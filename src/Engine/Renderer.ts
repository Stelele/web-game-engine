export interface IObjectInfo {
    name: string
    vertexData: Float32Array
    vertexBuffer: GPUBuffer
    fillColor: Float32Array
    fillColorUniform: GPUBuffer
    transformation: Float32Array
    transformationUniform: GPUBuffer
}

export interface IObjectInfoRequest {
    name: string
    vertexData: number[]
    fillColor: number[]
    transformation?: ITransformation
}

export interface ITransformation {
    translate?: number[]
    scale?: number[]
    rotate?: number
}

export class Renderer {
    private device!: GPUDevice
    private context!: GPUCanvasContext
    private presentationFormat!: GPUTextureFormat
    private vertexShader!: GPUShaderModule
    private fragmentShader!: GPUShaderModule
    private bindGroupLayout!: GPUBindGroupLayout
    private pipelineLayout!: GPUPipelineLayout
    private pipeline!: GPURenderPipeline
    private renderPassDescriptor!: GPURenderPassDescriptor
    private objectInfos!: Array<IObjectInfo>


    constructor(private canvas: HTMLCanvasElement) {
    }

    public async init() {
        this.objectInfos = []
        await this.getGPUDevice()
        this.setupCanvasResizing()
        this.configCanvas()
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
        function resize(canvas: HTMLCanvasElement, device: GPUDevice) {
            canvas.width = Math.max(1, Math.min(document.body.clientWidth, device.limits.maxTextureDimension2D))
            canvas.height = Math.max(1, Math.min(document.body.clientHeight, device.limits.maxTextureDimension2D))
        }

        window.addEventListener('resize', () => resize(this.canvas, this.device))
        resize(this.canvas, this.device)
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

    public loadShaders(vertexShader?: string, fragmentShader?: string) {
        this.loadVertexShader(vertexShader)
        this.loadFragmentShader(fragmentShader)

        this.configureBindGroupLayout()
        this.configurePipeline()
    }

    private loadVertexShader(shader?: string) {
        this.vertexShader = this.device.createShaderModule({
            label: "Vertex Shader",
            code: shader ?? /* wgsl */`
                @vertex
                fn vs() -> @builtin(position) vec4f {
                    return vec4f(.0);
                }
            `
        })
    }

    private loadFragmentShader(shader?: string) {
        this.fragmentShader = this.device.createShaderModule({
            label: "Fragment Shader",
            code: shader ?? /* wgsl */`
                @fragment
                fn fs() -> @location(0) vec4f {
                    return vec4f(.0);
                }
            `,
        })
    }

    private configureBindGroupLayout() {
        this.bindGroupLayout = this.device.createBindGroupLayout({
            label: "Bind Group Layout",
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                    buffer: { type: "uniform" }
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                    buffer: { type: "uniform" }
                }
            ]
        })

