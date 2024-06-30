import { Renderer } from "./Renderer"

export class gEngine {
    private constructor() { }

    // graphics context for drawing
    private static _Renderer: Renderer
    public static get GL() { return this._Renderer }

    public static async initializeWebGPU(htmlCanvasId: string) {
        document.body.style.backgroundColor = "black"
        const canvas = document.getElementById(htmlCanvasId) as HTMLCanvasElement

        if (!this._Renderer) {
            this._Renderer = new Renderer(canvas)
        }

        await this._Renderer.init()
    }

}