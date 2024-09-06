import { Mat4 } from "../../Utilities/Mat4"
import { Vec2 } from "../../Utilities/Vec2"
import { gEngine } from "../EngineCore"
import { BoundingBox, BoundingCollisionStatus } from "./BoundingBox"
import { Renderable } from "./Renderables"

export class Camera {
    private name: string
    public cx: number
    public cy: number
    public distToLeft: number
    public distToRight: number
    public distToTop: number
    public distToBottom: number

    public constructor(
        name: string,
        options?: {
            cx?: number,
            cy?: number,
            distToLeft?: number,
            distToRight?: number,
            distToTop?: number,
            distToBottom?: number,
        }
    ) {
        this.name = name
        this.cx = options?.cx ?? gEngine.width / 2
        this.cy = options?.cy ?? gEngine.height / 2
        this.distToLeft = options?.distToLeft ?? gEngine.width / 2
        this.distToRight = options?.distToRight ?? gEngine.width / 2
        this.distToTop = options?.distToTop ?? gEngine.height / 2
        this.distToBottom = options?.distToBottom ?? gEngine.height / 2
    }

    public get Name() { return this.name }
    public get WcHeight() { return this.distToBottom + this.distToTop }
    public get WcWidth() { return this.distToLeft + this.distToRight }
    public get ViewProjMat() {
        const viewMat = Mat4.lookAt(
            [this.cx, this.cy, 10],
            [this.cx, this.cy, 0],
            [0, 1, 0]
        )

        const projMat = Mat4.ortho(
            -this.distToLeft,
            this.distToRight,
            -this.distToBottom,
            this.distToTop,
            0,
            1000
        )

        return Mat4.matMul(viewMat, projMat).Value
    }
    public boundingBox(zone = 1) {
        return new BoundingBox([this.cx, this.cy], zone * this.WcWidth, zone * this.WcHeight)
    }

    public clampAtBoundary(obj: Renderable, zone: number) {
        const { status, statusObj } = this.boundingBox(zone).collisionStatus(obj.boundingBox)
        if (status === BoundingCollisionStatus.INSIDE) return { status, statusObj }

        if (statusObj['top']) {
            obj.y = this.cy - (zone * this.distToTop)
        }
        if (statusObj['bottom']) {
            obj.y = this.cy + (zone * this.distToBottom) - obj.scaledHeight
        }
        if (statusObj['right']) {
            obj.x = this.cx + (zone * this.distToRight) - obj.scaledWidth
        }
        if (statusObj['left']) {
            obj.x = this.cx - (zone * this.distToLeft)
        }

        return { status, statusObj }
    }

    public panBy([dx, dy]: number[]) {
        this.cx += dx ?? 0
        this.cy += dy ?? 0
    }

    public panTo([cx, cy]: number[]) {
        this.cx = cx ?? this.cx
        this.cy = cy ?? this.cy
    }

    public panWith(obj: Renderable, zone: number) {
        const { status, statusObj } = this.boundingBox(zone).collisionStatus(obj.boundingBox)
        if (status === BoundingCollisionStatus.INSIDE) return { status, statusObj }

        if (statusObj['top']) {
            this.cy = obj.y - (zone * this.distToTop)
        }
        if (statusObj['bottom']) {
            this.cy = obj.y + (zone * this.distToBottom) - obj.scaledHeight
        }
        if (statusObj['left']) {
            this.cx = obj.x - (zone * this.distToLeft)
        }
        if (statusObj['right']) {
            this.cx = obj.x + (zone * this.distToRight) - obj.scaledHeight
        }
    }

    public zoomBy(zoom: number) {
        if (zoom > 0) {
            this.distToLeft *= zoom
            this.distToRight *= zoom
            this.distToBottom *= zoom
            this.distToTop *= zoom
        }
    }

    public zoomTowards([x, y]: number[], zoom: number) {
        let delta = Vec2.subtract([x, y], [this.cx, this.cy])
        delta = Vec2.scale(delta, zoom - 1)
        const newC = Vec2.subtract([this.cx, this.cy], delta)

        this.cx = newC[0]
        this.cy = newC[1]

        this.zoomBy(zoom)
    }
}