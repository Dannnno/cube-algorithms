import { expect } from "vitest";
import { DeepReadonly } from "../../src/common/generics";
import {
  CubeData,
  CubeSide,
  CubeSideData,
  getCubeSize,
} from "../../src/model/cube";

export function checkCube(
  actualCube: DeepReadonly<CubeData>,
  expectedCube: DeepReadonly<CubeData>,
): void {
  const actualSize = getCubeSize(actualCube);
  expect(actualSize, "Cube Size").toBe(getCubeSize(expectedCube));

  for (let sideId = 1; sideId <= 6; ++sideId) {
    checkCubeSide(
      actualSize,
      sideId as CubeSide,
      actualCube[sideId - 1],
      expectedCube[sideId - 1],
    );
  }
  expect(actualCube, `Full Cube`).toStrictEqual(expectedCube);
}

function checkCubeSide(
  size: number,
  side: CubeSide,
  actualSide: DeepReadonly<CubeSideData>,
  expectedSide: DeepReadonly<CubeSideData>,
): void {
  expect(actualSide.length, `${side}: Length should be correct`).toBe(
    expectedSide.length,
  );

  for (let row = 0; row < size; ++row) {
    for (let col = 0; col < size; ++col) {
      expect(actualSide[row * size + col], `(${side}, ${row}, ${col})`).toBe(
        expectedSide[row * size + col],
      );
    }
  }

  expect(actualSide, `Full Side ${side}`).toStrictEqual(expectedSide);
}
