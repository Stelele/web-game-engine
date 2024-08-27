import { Vec3 } from "./Vec3"

export class Mat4 {
    private value: number[]

    public constructor(_value: number[]) {
        if (_value.length !== 16) {
            throw new Error("1D array must be of length 16")
        }

        this.value = _value
    }

    public get Value() { return this.value }

    public static IdentityMat() {
        return new Mat4([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ])
    }

    public static ZeroMat() {
        return new Mat4([
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0
        ])
    }

    public static matMul(aMat: Mat4, bMat: Mat4) {
        const temp = Mat4.ZeroMat()
        const a = aMat.value
        const b = bMat.value

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                temp.value[i * 4 + j] =
                    a[i * 4 + 0] * b[0 + j] +
                    a[i * 4 + 1] * b[4 + j] +
                    a[i * 4 + 2] * b[8 + j] +
                    a[i * 4 + 3] * b[12 + j]
            }
        }

        return temp
    }

    public static vec4Mul(mat: Mat4, vec4: number[]) {
        if (vec4.length !== 4) {
            throw new Error("vec4 must be of length 4")
        }
        const a = mat.value
        const result = []

        for (let i = 0; i < 4; i++) {
            const aVec4 = [
                a[0 * 4 + i],
                a[1 * 4 + i],
                a[2 * 4 + i],
                a[3 * 4 + i]
            ]

            result.push(dot(aVec4, vec4))
        }

        return result

        function dot(aVec4: number[], bVec4: number[]) {
            return aVec4[0] * bVec4[0] +
                aVec4[1] * bVec4[1] +
                aVec4[2] * bVec4[2] +
                aVec4[3] * bVec4[3]
        }
    }

    public transpose() {
        const t = this.value
        return new Mat4([
            t[0], t[4], t[8], t[12],
            t[1], t[5], t[9], t[13],
            t[2], t[6], t[10], t[14],
            t[3], t[7], t[11], t[15],
        ])
    }

    public translate(translation: number[]) {
        return Mat4.matMul(this, Mat4.translateMat(translation))
    }

    public scale(scales: number[]) {
        return Mat4.matMul(this, Mat4.scaleMat(scales))
    }

    public rotateX(t: number) {
        return Mat4.matMul(this, Mat4.rotateXMat(t))
    }

    public rotateY(t: number) {
        return Mat4.matMul(this, Mat4.rotateYMat(t))
    }

    public rotateZ(t: number) {
        return Mat4.matMul(this, Mat4.rotateZMat(t))
    }


    public static inverse(val: Mat4) {
        const m = val.Value
        const dst = new Array<number>(16)

        const m00 = m[0 * 4 + 0]
        const m01 = m[0 * 4 + 1]
        const m02 = m[0 * 4 + 2]
        const m03 = m[0 * 4 + 3]
        const m10 = m[1 * 4 + 0]
        const m11 = m[1 * 4 + 1]
        const m12 = m[1 * 4 + 2]
        const m13 = m[1 * 4 + 3]
        const m20 = m[2 * 4 + 0]
        const m21 = m[2 * 4 + 1]
        const m22 = m[2 * 4 + 2]
        const m23 = m[2 * 4 + 3]
        const m30 = m[3 * 4 + 0]
        const m31 = m[3 * 4 + 1]
        const m32 = m[3 * 4 + 2]
        const m33 = m[3 * 4 + 3]

        const tmp0 = m22 * m33
        const tmp1 = m32 * m23
        const tmp2 = m12 * m33
        const tmp3 = m32 * m13
        const tmp4 = m12 * m23
        const tmp5 = m22 * m13
        const tmp6 = m02 * m33
        const tmp7 = m32 * m03
        const tmp8 = m02 * m23
        const tmp9 = m22 * m03
        const tmp10 = m02 * m13
        const tmp11 = m12 * m03
        const tmp12 = m20 * m31
        const tmp13 = m30 * m21
        const tmp14 = m10 * m31
        const tmp15 = m30 * m11
        const tmp16 = m10 * m21
        const tmp17 = m20 * m11
        const tmp18 = m00 * m31
        const tmp19 = m30 * m01
        const tmp20 = m00 * m21
        const tmp21 = m20 * m01
        const tmp22 = m00 * m11
        const tmp23 = m10 * m01

        const t0 = (tmp0 * m11 + tmp3 * m21 + tmp4 * m31) -
            (tmp1 * m11 + tmp2 * m21 + tmp5 * m31)
        const t1 = (tmp1 * m01 + tmp6 * m21 + tmp9 * m31) -
            (tmp0 * m01 + tmp7 * m21 + tmp8 * m31)
        const t2 = (tmp2 * m01 + tmp7 * m11 + tmp10 * m31) -
            (tmp3 * m01 + tmp6 * m11 + tmp11 * m31)
        const t3 = (tmp5 * m01 + tmp8 * m11 + tmp11 * m21) -
            (tmp4 * m01 + tmp9 * m11 + tmp10 * m21)

        const d = 1 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3)

        dst[0] = d * t0
        dst[1] = d * t1
        dst[2] = d * t2
        dst[3] = d * t3

        dst[4] = d * ((tmp1 * m10 + tmp2 * m20 + tmp5 * m30) -
            (tmp0 * m10 + tmp3 * m20 + tmp4 * m30))
        dst[5] = d * ((tmp0 * m00 + tmp7 * m20 + tmp8 * m30) -
            (tmp1 * m00 + tmp6 * m20 + tmp9 * m30))
        dst[6] = d * ((tmp3 * m00 + tmp6 * m10 + tmp11 * m30) -
            (tmp2 * m00 + tmp7 * m10 + tmp10 * m30))
        dst[7] = d * ((tmp4 * m00 + tmp9 * m10 + tmp10 * m20) -
            (tmp5 * m00 + tmp8 * m10 + tmp11 * m20))

        dst[8] = d * ((tmp12 * m13 + tmp15 * m23 + tmp16 * m33) -
            (tmp13 * m13 + tmp14 * m23 + tmp17 * m33))
        dst[9] = d * ((tmp13 * m03 + tmp18 * m23 + tmp21 * m33) -
            (tmp12 * m03 + tmp19 * m23 + tmp20 * m33))
        dst[10] = d * ((tmp14 * m03 + tmp19 * m13 + tmp22 * m33) -
            (tmp15 * m03 + tmp18 * m13 + tmp23 * m33))
        dst[11] = d * ((tmp17 * m03 + tmp20 * m13 + tmp23 * m23) -
            (tmp16 * m03 + tmp21 * m13 + tmp22 * m23))

        dst[12] = d * ((tmp14 * m22 + tmp17 * m32 + tmp13 * m12) -
            (tmp16 * m32 + tmp12 * m12 + tmp15 * m22))
        dst[13] = d * ((tmp20 * m32 + tmp12 * m02 + tmp19 * m22) -
            (tmp18 * m22 + tmp21 * m32 + tmp13 * m02))
        dst[14] = d * ((tmp18 * m12 + tmp23 * m32 + tmp15 * m02) -
            (tmp22 * m32 + tmp14 * m02 + tmp19 * m12))
        dst[15] = d * ((tmp22 * m22 + tmp16 * m02 + tmp21 * m12) -
            (tmp20 * m12 + tmp23 * m22 + tmp17 * m02))

        return new Mat4(dst)
    }

    public static translateMat([tx, ty, tz]: number[]) {
        return new Mat4([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            tx, ty, tz, 1
        ])
    }

    public static scaleMat([sx, sy, sz]: number[]) {
        return new Mat4([
            sx, 0, 0, 0,
            0, sy, 0, 0,
            0, 0, sz, 0,
            0, 0, 0, 1
        ])
    }

    public static rotateXMat(t: number) {
        const c = Math.cos(t)
        const s = Math.sin(t)

        return new Mat4([
            1, 0, 0, 0,
            0, c, s, 0,
            0, -s, c, 0,
            0, 0, 0, 1
        ])
    }

    public static rotateYMat(t: number) {
        const c = Math.cos(t)
        const s = Math.sin(t)

        return new Mat4([
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1
        ])
    }

    public static rotateZMat(t: number) {
        const c = Math.cos(t)
        const s = Math.sin(t)

        return new Mat4([
            c, s, 0, 0,
            -s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ])
    }

    public static ortho(left: number, right: number, bottom: number, top: number, near: number, far: number) {
        const val = new Array<number>(16)

        val[0] = 2 / (right - left)
        val[1] = 0
        val[2] = 0
        val[3] = 0

        val[4] = 0
        val[5] = 2 / (top - bottom)
        val[6] = 0
        val[7] = 0

        val[8] = 0
        val[9] = 0
        val[10] = 1 / (near - far)
        val[11] = 0

        val[12] = (right + left) / (left - right)
        val[13] = (top + bottom) / (bottom - top)
        val[14] = near / (near - far)
        val[15] = 1

        return new Mat4(val)
    }

    public static perspective(fovRad: number, aspect: number, zNear: number, zFar: number) {
        const val = new Array<number>(16)

        const f = Math.tan(Math.PI * 0.5 - 0.5 * fovRad)
        const rangeInv = 1 / (zNear - zFar)

        val[0] = f / aspect
        val[1] = 0
        val[2] = 0
        val[3] = 0

        val[4] = 0
        val[5] = f
        val[6] = 0
        val[7] = 0

        val[8] = 0
        val[9] = 0
        val[10] = zFar * rangeInv
        val[11] = -1

        val[12] = 0
        val[13] = 0
        val[14] = zNear * zFar * rangeInv
        val[15] = 0

        return val
    }

    public static cameraAim(eye: number[], target: number[], up: number[]) {
        const dst = new Array<number>(16)
        const zAxis = Vec3.normalize(Vec3.subtract(eye, target));
        const xAxis = Vec3.normalize(Vec3.cross(up, zAxis));
        const yAxis = Vec3.normalize(Vec3.cross(zAxis, xAxis));

        dst[0] = xAxis[0]; dst[1] = xAxis[1]; dst[2] = xAxis[2]; dst[3] = 0;
        dst[4] = yAxis[0]; dst[5] = yAxis[1]; dst[6] = yAxis[2]; dst[7] = 0;
        dst[8] = zAxis[0]; dst[9] = zAxis[1]; dst[10] = zAxis[2]; dst[11] = 0;
        dst[12] = eye[0]; dst[13] = eye[1]; dst[14] = eye[2]; dst[15] = 1;

        return new Mat4(dst)
    }

    public static lookAt(eye: number[], target: number[], up: number[]) {
        return Mat4.inverse(Mat4.cameraAim(eye, target, up))
    }

    public static aim(eye: number[], target: number[], up: number[]) {
        const dst = new Array<number>(16)

        const zAxis = Vec3.normalize(Vec3.subtract(target, eye));
        const xAxis = Vec3.normalize(Vec3.cross(up, zAxis));
        const yAxis = Vec3.normalize(Vec3.cross(zAxis, xAxis));

        dst[0] = xAxis[0]; dst[1] = xAxis[1]; dst[2] = xAxis[2]; dst[3] = 0;
        dst[4] = yAxis[0]; dst[5] = yAxis[1]; dst[6] = yAxis[2]; dst[7] = 0;
        dst[8] = zAxis[0]; dst[9] = zAxis[1]; dst[10] = zAxis[2]; dst[11] = 0;
        dst[12] = eye[0]; dst[13] = eye[1]; dst[14] = eye[2]; dst[15] = 1;

        return new Mat4(dst)
    }
}