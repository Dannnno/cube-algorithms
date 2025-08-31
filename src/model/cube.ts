import {
  DeepReadonly,
  LoopStatus,
  Maybe,
  Tuple,
  assert,
  forEach,
  isBoundedInteger,
  isPositiveInteger,
} from "@/common";

/**
 * A side of a cube
 */
export const enum CubeSide {
  Front = 2,
  Back = 4,
  Left = 1,
  Right = 3,
  Top = 5,
  Bottom = 6,
}
/**
 * An internal axis of the cube
 */
export type CubeAxis = "X" | "Y" | "Z";
/**
 * The direction to rotate a face
 */
export enum FaceRotationDirection {
  /** Rotate the face clockwise */
  Clockwise,
  /** Rotate the face counter-clockwise */
  CounterClockwise,
}
/**
 * The direction to rotate an internal layer (slice)
 */
export enum SliceDirection {
  /** Rotate the face upwards, i.e. towards row 0 */
  Up,
  /** Rotate the face downwards, i.e. towards row N */
  Down,
  /** Rotate the face to the left, i.e. towards col 0 */
  Left,
  /** Rotate the face to the right, i.e. towards col N */
  Right,
}
/**
 * The value at a given spot in the cube
 */
export type CubeCellValue = 1 | 2 | 3 | 4 | 5 | 6;
/**
 * Data representing a side of a cube
 */
export type CubeSideData = CubeCellValue[];
/**
 * A full cube (i.e. 6-sided shape)
 */
export type CubeData = Tuple<CubeSideData, 6>;
/**
 * An action to take on each side of a cube
 */
export type PerSideCallback = {
  /**
   * The action to take on a cube
   * @param sideIx The side being reviewed
   * @param data The data on the side
   * @returns Whether the loop should abort early (default: no)
   */
  (sideIx: CubeSide, data: DeepReadonly<CubeSideData>): LoopStatus | void;
};
/**
 * An action to take on each cell on a side of a cube
 */
export type PerCellCallback = {
  /**
   * The action to take on a cell
   * @param row The row the cell is on
   * @param col The column the cell is on
   * @param value The value at this cell
   * @returns Whether the loop should abort early (default: no)
   */
  (row: number, col: number, value: CubeCellValue): LoopStatus | void;
};

/**
 * The type of cube-block this is
 */
export enum CubeBlockType {
  /** This is a center cube (i.e. it only has one valued side) */
  Center = 1,
  /** This is an edge cube (i.e. it has two valued sides) */
  Edge = 2,
  /** This is a corner cube (i.e. it has three valued sides) */
  Corner = 3,
}

/**
 * An action to take on each block in a cube
 */
export type PerBlockCallback = {
  /**
   * The action to take on the block
   * @param cubeSides The sides of the cube, in the normal order (left/front/right/back/top/bottom)
   * @param coordinates The [X, Y, Z] coordinates of this cube. The top-left cube of the front-side
   *                    is considered [0, 0, 0]
   * @param type What type of cube block this is
   * @returns Whether the loop should abort early (default: no)
   */
  (
    cubeSides: DeepReadonly<Tuple<Maybe<CubeCellValue>, 6>>,
    coordinates: DeepReadonly<Tuple<number, 3>>,
    type: CubeBlockType,
  ): LoopStatus | void;
};

/**
 * Assert that a value is a valid cube cell
 * @param val The value to check as a valid cube cell
 */
export function assertIsValidCubeCell(
  val: unknown,
): asserts val is CubeCellValue {
  assert(isBoundedInteger(val, 1, 6));
}
/**
 * Assert that a cube is well-formed
 * @param cubeData The cube to check
 */
export function assertIsValidCube(cubeData: DeepReadonly<CubeData>): void;
/**
 * Assert that a cube is well-formed
 * @param cubeData The cube to check
 * @param size How large each cube's size is
 */
export function assertIsValidCube(
  cubeData: DeepReadonly<CubeData>,
  size: number,
): void;
/**
 * Assert that a cube is well-formed
 * @param cubeData The cube to check
 * @param size How large each cube's size is
 */
export function assertIsValidCube(
  cubeData: DeepReadonly<CubeData>,
  size?: number,
): void {
  const realSize = size ?? getCubeSize(cubeData);
  assert(isPositiveInteger(realSize) && realSize > 1);
  const cellsPerSide = realSize * realSize;
  assert(cubeData.length === 6);
  const counts = [cellsPerSide, 0, 0, 0, 0, 0, 0];
  for (const row of cubeData) {
    assert(row.length === cellsPerSide);
    for (const cellValue of row) {
      counts[cellValue] += 1;
      assertIsValidCubeCell(cellValue);
    }
  }
  assert(counts.every(v => v === cellsPerSide));
  assert(counts.length === 7);
}

/**
 * Take an action on each side of a cube
 * @param cube The cube
 * @param callback The action to take
 * @returns Whether the action was interrupted
 */
export function forEachSide(
  cubeData: DeepReadonly<CubeData>,
  callback: PerSideCallback,
): LoopStatus {
  assertIsValidCube(cubeData);

  return forEach(cubeData, (side, ix) => {
    assert(isBoundedInteger(ix, 0, 5));
    return callback((ix + 1) as CubeSide, side);
  });
}

/**
 * Take an action on each cell on a side
 * @param side The data on the side we're taking action on
 * @param size How big the side is
 * @param callback What to do
 * @returns Whether the action was interrupted
 */
export function forEachCellOnSide(
  side: DeepReadonly<CubeSideData>,
  size: number,
  callback: PerCellCallback,
): LoopStatus {
  return forEach(side, (cell, ix) =>
    callback(Math.floor(ix / size), ix % size, cell),
  );
}

/**
 * Take an action on each block in the cube
 * @param cube The cube to iterate over
 * @param callback The action to take on each block
 * @returns Whether the iteration ended early
 */
export function forEachBlockInCube(
  cube: DeepReadonly<CubeData>,
  callback: PerBlockCallback,
): LoopStatus {
  const size = getCubeSize(cube);
  assertIsValidCube(cube, size);

  for (let depth = 0; depth < size; ++depth) {
    for (let row = 0; row < size; ++row) {
      for (let col = 0; col < size; ++col) {
        const sides = extractBlockAtIndex(cube, size, depth, row, col);
        const count = sides.filter(v => !!v).length;
        if (
          callback(sides, [depth, row, col], count as CubeBlockType)
          === LoopStatus.StopLooping
        ) {
          return LoopStatus.StopLooping;
        }
      }
    }
  }
  return LoopStatus.KeepLooping;
}

function extractBlockAtIndex(
  cube: DeepReadonly<CubeData>,
  size: number,
  depth: number,
  row: number,
  col: number,
): Tuple<Maybe<CubeCellValue>, 6> {
  const s1 = size - 1;

  const left = col === 0 ? cube[0][row * size + s1 - depth] : undefined;
  const front = depth === 0 ? cube[1][row * size + col] : undefined;
  const right = col === s1 ? cube[2][row * size + depth] : undefined;
  const back = depth === s1 ? cube[3][row * size + s1 - col] : undefined;
  const top = row === 0 ? cube[4][size * (s1 - depth) + col] : undefined;
  const bottom = row === s1 ? cube[5][size * depth + col] : undefined;

  return [left, front, right, back, top, bottom];
}

/**
 * Get the cube size
 * @param cube The cube whose side needs to be checked
 * @returns The cube's size (as the length of one edge)
 */
export function getCubeSize(cube: DeepReadonly<CubeData>): number {
  return Math.sqrt(cube[0].length);
}
