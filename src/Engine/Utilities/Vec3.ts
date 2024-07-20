export class Vec3 {
    private vec: number[]

    constructor(_vec: number[]) {
        if (_vec.length !== 3) {
            throw new Error("Must be array of length 3")
        }

        this.vec = _vec
    }

    public get x() { return this.vec[0] }
    public get y() { return this.vec[1] }
    public get z() { return this.vec[2] }

    public normalize() {
        const length = Math.sqrt(
            this.x * this.x +
            this.y * this.y +
            this.z * this.z
        )

        return new Vec3(this.vec.map((v) => v / length))
    }

    public dot(obj: Vec3) {
        return this.x * obj.x +
            this.y * obj.y +
            this.z * obj.z
    }

    public cross(v: Vec3) {
        const x = this.y * v.z - this.z * v.y
        const y = this.z * v.x - this.x * v.z
        const z = this.x * v.y - this.y * v.x

        return new Vec3([x, y, z])
    }
}