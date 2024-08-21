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
    private reColor = false

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
        if (!text.length) return this
        this.text = text

        let lineIndex = 0
        const lines = this.text.split('\n')

        const widths: number[] = []
        for (const line of lines) {
            let xPos = 0

            for (let i = 0; i < line.length; i++) {
                const imageUVs = this.fontUVs[line.charCodeAt(i)]
                const charFont = this.font.chars[line.charCodeAt(i)]

                const yOffset = this.size * charFont.yoffset / this.font.common.lineHeight

                const xS = xPos
                const yS = yOffset + (this.size + this.lineSpacing) * lineIndex
                const xE = xS + Math.ceil(this.size * charFont.width / this.font.info.size)
                const yE = yS + Math.ceil(this.size * charFont.height / this.font.common.lineHeight)

                xPos = xE + this.letterSpacing

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
            }

            widths.push(xPos)
            lineIndex += 1
        }


        this.width = Math.max(...widths)
        this.height = lines.length * this.size + (lines.length - 1) * this.lineSpacing
        this.cx = this.x + this.width / 2
        this.cy = this.y + this.height / 2

        return this
    }

    public override setColor(col?: number[]): this {
        this.reColor = true
        return super.setColor(col)
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
            reColorImage: this.reColor,
            draw: this.draw.bind(this),
        }
    }
}