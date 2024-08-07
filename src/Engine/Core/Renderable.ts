import { Mat3 } from "../Utilities/Mat3";
import { ImageLoader } from "./Resources";
import { IObjectInfoRequest, IRenderableType } from "./Types/ObjectInfo";

export class Renderable {
    private _name: string
    private _type: IRenderableType
    private _vertices!: number[]
    private _color!: number[]
    private _scale!: number
    private _rotation!: number
    private _x!: number
    private _y!: number
    private _width!: number
    private _height!: number
    private _imageBitmap!: ImageBitmap
    private _imageUVs!: number[]

    public constructor(name: string, type: IRenderableType = 'primitive') {
        this._name = name
        this._type = type
        this.vertices()
        this.setColor()
        this.setScale()
        this.setRotation()
        this.setPos()
    }

    public get name() { return this._name }
    public get x() { return this._x }
    public get y() { return this._y }
    public get width() { return this._width }
    public get height() { return this._height }
    public get scaledWidth() { return this.width * this.scale }
    public get scaledHeight() { return this.height * this.scale }
    public get scale() { return this._scale }
    public get rotatation() { return this._rotation }
    public get color() { return this._color }

    public rect(width: number, height: number) {
        this._width = width
        this._height = height
        this.vertices([
            0, 0,
            0, height,
            width, 0,
            0, height,
            width, height,
            width, 0
        ])

        return this
    }

    public texture(width: number, height: number, image: string) {
        this._width = width
        this._height = height
        this.vertices([
            0, 0,
            0, height,
            width, 0,
            0, height,
            width, height,
            width, 0
        ])

        const imageBitmap = ImageLoader.fetchImage(image)
        if (imageBitmap) {
            this._imageBitmap = imageBitmap
        }
        this._imageUVs = [
            0, 0,
            0, 1,
            1, 0,
            0, 1,
            1, 1,
            1, 0,
        ]

        return this
    }

    private vertices(data?: number[]) {
        this._vertices = data ?? []
        return this
    }

    public setColor(col?: number[]) {
        this._color = col ?? [1, 1, 1, 1]

        if (this._color.length !== 4) {
            throw new Error("Array must be a 4 element array")
        }

        return this
    }

    public setScale(size?: number) {
        let s = size
        if (!s) { s = 1 }
        this._scale = s
        return this
    }

    public incScale(size: number) {
        this._scale += size
    }

    private get scaleMat() {
        const s = this._scale
        return new Mat3([
            s, 0, 0,
            0, s, 0,
            0, 0, 1,
        ])

    }

    public setRotation(theta?: number) {
        let t = theta
        if (!t) { t = 0 }
        this._rotation = t

        return this
    }

    public incRotation(theta: number) {
        this._rotation += theta
    }

    private get rotateMat() {
        const s = Math.sin(this._rotation)
        const c = Math.cos(this._rotation)
        return new Mat3([
            c, -s, 0,
            s, c, 0,
            0, 0, 1,
        ])
    }

    public setPos(pos: { x?: number, y?: number } = {}) {
        let x = pos.x
        let y = pos.y
        if (!x) { x = 0 }
        if (!y) { y = 0 }

        this._x = x
        this._y = y

        return this
    }

    public incPos(pos: { x?: number, y?: number }) {
        this._x += pos.x ?? 0
        this._y += pos.y ?? 0
    }

    private get translateMat() {
        return new Mat3([
            1, 0, 0,
            0, 1, 0,
            this._x, this._y, 1,
        ])
    }

    private getMatrix() {
        return this.scaleMat
            .matMul(this.rotateMat)
            .matMul(this.translateMat)
            .Value
    }

    public getObjectInfo(): IObjectInfoRequest {
        if (this._type === 'primitive') {
            return {
                type: 'primitive',
                name: this._name,
                fillColor: this._color,
                vertexData: this._vertices,
                draw: this.draw.bind(this),
            }
        }

        return {
            type: 'texture',
            name: this._name,
            fillColor: this._color,
            vertexData: this._vertices,
            textureUVs: this._imageUVs,
            imageBitmap: this._imageBitmap,
            samplerType: {
                addressModeU: 'clamp-to-edge',
                addressModeV: 'clamp-to-edge',
                magFilter: 'nearest',
            },
            draw: this.draw.bind(this),
        }
    }

    public update() { }

    public draw() {
        return this.getMatrix()
    }
}