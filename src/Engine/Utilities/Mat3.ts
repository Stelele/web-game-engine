export class Mat3 {
  private value: number[];

  public constructor(_value: number[]) {
    if (_value.length !== 9) {
      throw new Error("Must be a 1D array of length 9");
    }

    this.value = _value;
  }

  public get Value() {
    return this.value;
  }

  public static IdentityMat() {
    return new Mat3([
      1, 0, 0,
      0, 1, 0,
      0, 0, 1,
    ]);
  }

  public static ZeroMat() {
    return new Mat3([
      0, 0, 0,
      0, 0, 0,
      0, 0, 0,
    ]);
  }

  public matMul(mat: Mat3) {
    const temp = Mat3.ZeroMat();
    const a = this.value;
    const b = mat.value;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        temp.value[i * 3 + j] =
          a[i * 3 + 0] * b[0 + j] +
          a[i * 3 + 1] * b[3 + j] +
          a[i * 3 + 2] * b[6 + j]
      }
    }

    return temp;
  }

  public transpose() {
    const t = this.value
    return new Mat3([
      t[0], t[3], t[6],
      t[1], t[4], t[7],
      t[2], t[5], t[8],
    ])
  }
}
