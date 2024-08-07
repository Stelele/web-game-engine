import { ImageLoader } from "../Resources";
import { IObjectInfoRequest } from "../Types/ObjectInfo";
import { Renderable } from "./Renderable";
import { IAtlasElementInfo, IAtlasInfo, ITextureRenderDimensions } from "../Types/Atlas"

export class TextureRenderable extends Renderable {
    public imageBitmap!: ImageBitmap
    public imageUVs!: number[]

    constructor(name: string) {
        super(name)
    }

    public setTexture(width: number, height: number, image: string) {
        this.width = width
        this.height = height
        this.rect(width, height)

        const imageBitmap = ImageLoader.fetchImage(image)
        if (imageBitmap) {
            this.imageBitmap = imageBitmap
        }
        this.imageUVs = [
            0, 0,
            0, 1,
            1, 0,
            0, 1,
            1, 1,
            1, 0,
        ]

        return this
    }

    public setTextureFromAtlas(atlas: IAtlasInfo, elementInfo: IAtlasElementInfo, dimensions: ITextureRenderDimensions) {
        this.rect(dimensions.width, dimensions.height)

        const imageBitmap = ImageLoader.fetchImage(atlas.image)
        if (imageBitmap) {
            this.imageBitmap = imageBitmap
        }

        const x = elementInfo.x / atlas.width
        const y = elementInfo.y / atlas.height
        const xW = x + elementInfo.width / atlas.width
        const yH = y + elementInfo.height / atlas.height
        this.imageUVs = [
            x, y, x, yH, xW, y,
            x, yH, xW, yH, xW, y
        ]

        return this
    }

    public override getObjectInfo(): IObjectInfoRequest {
        return {
            type: 'texture',
            name: this.name,
            fillColor: this.color,
            vertexData: this.vertices,
            textureUVs: this.imageUVs,
            imageBitmap: this.imageBitmap,
            samplerType: {
                addressModeU: 'clamp-to-edge',
                addressModeV: 'clamp-to-edge',
                magFilter: 'nearest',
            },
            draw: this.draw.bind(this),
        }
    }
}