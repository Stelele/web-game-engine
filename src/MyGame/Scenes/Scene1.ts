import { AnimatedTextureRenderable, AudioLoader, gEngine, IScene, Renderable, TextureRenderable } from "../../Engine";
import { ResourceManifest } from "../ResourceManifest";

export class Scene1 implements IScene {
    private background: Renderable
    private background2: TextureRenderable
    private dye: Renderable
    private minionCollector!: TextureRenderable
    private minionPortal!: TextureRenderable
    private minionShip!: AnimatedTextureRenderable
    private minionShip2!: AnimatedTextureRenderable

    private startMoving = false
    private moveSpeed = -2
    private animationSpeed = 10

    public constructor() {
        this.background = new Renderable("Background")
            .rect(gEngine.width, gEngine.height)
            .setColor([0.8, 0.8, 0.8, 1])

        this.background2 = new TextureRenderable("Background 2")
            .setTexture(
                gEngine.width / 4,
                gEngine.height / 2,
                ResourceManifest["scene1"]["consolas72"].url
            )
            .setPos({ x: 20, y: 20 })

        const atlas = { width: 1024, height: 512, image: ResourceManifest["scene1"]["minion_sprite"].url }
        this.dye = new TextureRenderable("Dye (the hero)")
            .setTextureFromAtlas(
                atlas,
                { x: 0, y: 328, width: 120, height: 180 },
                { width: 70, height: 70 }
            )
        this.dye.setPos({
            x: gEngine.width / 2 - this.dye.width / 2,
            y: gEngine.height / 2 - this.dye.height / 2,
        })

        this.minionCollector = new TextureRenderable("bird 1")
            .setTextureFromAtlas(
                atlas,
                { x: 300, y: 328, width: 180, height: 180 },
                { width: 100, height: 100 },
            )
        this.minionCollector.setPos({
            x: gEngine.width / 4 - this.minionCollector.width / 2,
            y: gEngine.height / 2 - this.minionCollector.height / 2,
        })

        this.minionPortal = new TextureRenderable("bird 2")
            .setTextureFromAtlas(
                atlas,
                { x: 120, y: 328, width: 180, height: 180 },
                { width: 100, height: 100 }
            )
        this.minionPortal.setPos({
            x: 3 * gEngine.width / 4 - this.minionPortal.width / 2,
            y: gEngine.height / 2 - this.minionPortal.height / 2,
        })

        const fillers = { y: 0, width: 204, height: 164 }
        const fillers2 = { y: 164, width: 204, height: 164 }
        const animations = {
            "toLeft": [
                { x: 0, ...fillers },
                { x: 204, ...fillers },
                { x: 204 * 2, ...fillers },
                { x: 204 * 3, ...fillers },
                { x: 204 * 4, ...fillers }
            ],
            "toRight": [
                { x: 0, ...fillers2 },
                { x: 204, ...fillers2 },
                { x: 204 * 2, ...fillers2 },
                { x: 204 * 3, ...fillers2 },
                { x: 204 * 4, ...fillers2 }
            ]
        }

        this.minionShip = new AnimatedTextureRenderable("Minion Ship")
            .loadAnimations(atlas, animations, { width: 100, height: 100 })
        this.minionShip.setPos({
            x: gEngine.width / 4 - this.minionShip.width / 2,
            y: gEngine.height - this.minionShip.height - 20
        })

        this.minionShip2 = new AnimatedTextureRenderable("Minion Ship 2")
            .loadAnimations(atlas, animations, { width: 100, height: 100 })
        this.minionShip2.setPos({
            x: 3 * gEngine.width / 4 - this.minionShip.width / 2,
            y: gEngine.height - this.minionShip.height - 20
        })

        this.init()
    }

    public async init() {
        AudioLoader.playOnce(ResourceManifest["scene1"]["blueLevelCue"].url)
    }

    public update() {
        if (gEngine.Input.keys["ArrowLeft"]) {
            this.dye.incPos({ x: -2 })
        }

        if (gEngine.Input.keys["ArrowRight"]) {
            this.dye.incPos({ x: 2 })
        }

        if (gEngine.Input.keys["1"]) {
            this.minionShip.setAnimationDirection('right-to-left')
            this.minionShip2.setAnimationDirection('right-to-left')
        }

        if (gEngine.Input.keys["2"]) {
            this.startMoving = !this.startMoving
        }

        if (gEngine.Input.keys["3"]) {
            this.minionShip.setAnimationDirection('left-to-right')
            this.minionShip2.setAnimationDirection('left-to-right')
        }

        if (gEngine.Input.keys["4"]) {
            this.animationSpeed -= 10
            this.minionShip.setAnimationSpeed(this.animationSpeed)
            this.minionShip2.setAnimationSpeed(this.animationSpeed)
        }

        if (gEngine.Input.keys["5"]) {
            this.animationSpeed += 10
            this.minionShip.setAnimationSpeed(this.animationSpeed)
            this.minionShip2.setAnimationSpeed(this.animationSpeed)
        }

        if (this.startMoving) {
            this.minionShip.incPos({ x: this.moveSpeed })
            this.minionShip2.incPos({ x: this.moveSpeed })

            if (this.minionShip.x < 5) {
                this.moveSpeed = 2
            }

            if (this.minionShip2.x + this.minionShip2.width > gEngine.width - 5) {
                this.moveSpeed = -2
            }
        }

        if (this.dye.x + this.dye.scaledWidth < 0) {
            this.dye.setPos({ x: gEngine.width, y: gEngine.height / 2 - this.dye.height / 2 })
        }

        if (this.dye.x > gEngine.width) {
            this.dye.setPos({ x: -this.dye.width, y: gEngine.height / 2 - this.dye.height / 2 })
        }

    }

    public getRenderables() {
        return [
            this.background,
            this.background2,
            this.minionShip,
            this.minionShip2,
            this.minionCollector,
            this.minionPortal,
            this.dye,
        ]
    }

}