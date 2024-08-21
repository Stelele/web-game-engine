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


        for (let i = 0; i < 1; i++) {
            const minion = new AnimatedTextureRenderable(`Minion: ${i}`)
                .loadAnimations(atlasInfo, animations, { width: 50, height: 50 })
                .setAnimationDirection('left-to-right')

            minion.showBoundingBox = true
            minion.speed = 1
            minion.setFrontDirection([-1, 0])
            minion.setPos({
                x: gEngine.width + Math.random() * 100,
                y: Math.min(gEngine.height - minion.height, Math.max(0, Math.random() * gEngine.height))
            })

            this.objects.push(minion)
        }
    }

    public update() {
        for (const minion of this.objects) {
            minion.incPos({
                x: minion.curFrontDirection[0] * minion.speed,
                y: minion.curFrontDirection[1] * minion.speed
            })
            if (minion.x + minion.width < 0) {
                minion.setPos({
                    x: gEngine.width,
                    y: Math.min(gEngine.height - minion.height, Math.max(0, Math.random() * gEngine.height))
                })
            }
            minion.update()
        }
    }

    public chase(obj: Renderable, rate: number) {
        for (const minion of this.objects) {
            minion.rotateObjToPointTo(obj, rate)
        }
    }

}