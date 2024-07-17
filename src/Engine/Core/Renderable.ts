import { Mat4 } from "../Utilities/Mat4";
import { IObjectInfoRequest } from "./Renderer";

export class Renderable {
    private _name: string
    private _vertices!: number[]
    private _color!: number[]
    private _scale!: Mat4
    private _rotation!: Mat4
    private _translation!: Mat4

    public constructor(name: string) {
        this._name = name
        this.vertices()
        this.color()
        this.scale()
        this.rotate()
        this.translate()
    }

    public vertices(data?: number[]) {
        this._vertices = data ?? []
        return this
    }

    public color(col?: number[]) {
        this._color = col ?? [1, 1, 1, 1]

        if (this._color.length !== 4) {
            throw new Error("Array must be a 4 element array")
        }

        return this
    }

    public scale(size?: number) {
        let s = size
        if (!s) { s = 1 }

        this._scale = new Mat4([
            s, 0, 0, 0,
            0, s, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ])

        return this
    }

    public rotate(theta?: number) {
        let t = theta
        if (!t) { t = 0 }

        const s = Math.sin(t)
        const c = Math.cos(t)
        this._rotation = new Mat4([
            c, s, 0, 0,
            -1 * s, c, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 1
        ])

        return this
    }

    public translate(pos: { x?: number, y?: number } = {}) {
        console.log(pos)
        let x = pos.x
        let y = pos.y
        if (!x) { x = 0 }
        if (!y) { y = 0 }

        this._translation = new Mat4([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, 0, 1
        ])

        return this
    }

    private getMatrix() {
        return this._scale
            .matMul(this._rotation)
            .matMul(this._translation)
            .Value
    }

    public getObjectInfo(): IObjectInfoRequest {
        return {
            name: this._name,
            fillColor: this._color,
            vertexData: this._vertices,
            transformation: this.getMatrix()
        }
    }
}