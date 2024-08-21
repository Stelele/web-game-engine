import { Vec3 } from "./Vec3";

export class Vec2 {
    public static length([x, y]: number[]) {
        return Vec3.length([x, y, 0])
    }
    public static normalize([x, y]: number[]) {
        return this.vec3ToVec2(Vec3.normalize([x, y, 0]))
    }

    public static dot(a: number[], b: number[]) {
        return Vec3.dot([a[0], a[1], 0], [b[0], b[1], 0])
    }

    public static cross(a: number[], b: number[]) {
        return Vec3.cross([a[0], a[1], 0], [b[0], b[1], 0])[2]
    }

    public static add(a: number[], b: number[]) {
        return this.vec3ToVec2(Vec3.add([a[0], a[1], 0], [b[0], b[1], 0]))
    }

    public static subtract(a: number[], b: number[]) {
        return this.vec3ToVec2(Vec3.subtract([a[0], a[1], 0], [b[0], b[1], 0]))
    }

    public static scale([x, y]: number[], scaleFactor: number) {
        return this.vec3ToVec2(Vec3.scale([x, y, 0], scaleFactor))
    }

    private static vec3ToVec2([x, y]: number[]) {
        return [x, y]
    }

    public static rotate([x0, y0]: number[], rad: number) {
        const r = -rad
        const xr = x0 * Math.cos(r) - y0 * Math.sin(r)
        const yr = x0 * Math.sin(r) + y0 * Math.cos(r)
        return [xr, yr]
    }
}