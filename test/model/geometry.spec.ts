import { expect, describe, it } from "vitest";
import { 
    at, getCubeSize, rotateCubeFace, RotationAmount, 
} from "../../src/model/geometry";
import { checkCube } from "./utility";
import { CubeData, CubeSide } from "../../src/model/cube";
import { DeepReadonly, forceNever } from "../../src/common";


describe("getCubeSize", () => {
    it("calculates the size of a 2x2", () => 
        expect(getCubeSize(
            [
                [1, 1, 1, 1], 
                [2, 2, 2, 2], 
                [3, 3, 3, 3], 
                [4, 4, 4, 4], 
                [5, 5, 5, 5], 
                [6, 6, 6, 6]
            ]
        )).toBe(2)
    );
    it("calculates the size of a 3x3", () => 
        expect(getCubeSize(
            [
                [1, 1, 1, 1, 1, 1, 1, 1, 1], 
                [2, 2, 2, 2, 2, 2, 2, 2, 2], 
                [3, 3, 3, 3, 3, 3, 3, 3, 3], 
                [4, 4, 4, 4, 4, 4, 4, 4, 4], 
                [5, 5, 5, 5, 5, 5, 5, 5, 5], 
                [6, 6, 6, 6, 6, 6, 6, 6, 6]
            ]
        )).toBe(3)
    );
});

describe("at", () => {
    it("gets the value", () => 
        expect(
            at(
                [
                    [1, 2, 3, 4], 
                    [5, 6, 1, 2], 
                    [3, 4, 5, 6], 
                    [1, 2, 3, 4], 
                    [5, 6, 1, 2], 
                    [3, 4, 5, 6], 
                ],
                2, 1, 1
            )
        ).toBe(2)
    );
});

interface IRotateCubeFaceTestCase {
    readonly name: string;
    readonly cube: DeepReadonly<CubeData>,
    readonly side: CubeSide;
    readonly rotation: RotationAmount;
    readonly expectedCube: DeepReadonly<CubeData>
}

function getRotateCubeFaceTestCaseName(
    testCase: Omit<IRotateCubeFaceTestCase, "name">
): string {
    const { cube, side, rotation } = testCase;
    const size = getCubeSize(cube);
    let sideName: string;
    switch (side) {
        case CubeSide.Front: sideName = "front"; break;
        case CubeSide.Back: sideName = "back"; break;
        case CubeSide.Left: sideName = "left"; break;
        case CubeSide.Right: sideName = "right"; break;
        case CubeSide.Top: sideName = "top"; break;
        case CubeSide.Bottom: sideName = "bottom"; break;
        default: forceNever(side);
    }
    let rotName: string;
    switch (rotation) {
        case RotationAmount.None: rotName = "0° ↻"; break;
        case RotationAmount.Clockwise: rotName = "90° ↻"; break;
        case RotationAmount.CounterClockwise: rotName = "270° ↻"; break;
        case RotationAmount.Halfway: rotName = "180° ↻"; break;
        default: 
            rotName = `${90 * rotation}° ↻ (${(90 * rotation) % 360}° ↻)`; 
            break;
    }
    return `Rotate ${sideName} side by ${rotName} of ${size}x${size} cube`;
}

