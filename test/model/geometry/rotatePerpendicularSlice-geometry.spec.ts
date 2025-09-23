import fc from "fast-check";
import { describe, it } from "vitest";
import { DeepReadonly } from "../../../src/common";
import {
  CubeAxis,
  CubeData,
  CubeSide,
  getCubeSize,
} from "../../../src/model/cube";
import {
  RotationAmount,
  rotateCubeInternalSlice,
  rotatePerpendicularSlice,
} from "../../../src/model/geometry";
import {
  INamedTestCase,
  checkCube,
  fcCubeSizes,
  fcRotatePerpendicularSliceCommand,
  getAllTestCases,
  getTestCube,
  nameRotationAmount,
  nameSide,
} from "../utility";

interface IRotatePerpendicularSliceTestCase {
  readonly face: CubeSide;
  readonly cube: DeepReadonly<CubeData>;
  readonly sliceStart: number;
  readonly sliceSize: number;
  readonly rotationCount: number;
  readonly expectedCube: DeepReadonly<CubeData>;
}

describe("rotatePerpendicularSlice", () => {
  it.each(getTestCases())("$name", testCase => {
    const { cube, expectedCube, face, sliceStart, sliceSize, rotationCount } =
      testCase;
    const result = rotatePerpendicularSlice(
      cube,
      face,
      sliceStart,
      sliceSize,
      rotationCount,
    );
    checkCube(result, expectedCube);
  });

  it("Shouldn't touch the faces that are perpendicular to the axes", () =>
    fc.assert(
      fc.property(
        fcCubeSizes,
        fc.commands([fcRotatePerpendicularSliceCommand]), // enforced here
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

function getTestCases(): (IRotatePerpendicularSliceTestCase
  & INamedTestCase)[] {
  // Get all of the possible test cases based off of the types of manipulations we're doing
  const base3x3Cube = getTestCube(3);
  const base5x5Cube = getTestCube(5);

  const rot3x3XAxisLeft = rotateCubeInternalSlice(
    base3x3Cube,
    CubeAxis.Equatorial,
    1,
    1,
    1,
  );
  const rot3x3XAxisRight = rotateCubeInternalSlice(
    base3x3Cube,
    CubeAxis.Equatorial,
    1,
    1,
    -1,
  );
  const rot3x3YAxisUp = rotateCubeInternalSlice(
    base3x3Cube,
    CubeAxis.Middle,
    1,
    1,
    1,
  );
  const rot3x3YAxisDown = rotateCubeInternalSlice(
    base3x3Cube,
    CubeAxis.Middle,
    1,
    1,
    -1,
  );
  const rot3x3ZAxisUp = rotateCubeInternalSlice(
    base3x3Cube,
    CubeAxis.Standing,
    1,
    1,
    1,
  );
  const rot3x3ZAxisDown = rotateCubeInternalSlice(
    base3x3Cube,
    CubeAxis.Standing,
    1,
    1,
    -1,
  );

  const rot5x5XAxisLeft1 = rotateCubeInternalSlice(
    base5x5Cube,
    CubeAxis.Equatorial,
    1,
    1,
    1,
  );
  const rot5x5XAxisLeft1_2 = rotateCubeInternalSlice(
    base5x5Cube,
    CubeAxis.Equatorial,
    1,
    2,
    1,
  );
  const rot5x5XAxisLeft2_3 = rotateCubeInternalSlice(
    base5x5Cube,
    CubeAxis.Equatorial,
    2,
    2,
    1,
  );
  const rot5x5XAxisLeft3 = rotateCubeInternalSlice(
    base5x5Cube,
    CubeAxis.Equatorial,
    3,
    1,
    1,
  );
  const rot5x5XAxisRight1 = rotateCubeInternalSlice(
    base5x5Cube,
    CubeAxis.Equatorial,
    1,
    1,
    -1,
  );
  const rot5x5XAxisRight1_2 = rotateCubeInternalSlice(
    base5x5Cube,
    CubeAxis.Equatorial,
    1,
    2,
    -1,
  );
  const rot5x5XAxisRight2_3 = rotateCubeInternalSlice(
    base5x5Cube,
    CubeAxis.Equatorial,
    2,
    2,
    -1,
  );
  const rot5x5XAxisRight3 = rotateCubeInternalSlice(
    base5x5Cube,
    CubeAxis.Equatorial,
    3,
    1,
    -1,
  );

  const rot5x5YAxisUp1 = rotateCubeInternalSlice(
    base5x5Cube,
    CubeAxis.Middle,
    1,
    1,
    1,
  );
  const rot5x5YAxisUp1_2 = rotateCubeInternalSlice(
    base5x5Cube,
    CubeAxis.Middle,
    1,
    2,
    1,
  );
  const rot5x5YAxisUp2_3 = rotateCubeInternalSlice(
    base5x5Cube,
    CubeAxis.Middle,
    2,
    2,
    1,
  );
  const rot5x5YAxisUp3 = rotateCubeInternalSlice(
    base5x5Cube,
    CubeAxis.Middle,
    3,
    1,
    1,
  );
  const rot5x5YAxisDown1 = rotateCubeInternalSlice(
    base5x5Cube,
    CubeAxis.Middle,
    1,
    1,
    -1,
  );
  const rot5x5YAxisDown1_2 = rotateCubeInternalSlice(
    base5x5Cube,
    CubeAxis.Middle,
    1,
    2,
    -1,
  );
  const rot5x5YAxisDown2_3 = rotateCubeInternalSlice(
    base5x5Cube,
    CubeAxis.Middle,
    2,
    2,
    -1,
  );
  const rot5x5YAxisDown3 = rotateCubeInternalSlice(
    base5x5Cube,
    CubeAxis.Middle,
    3,
    1,
    -1,
  );

  const rot5x5ZAxisUp1 = rotateCubeInternalSlice(
    base5x5Cube,
    CubeAxis.Standing,
    1,
    1,
    1,
  );
  const rot5x5ZAxisUp1_2 = rotateCubeInternalSlice(
    base5x5Cube,
    CubeAxis.Standing,
    1,
    2,
    1,
  );
  const rot5x5ZAxisUp2_3 = rotateCubeInternalSlice(
    base5x5Cube,
    CubeAxis.Standing,
    2,
    2,
    1,
  );
  const rot5x5ZAxisUp3 = rotateCubeInternalSlice(
    base5x5Cube,
    CubeAxis.Standing,
    3,
    1,
    1,
  );
  const rot5x5ZAxisDown1 = rotateCubeInternalSlice(
    base5x5Cube,
    CubeAxis.Standing,
    1,
    1,
    -1,
  );
  const rot5x5ZAxisDown1_2 = rotateCubeInternalSlice(
    base5x5Cube,
    CubeAxis.Standing,
    1,
    2,
    -1,
  );
  const rot5x5ZAxisDown2_3 = rotateCubeInternalSlice(
    base5x5Cube,
    CubeAxis.Standing,
    2,
    2,
    -1,
  );
  const rot5x5ZAxisDown3 = rotateCubeInternalSlice(
    base5x5Cube,
    CubeAxis.Standing,
    3,
    1,
    -1,
  );

  // Get all of the actual test cases
  const tests: IRotatePerpendicularSliceTestCase[] = [
    ..._makeRotatePerpendicularSliceTestCase(CubeSide.Left, [
      [base3x3Cube, rot3x3YAxisDown, rot3x3YAxisUp, 1, 1],
      [base5x5Cube, rot5x5YAxisDown1, rot5x5YAxisUp1, 1, 1],
      [base5x5Cube, rot5x5YAxisDown1_2, rot5x5YAxisUp1_2, 1, 2],
      [base5x5Cube, rot5x5YAxisDown2_3, rot5x5YAxisUp2_3, 2, 2],
      [base5x5Cube, rot5x5YAxisDown3, rot5x5YAxisUp3, 3, 1],
    ]),
    ..._makeRotatePerpendicularSliceTestCase(CubeSide.Front, [
      [base3x3Cube, rot3x3ZAxisUp, rot3x3ZAxisDown, 1, 1],
      [base5x5Cube, rot5x5ZAxisUp3, rot5x5ZAxisDown3, 1, 1],
      [base5x5Cube, rot5x5ZAxisUp2_3, rot5x5ZAxisDown2_3, 1, 2],
      [base5x5Cube, rot5x5ZAxisUp1_2, rot5x5ZAxisDown1_2, 2, 2],
      [base5x5Cube, rot5x5ZAxisUp1, rot5x5ZAxisDown1, 3, 1],
    ]),
    ..._makeRotatePerpendicularSliceTestCase(CubeSide.Right, [
      [base3x3Cube, rot3x3YAxisUp, rot3x3YAxisDown, 1, 1],
      [base5x5Cube, rot5x5YAxisUp3, rot5x5YAxisDown3, 1, 1],
      [base5x5Cube, rot5x5YAxisUp2_3, rot5x5YAxisDown2_3, 1, 2],
      [base5x5Cube, rot5x5YAxisUp1_2, rot5x5YAxisDown1_2, 2, 2],
      [base5x5Cube, rot5x5YAxisUp1, rot5x5YAxisDown1, 3, 1],
    ]),
    ..._makeRotatePerpendicularSliceTestCase(CubeSide.Back, [
      [base3x3Cube, rot3x3ZAxisDown, rot3x3ZAxisUp, 1, 1],
      [base5x5Cube, rot5x5ZAxisDown1, rot5x5ZAxisUp1, 1, 1],
      [base5x5Cube, rot5x5ZAxisDown1_2, rot5x5ZAxisUp1_2, 1, 2],
      [base5x5Cube, rot5x5ZAxisDown2_3, rot5x5ZAxisUp2_3, 2, 2],
      [base5x5Cube, rot5x5ZAxisDown3, rot5x5ZAxisUp3, 3, 1],
    ]),
    ..._makeRotatePerpendicularSliceTestCase(CubeSide.Top, [
      [base3x3Cube, rot3x3XAxisLeft, rot3x3XAxisRight, 1, 1],
      [base5x5Cube, rot5x5XAxisLeft1, rot5x5XAxisRight1, 1, 1],
      [base5x5Cube, rot5x5XAxisLeft1_2, rot5x5XAxisRight1_2, 1, 2],
      [base5x5Cube, rot5x5XAxisLeft2_3, rot5x5XAxisRight2_3, 2, 2],
      [base5x5Cube, rot5x5XAxisLeft3, rot5x5XAxisRight3, 3, 1],
    ]),
    ..._makeRotatePerpendicularSliceTestCase(CubeSide.Bottom, [
      [base3x3Cube, rot3x3XAxisRight, rot3x3XAxisLeft, 1, 1],
      [base5x5Cube, rot5x5XAxisRight3, rot5x5XAxisLeft3, 1, 1],
      [base5x5Cube, rot5x5XAxisRight2_3, rot5x5XAxisLeft2_3, 1, 2],
      [base5x5Cube, rot5x5XAxisRight1_2, rot5x5XAxisLeft1_2, 2, 2],
      [base5x5Cube, rot5x5XAxisRight1, rot5x5XAxisLeft1, 3, 1],
    ]),
  ];

  return getAllTestCases(tests, testCase => {
    const { cube, face, sliceStart, sliceSize, rotationCount } = testCase;
    const size = getCubeSize(cube);
    const sideName = nameSide(face);
    const rotName = nameRotationAmount(rotationCount);
    return `Should rotate perpendicular slices [${sliceStart}-${sliceStart + sliceSize}) by ${rotName} while facing ${sideName} of a ${size}x${size} cube`;
  });
}

/**
 * Given a cube and a 'forward' slice, also generate the test cases if we were to do the same
 * but backwards
 * @param face The face that we need the perpendicular axis of
 * @param cubes Information about the cubes and how its being sliced:
 *              [original, slice forwards, slice backwards, slice index, slice size]
 * @returns The test cases that correspond to this
 */
function _makeRotatePerpendicularSliceTestCase(
  face: CubeSide,
  cubes: readonly DeepReadonly<
    [CubeData, CubeData, CubeData, number, number]
  >[],
): IRotatePerpendicularSliceTestCase[] {
  const testCases: IRotatePerpendicularSliceTestCase[] = [];
  for (const [cube, expForward, expBack, sliceIndex, sliceSize] of cubes) {
    testCases.push(
      {
        face,
        rotationCount: RotationAmount.Clockwise,
        cube,
        expectedCube: expForward,
        sliceStart: sliceIndex,
        sliceSize,
      },
      {
        face,
        rotationCount: RotationAmount.CounterClockwise,
        cube,
        expectedCube: expBack,
        sliceStart: sliceIndex,
        sliceSize,
      },
    );
  }
  return testCases;
}
