import { expect, test } from "vitest";
import { Mat4 } from "./Mat4";

test("mult with identity", () => {
    // arrange
    const a = Mat4.IdentityMat()
    const b = new Mat4([
        1, 2, 3, 4,
        5, 6, 7, 8,
        1, 2, 3, 4,
        9, 1, 2, 3
    ])

    // act
    const result = a.matMul(b)

    // assert
    expect(b.Value).eqls(result.Value)
})

test("transpose", () => {
    // arrange
    const a = new Mat4([
        1, 2, 3, 4,
        5, 6, 7, 9,
        9, 10, 11, 12,
        13, 14, 15, 16
    ])

    // act
    const aT = a.transpose()
    const aTT = aT.transpose()

    // assert
    expect(aTT.Value).eqls(a.Value)
    expect(aT.Value).eqls([
        1, 5, 9, 13,
        2, 6, 10, 14,
        3, 7, 11, 15,
        4, 9, 12, 16
    ])
})

test("mat mult", () => {
    // arrange
    const a = new Mat4([
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 0, 1, 2,
        3, 4, 5, 6
    ])
    const b = new Mat4([
        9, 8, 7, 6,
        5, 4, 3, 2,
        1, 0, 9, 8,
        7, 6, 5, 4,
    ])

    // act
    const response = a.matMul(b)

    // assert
    expect(response.Value).eqls([
        50, 40, 60, 50,
        138, 112, 156, 130,
        96, 84, 82, 70,
        94, 76, 108, 90
    ])
})