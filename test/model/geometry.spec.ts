import { expect, describe, it, beforeAll } from "vitest";
import { 
    at, refocusCube, rotateCubeFace, rotateCubeInternalSlice,
    rotateCubeSliceFromFace, RotationAmount
} from "../../src/model/geometry";
import { checkCube } from "./utility";
import { 
    CubeAxis, CubeData, CubeSide, getCubeSize, SliceDirection 
} from "../../src/model/cube";
import { DeepReadonly, forceNever, Tuple, zip } from "../../src/common";


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
    baseCube: DeepReadonly<CubeData>,
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
    const mutated = Object.is(cube, baseCube) ? "" : "[MUT!] ";
    return `${mutated}Rotate ${sideName} side by ${rotName} of ${size}x${size} cube`;
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
                name: getRotateCubeFaceTestCaseName(baseCube, testCase)
            })
        )
    )("$name", testCase => {
        const { cube, side, rotation, expectedCube } = testCase;
        const result = rotateCubeFace(cube, side, rotation);
        checkCube(result, expectedCube);
    });
});

interface IRotateCubeSliceTestCase {
    readonly name: string;
    readonly cube: DeepReadonly<CubeData>,
    readonly axis: CubeAxis;
    readonly rotation: RotationAmount;
    readonly sliceStart: number;
    readonly sliceSize: number;
    readonly expectedCube: DeepReadonly<CubeData>
}

function getRotateCubeSliceTestCaseName(
    baseCube: DeepReadonly<CubeData>,
    testCase: Omit<IRotateCubeSliceTestCase, "name">
): string {
    const { cube, axis, sliceStart, sliceSize, rotation } = testCase;
    const size = getCubeSize(cube);
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
    const mutated = Object.is(cube, baseCube) ? "" : "[MUT!] ";
    return `${mutated}Rotate ${axis}-axis (${sliceStart}+${sliceSize}) by ${rotName} of ${size}x${size} cube`;
}

