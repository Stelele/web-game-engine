import { IObjectInfo } from "../../Types";
import { Renderable } from "../Renderables";
import { getFillColorInfo, getTransformationBuffer, getVertexInfo } from "./helpers";
import { IRenderTemplate } from "./RenderTemplate";

export class PrimitiveRenderTemplate implements IRenderTemplate {
    public constructor() { }

    public getDrawObject(obj: Renderable, device: GPUDevice): IObjectInfo {
        const info = obj.getObjectInfo()
        const vertexInfo = getVertexInfo(info.vertexData, info.name, device)
        const colorInfo = getFillColorInfo(info.fillColor, info.name, device)
        const transformBuffer = getTransformationBuffer(info.name, device)

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
    }

    public processRenderPass(_objectInfo: IObjectInfo, _pass: GPURenderPassEncoder, _device: GPUDevice) { }

    public configureBindGroupLayout(layouts: Record<string, GPUBindGroupLayout>, device: GPUDevice, baseEntries: Array<GPUBindGroupLayoutEntry>) {
        layouts["primitive"] = device.createBindGroupLayout({
            label: `Bind Group Layout: primitive`,
            entries: baseEntries
        })
    }

    public configurePipelineBuffers(_buffers: Array<GPUVertexBufferLayout | null>) { }

    public getBindGroup(_entries: Array<GPUBindGroupEntry>, _samplers: GPUSampler[], _objectInfo: IObjectInfo) { }

}