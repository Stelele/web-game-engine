import { Mat4 } from "../../../Utilities/Mat4"
import { Vec2 } from "../../../Utilities/Vec2"
import { gEngine } from "../../EngineCore"
import { BoundingBox, BoundingCollisionStatus } from "../BoundingBox"
import { Renderable } from "../Renderables"
import { CameraShake } from "./CameraShake"
import { CameraState } from "./CameraState"

export class Camera {
    private _name: string
    private state: CameraState
    private shaker?: CameraShake
    private centerBeforeShake: number[] = []

    public constructor(
        name: string,
        options?: {
            cx?: number,
            cy?: number,
            width?: number,
            height?: number
        }
    ) {
        this._name = name
        const cx = options?.cx ?? gEngine.width / 2
        const cy = options?.cy ?? gEngine.height / 2
        const width = options?.width ?? gEngine.width
        const height = options?.height ?? gEngine.height

        this.state = new CameraState([cx, cy], width, height)
    }

    public get center() { return this.state.center }
    public get name() { return this._name }
    public get viewProjMat() {
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
        if (this.shaker && !this.shaker.shakeDone) {
            this.shaker.updateShakeState()
        } else {
            this.state.updateCameraState()
        }

        if (this.shaker && this.shaker.shakeDone) {
            this.shaker = undefined
            this.state.setCenter(this.centerBeforeShake)
        }
    }

    public shake(xDelta: number, yDelta: number, shakeFrequency: number, shakeDuration: number) {
        this.centerBeforeShake = this.state.center
        this.shaker = new CameraShake(this, xDelta, yDelta, shakeFrequency, shakeDuration)
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

    public setCenter([cx, cy]: number[]) {
        this.state.setCenter([cx, cy])
    }

    public setCenterDirectly(value: number[]) {
        this.state.setCenterDirectly(value)
    }
}