describe("rotateCubeInternalSlice", () => {
    const baseCube = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1], 
        [2, 2, 2, 2, 2, 2, 2, 2, 2], 
        [3, 3, 3, 3, 3, 3, 3, 3, 3], 
        [4, 4, 4, 4, 4, 4, 4, 4, 4], 
        [5, 5, 5, 5, 5, 5, 5, 5, 5], 
        [6, 6, 6, 6, 6, 6, 6, 6, 6]
    ];
    const baseSide1Rotated = rotateCubeFace(baseCube, CubeSide.Left, 1);
    const baseSide2Rotated = rotateCubeFace(baseCube, CubeSide.Front, 1);
    const baseSide5Rotated = rotateCubeFace(baseCube, CubeSide.Top, 1);

    const tests: Omit<IRotateCubeSliceTestCase, "name">[] = [
        { 
            axis: "X", sliceStart: 0, sliceSize: 1, rotation: RotationAmount.CounterClockwise,
            cube: baseCube, expectedCube: [
                [ 4, 4, 4, 1, 1, 1, 1, 1, 1 ], 
                [ 1, 1, 1, 2, 2, 2, 2, 2, 2 ], 
                [ 2, 2, 2, 3, 3, 3, 3, 3, 3 ], 
                [ 3, 3, 3, 4, 4, 4, 4, 4, 4 ], 
                [ 5, 5, 5, 5, 5, 5, 5, 5, 5 ], 
                [ 6, 6, 6, 6, 6, 6, 6, 6, 6 ]
            ]
        },
        {
            axis: "X", sliceStart: 1, sliceSize: 1, rotation: RotationAmount.CounterClockwise,
            cube: baseCube, expectedCube: [
                [ 1, 1, 1, 4, 4, 4, 1, 1, 1 ], 
                [ 2, 2, 2, 1, 1, 1, 2, 2, 2 ], 
                [ 3, 3, 3, 2, 2, 2, 3, 3, 3 ], 
                [ 4, 4, 4, 3, 3, 3, 4, 4, 4 ], 
                [ 5, 5, 5, 5, 5, 5, 5, 5, 5 ], 
                [ 6, 6, 6, 6, 6, 6, 6, 6, 6 ]
            ]
        },
        {
            axis: "X", sliceStart: 2, sliceSize: 1, rotation: RotationAmount.Clockwise,
            cube: baseCube, expectedCube: [
                [ 1, 1, 1, 1, 1, 1, 2, 2, 2 ], 
                [ 2, 2, 2, 2, 2, 2, 3, 3, 3 ], 
                [ 3, 3, 3, 3, 3, 3, 4, 4, 4 ], 
                [ 4, 4, 4, 4, 4, 4, 1, 1, 1 ], 
                [ 5, 5, 5, 5, 5, 5, 5, 5, 5 ], 
                [ 6, 6, 6, 6, 6, 6, 6, 6, 6 ]
            ]
        },
        {
            axis: "X", sliceStart: 0, sliceSize: 2, rotation: RotationAmount.CounterClockwise,
            cube: baseCube, expectedCube: [
                [ 4, 4, 4, 4, 4, 4, 1, 1, 1 ], 
                [ 1, 1, 1, 1, 1, 1, 2, 2, 2 ], 
                [ 2, 2, 2, 2, 2, 2, 3, 3, 3 ], 
                [ 3, 3, 3, 3, 3, 3, 4, 4, 4 ], 
                [ 5, 5, 5, 5, 5, 5, 5, 5, 5 ], 
                [ 6, 6, 6, 6, 6, 6, 6, 6, 6 ]
            ]
        },
        {
            axis: "X", sliceStart: 0, sliceSize: 2, rotation: RotationAmount.Clockwise,
            cube: baseSide1Rotated, expectedCube: [
                [ 5, 2, 2, 5, 2, 2, 1, 1, 1 ],
                [ 3, 3, 3, 3, 3, 3, 5, 2, 2 ],
                [ 4, 4, 6, 4, 4, 6, 3, 3, 3 ],
                [ 1, 1, 1, 1, 1, 1, 4, 4, 6 ],
                // SIDE 5 IS EXPECTED NOT TO HAVE THE FACE FIXED
                [ 4, 5, 5, 4, 5, 5, 4, 5, 5 ],
                [ 2, 6, 6, 2, 6, 6, 2, 6, 6 ],
            ]
        },
        {
            axis: "Z", sliceStart: 0, sliceSize: 1, rotation: RotationAmount.CounterClockwise,
            cube: baseCube, expectedCube: [
                [ 5, 1, 1, 5, 1, 1, 5, 1, 1 ], 
                [ 2, 2, 2, 2, 2, 2, 2, 2, 2 ], 
                [ 3, 3, 6, 3, 3, 6, 3, 3, 6 ], 
                [ 4, 4, 4, 4, 4, 4, 4, 4, 4 ], 
                [ 3, 3, 3, 5, 5, 5, 5, 5, 5 ], 
                [ 6, 6, 6, 6, 6, 6, 1, 1, 1 ]
            ]
        },
        {
            axis: "Z", sliceStart: 1, sliceSize: 1, rotation: RotationAmount.CounterClockwise,
            cube: baseCube, expectedCube: [
                [ 1, 5, 1, 1, 5, 1, 1, 5, 1 ], 
                [ 2, 2, 2, 2, 2, 2, 2, 2, 2 ], 
                [ 3, 6, 3, 3, 6, 3, 3, 6, 3 ], 
                [ 4, 4, 4, 4, 4, 4, 4, 4, 4 ], 
                [ 5, 5, 5, 3, 3, 3, 5, 5, 5 ], 
                [ 6, 6, 6, 1, 1, 1, 6, 6, 6 ]
            ]
        },
        {
            axis: "Z", sliceStart: 2, sliceSize: 1, rotation: RotationAmount.Clockwise,
            cube: baseCube, expectedCube: [
                [ 1, 1, 6, 1, 1, 6, 1, 1, 6 ], 
                [ 2, 2, 2, 2, 2, 2, 2, 2, 2 ], 
                [ 5, 3, 3, 5, 3, 3, 5, 3, 3 ], 
                [ 4, 4, 4, 4, 4, 4, 4, 4, 4 ], 
                [ 5, 5, 5, 5, 5, 5, 1, 1, 1 ], 
                [ 3, 3, 3, 6, 6, 6, 6, 6, 6 ]
            ]
        },
        {
            axis: "Z", sliceStart: 0, sliceSize: 2, rotation: RotationAmount.CounterClockwise,
            cube: baseCube, expectedCube: [
                [ 5, 5, 1, 5, 5, 1, 5, 5, 1 ], 
                [ 2, 2, 2, 2, 2, 2, 2, 2, 2 ], 
                [ 3, 6, 6, 3, 6, 6, 3, 6, 6 ], 
                [ 4, 4, 4, 4, 4, 4, 4, 4, 4 ], 
                [ 3, 3, 3, 3, 3, 3, 5, 5, 5 ], 
                [ 6, 6, 6, 1, 1, 1, 1, 1, 1 ]
            ]
        },
        {
            axis: "Z", sliceStart: 0, sliceSize: 2, rotation: RotationAmount.Clockwise,
            cube: baseSide5Rotated, expectedCube: [
                [ 6, 6, 2, 6, 6, 1, 6, 6, 1 ],
                [ 3, 3, 3, 2, 2, 2, 2, 2, 2 ],
                [ 4, 5, 5, 3, 5, 5, 3, 5, 5 ],
                // SIDE 4 IS EXPECTED NOT TO HAVE THE FACE FIXED
                [ 1, 1, 1, 4, 4, 4, 4, 4, 4 ],
                [ 1, 1, 2, 1, 1, 2, 5, 5, 5 ],
                [ 6, 6, 6, 3, 3, 4, 3, 3, 4 ],
            ]
        },
        {
            axis: "Y", sliceStart: 0, sliceSize: 1, rotation: RotationAmount.CounterClockwise,
            cube: baseCube, expectedCube: [
                [ 1, 1, 1, 1, 1, 1, 1, 1, 1 ], 
                [ 5, 2, 2, 5, 2, 2, 5, 2, 2 ], 
                [ 3, 3, 3, 3, 3, 3, 3, 3, 3 ], 
                [ 4, 4, 6, 4, 4, 6, 4, 4, 6 ], 
                [ 4, 5, 5, 4, 5, 5, 4, 5, 5 ], 
                [ 2, 6, 6, 2, 6, 6, 2, 6, 6 ]
            ]
        },
        {
            axis: "Y", sliceStart: 1, sliceSize: 1, rotation: RotationAmount.CounterClockwise,
            cube: baseCube, expectedCube: [
                [ 1, 1, 1, 1, 1, 1, 1, 1, 1 ], 
                [ 2, 5, 2, 2, 5, 2, 2, 5, 2 ], 
                [ 3, 3, 3, 3, 3, 3, 3, 3, 3 ], 
                [ 4, 6, 4, 4, 6, 4, 4, 6, 4 ], 
                [ 5, 4, 5, 5, 4, 5, 5, 4, 5 ], 
                [ 6, 2, 6, 6, 2, 6, 6, 2, 6 ]
            ]
        },
        {
            axis: "Y", sliceStart: 2, sliceSize: 1, rotation: RotationAmount.Clockwise,
            cube: baseCube, expectedCube: [
                [ 1, 1, 1, 1, 1, 1, 1, 1, 1 ], 
                [ 2, 2, 6, 2, 2, 6, 2, 2, 6 ], 
                [ 3, 3, 3, 3, 3, 3, 3, 3, 3 ], 
                [ 5, 4, 4, 5, 4, 4, 5, 4, 4 ], 
                [ 5, 5, 2, 5, 5, 2, 5, 5, 2 ], 
                [ 6, 6, 4, 6, 6, 4, 6, 6, 4 ]
            ]
        },
        {
            axis: "Y", sliceStart: 0, sliceSize: 2, rotation: RotationAmount.CounterClockwise,
            cube: baseCube, expectedCube: [
                [ 1, 1, 1, 1, 1, 1, 1, 1, 1 ], 
                [ 5, 5, 2, 5, 5, 2, 5, 5, 2 ], 
                [ 3, 3, 3, 3, 3, 3, 3, 3, 3 ], 
                [ 4, 6, 6, 4, 6, 6, 4, 6, 6 ], 
                [ 4, 4, 5, 4, 4, 5, 4, 4, 5 ], 
                [ 2, 2, 6, 2, 2, 6, 2, 2, 6 ]
            ]
        },
        {
            axis: "Y", sliceStart: 0, sliceSize: 2, rotation: RotationAmount.Clockwise,
            cube: baseSide2Rotated, expectedCube: [
                // SIDE 5 IS EXPECTED NOT TO HAVE THE FACE FIXED
                [ 1, 1, 6, 1, 1, 6, 1, 1, 6 ],
                [ 3, 3, 2, 6, 6, 2, 6, 6, 2 ],
                [ 5, 3, 3, 5, 3, 3, 5, 3, 3 ],
                [ 4, 1, 1, 4, 5, 5, 4, 5, 5 ],
                [ 2, 2, 5, 2, 2, 5, 2, 2, 1 ],
                [ 4, 4, 3, 4, 4, 6, 4, 4, 6 ],
            ]
        }
    ];

    it.each(
        tests.map(testCase => ({
            ...testCase, 
            name: getRotateCubeSliceTestCaseName(baseCube, testCase)
        }))
    )("$name", testCase => {
        const { axis, sliceStart, sliceSize, cube, rotation, expectedCube } = testCase;
        const result = rotateCubeInternalSlice(cube, axis, sliceStart, sliceSize, rotation);
        checkCube(result, expectedCube);
    });
});

