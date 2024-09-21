import { gEngine, IAtlasElementInfo, IAtlasInfo, ITextureRenderDimensions, TextureRenderable } from "../../Engine";
import { ResourceManifest } from "../ResourceManifest";

export class Portal extends TextureRenderable {
    public constructor() {
        super("Portal")

        const atlas: IAtlasInfo = {
            width: 1024,
            height: 512,
            image: ResourceManifest["scene1"]["atlas"].url
        }

        const elementInfo: IAtlasElementInfo = {
            x: 130,
            y: 164 * 2,
            width: 180,
            height: 180,
        }
        const dimensions: ITextureRenderDimensions = {
            width: 75,
            height: 75,
        }

        this.setTextureFromAtlas(atlas, elementInfo, dimensions)
    }

    public override update(): void {
        if (gEngine.Input.keys["ArrowUp"]) {
            this.incPos({ y: -2 })
        }

        if (gEngine.Input.keys["ArrowDown"]) {
            this.incPos({ y: 2 })
        }

        if (gEngine.Input.keys["ArrowLeft"]) {
            this.incPos({ x: -2 })
        }

        if (gEngine.Input.keys["ArrowRight"]) {
            this.incPos({ x: 2 })
        }
    }
}