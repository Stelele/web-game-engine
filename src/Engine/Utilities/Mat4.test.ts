import { expect, test } from "vitest";
import { Mat4 } from "./Mat4";

test("Should GiveSame matrix when Multiplied by Identity", () => {
    // arrange
    const a = Mat4.IdentityMat();
    const test = [
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, 15, 16
    ];
    const b = new Mat4(test);

    // act
    const result = a.matMul(b);

    // assert
    expect(result.Value).toEqual(test);
});

test("Valid Mat mul", () => {
    // arrange
    const a = new Mat4([
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, 15, 16
    ]);
    const b = new Mat4([
        1, 2, 3, 4,
        1, 2, 3, 4,
        1, 2, 3, 4,
        1, 2, 3, 4
    ]);

    // act
    const result = b.matMul(a)

    // asset
    const expectedResult: number[] = [
        90, 100, 110, 120,
        90, 100, 110, 120,
        90, 100, 110, 120,
        90, 100, 110, 120,
    ]

    expect(result.Value).toEqual(expectedResult)
});
