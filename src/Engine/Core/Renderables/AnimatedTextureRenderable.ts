import { ImageLoader } from "../Resources";
import { IAtlasElementInfo, IAtlasInfo, ITextureRenderDimensions } from "../Types/Atlas";
import { IObjectInfoRequest } from "../Types/ObjectInfo";
import { Renderable } from "./Renderable";

export class AnimatedTextureRenderable extends Renderable {
    public animations: Record<string, number[][]> = {}
    public imageBitmap!: ImageBitmap
    public curAnimation!: string
    private curAnimationIndex = 0
    private curTime!: Date
    private incFrameValue = 1
    private animationSpeedMs = 50

    public constructor(name: string) {
        super(name)
    }

    public loadAnimations(atlas: IAtlasInfo, animations: Record<string, IAtlasElementInfo[]>, dimensions: ITextureRenderDimensions) {
        this.rect(dimensions.width, dimensions.height)

        const imageBitmap = ImageLoader.fetchImage(atlas.image)
        if (imageBitmap) {
            this.imageBitmap = imageBitmap
        }

        const processedAnimations: Record<string, number[][]> = {}
        for (const key in animations) {
            processedAnimations[key] = []
            for (const elementInfo of animations[key]) {
                const x = elementInfo.x / atlas.width
                const y = elementInfo.y / atlas.height
                const xW = x + elementInfo.width / atlas.width
                const yH = y + elementInfo.height / atlas.height
                processedAnimations[key].push([
                    x, y, x, yH, xW, y,
                    x, yH, xW, yH, xW, y
                ])
            }
        }
        this.animations = processedAnimations
        this.curAnimation = Object.keys(this.animations)[0] ?? ""

        return this
    }

    public override getObjectInfo(): IObjectInfoRequest {
        this.curTime = new Date()
        return {
            type: 'animated-texture',
            name: this.name,
            fillColor: this.color,
            vertexData: this.vertices,
            textureUVs: this.frame.bind(this),
            imageBitmap: this.imageBitmap,
            samplerType: {
                addressModeU: 'clamp-to-edge',
                addressModeV: 'clamp-to-edge',
                magFilter: 'nearest',
            },
            draw: this.animateAndDraw.bind(this),
        }
    }

    public setCurAnimation(key: string) {
        if (key in this.animations) {
            this.curAnimation = key
        }

        return this
    }

    public setAnimationDirection(dir: 'left-to-right' | 'right-to-left') {
        if (dir === 'left-to-right') {
            this.incFrameValue = 1
        } else if (dir === 'right-to-left') {
            this.incFrameValue = -1
        }

        return this
    }

    public setAnimationSpeed(ms: number) {
        this.animationSpeedMs = ms
        return this
    }


    private frame() { return this.animations[this.curAnimation][this.curAnimationIndex] }

    public animateAndDraw() {
        const temp = new Date()
        if (temp.getTime() - this.curTime.getTime() > this.animationSpeedMs) {
            this.curAnimationIndex = Math.abs(
                (this.curAnimationIndex + this.incFrameValue) %
                this.animations[this.curAnimation].length
            )
            this.curTime = new Date()
        }
        return this.draw()
    }
}