import { gEngine } from "../../Engine";
import { Renderable } from "../../Engine/Core/Renderable";

export class WhiteSquareSprite extends Renderable {
    constructor() {
        super("White Square")
        this.rect(10, 10)
        this.setColor([1, 1, 1, 1])
        this.setScale(5)
        this.setRotation(0.2)
        this.setPos({
            x: gEngine.width / 2 - this.scaledWidth / 2,
            y: gEngine.height / 2
        })
    }

    public override update(): void {
        if (this.x > gEngine.width + this.scaledWidth) {
            this.setPos({
                x: -this.scaledWidth,
                y: gEngine.height / 2
            })
        }
        this.incPos({
            x: 1
        })
        this.incRotation(Math.PI / 180)

    }
}