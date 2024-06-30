import { gEngine } from "../Engine";
import { SimpleFS } from "../shaders/SimpleFS";
import { SimpleVS } from "../shaders/SimpleVS";

export async function main() {
    await gEngine.initializeWebGPU("GLCanvas")

    gEngine.GL.loadShaders(SimpleVS, SimpleFS)
    gEngine.GL.setFillColor(new Float32Array([0.5, 0, 1, 1]))
}



