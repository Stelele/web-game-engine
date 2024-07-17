export class Mat4 {
  private value: number[];

  public constructor(_value: number[]) {
    if (_value.length !== 16) {
      throw new Error("Must be a 1D array of length 16");
    }

    this.value = _value;
  }

  public get Value() {
    return this.value;
  }

  public static IdentityMat() {
    return new Mat4([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);
  }

  public static ZeroMat() {
    return new Mat4([
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0
    ]);
  }

  public matMul(mat: Mat4) {
    const temp = Mat4.ZeroMat();
    const a = this.value;
    const b = mat.value;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        temp.value[i * 4 + j] =
          a[i * 4 + 0] * b[0 + j] +
          a[i * 4 + 1] * b[4 + j] +
          a[i * 4 + 2] * b[8 + j] +
          a[i * 4 + 3] * b[12 + j];
      }
    }

    return temp;
  }
}
