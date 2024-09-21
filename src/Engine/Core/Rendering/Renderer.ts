import { Renderable } from "./Renderables/Renderable";
import { IScene } from "../Types/Scene";
import { IObjectInfo, IObjectInfoRequest, IRenderableType, ISamplerType } from '../Types/ObjectInfo'
import { IViewPortInfo, IViewPortInfoRequest } from '../Types/ViewPort'
import { Camera } from "./Camera/Camera";
import { IRenderingPassInfo } from "../Types/RenderingPassInfo";

export class Renderer {
    private device!: GPUDevice
    private context!: GPUCanvasContext
    private presentationFormat!: GPUTextureFormat
    private shaders: Record<string, { vertex: GPUShaderModule; fragment: GPUShaderModule }> = {}
    private bindGroupLayouts: Record<string, GPUBindGroupLayout> = {}
    private pipelineLayouts: Record<string, GPUPipelineLayout> = {}
    private pipelines: Record<string, GPURenderPipeline> = {}
    private samplers: Array<GPUSampler> = []
    private renderPassDescriptor!: GPURenderPassDescriptor
    private worldDimensions!: Float32Array
    private worldDimensionsUniform!: GPUBuffer
    private resolutionUniform!: GPUBuffer

    private curScene!: IScene
    private renderingInfos: IRenderingPassInfo[] = []

    constructor(private canvas: HTMLCanvasElement) { }

    public async init(worldWidth: number, worldHeight: number) {
        await this.getGPUDevice()
        this.configWorldProperties(worldWidth, worldHeight)
        this.setupCanvasResizing()
        this.configCanvas()
        this.setupSamplers()
        this.loadShaders()
        this.configureRenderPassDescriptor()
        this.startAnimation(60, this)
    }

    public clearCanvas(clearColor: number[]) {
        if (clearColor.length != 4) {
            throw new Error("Clear color must be of length 4")
        }

        clearColor.forEach((color) => {
            if (color < 0 || color > 1) {
                throw new Error("Color value must be between 0 and 1")
            }
        })

        for (const colorAttachment of this.renderPassDescriptor.colorAttachments) {
            if (colorAttachment?.clearValue) {
                colorAttachment.clearValue = clearColor
            }
        }
    }

    private async getGPUDevice() {
        var adapter = await navigator.gpu?.requestAdapter()
        const device = await adapter?.requestDevice()
        if (!device) {
            this.fail("Browser does not support WebGPU")
            return
        }

        this.device = device
    }

    private setupCanvasResizing() {
        function resize(renderer: Renderer) {
            renderer.canvas.width = Math.max(1, Math.min(document.body.clientWidth, renderer.device.limits.maxTextureDimension2D))
            renderer.canvas.height = Math.max(1, Math.min(document.body.clientHeight, renderer.device.limits.maxTextureDimension2D))
        }

        window.addEventListener('resize', () => resize(this))
        resize(this)
    }

    private configCanvas() {
        var context = this.canvas.getContext("webgpu")
        if (!context) {
            this.fail("Failed to get canvas context")
            return
        }
        this.context = context

        this.presentationFormat = navigator.gpu.getPreferredCanvasFormat()
        context.configure({
            device: this.device,
            format: this.presentationFormat
        })
    }

    private fail(msg: string) {
        document.body.innerHTML = `<H1>${msg}</H1>`
    }

    private setupSamplers() {
        for (let i = 0; i < 8; i++) {
            this.samplers.push(
                this.device.createSampler({
                    label: `Sampler: ${i}`,
                    addressModeU: (i & 1) ? 'repeat' : 'clamp-to-edge',
                    addressModeV: (i & 2) ? 'repeat' : 'clamp-to-edge',
                    magFilter: (i & 4) ? 'linear' : 'nearest'
                })
            )
        }
    }

