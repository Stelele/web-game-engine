import { Interpolate, InterpolateV2 } from "../../Utilities/Interpolate"
import { Mat4 } from "../../Utilities/Mat4"
import { Vec2 } from "../../Utilities/Vec2"
import { gEngine } from "../EngineCore"
import { BoundingBox, BoundingCollisionStatus } from "./BoundingBox"
import { Renderable } from "./Renderables"

export class Camera {
    private name: string
    private state: CameraState

    public constructor(
        name: string,
        options?: {
            cx?: number,
            cy?: number,
            width?: number,
            height?: number
        }
    ) {
        this.name = name
        const cx = options?.cx ?? gEngine.width / 2
        const cy = options?.cy ?? gEngine.height / 2
        const width = options?.width ?? gEngine.width
        const height = options?.height ?? gEngine.height

        this.state = new CameraState([cx, cy], width, height)
    }

    public get Name() { return this.name }
    public get ViewProjMat() {
        const viewMat = Mat4.lookAt(
            [...this.state.center, 10],
            [...this.state.center, 0],
            [0, 1, 0]
        )

        const projMat = Mat4.ortho(
            -(this.state.width / 2),
            this.state.width / 2,
            -(this.state.height / 2),
            this.state.height / 2,
            0,
            1000
        )

        return Mat4.matMul(viewMat, projMat).Value
    }

    public update() {
        this.state.updateCameraState()
    }

    public configIntepolation(stiffness: number, duration: number) {
        this.state.configInterpolation(stiffness, duration)
    }

    public boundingBox(zone = 1) {
        return new BoundingBox(this.state.center, zone * this.state.width, zone * this.state.height)
    }

    public clampAtBoundary(obj: Renderable, zone: number) {
        const { status, statusObj } = this.boundingBox(zone).collisionStatus(obj.boundingBox)
        if (status === BoundingCollisionStatus.INSIDE) return { status, statusObj }

        if (statusObj['top']) {
            obj.y = this.state.center[1] - (zone * this.state.height / 2)
        }
        if (statusObj['bottom']) {
            obj.y = this.state.center[1] + (zone * this.state.height / 2) - obj.scaledHeight
        }
        if (statusObj['right']) {
            obj.x = this.state.center[0] + (zone * this.state.width / 2) - obj.scaledWidth
        }
        if (statusObj['left']) {
            obj.x = this.state.center[0] - (zone * this.state.width / 2)
        }

        return { status, statusObj }
    }

    public panBy([dx, dy]: number[]) {
        const cx = this.state.center[0] + dx
        const cy = this.state.center[1] + dy
        this.state.setCenter([cx, cy])
    }

    public panTo([cx, cy]: number[]) {
        this.state.setCenter([cx, cy])
    }

    public panWith(obj: Renderable, zone: number) {
        const { status, statusObj } = this.boundingBox(zone).collisionStatus(obj.boundingBox)
        if (status === BoundingCollisionStatus.INSIDE) return { status, statusObj }

        let cx = this.state.center[0]
        let cy = this.state.center[1]

        if (statusObj['top']) {
            cy = obj.cy - (zone * this.state.height / 2) + obj.scaledHeight
        }
        if (statusObj['bottom']) {
            cy = obj.cy + (zone * this.state.height / 2) - obj.scaledHeight
        }
        if (statusObj['left']) {
            cx = obj.cx - (zone * this.state.width / 2) + obj.scaledWidth
        }
        if (statusObj['right']) {
            cx = obj.cx + (zone * this.state.width / 2) - obj.scaledWidth
        }

        this.state.setCenter([cx, cy])
    }

    public zoomBy(zoom: number) {
        if (zoom > 0) {
            this.state.setDimensions(
                Math.max(1, this.state.width * zoom),
                Math.max(1, this.state.height * zoom),
            )
        }
    }

    public zoomTowards([x, y]: number[], zoom: number) {
        let delta = Vec2.subtract([x, y], this.state.center)
        delta = Vec2.scale(delta, zoom - 1)
        const newC = Vec2.subtract(this.state.center, delta)

        this.state.setCenter(newC)

        this.zoomBy(zoom)
    }
}

class CameraState {
    private readonly cycles = 300
    private readonly rate = 0.1
    private _center: InterpolateV2
    private _width: Interpolate
    private _height: Interpolate

    public constructor(center: number[], width: number, height: number) {
        this._center = new InterpolateV2(center, this.cycles, this.rate)
        this._width = new Interpolate(width, this.cycles, this.rate)
        this._height = new Interpolate(height, this.cycles, this.rate)
    }

    public get center() { return this._center.value }
    public get width() { return this._width.value }
    public get height() { return this._height.value }

    public setCenter(value: number[]) {
        this._center.setFinalValue(value)
    }

    public setDimensions(width: number, height: number) {
        this._width.setFinalValue(width)
        this._height.setFinalValue(height)
    }

    public updateCameraState() {
        this._center.updateInterpolation()
        this._width.updateInterpolation()
        this._height.updateInterpolation()
    }

    public configInterpolation(stiffness: number, duration: number) {
        this._center.configInterpolation(stiffness, duration)
        this._width.configInterpolation(stiffness, duration)
        this._height.configInterpolation(stiffness, duration)
    }
}