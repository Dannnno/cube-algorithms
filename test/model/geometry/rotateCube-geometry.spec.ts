import fc from "fast-check";
import { describe, it } from "vitest";
import { DeepReadonly } from "../../../src/common";
import { CubeAxis, CubeData } from "../../../src/model/cube";
import { RotationAmount, rotateCube } from "../../../src/model/geometry";
import {
  INamedTestCase,
  checkCube,
  fcCubeSizes,
  fcRotateWholeCubeCommand,
  getAllTestCases,
  getTestCube,
  nameRotationAmount,
} from "../utility";

interface IRotateCubeTestCase {
  readonly axis: CubeAxis;
  readonly numRotations: RotationAmount;
  readonly expectedCube: DeepReadonly<CubeData>;
}

describe("rotateCube", () => {
  const baseCube = getTestCube(3);
  it.each(getTestCases(baseCube))("$name", testCase => {
    const { axis, numRotations, expectedCube } = testCase;
    const result = rotateCube(baseCube, axis, numRotations);
    checkCube(result, expectedCube);
  });

  it("Should preserve the overall value distribution", () =>
    fc.assert(
      fc.property(
        fcCubeSizes,
        fc.commands([fcRotateWholeCubeCommand]), // enforced here
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

function getTestCases(baseCube: any): (IRotateCubeTestCase & INamedTestCase)[] {
  const testCases = [
    {
      axis: "X",
      numRotations: RotationAmount.None,
      expectedCube: baseCube,
    },
    {
      axis: "X",
      numRotations: RotationAmount.Clockwise,
      expectedCube: [
        [2, 2, 2, 2, 2, 2, 2, 2, 2],
        [3, 3, 3, 3, 3, 3, 3, 3, 3],
        [4, 4, 4, 4, 4, 4, 4, 4, 4],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [5, 5, 5, 5, 5, 5, 5, 5, 5],
        [6, 6, 6, 6, 6, 6, 6, 6, 6],
      ],
    },
    {
      axis: "X",
      numRotations: RotationAmount.Halfway,
      expectedCube: [
        [3, 3, 3, 3, 3, 3, 3, 3, 3],
        [4, 4, 4, 4, 4, 4, 4, 4, 4],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [2, 2, 2, 2, 2, 2, 2, 2, 2],
        [5, 5, 5, 5, 5, 5, 5, 5, 5],
        [6, 6, 6, 6, 6, 6, 6, 6, 6],
      ],
    },
    {
      axis: "X",
      numRotations: RotationAmount.CounterClockwise,
      expectedCube: [
        [4, 4, 4, 4, 4, 4, 4, 4, 4],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [2, 2, 2, 2, 2, 2, 2, 2, 2],
        [3, 3, 3, 3, 3, 3, 3, 3, 3],
        [5, 5, 5, 5, 5, 5, 5, 5, 5],
        [6, 6, 6, 6, 6, 6, 6, 6, 6],
      ],
    },
    {
      axis: "Y",
      numRotations: RotationAmount.None,
      expectedCube: baseCube,
    },
    {
      axis: "Y",
      numRotations: RotationAmount.Clockwise,
      expectedCube: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [6, 6, 6, 6, 6, 6, 6, 6, 6],
        [3, 3, 3, 3, 3, 3, 3, 3, 3],
        [5, 5, 5, 5, 5, 5, 5, 5, 5],
        [2, 2, 2, 2, 2, 2, 2, 2, 2],
        [4, 4, 4, 4, 4, 4, 4, 4, 4],
      ],
    },
    {
      axis: "Y",
      numRotations: RotationAmount.Halfway,
      expectedCube: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [4, 4, 4, 4, 4, 4, 4, 4, 4],
        [3, 3, 3, 3, 3, 3, 3, 3, 3],
        [2, 2, 2, 2, 2, 2, 2, 2, 2],
        [6, 6, 6, 6, 6, 6, 6, 6, 6],
        [5, 5, 5, 5, 5, 5, 5, 5, 5],
      ],
    },
    {
      axis: "Y",
      numRotations: RotationAmount.CounterClockwise,
      expectedCube: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [5, 5, 5, 5, 5, 5, 5, 5, 5],
        [3, 3, 3, 3, 3, 3, 3, 3, 3],
        [6, 6, 6, 6, 6, 6, 6, 6, 6],
        [4, 4, 4, 4, 4, 4, 4, 4, 4],
        [2, 2, 2, 2, 2, 2, 2, 2, 2],
      ],
    },
    {
      axis: "Z",
      numRotations: RotationAmount.None,
      expectedCube: baseCube,
    },
    {
      axis: "Z",
      numRotations: RotationAmount.Clockwise,
      expectedCube: [
        [6, 6, 6, 6, 6, 6, 6, 6, 6],
        [2, 2, 2, 2, 2, 2, 2, 2, 2],
        [5, 5, 5, 5, 5, 5, 5, 5, 5],
        [4, 4, 4, 4, 4, 4, 4, 4, 4],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [3, 3, 3, 3, 3, 3, 3, 3, 3],
      ],
    },
    {
      axis: "Z",
      numRotations: RotationAmount.Halfway,
      expectedCube: [
        [3, 3, 3, 3, 3, 3, 3, 3, 3],
        [2, 2, 2, 2, 2, 2, 2, 2, 2],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [4, 4, 4, 4, 4, 4, 4, 4, 4],
        [6, 6, 6, 6, 6, 6, 6, 6, 6],
        [5, 5, 5, 5, 5, 5, 5, 5, 5],
      ],
    },
    {
      axis: "Z",
      numRotations: RotationAmount.CounterClockwise,
      expectedCube: [
        [5, 5, 5, 5, 5, 5, 5, 5, 5],
        [2, 2, 2, 2, 2, 2, 2, 2, 2],
        [6, 6, 6, 6, 6, 6, 6, 6, 6],
        [4, 4, 4, 4, 4, 4, 4, 4, 4],
        [3, 3, 3, 3, 3, 3, 3, 3, 3],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
      ],
    },
  ] as const;

  return getAllTestCases(
    testCases,
    ({ axis, numRotations }) =>
      `Should rotate the cube ${nameRotationAmount(numRotations)} about the ${axis}-axis`,
  );
}
