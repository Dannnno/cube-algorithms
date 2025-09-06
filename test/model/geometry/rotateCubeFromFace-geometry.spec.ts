import fc from "fast-check";
import { describe, it } from "vitest";
import { DeepReadonly } from "../../../src/common";
import { CubeData, CubeSide, SliceDirection } from "../../../src/model/cube";
import {
  RotationAmount,
  rotateCube,
  rotateCubeFromFace,
} from "../../../src/model/geometry";
import {
  INamedTestCase,
  checkCube,
  fcCubeSizes,
  fcRotateWholeCubeFromFaceCommand,
  getAllTestCases,
  getTestCube,
  nameDirection,
  nameRotationAmount,
  nameSide,
} from "../utility";

interface IRotateCubeFromFaceTestCase {
  readonly direction: SliceDirection;
  readonly rotation: RotationAmount;
  readonly faceRef: CubeSide;
  readonly expectedCube: DeepReadonly<CubeData>;
}

describe("rotateCubeFromFace", () => {
  const cube = getTestCube(3);

  it.each(getTestCases(cube))(
    "$name",
    ({ direction, rotation, faceRef, expectedCube }) => {
      const result = rotateCubeFromFace(cube, faceRef, direction, rotation);
      checkCube(result, expectedCube);
    },
  );

  it("Should preserve the overall value distribution", () =>
    fc.assert(
      fc.property(
        fcCubeSizes,
        fc.commands([fcRotateWholeCubeFromFaceCommand]), // enforced here
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

function getTestCases(
  cube: DeepReadonly<CubeData>,
): (IRotateCubeFromFaceTestCase & INamedTestCase)[] {
  const tests = [
    {
      faceRef: CubeSide.Left,
      direction: SliceDirection.Left,
      rotation: 1,
      expectedCube: rotateCube(cube, "X", 1),
    },
    {
      faceRef: CubeSide.Left,
      direction: SliceDirection.Right,
      rotation: 1,
      expectedCube: rotateCube(cube, "X", -1),
    },
    {
      faceRef: CubeSide.Left,
      direction: SliceDirection.Up,
      rotation: 1,
      expectedCube: rotateCube(cube, "Z", 1),
    },
    {
      faceRef: CubeSide.Left,
      direction: SliceDirection.Down,
      rotation: 1,
      expectedCube: rotateCube(cube, "Z", -1),
    },

    {
      faceRef: CubeSide.Front,
      direction: SliceDirection.Left,
      rotation: 1,
      expectedCube: rotateCube(cube, "X", 1),
    },
    {
      faceRef: CubeSide.Front,
      direction: SliceDirection.Right,
      rotation: 1,
      expectedCube: rotateCube(cube, "X", -1),
    },
    {
      faceRef: CubeSide.Front,
      direction: SliceDirection.Up,
      rotation: 1,
      expectedCube: rotateCube(cube, "Y", 1),
    },
    {
      faceRef: CubeSide.Front,
      direction: SliceDirection.Down,
      rotation: 1,
      expectedCube: rotateCube(cube, "Y", -1),
    },

    {
      faceRef: CubeSide.Right,
      direction: SliceDirection.Left,
      rotation: 1,
      expectedCube: rotateCube(cube, "X", 1),
    },
    {
      faceRef: CubeSide.Right,
      direction: SliceDirection.Right,
      rotation: 1,
      expectedCube: rotateCube(cube, "X", -1),
    },
    {
      faceRef: CubeSide.Right,
      direction: SliceDirection.Up,
      rotation: 1,
      expectedCube: rotateCube(cube, "Z", -1),
    },
    {
      faceRef: CubeSide.Right,
      direction: SliceDirection.Down,
      rotation: 1,
      expectedCube: rotateCube(cube, "Z", 1),
    },

    {
      faceRef: CubeSide.Back,
      direction: SliceDirection.Left,
      rotation: 1,
      expectedCube: rotateCube(cube, "X", 1),
    },
    {
      faceRef: CubeSide.Back,
      direction: SliceDirection.Right,
      rotation: 1,
      expectedCube: rotateCube(cube, "X", -1),
    },
    {
      faceRef: CubeSide.Back,
      direction: SliceDirection.Up,
      rotation: 1,
      expectedCube: rotateCube(cube, "Y", -1),
    },
    {
      faceRef: CubeSide.Back,
      direction: SliceDirection.Down,
      rotation: 1,
      expectedCube: rotateCube(cube, "Y", 1),
    },

    {
      faceRef: CubeSide.Top,
      direction: SliceDirection.Left,
      rotation: 1,
      expectedCube: rotateCube(cube, "Z", -1),
    },
    {
      faceRef: CubeSide.Top,
      direction: SliceDirection.Right,
      rotation: 1,
      expectedCube: rotateCube(cube, "Z", 1),
    },
    {
      faceRef: CubeSide.Top,
      direction: SliceDirection.Up,
      rotation: 1,
      expectedCube: rotateCube(cube, "Y", 1),
    },
    {
      faceRef: CubeSide.Top,
      direction: SliceDirection.Down,
      rotation: 1,
      expectedCube: rotateCube(cube, "Y", -1),
    },

    {
      faceRef: CubeSide.Bottom,
      direction: SliceDirection.Left,
      rotation: 1,
      expectedCube: rotateCube(cube, "Z", 1),
    },
    {
      faceRef: CubeSide.Bottom,
      direction: SliceDirection.Right,
      rotation: 1,
      expectedCube: rotateCube(cube, "Z", -1),
    },
    {
      faceRef: CubeSide.Bottom,
      direction: SliceDirection.Up,
      rotation: 1,
      expectedCube: rotateCube(cube, "Y", 1),
    },
    {
      faceRef: CubeSide.Bottom,
      direction: SliceDirection.Down,
      rotation: 1,
      expectedCube: rotateCube(cube, "Y", -1),
    },
  ];
  return getAllTestCases(
    tests,
    ({ faceRef, rotation, direction }) =>
      `Should rotate the cube ${nameRotationAmount(rotation)} ${nameDirection(direction)} while facing ${nameSide(faceRef)}`,
  );
}