interface IRefocusCubeTestCase {
    readonly name: string;
    readonly cube: DeepReadonly<CubeData>,
    readonly focusSide: CubeSide;
    readonly expectedCube: DeepReadonly<CubeData>
}

function getRefocusCubeTestCaseName(
    testCase: Omit<IRefocusCubeTestCase, "name">
): string {
    const { cube, focusSide } = testCase;
    const size = getCubeSize(cube);
    let sideName: string;
    switch (focusSide) {
        case CubeSide.Front: sideName = "front"; break;
        case CubeSide.Back: sideName = "back"; break;
        case CubeSide.Left: sideName = "left"; break;
        case CubeSide.Right: sideName = "right"; break;
        case CubeSide.Top: sideName = "top"; break;
        case CubeSide.Bottom: sideName = "bottom"; break;
        default: forceNever(focusSide);
    }
    return `Focus the ${sideName} side of ${size}x${size} cube`;
}


describe("refocusCube", () => {
    const baseCube = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1], 
        [2, 2, 2, 2, 2, 2, 2, 2, 2], 
        [3, 3, 3, 3, 3, 3, 3, 3, 3], 
        [4, 4, 4, 4, 4, 4, 4, 4, 4], 
        [5, 5, 5, 5, 5, 5, 5, 5, 5], 
        [6, 6, 6, 6, 6, 6, 6, 6, 6]
    ];

    const rcf = (
        cubeData: DeepReadonly<CubeData>, 
        sideId: CubeSide
    ) => rotateCubeFace(cubeData, sideId, 1);
    const rcs = (
        cube: DeepReadonly<CubeData>, 
        axis: CubeAxis
    ) => rotateCubeInternalSlice(cube, axis, 1, 1, 1);

    const testCube = 
        rcf(
            rcf(
                rcf(
                    rcf(
                        rcf(
                            rcf(
                                rcs(
                                    rcs(
                                        rcs(baseCube, "X"), "Y"
                                    ), "Z"
                                ), 1
                            ), 2
                        ), 3
                    ), 4
                ), 5
            ), 6
        );

    // Just make sure that our test cube is set up the way we expect it to be
    beforeAll(() => 
        checkCube(
            testCube,
            [
                [ 5, 1, 3, 2, 1, 4, 6, 3, 6 ],
                [ 5, 2, 4, 6, 6, 3, 4, 2, 6 ],
                [ 5, 1, 1, 5, 3, 4, 2, 3, 6 ],
                [ 5, 2, 2, 5, 5, 5, 3, 4, 2 ],
                [ 1, 1, 4, 6, 2, 5, 2, 6, 3 ],
                [ 1, 3, 3, 6, 4, 4, 1, 1, 4 ]
            ]
        )
    );

    const tests: Omit<IRefocusCubeTestCase, "name">[] = [
        { cube: testCube, focusSide: CubeSide.Left, expectedCube: [
                [ 5, 2, 2, 5, 5, 5, 3, 4, 2 ],
                [ 5, 1, 3, 2, 1, 4, 6, 3, 6 ],
                [ 5, 2, 4, 6, 6, 3, 4, 2, 6 ],
                [ 5, 1, 1, 5, 3, 4, 2, 3, 6 ],
                [ 4, 5, 3, 1, 2, 6, 1, 6, 2 ],
                [ 1, 6, 1, 1, 4, 3, 4, 4, 3 ]
            ]
        },
        { cube: testCube, focusSide: CubeSide.Front, expectedCube: [
                [ 5, 1, 3, 2, 1, 4, 6, 3, 6 ],
                [ 5, 2, 4, 6, 6, 3, 4, 2, 6 ],
                [ 5, 1, 1, 5, 3, 4, 2, 3, 6 ],
                [ 5, 2, 2, 5, 5, 5, 3, 4, 2 ],
                [ 1, 1, 4, 6, 2, 5, 2, 6, 3 ],
                [ 1, 3, 3, 6, 4, 4, 1, 1, 4 ]
            ]
        },
        { cube: testCube, focusSide: CubeSide.Right, expectedCube: [
                [ 5, 2, 4, 6, 6, 3, 4, 2, 6 ],
                [ 5, 1, 1, 5, 3, 4, 2, 3, 6 ],
                [ 5, 2, 2, 5, 5, 5, 3, 4, 2 ],
                [ 5, 1, 3, 2, 1, 4, 6, 3, 6 ],
                [ 2, 6, 1, 6, 2, 1, 3, 5, 4 ],
                [ 3, 4, 4, 3, 4, 1, 1, 6, 1 ]
            ]
        },
        { cube: testCube, focusSide: CubeSide.Back, expectedCube: [
                [ 5, 1, 1, 5, 3, 4, 2, 3, 6 ],
                [ 5, 2, 2, 5, 5, 5, 3, 4, 2 ],
                [ 5, 1, 3, 2, 1, 4, 6, 3, 6 ],
                [ 5, 2, 4, 6, 6, 3, 4, 2, 6 ],
                [ 3, 6, 2, 5, 2, 6, 4, 1, 1 ],
                [ 4, 1, 1, 4, 4, 6, 3, 3, 1 ]
            ]
        },
        { cube: testCube, focusSide: CubeSide.Top, expectedCube: [
                [ 6, 2, 5, 3, 1, 1, 6, 4, 3 ],
                [ 1, 1, 4, 6, 2, 5, 2, 6, 3 ],
                [ 1, 4, 6, 1, 3, 3, 5, 5, 2 ],
                [ 4, 1, 1, 4, 4, 6, 3, 3, 1 ],
                [ 2, 4, 3, 5, 5, 5, 2, 2, 5 ],
                [ 5, 2, 4, 6, 6, 3, 4, 2, 6 ]
            ]
        },
        { cube: testCube, focusSide: CubeSide.Bottom, expectedCube: [
                [ 3, 4, 6, 1, 1, 3, 5, 2, 6 ],
                [ 1, 3, 3, 6, 4, 4, 1, 1, 4 ],
                [ 2, 5, 5, 3, 3, 1, 6, 4, 1 ],
                [ 3, 6, 2, 5, 2, 6, 4, 1, 1 ],
                [ 5, 2, 4, 6, 6, 3, 4, 2, 6 ],
                [ 2, 4, 3, 5, 5, 5, 2, 2, 5 ]
            ]
        }
    ];

    it.each(
        tests.map(testCase => ({
            ...testCase, name: getRefocusCubeTestCaseName(testCase)
        }))
    )("$name", testCase => {
        const { cube, expectedCube, focusSide } = testCase;
        const result = refocusCube(cube, focusSide);
        checkCube(result, expectedCube);
    });
});

