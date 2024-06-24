export class Renderer {
    private device!: GPUDevice
    private context!: GPUCanvasContext
    private presentationFormat!: GPUTextureFormat
    private vertexShader!: GPUShaderModule
    private fragmentShader!: GPUShaderModule
    private pipeline!: GPURenderPipeline
    private renderPassDescriptor!: GPURenderPassDescriptor

    constructor(private canvas: HTMLCanvasElement) {
    }

    public async init() {
        await this.getGPUDevice()
        this.configCanvas()
        this.loadShaders()
        this.configurePipeline()
        this.configureRenderPassDescriptor()
        this.render()
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

    private loadShaders() {
        this.loadVertexShader()
        this.loadFragmentShader()
    }

    private loadVertexShader() {
        this.vertexShader = this.device.createShaderModule({
            label: "Vertex Shader",
            code: /* wgsl */ `
                @vertex
                fn vs(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
                let points = array(
                    vec2f(-.5,  .5),
                    vec2f(-.5, -.5),
                    vec2f( .5,  .5),
                    vec2f( .5,  .5),
                    vec2f(-.5, -.5),
                    vec2f( .5, -.5)
                );
        
                return vec4f(points[index], .0, 1.);
                }
            `
        })
    }

    private loadFragmentShader() {
        this.fragmentShader = this.device.createShaderModule({
            label: "Fragment Shader",
            code: /* wgsl */ `
                @fragment
                fn fs() -> @location(0) vec4f {
                    return vec4f(1., .0, .0, 1.);
                }
            `
        })
    }

    private configurePipeline() {
        this.pipeline = this.device.createRenderPipeline({
            label: "Render Pipeline",
            layout: "auto",
            vertex: { module: this.vertexShader },
            fragment: {
                module: this.fragmentShader,
                targets: [{ format: this.presentationFormat }]
            }
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

    private render() {

        (this.renderPassDescriptor.colorAttachments as any)[0].view = this.context.getCurrentTexture().createView()

        const encoder = this.device.createCommandEncoder({ label: "render encoder" })

        const pass = encoder.beginRenderPass(this.renderPassDescriptor)
        pass.setPipeline(this.pipeline)
        pass.draw(6)
        pass.end()

        this.device.queue.submit([encoder.finish()])
    }
}