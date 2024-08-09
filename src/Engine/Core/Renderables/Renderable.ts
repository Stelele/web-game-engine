import { Mat3 } from "../../Utilities/Mat3";
import { IObjectInfoRequest } from "../Types/ObjectInfo";

export class Renderable {
    public name: string
    public vertices!: number[]
    public color!: number[]
    public scale!: number
    public rotation!: number
    public x!: number
    public y!: number
    public width!: number
    public height!: number


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

        return this
    }

    private setVertices(data?: number[]) {
        this.vertices = data ?? []
        return this
    }

    public setColor(col?: number[]) {
        this.color = col ?? [1, 1, 1, 1]

        if (this.color.length !== 4) {
            throw new Error("Array must be a 4 element array")
        }

        return this
    }

    public setScale(size?: number) {
        let s = size
        if (!s) { s = 1 }
        this.scale = s
        return this
    }

    public incScale(size: number) {
        this.scale += size
    }

    private get scaleMat() {
        const s = this.scale
        return new Mat3([
            s, 0, 0,
            0, s, 0,
            0, 0, 1,
        ])

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
        const s = Math.sin(this.rotation)
        const c = Math.cos(this.rotation)
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

        this.x = x
        this.y = y

        return this
    }

    public incPos(pos: { x?: number, y?: number }) {
        this.x += pos.x ?? 0
        this.y += pos.y ?? 0
    }

    private get translateMat() {
        return new Mat3([
            1, 0, 0,
            0, 1, 0,
            this.x, this.y, 1,
        ])
    }

    private getMatrix() {
        return this.scaleMat
            .matMul(this.rotateMat)
            .matMul(this.translateMat)
            .Value
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
        return this.getMatrix()
    }
}