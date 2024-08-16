import { SimpleFS } from "../Shaders/SimpleFS"
import { SimpleVS } from "../Shaders/SimpleVS"
import { TextureFS } from "../Shaders/TextureFS"
import { TexturevS as TextureVS } from "../Shaders/TextureVS"
import { InputHandler } from "./InputHandler"
import { Renderer } from "./Renderer"
import { AudioLoader, FontLoader, ImageLoader, IResource, IResourceManifest, TextFileLoader, TextFileType } from "./Resources"
import { ResourceMap } from "./Resources/ResourceMap"

export class gEngine {
    private constructor() { }

    // graphics context for drawing
    private static _Renderer: Renderer
    public static get GL() { return this._Renderer }

    // input hander
    public static get Input() { return InputHandler }

    // resource manager
    public static get ResourceManager() { return ResourceMap }

    private static _width: number = 640
    private static _height: number = 360

    public static get width() { return gEngine._width }
    public static get height() { return gEngine._height }

    public static async initializeWebGPU(htmlCanvasId: string) {
        document.body.style.backgroundColor = "black"
        const canvas = document.getElementById(htmlCanvasId) as HTMLCanvasElement

        this.Input.initialize()

        if (!this._Renderer) {
            this._Renderer = new Renderer(canvas)
        }

        await this._Renderer.init(this.width, this.height)
        this.GL.loadShaders(SimpleVS, SimpleFS, 'primitive')
        this.GL.loadShaders(TextureVS, TextureFS, 'texture')
        this.GL.loadShaders(TextureVS, TextureFS, 'animated-texture')
    }

    public static async loadResourcesFromManifest(manifest: IResourceManifest) {
        const promises: Promise<unknown>[] = []
        for (const batch in manifest) {
            for (const asset in manifest[batch]) {
                promises.push(this.loadResource(manifest[batch][asset]))
            }
        }

        await Promise.all(promises)
    }

    public static async loadResource(resource: IResource) {
        if (resource.type === 'font') {
            await FontLoader.loadBitmapFont(resource.url)
            return
        }

        if (resource.type === 'image') {
            await ImageLoader.loadImageAsBitMap(resource.url)
            return
        }

        if (resource.type === 'sound') {
            await AudioLoader.loadAudio(resource.url)
            return
        }

        if (resource.type === 'text') {
            const format = resource.format === 'text' ? TextFileType.TextFile : TextFileType.XMLFile
            await TextFileLoader.loadTextFile(resource.url, format)
            return
        }
    }

    public static setWorldDimensions(width: number) {
        gEngine._width = width
        gEngine._height = Math.round(width * 9 / 16)
    }

}