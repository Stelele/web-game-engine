export class Renderer {
    private device!: GPUDevice
    private context!: GPUCanvasContext
    private presentationFormat!: GPUTextureFormat
    private vertexShader!: GPUShaderModule
    private vertexData!: Float32Array
    private vertexBuffer!: GPUBuffer
    private fillColor!: Float32Array
    private fillColorBuffer!: GPUBuffer
    private fragmentShader!: GPUShaderModule
    private bindGroupLayout!: GPUBindGroupLayout
    private pipelineLayout!: GPUPipelineLayout
    private pipeline!: GPURenderPipeline
    private bindGroup!: GPUBindGroup
    private renderPassDescriptor!: GPURenderPassDescriptor

    constructor(private canvas: HTMLCanvasElement) {
    }

    public async init() {
        await this.getGPUDevice()
        this.setupCanvasResizing()
        this.configCanvas()
        this.loadShaders()
        this.confiureBuffers()
        this.configureBindGroup()
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

    private configureBindGroup() {
        this.bindGroup = this.device.createBindGroup({
            label: "Bind Group",
            layout: this.bindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: this.fillColorBuffer } }
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

    private confiureBuffers() {
        const vertices = new Float32Array([
            -0.5, -0.5, 0.5, 0.5, -0.5, 0.5,
            -0.5, -0.5, 0.5, -0.5, 0.5, 0.5
        ])
        const fillColor = new Float32Array([1, 1, 1, 1])

        this.loadVertexBuffer(vertices)
        this.configFillColorUniform()
        this.setFillColor(fillColor)
    }

    public loadVertexBuffer(data: Float32Array) {
        this.vertexData = data
        this.vertexBuffer = this.device.createBuffer({
            label: "Vertex Buffer",
            size: this.vertexData.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        })

        this.device.queue.writeBuffer(this.vertexBuffer, 0, this.vertexData)
    }

    private configFillColorUniform() {
        this.fillColorBuffer = this.device.createBuffer({
            label: "Color Fill Uniform Buffer",
            size: 4 * 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        })
    }

    public setFillColor(data: Float32Array) {
        if (data.length != 4) {
            throw new Error("Data must have 4 elements")
        }

        data.forEach((entry) => {
            if (entry < 0 || entry > 1) {
                throw new Error("Data values must be between 0 and 1")
            }
        })

        this.fillColor = data
        this.device.queue.writeBuffer(this.fillColorBuffer, 0, this.fillColor)
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
        pass.setVertexBuffer(0, this.vertexBuffer)
        pass.setBindGroup(0, this.bindGroup)
        pass.draw(this.vertexData.length / 2)
        pass.end()

        this.device.queue.submit([encoder.finish()])
    }
}