    public loadShaders(vertexShader?: string, fragmentShader?: string, type: IRenderableType = 'primitive') {
        const vs = this.loadVertexShader(type, vertexShader)
        const fs = this.loadFragmentShader(type, fragmentShader)
        this.shaders[type] = {
            vertex: vs,
            fragment: fs
        }

        this.configureBindGroupLayout(type)
        this.configurePipeline(type)
    }

    private loadVertexShader(type: IRenderableType, shader?: string) {
        return this.device.createShaderModule({
            label: `Vertex Shader: ${type}`,
            code: shader ?? /* wgsl */`
                @vertex
                fn vs() -> @builtin(position) vec4f {
                    return vec4f(.0);
                }
            `
        })
    }

    private loadFragmentShader(type: IRenderableType, shader?: string) {
        return this.device.createShaderModule({
            label: `Fragment Shader: ${type}`,
            code: shader ?? /* wgsl */`
                @fragment
                fn fs() -> @location(0) vec4f {
                    return vec4f(.0);
                }
            `,
        })
    }

    private configureBindGroupLayout(type: IRenderableType) {
        const baseEntries: Array<GPUBindGroupLayoutEntry> = []
        for (let i = 0; i < 5; i++) {
            baseEntries.push({
                binding: i,
                visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                buffer: { type: "uniform" }
            })
        }

        if (type === 'primitive') {
            this.bindGroupLayouts[type] = this.device.createBindGroupLayout({
                label: `Bind Group Layout: ${type}`,
                entries: baseEntries
            })
        } else if (type === 'texture' || type === 'animated-texture') {
            this.bindGroupLayouts[type] = this.device.createBindGroupLayout({
                label: `Bind Group Layout: ${type}`,
                entries: [
                    ...baseEntries,
                    {
                        binding: 10,
                        visibility: GPUShaderStage.FRAGMENT,
                        sampler: {}
                    },
                    {
                        binding: 11,
                        visibility: GPUShaderStage.FRAGMENT,
                        texture: {}
                    },
                    {
                        binding: 12,
                        visibility: GPUShaderStage.FRAGMENT,
                        buffer: { type: 'uniform' }
                    }
                ]
            })
        }

        this.pipelineLayouts[type] = this.device.createPipelineLayout({
            label: `Pipeline Layout: ${type}`,
            bindGroupLayouts: [
                this.bindGroupLayouts[type]
            ]
        })
    }

    private configurePipeline(type: IRenderableType) {
        const buffers: Array<GPUVertexBufferLayout | null> = [
            {
                arrayStride: 2 * 4,
                attributes: [
                    { shaderLocation: 0, offset: 0, format: "float32x2" }
                ]
            }
        ]

        if (type === 'texture' || type === 'animated-texture') {
            buffers.push({
                arrayStride: 2 * 4,
                attributes: [
                    { shaderLocation: 1, offset: 0, format: "float32x2" }
                ]
            })
        }

        this.pipelines[type] = this.device.createRenderPipeline({
            label: `Render Pipeline: ${type}`,
            layout: this.pipelineLayouts[type],
            vertex: {
                module: this.shaders[type].vertex,
                buffers
            },
            fragment: {
                module: this.shaders[type].fragment,
                targets: [{ format: this.presentationFormat }]
            }
        })
    }

    private getBindGroup(objectInfo: IObjectInfo, vpMatUniform: GPUBuffer) {
        const entries: Array<GPUBindGroupEntry> = [
            { binding: 0, resource: { buffer: objectInfo.fillColorUniform } },
            { binding: 1, resource: { buffer: objectInfo.transformationUniform } },
            { binding: 2, resource: { buffer: this.worldDimensionsUniform } },
            { binding: 3, resource: { buffer: this.resolutionUniform } },
            { binding: 4, resource: { buffer: vpMatUniform } },
        ]

        if (objectInfo.type === 'texture' || objectInfo.type === 'animated-texture') {
            const sampler = this.samplers[this.getSamplerIndex(objectInfo.samplerType)]
            entries.push({ binding: 10, resource: sampler })
            entries.push({ binding: 11, resource: objectInfo.texture.createView() })
            entries.push({ binding: 12, resource: { buffer: objectInfo.flags } })
        }

        return this.device.createBindGroup({
            label: "Bind Group",
            layout: this.bindGroupLayouts[objectInfo.type],
            entries
        })
    }

