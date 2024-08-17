import {
    gEngine,
    IScene,
    Renderable,
    TextRenderable,
    TextureRenderable
} from "../../Engine";
import { ResourceManifest } from "../ResourceManifest";

export class Scene1 implements IScene {
    private background: Renderable
    private background2: TextureRenderable
    private defaultText: TextRenderable
    private consolas16Text: TextRenderable
    private consolas24Text: TextRenderable
    private consolas32Text: TextRenderable
    private consolas72Text: TextRenderable
    private segment7: TextRenderable

    public constructor() {
        this.background = new Renderable("Background")
            .rect(gEngine.width, gEngine.height)
            .setColor([0.8, 0.8, 0.8, 1])

        this.background2 = new TextureRenderable("Background 2")
            .setTexture(gEngine.height / 4, gEngine.height / 4, ResourceManifest["scene1"]["consolas72"].url)
        this.background2.setPos({ x: 30, y: 30 })

        this.defaultText = new TextRenderable("Default Text Font")
            .setFont(32)
            .setText("System Font: in Red")
            .setColor([1, 0, 0, 1])
        this.defaultText.setPos({ x: gEngine.width / 2, y: 10 })

        this.consolas16Text = new TextRenderable("Consolas 16 Text Font")
            .setFont(16, ResourceManifest["font"]["consolas16"].url)
            .setText("Consolas 16: in black")
            .setColor([0, 0, 0, 1])
        this.consolas16Text.setPos({
            x: this.defaultText.x,
            y: this.defaultText.y + this.defaultText.height + 10
        })

        this.consolas24Text = new TextRenderable("Consolas 24 Text Font")
            .setFont(24, ResourceManifest["font"]["consolas24"].url)
            .setText("Consolas 24: in black")
            .setColor([0, 0, 0, 1])
        this.consolas24Text.setPos({
            x: this.defaultText.x,
            y: this.consolas16Text.y + this.consolas16Text.height + 10
        })

        this.consolas32Text = new TextRenderable("Consolas 32 Text Font")
            .setFont(32, ResourceManifest["font"]["consolas32"].url)
            .setText("Consolas 32: in white")
            .setColor([1, 1, 1, 1])
        this.consolas32Text.setPos({
            x: gEngine.width / 2 - this.consolas32Text.width / 4,
            y: this.consolas24Text.y + this.consolas24Text.height + 10
        })

        this.consolas72Text = new TextRenderable("Consolas 72 Text Font")
            .setFont(72, ResourceManifest["font"]["consolas72"].url)
            .setText("Consolas 72: in blue")
            .setColor([0, 0, 1, 1])
        this.consolas72Text.setPos({
            x: gEngine.width / 2 - this.consolas72Text.width / 2,
            y: this.consolas32Text.y + this.consolas32Text.height + 10
        })

        this.segment7 = new TextRenderable("Segment 92 Text Font")
            .setFont(92, ResourceManifest["font"]["segment7"].url)
            .setText("Segment7-92")
            .setColor([1, 1, 1, 1])
        this.segment7.setPos({
            x: gEngine.width / 2 - this.segment7.width / 2,
            y: this.consolas72Text.y + this.consolas72Text.height + 20
        })

        this.init()
    }

    public async init() {
    }

    public update() {

    }

    public getRenderables() {
        return [
            this.background,
            this.background2,
            this.defaultText,
            this.consolas16Text,
            this.consolas24Text,
            this.consolas32Text,
            this.consolas72Text,
            this.segment7
        ]
    }

}