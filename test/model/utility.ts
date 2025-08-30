import { expect } from "vitest";
import { DeepReadonly } from "../../src/common/generics";
import {
  CubeAxis,
  CubeData,
  CubeSide,
  CubeSideData,
  getCubeSize,
} from "../../src/model/cube";
import {
  rotateCubeFace,
  rotateCubeInternalSlice,
} from "../../src/model/geometry";

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

export function getTestCube(
  size: number,
  mutate: boolean = false,
): DeepReadonly<CubeData> {
  const length = size * size;
  const cube = [
    Array.from({ length }, _ => 1),
    Array.from({ length }, _ => 2),
    Array.from({ length }, _ => 3),
    Array.from({ length }, _ => 4),
    Array.from({ length }, _ => 5),
    Array.from({ length }, _ => 6),
  ];

  if (!mutate) {
    return cube;
  }

  const rcf = (cubeData: DeepReadonly<CubeData>, sideId: CubeSide) =>
    rotateCubeFace(cubeData, sideId, 1);
  const rcs = (cube: DeepReadonly<CubeData>, axis: CubeAxis) =>
    rotateCubeInternalSlice(cube, axis, 1, size - 2, 1);

  return rcf(
    rcf(rcf(rcf(rcf(rcf(rcs(rcs(rcs(cube, "X"), "Y"), "Z"), 1), 2), 3), 4), 5),
    6,
  );
}
