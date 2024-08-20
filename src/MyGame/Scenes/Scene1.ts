import { aW } from "vitest/dist/reporters-BECoY4-b.js";
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
            .setColor([0.8, 0.8, 0.8, 1])
        this.hero = new Hero()
        this.minions = new Minions()
        await this.minions.init()
        this.isLoading = false
    }

    public update() {
        this.hero.update()
        this.minions.update()
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