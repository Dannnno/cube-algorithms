import fc from "fast-check";
import { describe, it } from "vitest";
import { DeepReadonly, forceNever } from "../../../src/common";
import {
  CubeAxis,
  CubeData,
  CubeSide,
  SliceDirection,
  getCubeSize,
} from "../../../src/model/cube";
import {
  rotateCubeInternalSlice,
  rotateCubeSliceFromFace,
} from "../../../src/model/geometry";
import {
  INamedTestCase,
  checkCube,
  fcCubeSizes,
  fcRotateSliceFromFaceCommand,
  getAllTestCases,
  getTestCube,
  nameDirection,
  nameRotationAmount,
  nameSide,
} from "../utility";

interface IPartialRotateCubeSliceFromFaceBuilder {
  readonly sideRef: CubeSide;
  readonly axis: CubeAxis;
}
interface IRotateCubeSliceFromFaceTestCase
  extends IPartialRotateCubeSliceFromFaceBuilder {
  readonly cube: DeepReadonly<CubeData>;
  readonly direction: SliceDirection;
  readonly sliceIndex: number;
  readonly sliceSize: number;
  readonly rotation: number;
  readonly expectedCube: DeepReadonly<CubeData>;
}

describe("rotateCubeSliceFromFace", () => {
  it.each(getTestCases())("$name", testCase => {
    const {
      cube,
      expectedCube,
      sideRef,
      axis,
      direction,
      sliceIndex,
      sliceSize,
      rotation,
    } = testCase;
    const result = rotateCubeSliceFromFace(
      cube,
      sideRef,
      axis,
      sliceIndex,
      sliceSize,
      direction,
      rotation,
    );
    checkCube(result, expectedCube);
  });

  it("Shouldn't touch the faces that are perpendicular to the axes", () =>
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

function getTestCases(): (IRotateCubeSliceFromFaceTestCase & INamedTestCase)[] {
  // Get all of the possible test cases based off of the types of manipulations we're doing
  const base3x3Cube = getTestCube(3);
  const base5x5Cube = getTestCube(5);

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
  const rot5x5XAxisRight1_2 = rotateCubeInternalSlice(
    base5x5Cube,
    "X",
    1,
    2,
    -1,
  );
  const rot5x5XAxisRight2_3 = rotateCubeInternalSlice(
    base5x5Cube,
    "X",
    2,
    2,
    -1,
  );
  const rot5x5XAxisRight3 = rotateCubeInternalSlice(base5x5Cube, "X", 3, 1, -1);

  const rot5x5YAxisUp1 = rotateCubeInternalSlice(base5x5Cube, "Y", 1, 1, 1);
  const rot5x5YAxisUp1_2 = rotateCubeInternalSlice(base5x5Cube, "Y", 1, 2, 1);
  const rot5x5YAxisUp2_3 = rotateCubeInternalSlice(base5x5Cube, "Y", 2, 2, 1);
  const rot5x5YAxisUp3 = rotateCubeInternalSlice(base5x5Cube, "Y", 3, 1, 1);
  const rot5x5YAxisDown1 = rotateCubeInternalSlice(base5x5Cube, "Y", 1, 1, -1);
  const rot5x5YAxisDown1_2 = rotateCubeInternalSlice(
    base5x5Cube,
    "Y",
    1,
    2,
    -1,
  );
  const rot5x5YAxisDown2_3 = rotateCubeInternalSlice(
    base5x5Cube,
    "Y",
    2,
    2,
    -1,
  );
  const rot5x5YAxisDown3 = rotateCubeInternalSlice(base5x5Cube, "Y", 3, 1, -1);

  const rot5x5ZAxisUp1 = rotateCubeInternalSlice(base5x5Cube, "Z", 1, 1, 1);
  const rot5x5ZAxisUp1_2 = rotateCubeInternalSlice(base5x5Cube, "Z", 1, 2, 1);
  const rot5x5ZAxisUp2_3 = rotateCubeInternalSlice(base5x5Cube, "Z", 2, 2, 1);
  const rot5x5ZAxisUp3 = rotateCubeInternalSlice(base5x5Cube, "Z", 3, 1, 1);
  const rot5x5ZAxisDown1 = rotateCubeInternalSlice(base5x5Cube, "Z", 1, 1, -1);
  const rot5x5ZAxisDown1_2 = rotateCubeInternalSlice(
    base5x5Cube,
    "Z",
    1,
    2,
    -1,
  );
  const rot5x5ZAxisDown2_3 = rotateCubeInternalSlice(
    base5x5Cube,
    "Z",
    2,
    2,
    -1,
  );
  const rot5x5ZAxisDown3 = rotateCubeInternalSlice(base5x5Cube, "Z", 3, 1, -1);

  // Get all of the actual test cases
  const tests: IRotateCubeSliceFromFaceTestCase[] = [
    // Side 1 is straightforward - it should work just like it says on the box
    ..._makeRotateCubeSliceFromFaceTestCase(
      { axis: "X", sideRef: CubeSide.Left },
      SliceDirection.Left,
      [
        [base3x3Cube, rot3x3XAxisLeft, rot3x3XAxisRight, 1, 1],
        [base5x5Cube, rot5x5XAxisLeft1, rot5x5XAxisRight1, 1, 1],
        [base5x5Cube, rot5x5XAxisLeft1_2, rot5x5XAxisRight1_2, 1, 2],
        [base5x5Cube, rot5x5XAxisLeft2_3, rot5x5XAxisRight2_3, 2, 2],
        [base5x5Cube, rot5x5XAxisLeft3, rot5x5XAxisRight3, 3, 1],
      ],
    ),
    ..._makeRotateCubeSliceFromFaceTestCase(
      { axis: "Z", sideRef: CubeSide.Left },
      SliceDirection.Up,
      [
        [base3x3Cube, rot3x3ZAxisUp, rot3x3ZAxisDown, 1, 1],
        [base5x5Cube, rot5x5ZAxisUp1, rot5x5ZAxisDown1, 1, 1],
        [base5x5Cube, rot5x5ZAxisUp1_2, rot5x5ZAxisDown1_2, 1, 2],
        [base5x5Cube, rot5x5ZAxisUp2_3, rot5x5ZAxisDown2_3, 2, 2],
        [base5x5Cube, rot5x5ZAxisUp3, rot5x5ZAxisDown3, 3, 1],
      ],
    ),
    // Side 2 is straightforward - it should work just like it says on the box
    ..._makeRotateCubeSliceFromFaceTestCase(
      { axis: "X", sideRef: CubeSide.Front },
      SliceDirection.Left,
      [
        [base3x3Cube, rot3x3XAxisLeft, rot3x3XAxisRight, 1, 1],
        [base5x5Cube, rot5x5XAxisLeft1, rot5x5XAxisRight1, 1, 1],
        [base5x5Cube, rot5x5XAxisLeft1_2, rot5x5XAxisRight1_2, 1, 2],
        [base5x5Cube, rot5x5XAxisLeft2_3, rot5x5XAxisRight2_3, 2, 2],
        [base5x5Cube, rot5x5XAxisLeft3, rot5x5XAxisRight3, 3, 1],
      ],
    ),
    ..._makeRotateCubeSliceFromFaceTestCase(
      { axis: "Y", sideRef: CubeSide.Front },
      SliceDirection.Up,
      [
        [base3x3Cube, rot3x3YAxisUp, rot3x3YAxisDown, 1, 1],
        [base5x5Cube, rot5x5YAxisUp1, rot5x5YAxisDown1, 1, 1],
        [base5x5Cube, rot5x5YAxisUp1_2, rot5x5YAxisDown1_2, 1, 2],
        [base5x5Cube, rot5x5YAxisUp2_3, rot5x5YAxisDown2_3, 2, 2],
        [base5x5Cube, rot5x5YAxisUp3, rot5x5YAxisDown3, 3, 1],
      ],
    ),
    // Side 3 has the vertical axis inverted
    ..._makeRotateCubeSliceFromFaceTestCase(
      { axis: "X", sideRef: CubeSide.Right },
      SliceDirection.Left,
      [
        [base3x3Cube, rot3x3XAxisLeft, rot3x3XAxisRight, 1, 1],
        [base5x5Cube, rot5x5XAxisLeft1, rot5x5XAxisRight1, 1, 1],
        [base5x5Cube, rot5x5XAxisLeft1_2, rot5x5XAxisRight1_2, 1, 2],
        [base5x5Cube, rot5x5XAxisLeft2_3, rot5x5XAxisRight2_3, 2, 2],
        [base5x5Cube, rot5x5XAxisLeft3, rot5x5XAxisRight3, 3, 1],
      ],
    ),
    ..._makeRotateCubeSliceFromFaceTestCase(
      { axis: "Z", sideRef: CubeSide.Right },
      SliceDirection.Up,
      [
        [base3x3Cube, rot3x3ZAxisDown, rot3x3ZAxisUp, 1, 1],
        [base5x5Cube, rot5x5ZAxisDown3, rot5x5ZAxisUp3, 1, 1],
        [base5x5Cube, rot5x5ZAxisDown2_3, rot5x5ZAxisUp2_3, 1, 2],
        [base5x5Cube, rot5x5ZAxisDown1_2, rot5x5ZAxisUp1_2, 2, 2],
        [base5x5Cube, rot5x5ZAxisDown1, rot5x5ZAxisUp1, 3, 1],
      ],
    ),
    // Side 4 has the vertical axis inverted
    ..._makeRotateCubeSliceFromFaceTestCase(
      { axis: "X", sideRef: CubeSide.Back },
      SliceDirection.Left,
      [
        [base3x3Cube, rot3x3XAxisLeft, rot3x3XAxisRight, 1, 1],
        [base5x5Cube, rot5x5XAxisLeft1, rot5x5XAxisRight1, 1, 1],
        [base5x5Cube, rot5x5XAxisLeft1_2, rot5x5XAxisRight1_2, 1, 2],
        [base5x5Cube, rot5x5XAxisLeft2_3, rot5x5XAxisRight2_3, 2, 2],
        [base5x5Cube, rot5x5XAxisLeft3, rot5x5XAxisRight3, 3, 1],
      ],
    ),
    ..._makeRotateCubeSliceFromFaceTestCase(
      { axis: "Y", sideRef: CubeSide.Back },
      SliceDirection.Up,
      [
        [base3x3Cube, rot3x3YAxisDown, rot3x3YAxisUp, 1, 1],
        [base5x5Cube, rot5x5YAxisDown3, rot5x5YAxisUp3, 1, 1],
        [base5x5Cube, rot5x5YAxisDown2_3, rot5x5YAxisUp2_3, 1, 2],
        [base5x5Cube, rot5x5YAxisDown1_2, rot5x5YAxisUp1_2, 2, 2],
        [base5x5Cube, rot5x5YAxisDown1, rot5x5YAxisUp1, 3, 1],
      ],
    ),
    // Side 5 is a little special in general
    ..._makeRotateCubeSliceFromFaceTestCase(
      { axis: "Z", sideRef: CubeSide.Top },
      SliceDirection.Left,
      // Z-left for us is Z-down for side 1
      [
        [base3x3Cube, rot3x3ZAxisDown, rot3x3ZAxisUp, 1, 1],
        [base5x5Cube, rot5x5ZAxisDown1, rot5x5ZAxisUp1, 1, 1],
        [base5x5Cube, rot5x5ZAxisDown1_2, rot5x5ZAxisUp1_2, 1, 2],
        [base5x5Cube, rot5x5ZAxisDown2_3, rot5x5ZAxisUp2_3, 2, 2],
        [base5x5Cube, rot5x5ZAxisDown3, rot5x5ZAxisUp3, 3, 1],
      ],
    ),
    ..._makeRotateCubeSliceFromFaceTestCase(
      { axis: "Y", sideRef: CubeSide.Top },
      SliceDirection.Up,
      // Y-up is the same as side 2
      [
        [base3x3Cube, rot3x3YAxisUp, rot3x3YAxisDown, 1, 1],
        [base5x5Cube, rot5x5YAxisUp1, rot5x5YAxisDown1, 1, 1],
        [base5x5Cube, rot5x5YAxisUp1_2, rot5x5YAxisDown1_2, 1, 2],
        [base5x5Cube, rot5x5YAxisUp2_3, rot5x5YAxisDown2_3, 2, 2],
        [base5x5Cube, rot5x5YAxisUp3, rot5x5YAxisDown3, 3, 1],
      ],
    ),
    // Side 6 is even more special
    ..._makeRotateCubeSliceFromFaceTestCase(
      { axis: "Z", sideRef: CubeSide.Bottom },
      SliceDirection.Left,
      // Z-left for us is Z-up for side 1, but it does have indices inverted
      [
        [base3x3Cube, rot3x3ZAxisUp, rot3x3ZAxisDown, 1, 1],
        [base5x5Cube, rot5x5ZAxisUp3, rot5x5ZAxisDown3, 1, 1],
        [base5x5Cube, rot5x5ZAxisUp2_3, rot5x5ZAxisDown2_3, 1, 2],
        [base5x5Cube, rot5x5ZAxisUp1_2, rot5x5ZAxisDown1_2, 2, 2],
        [base5x5Cube, rot5x5ZAxisUp1, rot5x5ZAxisDown1, 3, 1],
      ],
    ),
    ..._makeRotateCubeSliceFromFaceTestCase(
      { axis: "Y", sideRef: CubeSide.Bottom },
      SliceDirection.Up,
      // Y-up is the same as side 2
      [
        [base3x3Cube, rot3x3YAxisUp, rot3x3YAxisDown, 1, 1],
        [base5x5Cube, rot5x5YAxisUp1, rot5x5YAxisDown1, 1, 1],
        [base5x5Cube, rot5x5YAxisUp1_2, rot5x5YAxisDown1_2, 1, 2],
        [base5x5Cube, rot5x5YAxisUp2_3, rot5x5YAxisDown2_3, 2, 2],
        [base5x5Cube, rot5x5YAxisUp3, rot5x5YAxisDown3, 3, 1],
      ],
    ),
  ];

  return getAllTestCases(tests, testCase => {
    const { cube, sideRef, axis, direction, sliceIndex, sliceSize, rotation } =
      testCase;
    const size = getCubeSize(cube);
    const sideName = nameSide(sideRef);
    const rotName = nameRotationAmount(rotation);
    const dirName = nameDirection(direction);
    return `Should rotate ${axis}-axis slices [${sliceIndex}-${sliceIndex + sliceSize}) ${dirName} by ${rotName} while facing ${sideName} of a ${size}x${size} cube`;
  });
}

/**
 * Given a cube and a 'forward' slice, also generate the test cases if we were to do the same
 * but backwards
 * @param testCase The test case to expand
 * @param forwardRotation The direction we're treating as 'forwards'
 * @param cubes Information about the cubes and how its being sliced:
 *              [original, slice forwards, slice backwards, slice index, slice size]
 * @returns The test cases that correspond to this
 */
function _makeRotateCubeSliceFromFaceTestCase(
  testCase: IPartialRotateCubeSliceFromFaceBuilder,
  forwardRotation: SliceDirection,
  cubes: readonly DeepReadonly<
    [CubeData, CubeData, CubeData, number, number]
  >[],
): IRotateCubeSliceFromFaceTestCase[] {
  let reverseRotation: SliceDirection;
  switch (forwardRotation) {
    case SliceDirection.Up:
      reverseRotation = SliceDirection.Down;
      break;
    case SliceDirection.Down:
      reverseRotation = SliceDirection.Up;
      break;
    case SliceDirection.Left:
      reverseRotation = SliceDirection.Right;
      break;
    case SliceDirection.Right:
      reverseRotation = SliceDirection.Left;
      break;
    default:
      forceNever(forwardRotation);
  }
  const testCases: Omit<IRotateCubeSliceFromFaceTestCase, "name">[] = [];
  for (const [cube, expForward, expBack, sliceIndex, sliceSize] of cubes) {
    testCases.push(
      {
        ...testCase,
        direction: forwardRotation,
        rotation: 1,
        cube,
        expectedCube: expForward,
        sliceIndex,
        sliceSize,
      },
      {
        ...testCase,
        direction: reverseRotation,
        rotation: 1,
        cube,
        expectedCube: expBack,
        sliceIndex,
        sliceSize,
      },
    );
  }
  return testCases;
}
