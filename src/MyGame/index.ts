import { gEngine } from "../Engine";
import { SimpleFS } from "../shaders/SimpleFS";
import { SimpleVS } from "../shaders/SimpleVS";

export async function main() {
    await gEngine.initializeWebGPU("GLCanvas")

    gEngine.GL.loadShaders(SimpleVS, SimpleFS)

    const vertices = [
        -0.5, -0.5, -0.5, 0.5, 0.5, 0.5,
        -0.5, -0.5, 0.5, -0.5, 0.5, 0.5
    ]

    gEngine.GL.addDrawObject({
        name: "Upper Triangle",
        vertexData: vertices,
        fillColor: [1, 1, 1, 1],
        transformation: {
            translate: [-0.25, 0.25],
            rotate: 0.2,
            scale: [1.2, 1.2]
        }
    })

    gEngine.GL.addDrawObject({
        name: "Lower Triangle",
        vertexData: vertices,
        fillColor: [1, 0, 0, 1],
        transformation: {
            rotate: -Math.PI / 4,
            scale: [0.4, 0.4],
            translate: [0.25, -0.25]
        }
    })

}



