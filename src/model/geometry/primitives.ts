/**
 * Contains the primitive cube manipulation APIs. Each is intended to be
 * interacted with in composition with other APIs, as they generally only do
 * what is on the label.
 *
 * Rather than optimizing for a number of rotations, all of these APIs just do
 * their logic multiple times. This is fine at current cube scales (max of 9x9x9)
 * and assuming that all callers are appropriately simplifying their number
 * of rotations, i.e. calling `rotate(1)` rather than `rotate(101)`
 */

import { assert, forceNever, isBoundedInteger } from "@/common";
import { CubeAxis, CubeData, CubeSide } from "../cube";
import { RotationAmount } from "./constants";
import { _at, _ix, _reverseRotation } from "./helpers";

/**
 * Rotate one face-matrix on the cube. Does not modify the adjacent faces
 * @param cube The cube that has a face being rotated. Will be mutated
 * @param size The size of the cube
 * @param face The face being rotated
 * @param rotation The number of times to rotate the face
 * @returns The cube with the face rotated
 */
export function _rotateFaceMatrix(
  cube: CubeData,
  size: number,
  face: CubeSide,
  rotation: RotationAmount,
): CubeData {
  if (rotation === RotationAmount.None) {
    return cube;
  }

  const side = cube[face - 1];
  const _v = (r: number, c: number) => _at(side, size, r, c);
  const _i = (r: number, c: number) => _ix(size, r, c);

  // https://stackoverflow.com/a/8664879/3076272
  const layers = Math.floor(size / 2);
  for (let i = 0; i < rotation; ++i) {
    for (let layer = 0; layer < layers; ++layer) {
      const first = layer;
      const last = size - first - 1;

      for (let ix = first; ix < last; ++ix) {
        const offset = ix - first;
        const top = _v(first, ix);
        const right = _v(ix, last);
        const bottom = _v(last, last - offset);
        const left = _v(last - offset, first);

        side[_i(first, ix)] = left;
        side[_i(ix, last)] = top;
        side[_i(last, last - offset)] = right;
        side[_i(last - offset, first)] = bottom;
      }
    }
  }

  return cube;
}

/**
 * Calculate the new cube after rotating the cube about the axis perpendicular
 * to the face (i.e. coming out of the plane). Imagine you had `face` facing
 * towards you and used the right-hand rule - the axis that follows the direction
 * of your thumb is the perpendicular face in this case. For the front/back faces
 * this is the Z-axis (standing layer), for the left/right faces this is the Y-axis
 * (middle layer), and for the top/bottom faces this is the X-axis (equatorial layer).
 * @param cube The cube to be rotated (will be modified)
 * @param size The size of the cube
 * @param face The face of the cube currently facing the user
 * @param sliceStart The index to start slicing at
 * @param sliceSize How many slices to rotate
 * @param rotation How much to rotate the slices that are perpendicular to `face`
 * @returns The modified cube data
 */
export function _rotateCrossSectionWithFacing(
  cube: CubeData,
  size: number,
  face: CubeSide,
  sliceStart: number,
  sliceSize: number,
  rotation: RotationAmount,
): CubeData {
  if (rotation === RotationAmount.None) {
    return cube;
  }

  let invertRotation = false;
  let invertSlice = false;
  let axis: CubeAxis;

  switch (face) {
    // Rotating about the Y-axis. 'Clockwise' is up from the Front
    case CubeSide.Left:
      axis = CubeAxis.Middle;
      invertRotation = true;
      break;
    case CubeSide.Right:
      axis = CubeAxis.Middle;
      invertSlice = true;
      break;
    // Rotating about the Z-axis. 'Clockwise' is up from the Left
    case CubeSide.Front:
      axis = CubeAxis.Standing;
      invertSlice = true;
      break;
    case CubeSide.Back:
      axis = CubeAxis.Standing;
      invertRotation = true;
      break;
    // Rotating about the X-=axis. 'Clockwise' is left from the Left
    case CubeSide.Top:
      axis = CubeAxis.Equatorial;
      break;
    case CubeSide.Bottom:
      axis = CubeAxis.Equatorial;
      invertRotation = true;
      invertSlice = true;
      break;
    default:
      forceNever(face);
  }

  const safeRotation = invertRotation ? _reverseRotation(rotation) : rotation;
  const safeSliceStart = invertSlice
    ? _invertSlice(size, sliceStart, sliceSize)
    : sliceStart;

  const indices: number[] = [];
  const end = safeSliceStart + sliceSize;
  for (let index = safeSliceStart; index < end; ++index) {
    indices.push(index);
  }

  return _rotateCrossSection(cube, size, axis, safeRotation, indices);
}