    private getSamplerIndex(samplerType: ISamplerType) {
        return (samplerType.addressModeU === 'repeat' ? 1 : 0) +
            (samplerType.addressModeV === 'repeat' ? 1 : 0) +
            (samplerType.magFilter === 'linear' ? 1 : 0)
    }

    private configureRenderPassDescriptor() {
        this.renderPassDescriptor = {
            label: "Render Pass Description",
            colorAttachments: [{
                clearValue: [0.0, 0.8, 0.0, 1.0],
                loadOp: "load",
                storeOp: "store",
                view: this.context.getCurrentTexture().createView()
            }]
        }
    }

    public setScene(scene: IScene) {
        const device = this.device
        const renderingInfos = this.renderingInfos

        freeResources()
        this.curScene = scene
        const newRendringInfos = getRenderingInfos(this.curScene)
        this.renderingInfos = newRendringInfos

        function getDrawObject(obj: Renderable): IObjectInfo {
            const info = obj.getObjectInfo()
            const vertexInfo = getVertexInfo(info.vertexData, info.name)
            const colorInfo = getFillColorInfo(info.fillColor, info.name)
            const transformBuffer = getTransformationBuffer(info.name)


            if (info.type === 'primitive') {
                return {
                    type: 'primitive',
                    name: info.name,
                    vertexData: vertexInfo.vertices,
                    vertexBuffer: vertexInfo.buffer,
                    fillColor: colorInfo.color,
                    fillColorUniform: colorInfo.buffer,
                    transformationUniform: transformBuffer,
                    draw: info.draw,
                }
            } else if (info.type === 'texture') {
                const textureInfo = getTextureInfo(info.name, info.imageBitmap, info.textureUVs)
                return {
                    type: 'texture',
                    name: info.name,
                    vertexData: vertexInfo.vertices,
                    vertexBuffer: vertexInfo.buffer,
                    fillColor: colorInfo.color,
                    fillColorUniform: colorInfo.buffer,
                    transformationUniform: transformBuffer,
                    texture: textureInfo.texture,
                    textureUVs: textureInfo.uvData,
                    textureUVsBuffer: textureInfo.uvBuffer,
                    samplerType: info.samplerType,
                    reColorImage: info.reColorImage,
                    showBoundingBox: info.showBoundingBox,
                    flags: getTextureFlags(info),
                    draw: info.draw,
                }
            }

            const textureInfo = getTextureInfo(info.name, info.imageBitmap, info.textureUVs())
            return {
                type: 'animated-texture',
                name: info.name,
                vertexData: vertexInfo.vertices,
                vertexBuffer: vertexInfo.buffer,
                fillColor: colorInfo.color,
                fillColorUniform: colorInfo.buffer,
                transformationUniform: transformBuffer,
                texture: textureInfo.texture,
                textureUVs: textureInfo.uvData,
                textureUVsData: info.textureUVs,
                textureUVsBuffer: textureInfo.uvBuffer,
                samplerType: info.samplerType,
                reColorImage: info.reColorImage,
                showBoundingBox: info.showBoundingBox,
                flags: getTextureFlags(info),
                draw: info.draw,
            }

            function getVertexInfo(data: number[], name: string) {
                const vertexData = new Float32Array(data)
                const vertexBuffer = device.createBuffer({
                    label: `Vertex Buffer: ${name}`,
                    size: vertexData.byteLength,
                    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
                })

                return {
                    vertices: vertexData,
                    buffer: vertexBuffer
                }
            }

            function getFillColorInfo(data: number[], name: string) {
                if (data.length != 4) {
                    throw new Error("Data must have 4 elements")
                }

                data.forEach((entry) => {
                    if (entry < 0 || entry > 1) {
                        throw new Error("Data values must be between 0 and 1")
                    }
                })

                const fillColorBuffer = device.createBuffer({
                    label: `Color Fill Uniform Buffer: ${name}`,
                    size: 4 * 4,
                    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
                })

                return {
                    color: new Float32Array(data),
                    buffer: fillColorBuffer,
                }
            }

            function getTransformationBuffer(name: string) {
                const transformBuffer = device.createBuffer({
                    label: `World Transformation Buffer: ${name}`,
                    size: 16 * 4,
                    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
                })


                return transformBuffer

            }

            function getTextureInfo(name: string, image: ImageBitmap, uvs: number[]) {
                const texture = device.createTexture({
                    label: `Texture: ${name}`,
                    format: 'rgba8unorm',
                    size: [image.width, image.height],
                    usage: GPUTextureUsage.TEXTURE_BINDING |
                        GPUTextureUsage.COPY_DST |
                        GPUTextureUsage.RENDER_ATTACHMENT
                })

                device.queue.copyExternalImageToTexture(
                    { source: image, flipY: false },
                    { texture },
                    { width: image.width, height: image.height },
                )

                const uvData = new Float32Array(uvs)
                const uvBuffer = device.createBuffer({
                    label: `UV Vertex Buffer: ${name}`,
                    size: uvData.byteLength,
                    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
                })

                return {
                    texture,
                    uvData,
                    uvBuffer,
                }
            }

            function getTextureFlags(info: IObjectInfoRequest) {
                const flags = new Uint32Array([0])
                if (info.type === 'texture' || info.type === 'animated-texture') {
                    if (info.reColorImage) {
                        flags[0] = flags[0] | 1
                    }
                    if (info.showBoundingBox) {
                        flags[0] = flags[0] | (1 << 1)
                    }
                }

                const buffer = device.createBuffer({
                    label: `Flags Uniform: ${info.name}`,
                    size: flags.byteLength,
                    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
                })

                device.queue.writeBuffer(buffer, 0, flags)

                return buffer
            }
        }

        function getViewProjection(camera: Camera) {
            const viewProjMat = new Float32Array(camera.viewProjMat)
            const vpMatUniform = device.createBuffer({
                label: `View-Projection Matrix: ${camera.name}`,
                size: viewProjMat.byteLength,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
            })
            return { viewProjMat, vpMatUniform }
        }

        function freeResources() {
            for (const renderingInfo of renderingInfos) {
                renderingInfo.vpMatUniform.destroy()
                renderingInfo.vpMatUniform.unmap()

                for (const objectInfo of renderingInfo.objectInfos) {
                    objectInfo.fillColorUniform.destroy()
                    objectInfo.fillColorUniform.unmap()
                    objectInfo.transformationUniform.destroy()
                    objectInfo.transformationUniform.unmap()
                    objectInfo.vertexBuffer.destroy()
                    objectInfo.vertexBuffer.unmap()

                    if (objectInfo.type !== 'primitive') {
                        objectInfo.texture.destroy()
                        objectInfo.textureUVsBuffer.destroy()
                        objectInfo.textureUVsBuffer.unmap()
                    }
                }
            }
        }

        function getRenderingInfos(scene: IScene) {
            const renderingPassInfos: IRenderingPassInfo[] = []

            for (const info of scene.getRenderingPassesInfo()) {
                const { vpMatUniform } = getViewProjection(info.camera)
                const renderingPassInfo: IRenderingPassInfo = {
                    vpMatUniform,
                    viewPort: info.viewPort,
                    camera: info.camera,
                    objectInfos: []
                }

                for (const renderable of info.renderables) {
                    renderingPassInfo.objectInfos.push(
                        getDrawObject(renderable)
                    )
                }

                renderingPassInfos.push(renderingPassInfo)
            }

            return renderingPassInfos
        }
    }

