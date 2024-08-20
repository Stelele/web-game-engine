import { AnimatedTextureRenderable, gEngine, IRenderableSet, Renderable } from "../../Engine";
import { IAtlasElementInfo, IAtlasInfo } from "../../Engine/Core/Types/Atlas";
import { ResourceManifest } from "../ResourceManifest";

export class Minions implements IRenderableSet {
    public objects: Renderable[] = []

    public async init() {
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


        for (let i = 0; i < 5; i++) {
            const minion = new AnimatedTextureRenderable(`Minion: ${i}`)
                .loadAnimations(atlasInfo, animations, { width: 102, height: 82 })
                .setAnimationDirection('left-to-right')

            minion.setPos({
                x: gEngine.width + Math.random() * 100,
                y: Math.min(gEngine.height - minion.height, Math.max(0, Math.random() * gEngine.height))
            })

            this.objects.push(minion)
        }
    }

    public update() {
        for (const minion of this.objects) {
            minion.incPos({ x: -1 })
            if (minion.x + minion.width < 0) {
                minion.setPos({
                    x: gEngine.width + Math.random() * 100,
                    y: Math.min(gEngine.height - minion.height, Math.max(0, Math.random() * gEngine.height))
                })
            }

            minion.update()
        }
    }

}