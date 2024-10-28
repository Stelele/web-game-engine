import { IObjectInfo, IRenderableType } from "../../Types";
import { Renderable } from "../Renderables";
import { AnimatedTextureRenderTemplate } from "./AnimatedTextureRenderTemplate";
import { PrimitiveRenderTemplate } from "./PrimitiveRenderTemplate";
import { TextureRenderTemplate } from "./TextureRenderTemplate";

export interface IRenderTemplate {
    getDrawObject: (obj: Renderable, device: GPUDevice) => IObjectInfo
    processRenderPass: (objectInfo: IObjectInfo, pass: GPURenderPassEncoder, device: GPUDevice) => void
    configureBindGroupLayout: (layouts: Record<string, GPUBindGroupLayout>, device: GPUDevice, baseEntries: Array<GPUBindGroupLayoutEntry>) => void
    configurePipelineBuffers: (buffers: Array<GPUVertexBufferLayout | null>) => void
    getBindGroup: (entries: Array<GPUBindGroupEntry>, samplers: GPUSampler[], objectInfo: IObjectInfo) => void
}


export function getRenderTemplate(type: IRenderableType): IRenderTemplate {
    switch (type) {
        case "primitive":
            return new PrimitiveRenderTemplate()
        case "texture":
            return new TextureRenderTemplate()
        case "animated-texture":
            return new AnimatedTextureRenderTemplate()
        default:
            throw new Error(`Type ${type} is not supported`)
    }
}