interface IRotateCubeSliceFromFaceTestCase {
    readonly name: string;
    readonly cube: DeepReadonly<CubeData>;
    readonly sideRef: CubeSide;
    readonly axis: CubeAxis;
    readonly direction: SliceDirection;
    readonly sliceIndex: number;
    readonly sliceSize: number;
    readonly rotation: number;
    readonly expectedCube: DeepReadonly<CubeData>
}

function getRotateCubeSliceFromFaceTestCaseName(
    testCase: Omit<IRotateCubeSliceFromFaceTestCase, "name">
): string {
    const {
        cube, sideRef, axis, direction, sliceIndex, sliceSize, rotation
    } = testCase;
    const size = getCubeSize(cube);
    let sideName: string;
    switch (sideRef) {
        case CubeSide.Front: sideName = "front"; break;
        case CubeSide.Back: sideName = "back"; break;
        case CubeSide.Left: sideName = "left"; break;
        case CubeSide.Right: sideName = "right"; break;
        case CubeSide.Top: sideName = "top"; break;
        case CubeSide.Bottom: sideName = "bottom"; break;
        default: forceNever(sideRef);
    }
    const rotName: string = `${90*rotation}° ↻`;
    let dirName: string;
    switch (direction) {
        case SliceDirection.Up: dirName = "↑"; break;
        case SliceDirection.Down: dirName = "↓"; break;
        case SliceDirection.Left: dirName = "←"; break;
        case SliceDirection.Right: dirName = "→"; break;
    }
    return `${size}x${size}[${sideName}]: ${axis}-axis (${sliceIndex}+${sliceSize}) ${dirName} (${rotName})`;
}

