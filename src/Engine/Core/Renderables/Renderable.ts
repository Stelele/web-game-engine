import { Mat4 } from "../../Utilities/Mat4";
import { Vec2 } from "../../Utilities/Vec2";
import { IObjectInfoRequest } from "../Types/ObjectInfo";

export class Renderable {
    public name: string
    public vertices!: number[]
    public color!: number[]
    public scale!: number
    public rotation!: number
    public x!: number
    public y!: number
    protected cx!: number
    protected cy!: number
    public width!: number
    public height!: number
    public visible = true
    private frontDirection = [0, 1]
    public speed = 0
    public showBoundingBox = false

    public constructor(name: string) {
        this.name = name
        this.setVertices()
        this.setColor()
        this.setScale()
        this.setRotation()
        this.setPos()
    }


    public get scaledWidth() { return this.width * this.scale }
    public get scaledHeight() { return this.height * this.scale }
    public get curFrontDirection() { return this.frontDirection }
    public get boundingBox() {
        return new BoundingBox(
            [this.cx, this.cy],
            this.scaledWidth,
            this.scaledHeight
        )
    }

    protected setCenterPos([x, y]: number[]) {
        this.cx = x
        this.cy = y
    }

    public rect(width: number, height: number) {
        this.width = width
        this.height = height
        this.setVertices([
            0, 0,
            0, height,
            width, 0,
            0, height,
            width, height,
            width, 0
        ])

        this.setCenterPos([this.width / 2, this.height / 2])

        return this
    }

    private setVertices(data?: number[]) {
        this.vertices = data ?? []
        return this
    }

    /**
     * set color using red, green, blue, alpha color model
     * @param r value ranges from 0 to 255
     * @param g value ranges from 0 to 255
     * @param b value ranges from 0 to 255
     * @param a value ranges from 0 to 255
     * @returns 
     */
    public setColor([r, g, b, a]: number[] = [255, 255, 255, 255]) {

        this.color = [
            r / 255,
            g / 255,
            b / 255,
            a / 255,
        ]

        if (this.color.length !== 4) {
            throw new Error("Array must be a 4 element array")
        }

        return this
    }

    /** 
    * set color using hue, saturation, brightness color model
    * 
    * @param hue value ranges from 0 to 360 degrees
    * @param sat value ranges from 0 to 100
    * @param bright value ranges from 0 to 100
    * @param alpha value ranges from 0 to 255
    */
    public setColorHSB([hue, sat, bright, alpha]: number[]) {
        const s = sat / 100
        const b = bright / 100
        const k = (n: number) => (n + hue / 60) % 6
        const f = (n: number) => b * (1 - s * Math.max(0, Math.min(k(n), 4 - k(n), 1)))
        this.color = [f(5), f(3), f(1), alpha / 255]

        if (this.color.length !== 4) {
            throw new Error("Array must be a 4 element array")
        }

        return this
    }

    public setFrontDirection([x, y]: number[]) {
        this.frontDirection = Vec2.normalize([x, y])
    }

    public setScale(size?: number) {
        this.scale = size ?? 1
        return this
    }

    public incScale(size: number) {
        this.scale += size
    }

    private get scaleMat() {
        const s = this.scale
        return Mat4.scaleMat([s, s, 1])

    }

    public setRotation(theta?: number) {
        let t = theta
        if (!t) { t = 0 }
        this.rotation = t

        return this
    }

    public incRotation(theta: number) {
        this.rotation += theta
    }

    private get rotateMat() {
        return Mat4.rotateZMat(-this.rotation)
    }

    public setPos(pos: { x?: number, y?: number } = {}) {
        this.x = pos.x ?? 0
        this.y = pos.y ?? 0
        this.cx = this.x + this.width / 2
        this.cy = this.y + this.height / 2
        return this
    }

    public incPos(pos: { x?: number, y?: number }) {
        this.x += pos.x ?? 0
        this.y += pos.y ?? 0
        this.cx = this.x + this.width / 2
        this.cy = this.y + this.height / 2
        return this
    }

    private get translateMat() {
        return Mat4.translateMat([this.x, this.y, 0])
    }

    private getMatrix() {
        return Mat4.matMul(
            this.scaleMat,
            Mat4.matMul(
                this.rotateMat,
                this.translateMat
            )
        ).Value
    }

    public getObjectInfo(): IObjectInfoRequest {
        return {
            type: 'primitive',
            name: this.name,
            fillColor: this.color,
            vertexData: this.vertices,
            draw: this.draw.bind(this),
        }
    }

    public update() { }

    public draw() {
        if (!this.visible) return Mat4.ZeroMat().Value
        return this.getMatrix()
    }

    public isBBCollision(obj: Renderable) {
        return this.boundingBox.intesects(obj.boundingBox)
    }

    public getBBCollisionStatus(obj: Renderable) {
        return this.boundingBox.collisionStatus(obj.boundingBox)
    }

    public rotateObjToPointTo(obj: Renderable, rate: number) {
        let dir = Vec2.subtract([obj.x, obj.y], [this.x, this.y])
        const len = Vec2.length(dir)
        if (len < Number.MIN_VALUE) return
        dir = Vec2.scale(dir, 1 / len)

        const fDir = this.curFrontDirection
        let cosTheta = Math.max(-1, Math.min(1, Vec2.dot(dir, fDir)))
        if (cosTheta > 0.999999) return

        const r3D = Vec2.cross(fDir, dir)

        let rad = Math.acos(cosTheta)
        if (r3D > 0) {
            rad = -rad
        }

        rad *= rate
        this.frontDirection = Vec2.rotate(this.frontDirection, rad)
        this.incRotation(rad)
    }
}

export class BoundingBox {
    public minX: number
    public minY: number
    public maxX: number
    public maxY: number

    public constructor([cx, cy]: number[], width: number, height: number) {
        this.minX = cx - width / 2
        this.minY = cy - height / 2
        this.maxX = cx + width / 2
        this.maxY = cy + height / 2
    }

    public containsPoint([x, y]: number[]) {
        return this.minX < x && this.maxX > x &&
            this.minY < y && this.maxY > y
    }

    public intesects(bound: BoundingBox) {
        return this.minX < bound.maxX &&
            this.maxX > bound.minX &&
            this.minY < bound.maxY &&
            this.maxY > bound.minY
    }

    public collisionStatus(bound: BoundingBox) {
        let status: number = BoundingCollisionStatus.OUTSIDE

        if (!this.intesects(bound)) return status

        if (bound.minX < this.minX) {
            status |= BoundingCollisionStatus.LEFT
        }
        if (bound.maxX > this.maxX) {
            status |= BoundingCollisionStatus.RIGHT
        }
        if (bound.minY < this.minY) {
            status |= BoundingCollisionStatus.TOP
        }
        if (bound.maxY > this.maxY) {
            status |= BoundingCollisionStatus.BOTTOM
        }
        if (status === BoundingCollisionStatus.OUTSIDE) {
            status = BoundingCollisionStatus.INSIDE
        }

        return status
    }
}

export enum BoundingCollisionStatus {
    LEFT = 1,
    RIGHT = 2,
    TOP = 4,
    BOTTOM = 8,
    INSIDE = 16,
    OUTSIDE = 0,
}