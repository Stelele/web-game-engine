import { IObjectInfoRequest, ISamplerType } from "../../Types"

export function getVertexInfo(data: number[], name: string, device: GPUDevice) {
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

export function getFillColorInfo(data: number[], name: string, device: GPUDevice) {
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

export function getTransformationBuffer(name: string, device: GPUDevice) {
    const transformBuffer = device.createBuffer({
        label: `World Transformation Buffer: ${name}`,
        size: 16 * 4,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })


    return transformBuffer

}

export function getTextureInfo(name: string, image: ImageBitmap, uvs: number[], device: GPUDevice) {
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

export function getTextureFlags(info: IObjectInfoRequest, device: GPUDevice) {
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

export function getSamplerIndex(samplerType: ISamplerType) {
    return (samplerType.addressModeU === 'repeat' ? 1 : 0) +
        (samplerType.addressModeV === 'repeat' ? 1 : 0) +
        (samplerType.magFilter === 'linear' ? 1 : 0)
}