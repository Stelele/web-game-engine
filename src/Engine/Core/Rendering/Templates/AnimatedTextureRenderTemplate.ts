import { IObjectInfo } from "../../Types";
import { Renderable } from "../Renderables";
import { getFillColorInfo, getSamplerIndex, getTextureFlags, getTextureInfo, getTransformationBuffer, getVertexInfo } from "./helpers";
import { IRenderTemplate } from "./RenderTemplate";

export class AnimatedTextureRenderTemplate implements IRenderTemplate {
    public getDrawObject(obj: Renderable, device: GPUDevice): IObjectInfo {
        const info = obj.getObjectInfo()
        if (info.type !== "animated-texture") {
            throw new Error("Only support animated textures")
        }

        const vertexInfo = getVertexInfo(info.vertexData, info.name, device)
        const colorInfo = getFillColorInfo(info.fillColor, info.name, device)
        const transformBuffer = getTransformationBuffer(info.name, device)
        const textureInfo = getTextureInfo(info.name, info.imageBitmap, info.textureUVs(), device)

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
            flags: getTextureFlags(info, device),
            draw: info.draw,
        }
    }

    public processRenderPass(objectInfo: IObjectInfo, pass: GPURenderPassEncoder, device: GPUDevice) {
        if (objectInfo.type !== "animated-texture") return

        pass.setVertexBuffer(1, objectInfo.textureUVsBuffer)
        objectInfo.textureUVs.set(objectInfo.textureUVsData())
        device.queue.writeBuffer(objectInfo.textureUVsBuffer, 0, objectInfo.textureUVs)
    }

    public configureBindGroupLayout(layouts: Record<string, GPUBindGroupLayout>, device: GPUDevice, baseEntries: Array<GPUBindGroupLayoutEntry>) {
        layouts["animated-texture"] = device.createBindGroupLayout({
            label: `Bind Group Layout: animated-texture`,
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

    public configurePipelineBuffers(buffers: Array<GPUVertexBufferLayout | null>) {
        buffers.push({
            arrayStride: 2 * 4,
            attributes: [
                { shaderLocation: 1, offset: 0, format: "float32x2" }
            ]
        })
    }

    public getBindGroup(entries: Array<GPUBindGroupEntry>, samplers: GPUSampler[], objectInfo: IObjectInfo) {
        if (objectInfo.type !== "animated-texture") return

        const sampler = samplers[getSamplerIndex(objectInfo.samplerType)]
        entries.push({ binding: 10, resource: sampler })
        entries.push({ binding: 11, resource: objectInfo.texture.createView() })
        entries.push({ binding: 12, resource: { buffer: objectInfo.flags } })
    }


}