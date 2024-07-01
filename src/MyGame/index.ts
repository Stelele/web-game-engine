import { gEngine } from "../Engine";
import { SimpleFS } from "../shaders/SimpleFS";
import { SimpleVS } from "../shaders/SimpleVS";

export async function main() {
    await gEngine.initializeWebGPU("GLCanvas")

    gEngine.GL.loadShaders(SimpleVS, SimpleFS)

    const vertices = new Float32Array([
        -0.5, -0.5, -0.5, 0.5, 0.5, 0.5,
        -0.5, -0.5, 0.5, -0.5, 0.5, 0.5
    ])

    gEngine.GL.addDrawObject({
        name: "Upper Triangle",
        vertexData: vertices,
        fillColor: new Float32Array([0.5, 0, 1, 1])
    })

    gEngine.GL.addDrawObject({
        name: "Lower Triangle",
        vertexData: vertices,
        fillColor: new Float32Array([0, 0, 1, 1])
    })

}



