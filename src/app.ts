import { resize } from "./helpers/ResizeWindow"
import { CellShader } from "./shaders"

export class App {
    private constructor() { }

    private static device: GPUDevice
    private static context: GPUCanvasContext
    private static vertexBufferLayout: GPUVertexBufferLayout
    private static renderPipeLine: GPURenderPipeline
    private static vertexArray: Float32Array
    private static vertexBuffer: GPUBuffer
    private static gridArray: Float32Array
    private static gridBuffer: GPUBuffer
    private static bindGroup: GPUBindGroup
    private static readonly GRID_SIZE = 1024


    public static async init() {
        this.setupScreenResizing()
        const { canvasFormat } = await this.setupGPUDeviceAndCanvasContext()
        this.setupBuffers()
        this.setRenderPipeline(canvasFormat)
        this.setBindGroup()
        this.renderLoop()
    }

    private static setupScreenResizing() {
        const canvas = document.getElementById("webgpu-canvas") as HTMLCanvasElement
        window.addEventListener("resize", (ev) => resize(canvas, ev))
        resize(canvas)
    }

    private static async setupGPUDeviceAndCanvasContext() {
        if (!navigator.gpu) {
            throw new Error("WebGPU is not supported on browser")
        }

        const adapter = await navigator.gpu.requestAdapter()
        if (!adapter) {
            throw new Error("No adpter is available at the moment")
        }

        const device = await adapter.requestDevice()
        if (!device) {
            throw new Error("Could not fetch GPU device")
        }
        this.device = device

        const canvas = document.getElementById("webgpu-canvas") as HTMLCanvasElement
        const context = canvas.getContext("webgpu")
        if (!context) {
            throw new Error("Failed to get canvas context")
        }
        this.context = context

        const canvasFormat = navigator.gpu.getPreferredCanvasFormat()
        context.configure({
            device: device,
            format: canvasFormat
        })

        return { canvasFormat }
    }

    private static setupBuffers() {
        this.setupVertexBuffer()
        this.setupGridBuffer()
    }

    private static setupVertexBuffer() {
        App.vertexArray = new Float32Array([
            -1, -1, -1, 1, 1, 1,
            -1, -1, 1, -1, 1, 1
        ])

        this.vertexBuffer = this.device.createBuffer({
            label: "Vertex Buffer",
            size: this.vertexArray.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        })

        this.device.queue.writeBuffer(this.vertexBuffer, 0, this.vertexArray)

        this.vertexBufferLayout = {
            arrayStride: 8,
            attributes: [{
                format: "float32x2",
                offset: 0,
                shaderLocation: 0
            }]
        }
    }

    private static setupGridBuffer() {
        this.gridArray = new Float32Array([this.GRID_SIZE, this.GRID_SIZE])

        this.gridBuffer = this.device.createBuffer({
            label: "Grid Buffer",
            size: this.gridArray.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        })

        this.device.queue.writeBuffer(this.gridBuffer, 0, this.gridArray)


    }

    private static setRenderPipeline(canvasFormat: GPUTextureFormat) {
        const cellShaderModule = this.device.createShaderModule({
            label: "Cell shader",
            code: CellShader
        })

        this.renderPipeLine = this.device.createRenderPipeline({
            label: "Cell pipeline",
            layout: "auto",
            vertex: {
                module: cellShaderModule,
                entryPoint: "vertexMain",
                buffers: [this.vertexBufferLayout]
            },
            fragment: {
                module: cellShaderModule,
                entryPoint: "fragmentMain",
                targets: [{ format: canvasFormat }]
            }
        })
    }

    private static setBindGroup() {
        this.bindGroup = this.device.createBindGroup({
            label: "Cell renderer bind group",
            layout: this.renderPipeLine.getBindGroupLayout(0),
            entries: [{
                binding: 0,
                resource: { buffer: this.gridBuffer }
            }]
        })
    }

    private static renderLoop() {
        const encoder = this.device.createCommandEncoder()

        const pass = encoder.beginRenderPass({
            colorAttachments: [{
                view: this.context.getCurrentTexture().createView(),
                loadOp: "clear",
                clearValue: [1, 1, 1, 1],
                storeOp: "store"
            }]
        })

        pass.setPipeline(this.renderPipeLine)
        pass.setVertexBuffer(0, this.vertexBuffer)
        pass.setBindGroup(0, this.bindGroup)
        pass.draw(this.vertexArray.length / 2, this.GRID_SIZE * this.GRID_SIZE)

        pass.end()
        this.device.queue.submit([encoder.finish()])
    }
}