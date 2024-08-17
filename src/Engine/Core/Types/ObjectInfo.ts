
export type IRenderableType = 'primitive' | 'texture' | 'animated-texture'
export interface ISamplerType {
    addressModeU: 'repeat' | 'clamp-to-edge'
    addressModeV: 'repeat' | 'clamp-to-edge'
    magFilter: 'linear' | 'nearest'
}

type IObjectInfoBase = {
    name: string
    vertexData: Float32Array
    vertexBuffer: GPUBuffer
    fillColor: Float32Array
    fillColorUniform: GPUBuffer
    transformationUniform: GPUBuffer
    draw: () => number[]
}


export type IObjectInfo = IObjectInfoBase & ({
    type: 'primitive'
} | {
    type: 'texture'
    textureUVs: Float32Array
    textureUVsBuffer: GPUBuffer
    texture: GPUTexture
    samplerType: ISamplerType
    reColorImage: boolean
    flags: GPUBuffer
} | {
    type: 'animated-texture'
    textureUVsData: () => number[]
    textureUVs: Float32Array
    textureUVsBuffer: GPUBuffer
    texture: GPUTexture
    samplerType: ISamplerType
    reColorImage: boolean
    flags: GPUBuffer
})

type IObjectInfoRequestBase = {
    name: string
    vertexData: number[]
    fillColor: number[]
    draw: () => number[]
}

export type IObjectInfoRequest = IObjectInfoRequestBase & ({
    type: 'primitive'
} | {
    type: 'texture'
    textureUVs: number[]
    imageBitmap: ImageBitmap
    samplerType: ISamplerType
    reColorImage: boolean
} | {
    type: 'animated-texture'
    textureUVs: () => number[]
    imageBitmap: ImageBitmap
    samplerType: ISamplerType
    reColorImage: boolean
})