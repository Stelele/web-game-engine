import { gEngine, TextureRenderable } from "../../Engine";
import { IAtlasElementInfo, IAtlasInfo, ITextureRenderDimensions } from "../../Engine/Core/Types/Atlas";
import { ResourceManifest } from "../ResourceManifest";

export class Hero extends TextureRenderable {
    public constructor() {
        super("Hero")
        const atlas: IAtlasInfo = {
            width: 1024,
            height: 512,
            image: ResourceManifest["scene1"]["atlas"].url
        }
        const elementInfo: IAtlasElementInfo = {
            x: 5,
            y: 164 * 2,
            width: 120,
            height: 180,
        }
        const dimensions: ITextureRenderDimensions = {
            width: 50,
            height: 75,
        }

        this.setTextureFromAtlas(atlas, elementInfo, dimensions)
        this.setPos({
            x: gEngine.width / 2 - this.width / 2,
            y: gEngine.height / 2 - this.height / 2,
        })
    }
}