import fc from "fast-check";
import { beforeAll, describe, it } from "vitest";
import { DeepReadonly } from "../../../src/common";
import { CubeData, CubeSide, getCubeSize } from "../../../src/model/cube";
import { refocusCube } from "../../../src/model/geometry";
import {
  INamedTestCase,
  checkCube,
  fcCubeSizes,
  fcFocusCubeFaceCommand,
  getAllTestCases,
  getTestCube,
  nameSide,
} from "../utility";

interface IRefocusCubeTestCase {
  readonly cube: DeepReadonly<CubeData>;
  readonly focusSide: CubeSide;
  readonly expectedCube: DeepReadonly<CubeData>;
}

describe("refocusCube", () => {
  it.each(getTestCases())("$name", testCase => {
    const { cube, expectedCube, focusSide } = testCase;
    const result = refocusCube(cube, focusSide);
    checkCube(result, expectedCube);
  });

  it("Should preserve which values are grouped on a side", () =>
    fc.assert(
      fc.property(
        fcCubeSizes,
        fc.commands([fcFocusCubeFaceCommand]), // enforced here
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

function getTestCases(): (IRefocusCubeTestCase & INamedTestCase)[] {
  const testCube = getTestCube(3, true);

  // Just make sure that our test cube is set up the way we expect it to be
  beforeAll(() =>
    checkCube(testCube, [
      [5, 1, 3, 2, 1, 4, 6, 3, 6],
      [5, 2, 4, 6, 6, 3, 4, 2, 6],
      [5, 1, 1, 5, 3, 4, 2, 3, 6],
      [5, 2, 2, 5, 5, 5, 3, 4, 2],
      [1, 1, 4, 6, 2, 5, 2, 6, 3],
      [1, 3, 3, 6, 4, 4, 1, 1, 4],
    ]),
  );

  const tests: Omit<IRefocusCubeTestCase, "name">[] = [
    {
      cube: testCube,
      focusSide: CubeSide.Left,
      expectedCube: [
        [5, 2, 2, 5, 5, 5, 3, 4, 2],
        [5, 1, 3, 2, 1, 4, 6, 3, 6],
        [5, 2, 4, 6, 6, 3, 4, 2, 6],
        [5, 1, 1, 5, 3, 4, 2, 3, 6],
        [4, 5, 3, 1, 2, 6, 1, 6, 2],
        [1, 6, 1, 1, 4, 3, 4, 4, 3],
      ],
    },
    {
      cube: testCube,
      focusSide: CubeSide.Front,
      expectedCube: [
        [5, 1, 3, 2, 1, 4, 6, 3, 6],
        [5, 2, 4, 6, 6, 3, 4, 2, 6],
        [5, 1, 1, 5, 3, 4, 2, 3, 6],
        [5, 2, 2, 5, 5, 5, 3, 4, 2],
        [1, 1, 4, 6, 2, 5, 2, 6, 3],
        [1, 3, 3, 6, 4, 4, 1, 1, 4],
      ],
    },
    {
      cube: testCube,
      focusSide: CubeSide.Right,
      expectedCube: [
        [5, 2, 4, 6, 6, 3, 4, 2, 6],
        [5, 1, 1, 5, 3, 4, 2, 3, 6],
        [5, 2, 2, 5, 5, 5, 3, 4, 2],
        [5, 1, 3, 2, 1, 4, 6, 3, 6],
        [2, 6, 1, 6, 2, 1, 3, 5, 4],
        [3, 4, 4, 3, 4, 1, 1, 6, 1],
      ],
    },
    {
      cube: testCube,
      focusSide: CubeSide.Back,
      expectedCube: [
        [5, 1, 1, 5, 3, 4, 2, 3, 6],
        [5, 2, 2, 5, 5, 5, 3, 4, 2],
        [5, 1, 3, 2, 1, 4, 6, 3, 6],
        [5, 2, 4, 6, 6, 3, 4, 2, 6],
        [3, 6, 2, 5, 2, 6, 4, 1, 1],
        [4, 1, 1, 4, 4, 6, 3, 3, 1],
      ],
    },
    {
      cube: testCube,
      focusSide: CubeSide.Top,
      expectedCube: [
        [6, 2, 5, 3, 1, 1, 6, 4, 3],
        [1, 1, 4, 6, 2, 5, 2, 6, 3],
        [1, 4, 6, 1, 3, 3, 5, 5, 2],
        [4, 1, 1, 4, 4, 6, 3, 3, 1],
        [2, 4, 3, 5, 5, 5, 2, 2, 5],
        [5, 2, 4, 6, 6, 3, 4, 2, 6],
      ],
    },
    {
      cube: testCube,
      focusSide: CubeSide.Bottom,
      expectedCube: [
        [3, 4, 6, 1, 1, 3, 5, 2, 6],
        [1, 3, 3, 6, 4, 4, 1, 1, 4],
        [2, 5, 5, 3, 3, 1, 6, 4, 1],
        [3, 6, 2, 5, 2, 6, 4, 1, 1],
        [5, 2, 4, 6, 6, 3, 4, 2, 6],
        [2, 4, 3, 5, 5, 5, 2, 2, 5],
      ],
    },
  ];

  return getAllTestCases(tests, ({ cube, focusSide }) => {
    const size = getCubeSize(cube);
    const sideName = nameSide(focusSide);
    return `Should focus the ${sideName} side of a ${size}x${size} cube`;
  });
}
