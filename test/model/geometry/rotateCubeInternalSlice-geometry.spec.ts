import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { DeepReadonly, isBoundedInteger } from "../../../src/common";
import { CubeAxis, CubeData, getCubeSize } from "../../../src/model/cube";
import {
  RotationAmount,
  rotateCubeInternalSlice,
} from "../../../src/model/geometry";
import {
  INamedTestCase,
  checkCube,
  fcCubeAxes,
  fcCubeSizes,
  fcRotateSliceFromFaceCommand,
  fcRotationCounts,
  fcSliceSizes,
  fcSliceStarts,
  getAllTestCases,
  getTestCube,
  nameRotationAmount,
} from "../utility";

interface IRotateCubeSliceTestCase {
  readonly cube: DeepReadonly<CubeData>;
  readonly axis: CubeAxis;
  readonly rotation: RotationAmount;
  readonly sliceStart: number;
  readonly sliceSize: number;
  readonly expectedCube: DeepReadonly<CubeData>;
}

describe("rotateCubeInternalSlice", () => {
  it.each(getTestCases())("$name", testCase => {
    const { axis, sliceStart, sliceSize, cube, rotation, expectedCube } =
      testCase;
    const result = rotateCubeInternalSlice(
      cube,
      axis,
      sliceStart,
      sliceSize,
      rotation,
    );
    checkCube(result, expectedCube);
  });

  it("Should assert a failure if the offset start is invalid", () =>
    fc.assert(
      fc.property(
        fc
          .tuple(fc.integer(), fcCubeSizes)
          .filter(
            ([offsetStart, size]) =>
              !isBoundedInteger(offsetStart, 1, size - 1),
          ),
        fc.boolean(),
        fcCubeAxes,
        fcSliceSizes,
        fcRotationCounts,
        ([offsetStart, cubeSize], mutate, axis, numSlices, numRotations) => {
          const testCube = getTestCube(cubeSize, mutate);
          expect(() =>
            rotateCubeInternalSlice(
              testCube,
              axis,
              offsetStart,
              numSlices,
              numRotations,
            ),
          ).toThrowError(
            `Assertion of "Offset must be in range [1, ${cubeSize - 2}]" [false] failed`,
          );
        },
      ),
    ));

  it("Should assert a failure if the offset size is invalid", () =>
    fc.assert(
      fc.property(
        fc
          .tuple(fcSliceStarts, fcCubeSizes, fc.integer())
          .filter(
            ([offsetStart, size, numSlices]) =>
              isBoundedInteger(offsetStart, 1, size - 2)
              && !isBoundedInteger(numSlices, 1, size - 1 - offsetStart),
          ),
        fc.boolean(),
        fcCubeAxes,
        fcRotationCounts,
        ([offsetStart, cubeSize, numSlices], mutate, axis, numRotations) => {
          const testCube = getTestCube(cubeSize, mutate);
          expect(() =>
            rotateCubeInternalSlice(
              testCube,
              axis,
              offsetStart,
              numSlices,
              numRotations,
            ),
          ).toThrowError(
            `Assertion of "Number of slices must be in range [1, ${cubeSize - 1 - offsetStart}]" [false] failed`,
          );
        },
      ),
    ));

  // We don't have a command for the function under test here yet, the one below is actually the face-referential one
  it.skip("Shouldn't touch the faces that are perpendicular to the axes", () =>
    fc.assert(
      fc.property(
        fcCubeSizes,
        fc.commands([fcRotateSliceFromFaceCommand]), // enforced here
        (cubeSize, cmds) => {
          const s = () => ({
            model: { cubeSize, commandList: [] },
            real: getTestCube(cubeSize),
          });
          fc.modelRun(s, cmds);
        },
      ),
    ));
});

function getTestCases(): (IRotateCubeSliceTestCase & INamedTestCase)[] {
  const baseCube = getTestCube(3);

  const tests: IRotateCubeSliceTestCase[] = [
    {
      axis: "X",
      sliceStart: 1,
      sliceSize: 1,
      rotation: RotationAmount.CounterClockwise,
      cube: baseCube,
      expectedCube: [
        [1, 1, 1, 4, 4, 4, 1, 1, 1],
        [2, 2, 2, 1, 1, 1, 2, 2, 2],
        [3, 3, 3, 2, 2, 2, 3, 3, 3],
        [4, 4, 4, 3, 3, 3, 4, 4, 4],
        [5, 5, 5, 5, 5, 5, 5, 5, 5],
        [6, 6, 6, 6, 6, 6, 6, 6, 6],
      ],
    },
    {
      axis: "Z",
      sliceStart: 1,
      sliceSize: 1,
      rotation: RotationAmount.CounterClockwise,
      cube: baseCube,
      expectedCube: [
        [1, 5, 1, 1, 5, 1, 1, 5, 1],
        [2, 2, 2, 2, 2, 2, 2, 2, 2],
        [3, 6, 3, 3, 6, 3, 3, 6, 3],
        [4, 4, 4, 4, 4, 4, 4, 4, 4],
        [5, 5, 5, 3, 3, 3, 5, 5, 5],
        [6, 6, 6, 1, 1, 1, 6, 6, 6],
      ],
    },
    {
      axis: "Y",
      sliceStart: 1,
      sliceSize: 1,
      rotation: RotationAmount.CounterClockwise,
      cube: baseCube,
      expectedCube: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [2, 5, 2, 2, 5, 2, 2, 5, 2],
        [3, 3, 3, 3, 3, 3, 3, 3, 3],
        [4, 6, 4, 4, 6, 4, 4, 6, 4],
        [5, 4, 5, 5, 4, 5, 5, 4, 5],
        [6, 2, 6, 6, 2, 6, 6, 2, 6],
      ],
    },
  ];

  return getAllTestCases(
    tests,
    ({ cube, axis, sliceStart, sliceSize, rotation }) => {
      const size = getCubeSize(cube);
      const rotName = nameRotationAmount(rotation);
      const mutated = Object.is(cube, baseCube) ? "" : "mutated ";
      return `Should rotate ${axis}-axis slices [${sliceStart}-${sliceStart + sliceSize}) by ${rotName} of a ${mutated}${size}x${size} cube`;
    },
  );
}
