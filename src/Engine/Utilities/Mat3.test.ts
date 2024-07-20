import { expect, test } from "vitest";
import { Mat3 } from "./Mat3";

test("Should GiveSame matrix when Multiplied by Identity", () => {
    // arrange
    const a = Mat3.IdentityMat();
    const test = [
        1, 2, 3,
        4, 5, 6,
        7, 8, 9,
    ];
    const b = new Mat3(test);

    // act
    const result = a.matMul(b);

    // assert
    expect(result.Value).toEqual(test);
});

test("Valid Mat mul", () => {
    // arrange
    const a = new Mat3([
        1, 2, 3,
        4, 5, 6,
        7, 8, 9,
    ]);
    const b = new Mat3([
        1, 2, 3,
        1, 2, 3,
        1, 2, 3,
    ]);

    // act
    const result = b.matMul(a)

    // asset
    const expectedResult: number[] = [
        30, 36, 42,
        30, 36, 42,
        30, 36, 42,
    ]

    expect(result.Value).toEqual(expectedResult)
});
