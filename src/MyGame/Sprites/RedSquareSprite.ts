import { gEngine } from "../../Engine";
import { Renderable } from "../../Engine/Core/Renderable";

export class RedSquareSprite extends Renderable {
    private incSize: number = 0.05
    public constructor() {
        super("Red Square")
        this.rect(10, 10)
        this.setColor([1, 0.2, 0.2, 1])
        this.setPos({
            x: gEngine.width / 2 - this.width / 2,
            y: gEngine.height / 2 - this.height / 2
        })
        this.setScale(2)
    }

    public override update(): void {
        if (this.scale > 5) {
            this.incSize = -0.05
        }

        if (this.scale < 2) {
            this.incSize = 0.05
        }

        this.incScale(this.incSize)
        this.setPos({
            x: gEngine.width / 2 - this.scaledWidth / 2,
            y: gEngine.height / 2 - this.scaledHeight / 2
        })
    }
}