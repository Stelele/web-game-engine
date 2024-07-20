import { gEngine } from "../Engine";
import { Renderable } from "../Engine/Core/Renderable";
import { RedSquareSprite } from "./Sprites/RedSquareSprite";
import { WhiteSquareSprite } from "./Sprites/WhiteSquareSprite";

export async function main() {
    gEngine.setWorldDimensions(640)
    await gEngine.initializeWebGPU("GLCanvas")
    gEngine.GL.clearCanvas([0.9, 0.9, 0.9, 1])

    gEngine.GL.setViewPort({ x: 0.1, y: 0.1, width: 0.8 })
    const background = new Renderable("Background")
        .rect(gEngine.width, gEngine.height)
        .setColor([0.8, 0.8, 0.8, 1])
    gEngine.GL.addDrawObject(background)


    const redSquare = new RedSquareSprite()
    gEngine.GL.addDrawObject(redSquare)

    const whiteSquare = new WhiteSquareSprite()
    gEngine.GL.addDrawObject(whiteSquare)

}