/**
 * Given a slice from one end, invert it to come from the other end
 * @param cubeSize The size of the cube
 * @param sliceStart The start of the slice
 * @param sliceSize The end of the slice
 * @returns The new slice start
 */
export function _invertSlice(
  cubeSize: number,
  sliceStart: number,
  sliceSize: number,
): number {
  // If we're slicing a cube of size 5 from 1-2 (i.e. the first two internal slices)
  // then the inversion of that would be to slice from 2-3 (i.e. the last two internal slices)
  // _invertSlice(5, 1, 2) -> 2
  return cubeSize - sliceStart - sliceSize;
}

/**
 * Rotate one or more slices of the cube about an axis. Doesn't touch perpendicular
 * faces
 * @param cube The cube that is having a cross section rotated (will be mutated)
 * @param size The size of the cube
 * @param axis The axis being rotated about
 * @param rotation How much to rotate about the axis
 * @param indices Which slices should be rotated
 * @returns The modified cube data
 */
export function _rotateCrossSection(
  cube: CubeData,
  size: number,
  axis: CubeAxis,
  rotation: RotationAmount,
  indices: readonly number[],
): CubeData {
  if (rotation === RotationAmount.None) {
    return cube;
  }

  assert(indices.length > 0, `Expected to have indices`);
  for (const index of indices) {
    assert(isBoundedInteger(index, 0, size - 1), `index ∈ [0, ${size})`);
  }

  let rotateHelper: typeof _sliceCubeOnEquatorialAxis;
  switch (axis) {
    case CubeAxis.Middle:
      rotateHelper = _sliceCubeOnMiddleAxis;
      break;
    case CubeAxis.Equatorial:
      rotateHelper = _sliceCubeOnEquatorialAxis;
      break;
    case CubeAxis.Standing:
      rotateHelper = _sliceCubeOnStandingAxis;
      break;
    default:
      forceNever(axis);
  }

  return rotateHelper(cube, size, rotation, indices);
}

function _sliceCubeOnEquatorialAxis(
  cube: CubeData,
  size: number,
  rotation: RotationAmount,
  indices: readonly number[],
): CubeData {
  const _i = (r: number, c: number) => _ix(size, r, c);
  const [side1, side2, side3, side4, _side5, _side6] = cube;
  for (const rowOff of indices) {
    for (let colOff = 0; colOff < size; ++colOff) {
      const ix = _i(rowOff, colOff);
      for (let r = 0; r < rotation; ++r) {
        const tmp = side1[ix];
        side1[ix] = side2[ix];
        side2[ix] = side3[ix];
        side3[ix] = side4[ix];
        side4[ix] = tmp;
      }
    }
  }

  return cube;
}

function _sliceCubeOnMiddleAxis(
  cube: CubeData,
  size: number,
  rotations: RotationAmount,
  indices: readonly number[],
): CubeData {
  const _i = (r: number, c: number) => _ix(size, r, c);
  const [_side1, side2, _side3, side4, side5, side6] = cube;
  for (const colOff of indices) {
    for (let rowOff = 0; rowOff < size; ++rowOff) {
      const side2Ix = _i(rowOff, colOff);
      const side5Ix = side2Ix;
      const side6Ix = side2Ix;
      const side4Ix = _i(size - rowOff - 1, size - colOff - 1);
      for (let r = 0; r < rotations; ++r) {
        const tmp = side2[side2Ix];
        side2[side2Ix] = side6[side6Ix];
        side6[side6Ix] = side4[side4Ix];
        side4[side4Ix] = side5[side5Ix];
        side5[side5Ix] = tmp;
      }
    }
  }

  return cube;
}

function _sliceCubeOnStandingAxis(
  cube: CubeData,
  size: number,
  rotations: RotationAmount,
  indices: readonly number[],
): CubeData {
  const _i = (r: number, c: number) => _ix(size, r, c);
  const [side1, _side2, side3, _side4, side5, side6] = cube;
  for (const colOff of indices) {
    for (let rowOff = 0; rowOff < size; ++rowOff) {
      const side1Ix = _i(rowOff, colOff);
      const side3Ix = _i(size - rowOff - 1, size - colOff - 1);
      const side5Ix = _i(colOff, size - rowOff - 1);
      const side6Ix = _i(size - colOff - 1, rowOff);
      for (let r = 0; r < rotations; ++r) {
        const tmp = side1[side1Ix];
        side1[side1Ix] = side6[side6Ix];
        side6[side6Ix] = side3[side3Ix];
        side3[side3Ix] = side5[side5Ix];
        side5[side5Ix] = tmp;
      }
    }
  }
  return cube;
}