function _makeRotateCubeSliceFromFaceTestCase(
    testCase: Omit<
        IRotateCubeSliceFromFaceTestCase, 
        | "name" | "cube" | "expectedCube" | "direction" | "rotation" 
        | "sliceSize" | "sliceIndex"
    >,
    forwardRotation: SliceDirection,
    cubes: readonly DeepReadonly<[CubeData, CubeData, CubeData, number, number]>[]
): Omit<IRotateCubeSliceFromFaceTestCase, "name">[] {
    let reverseRotation: SliceDirection;
    switch (forwardRotation) {
        case SliceDirection.Up: reverseRotation = SliceDirection.Down; break;
        case SliceDirection.Down: reverseRotation = SliceDirection.Up; break;
        case SliceDirection.Left: reverseRotation = SliceDirection.Right; break;
        case SliceDirection.Right: reverseRotation = SliceDirection.Left; break;
        default: forceNever(forwardRotation);
    }
    const testCases: Omit<IRotateCubeSliceFromFaceTestCase, "name">[] = [];
    for (const [cube, expForward, expBack, sliceIndex, sliceSize] of cubes) {
        testCases.push(
            {
                ...testCase, direction: forwardRotation, rotation: 1,
                cube, expectedCube: expForward, sliceIndex, sliceSize,
            },
            {
                ...testCase, direction: reverseRotation, rotation: 1,
                cube, expectedCube: expBack, sliceIndex, sliceSize,
            }
        );
    }
    return testCases;
}