    private configWorldProperties(width: number, height: number) {
        this.worldDimensions = new Float32Array([width, height])
        this.worldDimensionsUniform = this.device.createBuffer({
            label: "World Dimensions Uniform",
            size: this.worldDimensions.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        })
        this.device.queue.writeBuffer(this.worldDimensionsUniform, 0, this.worldDimensions)

        const resolution = new Float32Array([this.canvas.width, this.canvas.height])
        this.resolutionUniform = this.device.createBuffer({
            label: "Resoultion Uniform",
            size: resolution.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        })
        this.device.queue.writeBuffer(this.resolutionUniform, 0, resolution)
    }

    private startAnimation(targetFps: number, renderer: Renderer) {
        let start: number | undefined = undefined
        const targetFrameTime = Math.round(1000 / targetFps)
        renderer.render()
        requestAnimationFrame(animate)

        function animate(timeStep: number) {
            renderer.curScene?.update()

            if (start === undefined) {
                start = timeStep
            }

            const elapsed = timeStep - start
            if (elapsed >= targetFrameTime) {
                start = undefined
                renderer.render()
            }

            requestAnimationFrame(animate)
        }

    }

    private render() {
        for (const colorAtachments of this.renderPassDescriptor.colorAttachments) {
            if (colorAtachments?.view) {
                colorAtachments.view = this.context.getCurrentTexture().createView()
            }
        }

        this.device.queue.writeBuffer(this.resolutionUniform, 0, new Float32Array([this.canvas.width, this.canvas.height]))

        const encoder = this.device.createCommandEncoder({ label: "render encoder" })

        for (const info of this.renderingInfos) {
            this.processRenderPass(encoder, info)
        }

        this.device.queue.submit([encoder.finish()])
    }

