import { gEngine, IScene, Renderable } from "../../Engine";
import { Hero } from "../Sprites/Hero";
import { Minions } from "../Sprites/Minions";

export class Scene1 implements IScene {
    private isLoading = false
    private background!: Renderable
    private hero!: Hero
    private minions!: Minions

    public constructor() {
        this.isLoading = true
        this.init()
    }

    public async init() {
        this.background = new Renderable("Background")
            .rect(gEngine.width, gEngine.height)
            .setColor([204, 204, 204, 255])
        this.hero = new Hero()
        this.minions = new Minions()
        await this.minions.init()
        this.isLoading = false
    }

    public update() {
        if (this.isLoading) return

        this.hero.update()
        this.minions.chase(this.hero, 0.5)
        this.minions.update()

        for (const minon of this.minions.objects) {
            if (this.hero.isBBCollision(minon)) {
                this.isLoading = true
                console.log(this.hero.getBBCollisionStatus(minon))
            }
        }
    }

    public getRenderables() {
        if (this.isLoading) return []

        return [
            this.background,
            this.hero,
            ...this.minions.objects
        ]
    }

}