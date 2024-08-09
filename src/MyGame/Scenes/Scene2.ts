import { AudioLoader, gEngine, IScene, Renderable, TextureRenderable } from "../../Engine";
import { ResourceManifest } from "../ResourceManifest";
import { Scene1 } from "./Scene1";

export class Scene2 implements IScene {
    private background: Renderable
    private redRect: Renderable
    private whiteSquare: Renderable
    private minionCollector!: Renderable
    private minionPortal!: Renderable

    public constructor() {
        this.background = new Renderable("Background")
            .rect(gEngine.width, gEngine.height)
            .setColor([0.2, 0.2, 0.9, 1])

        this.redRect = new Renderable("Red Rect")
            .rect(20, 40)
            .setColor([0.9, 0.2, 0.2, 1])

        this.redRect.setPos({
            x: gEngine.width / 2 - this.redRect.width / 2,
            y: gEngine.height / 2 - this.redRect.height / 2
        })

        this.whiteSquare = new Renderable("White Square")
            .rect(100, 100)
            .setColor([1, 1, 1, 1])
            .setRotation(Math.PI / 4)

        this.whiteSquare.setPos({
            x: gEngine.width / 2 - 14 * this.whiteSquare.width / 20,
            y: gEngine.height / 2,
        })

        this.minionCollector = new TextureRenderable("bird 1")
            .setTexture(50, 50, ResourceManifest["scene1"]["minion_collector"].url)
        this.minionCollector.setPos({
            x: gEngine.width / 4 - this.minionCollector.width / 2,
            y: gEngine.height / 2 - this.minionCollector.height / 2,
        })

        this.minionPortal = new TextureRenderable("bird 2")
            .setTexture(50, 50, ResourceManifest["scene1"]["minion_portal"].url)
        this.minionPortal.setPos({
            x: 3 * gEngine.width / 4 - this.minionPortal.width / 2,
            y: gEngine.height / 2 - this.minionPortal.height / 2,
        })

        this.init()
    }

    public async init() {
        AudioLoader.playOnce(ResourceManifest["scene2"]["redLevelCue"].url)
    }

    public update() {
        if (gEngine.Input.keys["ArrowLeft"]) {
            this.redRect.incPos({ x: -2 })
        }

        if (gEngine.Input.keys["ArrowRight"]) {
            this.redRect.incPos({ x: 2 })
        }

        if (this.redRect.x + this.redRect.scaledWidth < 0 || this.redRect.x > gEngine.width) {
            gEngine.GL.setScene(new Scene1())
        }
    }

    public getRenderables() {
        return [
            this.background,
            this.whiteSquare,
            this.minionCollector,
            this.minionPortal,
            this.redRect
        ]
    }

}