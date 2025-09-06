import fc from "fast-check";
import { describe, it } from "vitest";
import { DeepReadonly } from "../../../src/common";
import { CubeData, CubeSide, getCubeSize } from "../../../src/model/cube";
import { RotationAmount, rotateCubeFace } from "../../../src/model/geometry";
import {
  checkCube,
  fcCubeSizes,
  fcRotateFaceCommand,
  getAllTestCases,
  getTestCube,
  nameRotationAmount,
  nameSide,
} from "../utility";

interface IRotateCubeFaceTestCase {
  readonly cube: DeepReadonly<CubeData>;
  readonly side: CubeSide;
  readonly rotation: RotationAmount;
  readonly expectedCube: DeepReadonly<CubeData>;
}

describe("rotateCubeFace", () => {
  const tests = getTestCases();
  it.each(tests)("$name", testCase => {
    const { cube, side, rotation, expectedCube } = testCase;
    const result = rotateCubeFace(cube, side, rotation);
    checkCube(result, expectedCube);
  });

  it("Shouldn't touch the opposite face", () =>
    fc.assert(
      fc.property(
        fcCubeSizes,
        fc.commands([fcRotateFaceCommand]), // enforced here
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

function getTestCases(): IRotateCubeFaceTestCase[] {
  const baseCube = getTestCube(3);
  const baseSide1Rotated = rotateCubeFace(
    baseCube,
    CubeSide.Left,
    RotationAmount.Clockwise,
  );
  const baseSide2Rotated = rotateCubeFace(
    baseCube,
    CubeSide.Front,
    RotationAmount.Clockwise,
  );
  const baseSide5Rotated = rotateCubeFace(
    baseCube,
    CubeSide.Top,
    RotationAmount.Clockwise,
  );
  const tests: IRotateCubeFaceTestCase[] = [
    {
      side: CubeSide.Left,
      rotation: RotationAmount.Clockwise,
      cube: baseCube,
      expectedCube: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [5, 2, 2, 5, 2, 2, 5, 2, 2],
        [3, 3, 3, 3, 3, 3, 3, 3, 3],
        [4, 4, 6, 4, 4, 6, 4, 4, 6],
        [4, 5, 5, 4, 5, 5, 4, 5, 5],
        [2, 6, 6, 2, 6, 6, 2, 6, 6],
      ],
    },
    {
      side: CubeSide.Left,
      rotation: RotationAmount.CounterClockwise,
      cube: baseCube,
      expectedCube: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [6, 2, 2, 6, 2, 2, 6, 2, 2],
        [3, 3, 3, 3, 3, 3, 3, 3, 3],
        [4, 4, 5, 4, 4, 5, 4, 4, 5],
        [2, 5, 5, 2, 5, 5, 2, 5, 5],
        [4, 6, 6, 4, 6, 6, 4, 6, 6],
      ],
    },
    {
      // Force a test with too many rotations
      side: CubeSide.Left,
      rotation: 7 as RotationAmount,
      cube: baseCube,
      expectedCube: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [6, 2, 2, 6, 2, 2, 6, 2, 2],
        [3, 3, 3, 3, 3, 3, 3, 3, 3],
        [4, 4, 5, 4, 4, 5, 4, 4, 5],
        [2, 5, 5, 2, 5, 5, 2, 5, 5],
        [4, 6, 6, 4, 6, 6, 4, 6, 6],
      ],
    },
    {
      side: CubeSide.Front,
      rotation: RotationAmount.Clockwise,
      cube: baseCube,
      expectedCube: [
        [1, 1, 6, 1, 1, 6, 1, 1, 6],
        [2, 2, 2, 2, 2, 2, 2, 2, 2],
        [5, 3, 3, 5, 3, 3, 5, 3, 3],
        [4, 4, 4, 4, 4, 4, 4, 4, 4],
        [5, 5, 5, 5, 5, 5, 1, 1, 1],
        [3, 3, 3, 6, 6, 6, 6, 6, 6],
      ],
    },
    {
      side: CubeSide.Right,
      rotation: RotationAmount.Clockwise,
      cube: baseCube,
      expectedCube: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [2, 2, 6, 2, 2, 6, 2, 2, 6],
        [3, 3, 3, 3, 3, 3, 3, 3, 3],
        [5, 4, 4, 5, 4, 4, 5, 4, 4],
        [5, 5, 2, 5, 5, 2, 5, 5, 2],
        [6, 6, 4, 6, 6, 4, 6, 6, 4],
      ],
    },
    {
      side: CubeSide.Back,
      rotation: RotationAmount.Clockwise,
      cube: baseCube,
      expectedCube: [
        [5, 1, 1, 5, 1, 1, 5, 1, 1],
        [2, 2, 2, 2, 2, 2, 2, 2, 2],
        [3, 3, 6, 3, 3, 6, 3, 3, 6],
        [4, 4, 4, 4, 4, 4, 4, 4, 4],
        [3, 3, 3, 5, 5, 5, 5, 5, 5],
        [6, 6, 6, 6, 6, 6, 1, 1, 1],
      ],
    },
    {
      side: CubeSide.Top,
      rotation: RotationAmount.Clockwise,
      cube: baseCube,
      expectedCube: [
        [2, 2, 2, 1, 1, 1, 1, 1, 1],
        [3, 3, 3, 2, 2, 2, 2, 2, 2],
        [4, 4, 4, 3, 3, 3, 3, 3, 3],
        [1, 1, 1, 4, 4, 4, 4, 4, 4],
        [5, 5, 5, 5, 5, 5, 5, 5, 5],
        [6, 6, 6, 6, 6, 6, 6, 6, 6],
      ],
    },
    {
      side: CubeSide.Bottom,
      rotation: RotationAmount.Clockwise,
      cube: baseCube,
      expectedCube: [
        [1, 1, 1, 1, 1, 1, 4, 4, 4],
        [2, 2, 2, 2, 2, 2, 1, 1, 1],
        [3, 3, 3, 3, 3, 3, 2, 2, 2],
        [4, 4, 4, 4, 4, 4, 3, 3, 3],
        [5, 5, 5, 5, 5, 5, 5, 5, 5],
        [6, 6, 6, 6, 6, 6, 6, 6, 6],
      ],
    },
    {
      side: CubeSide.Front,
      rotation: RotationAmount.Clockwise,
      cube: baseSide1Rotated,
      expectedCube: [
        [1, 1, 2, 1, 1, 6, 1, 1, 6],
        [5, 5, 5, 2, 2, 2, 2, 2, 2],
        [4, 3, 3, 5, 3, 3, 5, 3, 3],
        [4, 4, 6, 4, 4, 6, 4, 4, 6],
        [4, 5, 5, 4, 5, 5, 1, 1, 1],
        [3, 3, 3, 2, 6, 6, 2, 6, 6],
      ],
    },
    {
      side: CubeSide.Front,
      rotation: RotationAmount.CounterClockwise,
      cube: baseSide1Rotated,
      expectedCube: [
        [1, 1, 5, 1, 1, 5, 1, 1, 4],
        [2, 2, 2, 2, 2, 2, 5, 5, 5],
        [6, 3, 3, 6, 3, 3, 2, 3, 3],
        [4, 4, 6, 4, 4, 6, 4, 4, 6],
        [4, 5, 5, 4, 5, 5, 3, 3, 3],
        [1, 1, 1, 2, 6, 6, 2, 6, 6],
      ],
    },
    {
      side: CubeSide.Left,
      rotation: RotationAmount.Clockwise,
      cube: baseSide2Rotated,
      expectedCube: [
        [1, 1, 1, 1, 1, 1, 6, 6, 6],
        [5, 2, 2, 5, 2, 2, 1, 2, 2],
        [5, 3, 3, 5, 3, 3, 5, 3, 3],
        [4, 4, 6, 4, 4, 6, 4, 4, 3],
        [4, 5, 5, 4, 5, 5, 4, 1, 1],
        [2, 3, 3, 2, 6, 6, 2, 6, 6],
      ],
    },
    {
      side: CubeSide.Left,
      rotation: RotationAmount.CounterClockwise,
      cube: baseSide2Rotated,
      expectedCube: [
        [6, 6, 6, 1, 1, 1, 1, 1, 1],
        [3, 2, 2, 6, 2, 2, 6, 2, 2],
        [5, 3, 3, 5, 3, 3, 5, 3, 3],
        [4, 4, 1, 4, 4, 5, 4, 4, 5],
        [2, 5, 5, 2, 5, 5, 2, 1, 1],
        [4, 3, 3, 4, 6, 6, 4, 6, 6],
      ],
    },
    {
      side: CubeSide.Left,
      rotation: RotationAmount.Clockwise,
      cube: baseSide5Rotated,
      expectedCube: [
        [1, 1, 2, 1, 1, 2, 1, 1, 2],
        [5, 3, 3, 5, 2, 2, 5, 2, 2],
        [4, 4, 4, 3, 3, 3, 3, 3, 3],
        [1, 1, 6, 4, 4, 6, 4, 4, 6],
        [4, 5, 5, 4, 5, 5, 1, 5, 5],
        [3, 6, 6, 2, 6, 6, 2, 6, 6],
      ],
    },
    {
      side: CubeSide.Left,
      rotation: RotationAmount.CounterClockwise,
      cube: baseSide5Rotated,
      expectedCube: [
        [2, 1, 1, 2, 1, 1, 2, 1, 1],
        [6, 3, 3, 6, 2, 2, 6, 2, 2],
        [4, 4, 4, 3, 3, 3, 3, 3, 3],
        [1, 1, 5, 4, 4, 5, 4, 4, 5],
        [3, 5, 5, 2, 5, 5, 2, 5, 5],
        [4, 6, 6, 4, 6, 6, 1, 6, 6],
      ],
    },
  ];

  return getAllTestCases(tests, ({ cube, side, rotation }) => {
    const size = getCubeSize(cube);
    const sideName = nameSide(side);
    const rotName = nameRotationAmount(rotation);
    const mutated = Object.is(cube, baseCube) ? "" : "mutated ";
    return `Should rotate the ${sideName} side by ${rotName} of a ${mutated}${size}x${size} cube`;
  });
}
