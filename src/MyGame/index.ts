import { gEngine } from "../Engine";
import { Renderable } from "../Engine/Core/Renderable";
import { SimpleFS } from "../shaders/SimpleFS";
import { SimpleVS } from "../shaders/SimpleVS";

export async function main() {
    await gEngine.initializeWebGPU("GLCanvas")

    gEngine.GL.loadShaders(SimpleVS, SimpleFS)

    const vertices = [
        -0.5, -0.5, -0.5, 0.5, 0.5, 0.5,
        -0.5, -0.5, 0.5, -0.5, 0.5, 0.5
    ]

    const upperTriangle = new Renderable("White Square")
        .vertices(vertices)
        .color([1, 1, 1, 1])
        .translate({ x: -0.25, y: 0.25 })
        .scale(1.2)
        .rotate(0.2)
    gEngine.GL.addDrawObject(upperTriangle.getObjectInfo())

    const lowerTriangle = new Renderable("Red Square")
        .vertices(vertices)
        .color([1, 0, 0, 1])
        .translate({ x: 0.25, y: -0.25 })
        .scale(0.4)
        .rotate(-0.785)
    gEngine.GL.addDrawObject(lowerTriangle.getObjectInfo())

}



