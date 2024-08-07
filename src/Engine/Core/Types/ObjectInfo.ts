
export type IRenderableType = 'primitive' | 'texture'
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
})