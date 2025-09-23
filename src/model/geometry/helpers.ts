import { assert, DeepReadonly, forceNever } from "@/common";
import {
  assertIsValidCube,
  assertIsValidCubeCell,
  CubeAxis,
  CubeCellValue,
  CubeData,
  CubeSide,
  CubeSideData,
  getCubeSize,
  SliceDirection,
} from "../cube";
import { RotationAmount } from "./constants";

/**
 * Determine whether the axis is considered in-plane with the face
 * @param face The face
 * @param axis The axis
 * @returns Whether the axis can be found on the face
 */
export function axisIsValidForFace(face: CubeSide, axis: CubeAxis): boolean {
  switch (face) {
    case CubeSide.Front:
    case CubeSide.Back:
      switch (axis) {
        case CubeAxis.Middle:
        case CubeAxis.Equatorial:
          return true;
        case CubeAxis.Standing:
          return false;
        default:
          forceNever(axis);
      }
    case CubeSide.Left:
    case CubeSide.Right:
      switch (axis) {
        case CubeAxis.Standing:
        case CubeAxis.Equatorial:
          return true;
        case CubeAxis.Middle:
          return false;
        default:
          forceNever(axis);
      }
    case CubeSide.Top:
    case CubeSide.Bottom:
      switch (axis) {
        case CubeAxis.Equatorial:
          return false;
        case CubeAxis.Standing:
        case CubeAxis.Middle:
          return true;
        default:
          forceNever(axis);
      }
    default:
      forceNever(face);
  }
}

/**
 * Confirm that the direction is valid for a given face and axis
 * @param face The face to be checked
 * @param axis The axis to be checked
 * @param direction The direction to be checked
 * @returns Whether it is valid to use the given cardinal direction to refer to
 *          the face+axis combination
 */
export function directionIsValidForFaceAndAxis(
  face: CubeSide,
  axis: CubeAxis,
  direction: SliceDirection,
): boolean {
  return _axisOrientation(face, axis) === _directionOrientation(direction);
}

function _directionOrientation(
  direction: SliceDirection,
): "vertical" | "horizontal" {
  switch (direction) {
    case SliceDirection.Up:
    case SliceDirection.Down:
      return "vertical";
    case SliceDirection.Left:
    case SliceDirection.Right:
      return "horizontal";
    default:
      forceNever(direction);
  }
}

function _axisOrientation(
  face: CubeSide,
  axis: CubeAxis,
): "vertical" | "horizontal" {
  assert(axisIsValidForFace(face, axis));
  switch (face) {
    case CubeSide.Front:
    case CubeSide.Back:
      switch (axis) {
        case CubeAxis.Middle:
          return "vertical";
        case CubeAxis.Equatorial:
          return "horizontal";
        case CubeAxis.Standing:
        default:
          assert(false);
      }
    case CubeSide.Left:
    case CubeSide.Right:
      switch (axis) {
        case CubeAxis.Standing:
          return "vertical";
        case CubeAxis.Equatorial:
          return "horizontal";
        case CubeAxis.Middle:
        default:
          assert(false);
      }
    case CubeSide.Top:
    case CubeSide.Bottom:
      switch (axis) {
        case CubeAxis.Middle:
          return "vertical";
        case CubeAxis.Standing:
          return "horizontal";
        case CubeAxis.Equatorial:
        default:
          assert(false);
      }
    default:
      forceNever(face);
  }
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
  col: number,
): CubeCellValue {
  assertIsValidCube(cubeData);
  assertIsValidCubeCell(side);
  return at_(cubeData, side, row, col);
}

/**
 * Get a value from the cube without checking for cube validity.
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
  col: number,
): CubeCellValue {
  return _at(cubeData[side - 1], getCubeSize(cubeData), row, col);
}

/**
 * Get a value from a cube side without checking for cube validity.
 * @param data The cube side
 * @param size The size of the cube
 * @param row The row the cell is in
 * @param col The column the cell is in
 * @returns The value at that cell
 */
export function _at(
  data: DeepReadonly<CubeSideData>,
  size: number,
  row: number,
  col: number,
): CubeCellValue {
  return data[_ix(size, row, col)];
}

/**
 * Get the 1D index of a cell given its 2D coordinates
 * @param size The size of the cube
 * @param row The row the cell is in
 * @param col The column the cell is in
 * @returns The 1D index of the cell
 */
export function _ix(size: number, row: number, col: number): number {
  return row * size + col;
}

/**
 * Do basic setup before manipulating a cube
 * @param cube The cube that will be manipulated
 * @param numRotations How many times to rotate the cube
 * @returns A mutable copy of the cube, the cube edge length, and a normalized rotation
 */
export function _setupManipulation(
  cube: DeepReadonly<CubeData>,
  numRotations: number,
): [CubeData, number, RotationAmount];
/**
 * Do basic setup before manipulating a cube
 * @param cube The cube that will be manipulated
 * @param size How big the size is
 * @param numRotations How many times to rotate the cube
 * @returns A mutable copy of the cube, the cube edge length, and a normalized rotation
 */
export function _setupManipulation(
  cube: DeepReadonly<CubeData>,
  size: number,
  numRotations: number,
): [CubeData, number, RotationAmount];
export function _setupManipulation(
  cube: DeepReadonly<CubeData>,
  sizeOrRotations: number,
  numRotations?: number,
): [CubeData, number, RotationAmount] {
  const size = numRotations === undefined ? getCubeSize(cube) : sizeOrRotations;
  assert(size === getCubeSize(cube));
  const numTurns = numRotations ?? sizeOrRotations;
  return [_copyCube(cube), size, _normalizeRotations(numTurns)];
}

/**
 * Deep copy a cube
 * @param cube The cube to be copied
 * @returns A deep copy of the cube
 */
export function _copyCube(cube: DeepReadonly<CubeData>): CubeData {
  return Array.from(cube, side => Array.from(side)) as CubeData;
}

/**
 * Normalize the rotation count
 * @param rotCount The number of rotations
 * @returns The normalized number of rotations
 */
export function _normalizeRotations(rotCount: number): RotationAmount {
  rotCount %= 4;
  return rotCount < 0 ? rotCount + 4 : rotCount;
}

/**
 * Reverse the direction of a rotation
 * @param rotation The rotation to invert
 * @returns The rotation in the opposite direction
 */
export function _reverseRotation(rotation: RotationAmount): RotationAmount {
  return _normalizeRotations(-rotation);
}

/**
 * Get the faces that are perpendicular to this axis
 * @param axis The axis to get the perpendicular faces of
 * @returns The [front, back] faces that are perpendicular to the axis
 */
export function getPerpendicularFaces(axis: CubeAxis): [CubeSide, CubeSide] {
  switch (axis) {
    case CubeAxis.Equatorial:
      return [CubeSide.Top, CubeSide.Bottom];
    case CubeAxis.Middle:
      return [CubeSide.Right, CubeSide.Left];
    case CubeAxis.Standing:
      return [CubeSide.Front, CubeSide.Back];
    default:
      forceNever(axis);
  }
}

/**
 * Get the face opposite to a specified one
 * @param face The current face
 * @returns The opposite face
 */
export function getOppositeFace(face: CubeSide): CubeSide {
  switch (face) {
    case CubeSide.Front:
      return CubeSide.Back;
    case CubeSide.Back:
      return CubeSide.Front;
    case CubeSide.Left:
      return CubeSide.Right;
    case CubeSide.Right:
      return CubeSide.Left;
    case CubeSide.Top:
      return CubeSide.Bottom;
    case CubeSide.Bottom:
      return CubeSide.Top;
    default:
      forceNever(face);
  }
}
