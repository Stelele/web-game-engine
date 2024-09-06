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
        let status = 0
        const statusObj = {
            'left': false,
            'right': false,
            'top': false,
            'bottom': false,
            'outside': false,
            'inside': false,
        }

        if (!this.intesects(bound)) {
            statusObj['outside'] = true
            return { status, statusObj }
        }

        if (bound.minX < this.minX) {
            status |= BoundingCollisionStatus.LEFT
            statusObj['left'] = true

        }
        if (bound.maxX > this.maxX) {
            status |= BoundingCollisionStatus.RIGHT
            statusObj['right'] = true
        }
        if (bound.minY < this.minY) {
            status |= BoundingCollisionStatus.TOP
            statusObj['top'] = true
        }
        if (bound.maxY > this.maxY) {
            status |= BoundingCollisionStatus.BOTTOM
            statusObj['bottom'] = true
        }
        if (status === BoundingCollisionStatus.OUTSIDE) {
            status = BoundingCollisionStatus.INSIDE
            statusObj['inside'] = true
        }

        return { status, statusObj }
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