    private processRenderPass(encoder: GPUCommandEncoder, info: IRenderingPassInfo) {
        const pass = encoder.beginRenderPass(this.renderPassDescriptor)

        let v = getViewPortInfo(info.viewPort, this.canvas)
        pass.setViewport(v.x, v.y, v.width, v.height, 0, 1)
        pass.setScissorRect(v.x, v.y, v.width, v.height)

        this.device.queue.writeBuffer(info.vpMatUniform, 0, new Float32Array(info.camera.viewProjMat))

        for (const objectInfo of info.objectInfos) {

            pass.setPipeline(this.pipelines[objectInfo.type])

            pass.setBindGroup(0, this.getBindGroup(objectInfo, info.vpMatUniform))
            this.device.queue.writeBuffer(objectInfo.fillColorUniform, 0, objectInfo.fillColor)
            this.device.queue.writeBuffer(objectInfo.vertexBuffer, 0, objectInfo.vertexData)
            this.device.queue.writeBuffer(objectInfo.transformationUniform, 0, getTransformArray(objectInfo))

            pass.setVertexBuffer(0, objectInfo.vertexBuffer)

            if (objectInfo.type === 'texture') {
                pass.setVertexBuffer(1, objectInfo.textureUVsBuffer)
                this.device.queue.writeBuffer(objectInfo.textureUVsBuffer, 0, objectInfo.textureUVs)
            } else if (objectInfo.type === 'animated-texture') {
                pass.setVertexBuffer(1, objectInfo.textureUVsBuffer)
                objectInfo.textureUVs.set(objectInfo.textureUVsData())
                this.device.queue.writeBuffer(objectInfo.textureUVsBuffer, 0, objectInfo.textureUVs)
            }

            pass.draw(objectInfo.vertexData.length / 2)
        }

        pass.end()

        function getTransformArray(objectInfo: IObjectInfo) {
            const transformation = objectInfo.draw()
            const transformationArray = new Float32Array(transformation)
            return transformationArray
        }

        function getViewPortInfo(v: IViewPortInfoRequest, canvas: HTMLCanvasElement): IViewPortInfo {
            if (!v) {
                return { x: 0, y: 0, width: canvas.width, height: canvas.height }
            }

            const height = Math.min(canvas.width * v.width * 9 / 16, canvas.height * v.width)
            return {
                x: canvas.width * v.x,
                y: canvas.height * v.y,
                width: canvas.width * v.width,
                height: height,
            }
        }
    }
}