        this.pipelineLayout = this.device.createPipelineLayout({
            label: "Pipeline Layout",
            bindGroupLayouts: [
                this.bindGroupLayout
            ]
        })
    }

    private configurePipeline() {
        this.pipeline = this.device.createRenderPipeline({
            label: "Render Pipeline",
            layout: this.pipelineLayout,
            vertex: {
                module: this.vertexShader,
                buffers: [
                    {
                        arrayStride: 2 * 4,
                        attributes: [
                            { shaderLocation: 0, offset: 0, format: "float32x2" }
                        ]
                    }
                ]
            },
            fragment: {
                module: this.fragmentShader,
                targets: [{ format: this.presentationFormat }]
            }
        })
    }

    private getBindGroup(objectInfo: IObjectInfo) {
        return this.device.createBindGroup({
            label: "Bind Group",
            layout: this.bindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: objectInfo.fillColorUniform } },
                { binding: 1, resource: { buffer: objectInfo.transformationUniform } }
            ]
        })
    }

    private configureRenderPassDescriptor() {
        this.renderPassDescriptor = {
            label: "Render Pass Description",
            colorAttachments: [{
                clearValue: [0.0, 0.8, 0.0, 1.0],
                loadOp: "clear",
                storeOp: "store",
                view: this.context.getCurrentTexture().createView()
            }]
        }
    }

    public addDrawObject(info: IObjectInfoRequest) {
        const vertexInfo = this.getVertexInfo(info.vertexData, info.name)
        const colorInfo = this.getFillColorInfo(info.fillColor, info.name)
        const transformInfo = this.getTransformationInfo(info.transformation ?? {}, info.name)

        this.objectInfos.push({
            name: info.name,
            vertexData: vertexInfo.vertices,
            vertexBuffer: vertexInfo.buffer,
            fillColor: colorInfo.color,
            fillColorUniform: colorInfo.buffer,
            transformation: transformInfo.transform,
            transformationUniform: transformInfo.buffer
        })
    }

    public removeDrawObject(name: string) {
        this.objectInfos = this.objectInfos.filter((v) => v.name !== name)
    }

    private getVertexInfo(data: number[], name: string) {
        const vertexData = new Float32Array(data)
        const vertexBuffer = this.device.createBuffer({
            label: `Vertex Buffer: ${name}`,
            size: vertexData.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        })

        return {
            vertices: vertexData,
            buffer: vertexBuffer
        }
    }

    private getFillColorInfo(data: number[], name: string) {
        if (data.length != 4) {
            throw new Error("Data must have 4 elements")
        }

        data.forEach((entry) => {
            if (entry < 0 || entry > 1) {
                throw new Error("Data values must be between 0 and 1")
            }
        })

        const fillColorBuffer = this.device.createBuffer({
            label: `Color Fill Uniform Buffer: ${name}`,
            size: 4 * 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        })

        return {
            color: new Float32Array(data),
            buffer: fillColorBuffer
        }
    }

    private getTransformationInfo(data: ITransformation, name: string) {
        if (data.scale && data.scale.length != 2) {
            throw new Error("Scale array must contain two elements")
        }

        if (data.translate && data.translate.length != 2) {
            throw new Error("Translate array must contain two elements")
        }

        const transformValues = new Float32Array(6)
        const transformViews = {
            rotate: { byteOffset: 0, length: 1 },
            translate: { byteOffset: 2, length: 2 },
            scale: { byteOffset: 4, length: 2 },
        }

        transformValues.set(
            [data.rotate ?? 0],
            transformViews.rotate.byteOffset
        )
        transformValues.set(
            data.translate ?? [0, 0],
            transformViews.translate.byteOffset
        )
        transformValues.set(
            data.scale ?? [1, 1],
            transformViews.scale.byteOffset)

        const transformBuffer = this.device.createBuffer({
            label: `Transform Uniform Buffer: ${name}`,
            size: transformValues.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        })

        return {
            transform: transformValues,
            buffer: transformBuffer
        }
    }

    private startAnimation(targetFps: number, renderer: Renderer) {
        let start: number | undefined = undefined
        const targetFrameTime = Math.round(1000 / targetFps)
        renderer.render()
        requestAnimationFrame(animate)

        function animate(timeStep: number) {
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

        const encoder = this.device.createCommandEncoder({ label: "render encoder" })

        const pass = encoder.beginRenderPass(this.renderPassDescriptor)
        pass.setPipeline(this.pipeline)

        for (const objectInfo of this.objectInfos) {
            pass.setBindGroup(0, this.getBindGroup(objectInfo))
            this.device.queue.writeBuffer(objectInfo.fillColorUniform, 0, objectInfo.fillColor)
            this.device.queue.writeBuffer(objectInfo.vertexBuffer, 0, objectInfo.vertexData)
            this.device.queue.writeBuffer(objectInfo.transformationUniform, 0, objectInfo.transformation)
            pass.setVertexBuffer(0, objectInfo.vertexBuffer)
            pass.draw(objectInfo.vertexData.length / 2)
        }

        pass.end()

        this.device.queue.submit([encoder.finish()])
    }
}