describe("rotateCubeSliceFromFace", () => {
    const base3x3Cube: CubeData = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [2, 2, 2, 2, 2, 2, 2, 2, 2],
        [3, 3, 3, 3, 3, 3, 3, 3, 3],
        [4, 4, 4, 4, 4, 4, 4, 4, 4],
        [5, 5, 5, 5, 5, 5, 5, 5, 5],
        [6, 6, 6, 6, 6, 6, 6, 6, 6]
    ];
    const base5x5Cube: CubeData = [
        Array.from({length: 25}, _ => 1),
        Array.from({length: 25}, _ => 2),
        Array.from({length: 25}, _ => 3),
        Array.from({length: 25}, _ => 4),
        Array.from({length: 25}, _ => 5),
        Array.from({length: 25}, _ => 6),
    ];

    const rot3x3XAxisLeft = rotateCubeInternalSlice(base3x3Cube, "X", 1, 1, 1);
    const rot3x3XAxisRight = rotateCubeInternalSlice(base3x3Cube, "X", 1, 1, -1); 
    const rot3x3YAxisUp = rotateCubeInternalSlice(base3x3Cube, "Y", 1, 1, 1);
    const rot3x3YAxisDown = rotateCubeInternalSlice(base3x3Cube, "Y", 1, 1, -1);
    const rot3x3ZAxisUp = rotateCubeInternalSlice(base3x3Cube, "Z", 1, 1, 1);
    const rot3x3ZAxisDown = rotateCubeInternalSlice(base3x3Cube, "Z", 1, 1, -1);

    const rot5x5XAxisLeft1 = rotateCubeInternalSlice(base5x5Cube, "X", 1, 1, 1);
    const rot5x5XAxisLeft1_2 = rotateCubeInternalSlice(base5x5Cube, "X", 1, 2, 1);
    const rot5x5XAxisLeft2_3 = rotateCubeInternalSlice(base5x5Cube, "X", 2, 2, 1);
    const rot5x5XAxisLeft3 = rotateCubeInternalSlice(base5x5Cube, "X", 3, 1, 1);
    const rot5x5XAxisRight1 = rotateCubeInternalSlice(base5x5Cube, "X", 1, 1, -1);
    const rot5x5XAxisRight1_2 = rotateCubeInternalSlice(base5x5Cube, "X", 1, 2, -1);
    const rot5x5XAxisRight2_3 = rotateCubeInternalSlice(base5x5Cube, "X", 2, 2, -1);
    const rot5x5XAxisRight3 = rotateCubeInternalSlice(base5x5Cube, "X", 3, 1, -1);

    const rot5x5YAxisUp1 = rotateCubeInternalSlice(base5x5Cube, "Y", 1, 1, 1);
    const rot5x5YAxisUp1_2 = rotateCubeInternalSlice(base5x5Cube, "Y", 1, 2, 1);
    const rot5x5YAxisUp2_3 = rotateCubeInternalSlice(base5x5Cube, "Y", 2, 2, 1);
    const rot5x5YAxisUp3 = rotateCubeInternalSlice(base5x5Cube, "Y", 3, 1, 1);
    const rot5x5YAxisDown1 = rotateCubeInternalSlice(base5x5Cube, "Y", 1, 1, -1);
    const rot5x5YAxisDown1_2 = rotateCubeInternalSlice(base5x5Cube, "Y", 1, 2, -1);
    const rot5x5YAxisDown2_3 = rotateCubeInternalSlice(base5x5Cube, "Y", 2, 2, -1);
    const rot5x5YAxisDown3 = rotateCubeInternalSlice(base5x5Cube, "Y", 3, 1, -1);
    
    const rot5x5ZAxisUp1 = rotateCubeInternalSlice(base5x5Cube, "Z", 1, 1, 1);
    const rot5x5ZAxisUp1_2 = rotateCubeInternalSlice(base5x5Cube, "Z", 1, 2, 1);
    const rot5x5ZAxisUp2_3 = rotateCubeInternalSlice(base5x5Cube, "Z", 2, 2, 1);
    const rot5x5ZAxisUp3 = rotateCubeInternalSlice(base5x5Cube, "Z", 3, 1, 1);
    const rot5x5ZAxisDown1 = rotateCubeInternalSlice(base5x5Cube, "Z", 1, 1, -1);
    const rot5x5ZAxisDown1_2 = rotateCubeInternalSlice(base5x5Cube, "Z", 1, 2, -1);
    const rot5x5ZAxisDown2_3 = rotateCubeInternalSlice(base5x5Cube, "Z", 2, 2, -1);
    const rot5x5ZAxisDown3 = rotateCubeInternalSlice(base5x5Cube, "Z", 3, 1, -1);

    const tests: Omit<IRotateCubeSliceFromFaceTestCase, "name">[] = [
        // Side 1 is straightforward - it should work just like it says on the box
        ..._makeRotateCubeSliceFromFaceTestCase(
            { axis: "X", sideRef: CubeSide.Left },
            SliceDirection.Left, 
            [
                [base3x3Cube, rot3x3XAxisLeft,    rot3x3XAxisRight,    1, 1],
                [base5x5Cube, rot5x5XAxisLeft1,   rot5x5XAxisRight1,   1, 1],
                [base5x5Cube, rot5x5XAxisLeft1_2, rot5x5XAxisRight1_2, 1, 2],
                [base5x5Cube, rot5x5XAxisLeft2_3, rot5x5XAxisRight2_3, 2, 2],
                [base5x5Cube, rot5x5XAxisLeft3,   rot5x5XAxisRight3,   3, 1],
            ]
        ),
        ..._makeRotateCubeSliceFromFaceTestCase(
            { axis: "Z", sideRef: CubeSide.Left },
            SliceDirection.Up, 
            [
                [base3x3Cube, rot3x3ZAxisUp,    rot3x3ZAxisDown,    1, 1],
                [base5x5Cube, rot5x5ZAxisUp1,   rot5x5ZAxisDown1,   1, 1],
                [base5x5Cube, rot5x5ZAxisUp1_2, rot5x5ZAxisDown1_2, 1, 2],
                [base5x5Cube, rot5x5ZAxisUp2_3, rot5x5ZAxisDown2_3, 2, 2],
                [base5x5Cube, rot5x5ZAxisUp3,   rot5x5ZAxisDown3,   3, 1],
            ]
        ),
        // Side 2 is straightforward - it should work just like it says on the box
        ..._makeRotateCubeSliceFromFaceTestCase(
            { axis: "X", sideRef: CubeSide.Front },
            SliceDirection.Left, 
            [
                [base3x3Cube, rot3x3XAxisLeft,    rot3x3XAxisRight,    1, 1],
                [base5x5Cube, rot5x5XAxisLeft1,   rot5x5XAxisRight1,   1, 1],
                [base5x5Cube, rot5x5XAxisLeft1_2, rot5x5XAxisRight1_2, 1, 2],
                [base5x5Cube, rot5x5XAxisLeft2_3, rot5x5XAxisRight2_3, 2, 2],
                [base5x5Cube, rot5x5XAxisLeft3,   rot5x5XAxisRight3,   3, 1],
            ]
        ),
        ..._makeRotateCubeSliceFromFaceTestCase(
            { axis: "Y", sideRef: CubeSide.Front },
            SliceDirection.Up, 
            [
                [base3x3Cube, rot3x3YAxisUp,    rot3x3YAxisDown,    1, 1],
                [base5x5Cube, rot5x5YAxisUp1,   rot5x5YAxisDown1,   1, 1],
                [base5x5Cube, rot5x5YAxisUp1_2, rot5x5YAxisDown1_2, 1, 2],
                [base5x5Cube, rot5x5YAxisUp2_3, rot5x5YAxisDown2_3, 2, 2],
                [base5x5Cube, rot5x5YAxisUp3,   rot5x5YAxisDown3,   3, 1],
            ]
        ),
        // Side 3 has the vertical axis inverted
        ..._makeRotateCubeSliceFromFaceTestCase(
            { axis: "X", sideRef: CubeSide.Right },
            SliceDirection.Left, 
            [
                [base3x3Cube, rot3x3XAxisLeft,    rot3x3XAxisRight,    1, 1],
                [base5x5Cube, rot5x5XAxisLeft1,   rot5x5XAxisRight1,   1, 1],
                [base5x5Cube, rot5x5XAxisLeft1_2, rot5x5XAxisRight1_2, 1, 2],
                [base5x5Cube, rot5x5XAxisLeft2_3, rot5x5XAxisRight2_3, 2, 2],
                [base5x5Cube, rot5x5XAxisLeft3,   rot5x5XAxisRight3,   3, 1],
            ]
        ),
        ..._makeRotateCubeSliceFromFaceTestCase(
            { axis: "Z", sideRef: CubeSide.Right },
            SliceDirection.Up, 
            [
                [base3x3Cube, rot3x3ZAxisDown,    rot3x3ZAxisUp,    1, 1],
                [base5x5Cube, rot5x5ZAxisDown3,   rot5x5ZAxisUp3,   1, 1],
                [base5x5Cube, rot5x5ZAxisDown2_3, rot5x5ZAxisUp2_3, 1, 2],
                [base5x5Cube, rot5x5ZAxisDown1_2, rot5x5ZAxisUp1_2, 2, 2],
                [base5x5Cube, rot5x5ZAxisDown1,   rot5x5ZAxisUp1,   3, 1],
            ]
        ),
        // Side 4 has the vertical axis inverted
        ..._makeRotateCubeSliceFromFaceTestCase(
            { axis: "X", sideRef: CubeSide.Back },
            SliceDirection.Left, 
            [
                [base3x3Cube, rot3x3XAxisLeft,    rot3x3XAxisRight,    1, 1],
                [base5x5Cube, rot5x5XAxisLeft1,   rot5x5XAxisRight1,   1, 1],
                [base5x5Cube, rot5x5XAxisLeft1_2, rot5x5XAxisRight1_2, 1, 2],
                [base5x5Cube, rot5x5XAxisLeft2_3, rot5x5XAxisRight2_3, 2, 2],
                [base5x5Cube, rot5x5XAxisLeft3,   rot5x5XAxisRight3,   3, 1],
            ]
        ),
        ..._makeRotateCubeSliceFromFaceTestCase(
            { axis: "Y", sideRef: CubeSide.Back },
            SliceDirection.Up, 
            [
                [base3x3Cube, rot3x3YAxisDown,    rot3x3YAxisUp,    1, 1],
                [base5x5Cube, rot5x5YAxisDown3,   rot5x5YAxisUp3,   1, 1],
                [base5x5Cube, rot5x5YAxisDown2_3, rot5x5YAxisUp2_3, 1, 2],
                [base5x5Cube, rot5x5YAxisDown1_2, rot5x5YAxisUp1_2, 2, 2],
                [base5x5Cube, rot5x5YAxisDown1,   rot5x5YAxisUp1,   3, 1],
            ]
        ),
        // Side 5 is a little special in general
        ..._makeRotateCubeSliceFromFaceTestCase(
            { axis: "Z", sideRef: CubeSide.Top },
            SliceDirection.Left, 
            // Z-left for us is Z-down for side 1
            [
                [base3x3Cube, rot3x3ZAxisDown,    rot3x3ZAxisUp,    1, 1],
                [base5x5Cube, rot5x5ZAxisDown1,   rot5x5ZAxisUp1,   1, 1],
                [base5x5Cube, rot5x5ZAxisDown1_2, rot5x5ZAxisUp1_2, 1, 2],
                [base5x5Cube, rot5x5ZAxisDown2_3, rot5x5ZAxisUp2_3, 2, 2],
                [base5x5Cube, rot5x5ZAxisDown3,   rot5x5ZAxisUp3,   3, 1],
            ]
        ),
        ..._makeRotateCubeSliceFromFaceTestCase(
            { axis: "Y", sideRef: CubeSide.Top },
            SliceDirection.Up, 
            // Y-up is the same as side 2
            [
                [base3x3Cube, rot3x3YAxisUp,    rot3x3YAxisDown,    1, 1],
                [base5x5Cube, rot5x5YAxisUp1,   rot5x5YAxisDown1,   1, 1],
                [base5x5Cube, rot5x5YAxisUp1_2, rot5x5YAxisDown1_2, 1, 2],
                [base5x5Cube, rot5x5YAxisUp2_3, rot5x5YAxisDown2_3, 2, 2],
                [base5x5Cube, rot5x5YAxisUp3,   rot5x5YAxisDown3,   3, 1],
            ]
        ),
        // Side 6 is even more special
        ..._makeRotateCubeSliceFromFaceTestCase(
            { axis: "Z", sideRef: CubeSide.Bottom },
            SliceDirection.Left, 
            // Z-left for us is Z-up for side 1, but it does have indices inverted
            [
                [base3x3Cube, rot3x3ZAxisUp,    rot3x3ZAxisDown,    1, 1],
                [base5x5Cube, rot5x5ZAxisUp3,   rot5x5ZAxisDown3,   1, 1],
                [base5x5Cube, rot5x5ZAxisUp2_3, rot5x5ZAxisDown2_3, 1, 2],
                [base5x5Cube, rot5x5ZAxisUp1_2, rot5x5ZAxisDown1_2, 2, 2],
                [base5x5Cube, rot5x5ZAxisUp1,   rot5x5ZAxisDown1,   3, 1],
            ]
        ),
        ..._makeRotateCubeSliceFromFaceTestCase(
            { axis: "Y", sideRef: CubeSide.Bottom },
            SliceDirection.Up, 
            // Y-up is the same as side 2
            [
                [base3x3Cube, rot3x3YAxisUp,    rot3x3YAxisDown,    1, 1],
                [base5x5Cube, rot5x5YAxisUp1,   rot5x5YAxisDown1,   1, 1],
                [base5x5Cube, rot5x5YAxisUp1_2, rot5x5YAxisDown1_2, 1, 2],
                [base5x5Cube, rot5x5YAxisUp2_3, rot5x5YAxisDown2_3, 2, 2],
                [base5x5Cube, rot5x5YAxisUp3,   rot5x5YAxisDown3,   3, 1],
            ]
        ),
    ];

    it.each<IRotateCubeSliceFromFaceTestCase>(
        tests.map(
            testCase => ({
                ...testCase, 
                name: getRotateCubeSliceFromFaceTestCaseName(testCase)
        }))
    )("$name", testCase => {
        const { 
            cube, expectedCube, sideRef, axis, direction, sliceIndex, sliceSize, 
            rotation 
        } = testCase;
        const result = rotateCubeSliceFromFace(
            cube, sideRef, axis, sliceIndex, sliceSize, direction, rotation
        );
        checkCube(result, expectedCube);
    });
})