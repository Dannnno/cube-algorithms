import { 
    DeepReadonly, Tuple, forEach, LoopStatus, assert, isBoundedInteger, 
    isPositiveInteger 
} from '@/common';
import { getCubeSize } from './geometry';

/**
 * A side of a cube
 */
export enum CubeSide {
    Front = 2,
    Back = 4,
    Left = 1,
    Right = 3,
    Top = 5,
    Bottom = 6
}
/**
 * An internal axis of the cube
 */
export type CubeAxis = "X" | "Y" | "Z";
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
    (
        sideIx: CubeSide, 
        data: DeepReadonly<CubeSideData>
    ): LoopStatus | void;
}
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
    (
        row: number,
        col: number,
        value: CubeCellValue
    ): LoopStatus | void;
}

/**
 * Assert that a value is a valid cube cell
 * @param val The value to check as a valid cube cell
 */
export function assertIsValidCubeCell(
    val: unknown
): asserts val is CubeCellValue {
    assert(isBoundedInteger(val, 1, 6));
}
/**
 * Assert that a cube is well-formed
 * @param cubeData The cube to check
 */
export function assertIsValidCube(
    cubeData: DeepReadonly<CubeData>
): void;
/**
 * Assert that a cube is well-formed
 * @param cubeData The cube to check
 * @param size How large each cube's size is
 */
export function assertIsValidCube(
    cubeData: DeepReadonly<CubeData>, size: number
): void;
/**
 * Assert that a cube is well-formed
 * @param cubeData The cube to check
 * @param size How large each cube's size is
 */
export function assertIsValidCube(
    cubeData: DeepReadonly<CubeData>, size?: number
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
    cubeData: DeepReadonly<CubeData>, callback: PerSideCallback
): LoopStatus {
    assertIsValidCube(cubeData);

    return forEach(cubeData, (side, ix) => {
        assert(isBoundedInteger(ix, 0, 5));
        return callback(ix + 1 as CubeSide, side)
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
    callback: PerCellCallback
): LoopStatus {
    return forEach(side, (cell, ix) => 
        callback(Math.floor(ix / size), ix % size, cell)
    );
}
