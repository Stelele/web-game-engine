export class Vec3 {
    public static normalize([x, y, z]: number[]) {
        const length = Math.sqrt(
            x * x +
            y * y +
            z * z
        )

        if (length < 0.00001) {
            return [0, 0, 0]
        }

        return [
            x / length,
            y / length,
            z / length
        ]
    }

    public static dot(a: number[], b: number[]) {
        return a[0] * b[0] +
            a[1] * b[1] +
            a[2] * b[2]
    }

    public static cross(a: number[], b: number[]) {
        const x = a[1] * b[2] - a[2] * b[1];
        const y = a[2] * b[0] - a[0] * b[2];
        const z = a[0] * b[1] - a[1] * b[0];

        return [x, y, z]
    }

    public static subtract(a: number[], b: number[]) {
        return [
            a[0] - b[0],
            a[1] - b[1],
            a[2] - b[2]
        ]
    }
}