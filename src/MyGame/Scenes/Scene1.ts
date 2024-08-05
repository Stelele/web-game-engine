import { AudioLoader, gEngine, IScene, Renderable } from "../../Engine";
import { ResourceManifest } from "../ResourceManifest";
import { Scene2 } from "./Scene2";

export class Scene1 implements IScene {
    private background: Renderable
    private blueRect: Renderable
    private redSquare: Renderable

    public constructor() {
        this.background = new Renderable("Background")
            .rect(gEngine.width, gEngine.height)
            .setColor([0.8, 0.8, 0.8, 1])

        this.blueRect = new Renderable("Blue Rect")
            .rect(20, 40)
            .setColor([0.2, 0.2, 0.9, 1])

        this.blueRect.setPos({
            x: gEngine.width / 2 - this.blueRect.width / 2,
            y: gEngine.height / 2 - this.blueRect.height / 2,
        })

        this.redSquare = new Renderable("Red Square")
            .rect(100, 100)
            .setColor([0.9, 0.2, 0.2, 1])

        this.redSquare.setPos({
            x: gEngine.width / 2 - this.redSquare.width / 2,
            y: gEngine.height / 2 - this.redSquare.height / 2,
        })

        this.init()
    }

    public async init() {
        AudioLoader.playOnce(ResourceManifest["scene1"]["blueLevelCue"].url)
    }

    public update() {
        if (gEngine.Input.keys["ArrowLeft"]) {
            this.blueRect.incPos({ x: -2 })
        }

        if (gEngine.Input.keys["ArrowRight"]) {
            this.blueRect.incPos({ x: 2 })
        }

        if (this.blueRect.x + this.blueRect.scaledWidth < 0 || this.blueRect.x > gEngine.width) {
            gEngine.GL.setScene(new Scene2())
        }

    }

    public getRenderables() {
        return [
            this.background,
            this.redSquare,
            this.blueRect,
        ]
    }

}