describe("rotateCubeFace", () => {
    const baseCube = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1], 
        [2, 2, 2, 2, 2, 2, 2, 2, 2], 
        [3, 3, 3, 3, 3, 3, 3, 3, 3], 
        [4, 4, 4, 4, 4, 4, 4, 4, 4], 
        [5, 5, 5, 5, 5, 5, 5, 5, 5], 
        [6, 6, 6, 6, 6, 6, 6, 6, 6]
    ];
    const baseSide1Rotated = rotateCubeFace(
        baseCube, CubeSide.Left, RotationAmount.Clockwise
    );
    const baseSide2Rotated = rotateCubeFace(
        baseCube, CubeSide.Front, RotationAmount.Clockwise
    );
    const baseSide5Rotated = rotateCubeFace(
        baseCube, CubeSide.Top, RotationAmount.Clockwise
    );
    
    const tests: Omit<IRotateCubeFaceTestCase, "name">[] = [
        { 
            side: CubeSide.Left, rotation: RotationAmount.Clockwise, cube: baseCube,
            expectedCube: [
                [ 1, 1, 1, 1, 1, 1, 1, 1, 1 ], 
                [ 5, 2, 2, 5, 2, 2, 5, 2, 2 ], 
                [ 3, 3, 3, 3, 3, 3, 3, 3, 3 ], 
                [ 4, 4, 6, 4, 4, 6, 4, 4, 6 ], 
                [ 4, 5, 5, 4, 5, 5, 4, 5, 5 ], 
                [ 2, 6, 6, 2, 6, 6, 2, 6, 6 ]
            ]
        },
        {
            side: CubeSide.Left, rotation: RotationAmount.CounterClockwise, cube: baseCube,
            expectedCube: [
                [ 1, 1, 1, 1, 1, 1, 1, 1, 1 ], 
                [ 6, 2, 2, 6, 2, 2, 6, 2, 2 ], 
                [ 3, 3, 3, 3, 3, 3, 3, 3, 3 ], 
                [ 4, 4, 5, 4, 4, 5, 4, 4, 5 ], 
                [ 2, 5, 5, 2, 5, 5, 2, 5, 5 ], 
                [ 4, 6, 6, 4, 6, 6, 4, 6, 6 ]
            ]
        },
        {
            // Force a test with too many rotations
            side: CubeSide.Left, rotation: 7 as RotationAmount, cube: baseCube,
            expectedCube: [
                [ 1, 1, 1, 1, 1, 1, 1, 1, 1 ], 
                [ 6, 2, 2, 6, 2, 2, 6, 2, 2 ], 
                [ 3, 3, 3, 3, 3, 3, 3, 3, 3 ], 
                [ 4, 4, 5, 4, 4, 5, 4, 4, 5 ], 
                [ 2, 5, 5, 2, 5, 5, 2, 5, 5 ], 
                [ 4, 6, 6, 4, 6, 6, 4, 6, 6 ]
            ]
        },
        {
            side: CubeSide.Front, rotation: RotationAmount.Clockwise, cube: baseCube,
            expectedCube: [
                [ 1, 1, 6, 1, 1, 6, 1, 1, 6 ], 
                [ 2, 2, 2, 2, 2, 2, 2, 2, 2 ], 
                [ 5, 3, 3, 5, 3, 3, 5, 3, 3 ], 
                [ 4, 4, 4, 4, 4, 4, 4, 4, 4 ], 
                [ 5, 5, 5, 5, 5, 5, 1, 1, 1 ], 
                [ 3, 3, 3, 6, 6, 6, 6, 6, 6 ]
            ]
        },
        {
            side: CubeSide.Right, rotation: RotationAmount.Clockwise, cube: baseCube,
            expectedCube: [
                [ 1, 1, 1, 1, 1, 1, 1, 1, 1 ], 
                [ 2, 2, 6, 2, 2, 6, 2, 2, 6 ], 
                [ 3, 3, 3, 3, 3, 3, 3, 3, 3 ], 
                [ 5, 4, 4, 5, 4, 4, 5, 4, 4 ], 
                [ 5, 5, 2, 5, 5, 2, 5, 5, 2 ], 
                [ 6, 6, 4, 6, 6, 4, 6, 6, 4 ]
            ]
        },
        {
            side: CubeSide.Back, rotation: RotationAmount.Clockwise, cube: baseCube,
            expectedCube: [
                [ 5, 1, 1, 5, 1, 1, 5, 1, 1 ], 
                [ 2, 2, 2, 2, 2, 2, 2, 2, 2 ], 
                [ 3, 3, 6, 3, 3, 6, 3, 3, 6 ], 
                [ 4, 4, 4, 4, 4, 4, 4, 4, 4 ], 
                [ 3, 3, 3, 5, 5, 5, 5, 5, 5 ], 
                [ 6, 6, 6, 6, 6, 6, 1, 1, 1 ]
            ]
        },
        {
            side: CubeSide.Top, rotation: RotationAmount.Clockwise, cube: baseCube,
            expectedCube: [
                [ 2, 2, 2, 1, 1, 1, 1, 1, 1 ], 
                [ 3, 3, 3, 2, 2, 2, 2, 2, 2 ], 
                [ 4, 4, 4, 3, 3, 3, 3, 3, 3 ], 
                [ 1, 1, 1, 4, 4, 4, 4, 4, 4 ], 
                [ 5, 5, 5, 5, 5, 5, 5, 5, 5 ], 
                [ 6, 6, 6, 6, 6, 6, 6, 6, 6 ]
            ]
        },
        {
            side: CubeSide.Bottom, rotation: RotationAmount.Clockwise, cube: baseCube,
            expectedCube: [
                [ 1, 1, 1, 1, 1, 1, 4, 4, 4 ], 
                [ 2, 2, 2, 2, 2, 2, 1, 1, 1 ], 
                [ 3, 3, 3, 3, 3, 3, 2, 2, 2 ], 
                [ 4, 4, 4, 4, 4, 4, 3, 3, 3 ], 
                [ 5, 5, 5, 5, 5, 5, 5, 5, 5 ], 
                [ 6, 6, 6, 6, 6, 6, 6, 6, 6]
            ]
        },
        {
            side: CubeSide.Front, rotation: RotationAmount.Clockwise, cube: baseSide1Rotated,
            expectedCube: [
                [ 1, 1, 2, 1, 1, 6, 1, 1, 6 ], 
                [ 5, 5, 5, 2, 2, 2, 2, 2, 2 ], 
                [ 4, 3, 3, 5, 3, 3, 5, 3, 3 ], 
                [ 4, 4, 6, 4, 4, 6, 4, 4, 6 ], 
                [ 4, 5, 5, 4, 5, 5, 1, 1, 1 ], 
                [ 3, 3, 3, 2, 6, 6, 2, 6, 6 ]
            ]
        },
        {
            side: CubeSide.Front, rotation: RotationAmount.CounterClockwise, cube: baseSide1Rotated,
            expectedCube: [
                [ 1, 1, 5, 1, 1, 5, 1, 1, 4 ], 
                [ 2, 2, 2, 2, 2, 2, 5, 5, 5 ], 
                [ 6, 3, 3, 6, 3, 3, 2, 3, 3 ], 
                [ 4, 4, 6, 4, 4, 6, 4, 4, 6 ], 
                [ 4, 5, 5, 4, 5, 5, 3, 3, 3 ], 
                [ 1, 1, 1, 2, 6, 6, 2, 6, 6 ]
            ]
        },
        {
            side: CubeSide.Left, rotation: RotationAmount.Clockwise, cube: baseSide2Rotated,
            expectedCube: [
                [ 1, 1, 1, 1, 1, 1, 6, 6, 6 ], 
                [ 5, 2, 2, 5, 2, 2, 1, 2, 2 ], 
                [ 5, 3, 3, 5, 3, 3, 5, 3, 3 ], 
                [ 4, 4, 6, 4, 4, 6, 4, 4, 3 ], 
                [ 4, 5, 5, 4, 5, 5, 4, 1, 1 ], 
                [ 2, 3, 3, 2, 6, 6, 2, 6, 6 ]
            ]
        },
        {
            side: CubeSide.Left, rotation: RotationAmount.CounterClockwise, cube: baseSide2Rotated,
            expectedCube: [
                [ 6, 6, 6, 1, 1, 1, 1, 1, 1 ], 
                [ 3, 2, 2, 6, 2, 2, 6, 2, 2 ], 
                [ 5, 3, 3, 5, 3, 3, 5, 3, 3 ], 
                [ 4, 4, 1, 4, 4, 5, 4, 4, 5 ], 
                [ 2, 5, 5, 2, 5, 5, 2, 1, 1 ], 
                [ 4, 3, 3, 4, 6, 6, 4, 6, 6 ]
            ]
        },
        {
            side: CubeSide.Left, rotation: RotationAmount.Clockwise, cube: baseSide5Rotated,
            expectedCube: [
                [ 1, 1, 2, 1, 1, 2, 1, 1, 2 ], 
                [ 5, 3, 3, 5, 2, 2, 5, 2, 2 ], 
                [ 4, 4, 4, 3, 3, 3, 3, 3, 3 ], 
                [ 1, 1, 6, 4, 4, 6, 4, 4, 6 ], 
                [ 4, 5, 5, 4, 5, 5, 1, 5, 5 ], 
                [ 3, 6, 6, 2, 6, 6, 2, 6, 6 ]
            ]
        },
        {
            side: CubeSide.Left, rotation: RotationAmount.CounterClockwise, cube: baseSide5Rotated,
            expectedCube: [
                [ 2, 1, 1, 2, 1, 1, 2, 1, 1 ], 
                [ 6, 3, 3, 6, 2, 2, 6, 2, 2 ], 
                [ 4, 4, 4, 3, 3, 3, 3, 3, 3 ], 
                [ 1, 1, 5, 4, 4, 5, 4, 4, 5 ], 
                [ 3, 5, 5, 2, 5, 5, 2, 5, 5 ], 
                [ 4, 6, 6, 4, 6, 6, 1, 6, 6 ]
            ]
        }
    ];

    it.each<IRotateCubeFaceTestCase>(
        tests.map(
            testCase => ({
                ...testCase, 
                name: getRotateCubeFaceTestCaseName(testCase)
            })
        )
    )("$name", testCase => {
        const { cube, side, rotation, expectedCube } = testCase;
        const result = rotateCubeFace(cube, side, rotation);
        checkCube(result, expectedCube);
    });
});