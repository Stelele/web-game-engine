import { gEngine } from "../EngineCore"
import { ImageLoader } from "./ImageLoader"
import { TextFileLoader, TextFileType } from "./TextFileLoader"

export interface IPadding {
    left: number
    right: number
    up: number
    down: number
}

export interface ISpacing {
    horizontal: number
    vertical: number
}

export interface IFontInfo {
    face: string
    size: number
    bold: boolean
    italic: boolean
    charset: string
    unicode: boolean
    stretchH: number
    smooth: boolean
    aa: number
    padding: IPadding
    spacing: ISpacing
    outline: number
}

export interface IFontCommon {
    lineHeight: number
    base: number
    scaleW: number
    scaleH: number
    pages: number
    packed: boolean
    alphaChnl: number
    redChnl: number
    greenChnl: number
    blueChnl: number
}

export interface IFontChar {
    id: number
    x: number
    y: number
    width: number
    height: number
    xoffset: number
    yoffset: number
    xadvance: number
    page: number
    chnl: number
}

export interface IFont {
    atlas: ImageBitmap
    info: IFontInfo
    common: IFontCommon
    chars: Record<string, IFontChar>
}

export class FontLoader {
    private constructor() { }

    public static async loadBitmapFont(fontName: string) {
        if (gEngine.ResourceManager.isAssetLoaded(fontName)) {
            gEngine.ResourceManager.incAssetRefCount(fontName)
            return
        }

        gEngine.ResourceManager.asyncLoadRequested(fontName)

        const atlasName = `${fontName}.png`
        const infoName = `${fontName}.fnt`

        const atlasPromise = ImageLoader.loadImageAsBitMap(atlasName)
        const infoPromise = TextFileLoader.loadTextFile(infoName, TextFileType.XMLFile)

        await Promise.all([atlasPromise, infoPromise])

        const atlas = ImageLoader.fetchImage(atlasName) as ImageBitmap
        const fontDocument = TextFileLoader.fetchTextFile(infoName) as Document

        const fontNode = fontDocument.childNodes.item(0)

        const nodes: Record<string, HTMLElement> = {}
        fontNode.childNodes.forEach((node) => {
            nodes[node.nodeName] = node as HTMLElement
        })

        const info = getFontInfo()
        const common = getFontCommon()
        const chars = getFontChars()

        const font: IFont = { info, common, chars, atlas }
        gEngine.ResourceManager.asyncLoadCompleted(fontName, font)

        function getFontInfo(): IFontInfo {
            const infoNode = nodes["info"]

            const face = infoNode.attributes.getNamedItem("face")?.value ?? ""
            const size = infoNode.attributes.getNamedItem("size")?.value ?? ""
            const bold = infoNode.attributes.getNamedItem("bold")?.value ?? ""
            const italic = infoNode.attributes.getNamedItem("italic")?.value ?? ""
            const charset = infoNode.attributes.getNamedItem("charset")?.value ?? ""
            const unicode = infoNode.attributes.getNamedItem("unicode")?.value ?? ""
            const stretchH = infoNode.attributes.getNamedItem("stretchH")?.value ?? ""
            const smooth = infoNode.attributes.getNamedItem("smooth")?.value ?? ""
            const aa = infoNode.attributes.getNamedItem("aa")?.value ?? ""
            const padding = infoNode.attributes.getNamedItem("padding")?.value.split(",") ?? ["0", "0", "0", "0"]
            const spacing = infoNode.attributes.getNamedItem("spacing")?.value.split(",") ?? ["1", "1"]
            const outline = infoNode.attributes.getNamedItem("outline")?.value ?? ""

            return {
                face,
                size: Number.parseInt(size),
                bold: bold === "1" ? true : false,
                italic: italic === "1" ? true : false,
                charset,
                unicode: unicode === "1" ? true : false,
                stretchH: Number.parseInt(stretchH),
                smooth: smooth === "1" ? true : false,
                aa: Number.parseInt(aa),
                padding: {
                    up: Number.parseInt(padding[0]),
                    right: Number.parseInt(padding[1]),
                    down: Number.parseInt(padding[2]),
                    left: Number.parseInt(padding[3])
                },
                spacing: {
                    horizontal: Number.parseInt(spacing[0]),
                    vertical: Number.parseInt(spacing[1])
                },
                outline: Number.parseInt(outline)
            }
        }

        function getFontCommon(): IFontCommon {
            const commonNode = nodes["common"]

            const lineHeight = commonNode.attributes.getNamedItem("lineHeight")?.value ?? ""
            const base = commonNode.attributes.getNamedItem("base")?.value ?? ""
            const scaleW = commonNode.attributes.getNamedItem("scaleW")?.value ?? ""
            const scaleH = commonNode.attributes.getNamedItem("scaleH")?.value ?? ""
            const pages = commonNode.attributes.getNamedItem("pages")?.value ?? ""
            const packed = commonNode.attributes.getNamedItem("packed")?.value ?? ""
            const alphaChnl = commonNode.attributes.getNamedItem("alphaChnl")?.value ?? ""
            const redChnl = commonNode.attributes.getNamedItem("redChnl")?.value ?? ""
            const greenChnl = commonNode.attributes.getNamedItem("greenChnl")?.value ?? ""
            const blueChnl = commonNode.attributes.getNamedItem("blueChnl")?.value ?? ""

            return {
                lineHeight: Number.parseInt(lineHeight),
                base: Number.parseInt(base),
                scaleW: Number.parseInt(scaleW),
                scaleH: Number.parseInt(scaleH),
                pages: Number.parseInt(pages),
                packed: packed === "1" ? true : false,
                alphaChnl: Number.parseInt(alphaChnl),
                redChnl: Number.parseInt(redChnl),
                greenChnl: Number.parseInt(greenChnl),
                blueChnl: Number.parseInt(blueChnl)
            }
        }

        function getFontChars(): Record<string, IFontChar> {
            const charsNode = nodes["chars"]
            const charsNum = Number.parseInt(charsNode.attributes.getNamedItem("count")?.value ?? "0")

            const chars: Record<string, IFontChar> = {}
            for (let i = 0; i < charsNum; i++) {
                const charNode = charsNode.children.item(i)
                if (!charNode) continue

                const id = Number.parseInt(charNode.attributes.getNamedItem("id")?.value ?? "")
                const x = Number.parseInt(charNode.attributes.getNamedItem("x")?.value ?? "")
                const y = Number.parseInt(charNode.attributes.getNamedItem("y")?.value ?? "")
                const width = Number.parseInt(charNode.attributes.getNamedItem("width")?.value ?? "")
                const height = Number.parseInt(charNode.attributes.getNamedItem("height")?.value ?? "")
                const xoffset = Number.parseInt(charNode.attributes.getNamedItem("xoffset")?.value ?? "")
                const yoffset = Number.parseInt(charNode.attributes.getNamedItem("yoffset")?.value ?? "")
                const xadvance = Number.parseInt(charNode.attributes.getNamedItem("xadvance")?.value ?? "")
                const page = Number.parseInt(charNode.attributes.getNamedItem("page")?.value ?? "")
                const chnl = Number.parseInt(charNode.attributes.getNamedItem("chnl")?.value ?? "")

                chars[id] = { id, x, y, width, height, xoffset, yoffset, xadvance, page, chnl }
            }

            return chars
        }
    }

    public static fetchBitmapFont(fontName: string) {
        return gEngine.ResourceManager.retrieveAsset<IFont>(fontName)
    }

    public static unloadFont(fontName: string) {
        gEngine.ResourceManager.unloadAsset(fontName)
    }
}