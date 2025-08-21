import { DeepReadonly } from "@/common";
import { 
    CubeSide, CubeCellValue, CubeSideData, CubeData, 
    assertIsValidCube, assertIsValidCubeCell,
} from "./cube";

/**
 * Get the cube size
 * @param cube The cube whose side needs to be checked
 * @returns The cube's size (as the length of one edge)
 */
export function getCubeSize(cube: DeepReadonly<CubeData>): number {
    return Math.sqrt(cube[0].length);
}

/**
 * Get a value from the cube
 * @param cubeData The cube
 * @param side The side the cell is on
 * @param row The row the cell is in
 * @param col The column the cell is in
 * @returns The value at that cell
 */
export function at(
    cubeData: DeepReadonly<CubeData>,
    side: CubeSide, 
    row: number, 
    col: number
): CubeCellValue {
    assertIsValidCube(cubeData);
    assertIsValidCubeCell(side);
    return at_(cubeData, side, row, col);
}

/**
 * Get a value from the cube without checking for index validity.
 * @param cubeData The cube
 * @param side The side the cell is on
 * @param row The row the cell is in
 * @param col The column the cell is in
 * @returns The value at that cell
 */
export function at_(
    cubeData: DeepReadonly<CubeData>,
    side: CubeSide,
    row: number, 
    col: number
): CubeCellValue {
    return _at(cubeData[side-1], getCubeSize(cubeData), row, col);
}

function _at(
    data: DeepReadonly<CubeSideData>, 
    size: number,
    row: number,
    col: number
): CubeCellValue {
    return data[_ix(size, row, col)];
}

function _ix(size: number, row: number, col: number): number {
    return row * size + col;
}
