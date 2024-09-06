import { AnimatedTextureRenderable } from "../../Engine";
import { IAtlasElementInfo, IAtlasInfo } from "../../Engine/Core/Types/Atlas";
import { ResourceManifest } from "../ResourceManifest";

export class Minion extends AnimatedTextureRenderable {
    public constructor() {
        super("Minion")
        const atlasInfo: IAtlasInfo = {
            width: 1024,
            height: 512,
            image: ResourceManifest["scene1"]["atlas"].url
        }

        const animations: Record<string, IAtlasElementInfo[]> = { "swim": [] }
        for (let i = 0; i < 10; i++) {
            animations["swim"].push({
                x: 204 * (i % 5),
                y: 164 * Math.floor(i / 5),
                width: 204,
                height: 164,
            })
        }

        this.loadAnimations(atlasInfo, animations, { width: 50, height: 50 })
            .setAnimationDirection('left-to-right')

        this.speed = 1
    }
}