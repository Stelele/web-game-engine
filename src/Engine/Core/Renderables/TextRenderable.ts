import { FontLoader, IFont } from "../Resources";
import { IObjectInfoRequest } from "../Types/ObjectInfo";
import { Renderable } from "./Renderable";

export class TextRenderable extends Renderable {
    public font!: IFont
    public fontUVs: Record<string, number[]> = {}
    public imageUVs: number[] = []
    public text!: string
    public size!: number
    public letterSpacing = 2
    public lineSpacing = 2

    constructor(name: string) {
        super(name)
        this.setFont()
    }

    public setFont(size: number = 16, font: string = "/Fonts/system_default_font") {
        this.size = size
        const temp = FontLoader.fetchBitmapFont(font)

        if (temp) {
            this.font = temp
        }

        this.fontUVs = {}

        for (const charKey in this.font.chars) {
            const char = this.font.chars[charKey]

            const xS = char.x / this.font.atlas.width
            const yS = char.y / this.font.atlas.height
            const xE = (char.x + char.width) / this.font.atlas.width
            const yE = (char.y + char.height) / this.font.atlas.height

            this.fontUVs[char.id] = [
                xS, yS,
                xS, yE,
                xE, yS,
                xS, yE,
                xE, yE,
                xE, yS,
            ]
        }

        return this
    }

    public setText(text: string) {
        if (!text.length) return
        this.text = text

        const lines = this.text.split('\n')

        let lI = 0
        for (const line of lines) {
            let cI = 0
            for (const char of line.split('')) {
                const imageUVs = this.fontUVs[char.charCodeAt(0)]
                const charFont = this.font.chars[char.charCodeAt(0)]

                const xOffset = this.size * charFont.xoffset / this.font.info.size
                const yOffset = this.size * charFont.yoffset / this.font.common.lineHeight

                const x = (this.size + this.letterSpacing) * cI
                const y = (this.size + this.lineSpacing) * lI

                const xS = x + xOffset
                const yS = y + yOffset
                const xE = x + this.size
                const yE = y + this.size

                const vertices = [
                    xS, yS,
                    xS, yE,
                    xE, yS,
                    xS, yE,
                    xE, yE,
                    xE, yS,
                ]

                this.vertices.push(...vertices)
                this.imageUVs.push(...imageUVs)
                cI += 1
            }

            lI += 1
        }

        this.width = Math.max(...lines.map((l) => l.length * this.size + (l.length - 1) * this.letterSpacing))
        this.height = lines.length * this.size + (lines.length - 1) * this.lineSpacing

        return this
    }

    public override getObjectInfo(): IObjectInfoRequest {
        return {
            type: 'texture',
            name: this.name,
            fillColor: this.color,
            vertexData: this.vertices,
            textureUVs: this.imageUVs,
            imageBitmap: this.font.atlas,
            samplerType: {
                addressModeU: 'clamp-to-edge',
                addressModeV: 'clamp-to-edge',
                magFilter: 'nearest',
            },
            draw: this.draw.bind(this),
        }
    }
}