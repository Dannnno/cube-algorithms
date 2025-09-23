/**
 * Provides all of the major ways to manipulate a puzzle cube. This should only
 * contain and export the public methods that should be used elsewhere; all of
 * the other files in this directory should be helper methods that actually get
 * into the data model and manipulation.
 *
 * Overall, the cube is stored as a 6-element array of 1-dimensional arrays,
 * where each cube side has N**2 elements (where N is the length of one edge of
 * the cube). Each element has a value 1-6, which represents which 'side (on a
 * solved cube) the cell looks like.
 *
 * The layout of the cube is as though the cube were unrolled and flattened:
 *
 * cube = [left, front, right, back, top, bottom]
 *          +--------+
 *          |   top  |
 * +--------+--------+--------+--------+
 * |  left  |  front |  right |  back  |
 * +--------+--------+--------+--------+
 *          | bottom |
 *          +--------+
 *
 * There are three relevant axes in the cube (assuming you're facing 'front' with
 * 'top' above):
 *   - The Y-axis, or the middle axis, runs vertically along top-front-bottom-back
 *   - The Z-axis, or the standing axis, runs vertically along top-right-bottom-left
 *   - The X-axis, or the equatorial axis, runs horizontally along left-back-right-front
 *
 * All moves are, more or less, slices of one or more of the layers in a given
 * cube, about an axis. Practically, this ends up looking like one of:
 *   1. Rotating a single face of the cube
 *   2. Rotating one or more internal layers
 *   3. Rotating the whole cube
 *
 * APIs for each of these are provided, but are implemented in such a way that
 * they are all assumed to be executed from some abstract fixed view-point. This
 * isn't the way users will actually interact with the cube; whether using
 * algorithmic input, keyboard controls, or buttons on the cube, all of those
 * will generally involve orienting the cube such that it is facing you in some
 * way, and then executing turns from that perspective.
 *
 * Rather than requiring every rendering perspective and parsing implementation
 * to handle that, 'facing' APIs exist as well that wrap the lower-level APIs
 * in such a way that the callers don't need to understand the internal data
 * model.
 */

import { assert, DeepReadonly, isBoundedInteger } from "@/common";
import { CubeAxis, CubeData, CubeSide, SliceDirection } from "../cube";
import { _focusCubeFace } from "./focus-face";
import { _setupManipulation } from "./helpers";
import { _rotateCrossSectionWithFacing } from "./primitives";
import { _rotateCube, _rotateCubeDirectionally } from "./rotate-cube";
import { _rotateCubeFace } from "./rotate-face";
import {
  _rotateCubeSlice,
  _rotateCubeSliceDirectionally,
} from "./rotate-slice";

export * from "./constants";
export {
  at,
  directionIsValidForFaceAndAxis,
  getPerpendicularFaces,
} from "./helpers";

/**
 * Rotate a single cube face
 * @param cube The cube data
 * @param face Which face is being rotated clockwise
 * @param numTurns How many turns to rotate the cube face
 * @returns The modified cube data
 */
export function rotateCubeFace(
  cube: DeepReadonly<CubeData>,
  face: CubeSide,
  numTurns: number,
): CubeData {
  const [newCube, size, rotation] = _setupManipulation(cube, numTurns);
  return _rotateCubeFace(newCube, size, face, rotation, 1);
}

/**
 * Deeply rotate a single cube face, including slices further in
 * @param cube The cube data
 * @param face Which face is being rotated clockwise
 * @param depth How deep into the cube to rotate
 * @param numTurns How many turns to rotate the cube face
 * @returns The modified cube data
 */
export function rotateCubeDeepTurn(
  cube: DeepReadonly<CubeData>,
  face: CubeSide,
  depth: number,
  numTurns: number,
): CubeData {
  const [newCube, size, rotation] = _setupManipulation(cube, numTurns);
  assert(depth > 1, `Need a depth > 1`);
  return _rotateCubeFace(newCube, size, face, rotation, depth);
}

/**
 * Rotate internal slices of a cube, ignoring any affects on perpendicular faces
 * @param cube The cube being rotated
 * @param axis The axis of rotation
 * @param sliceStart Which slice to rotate
 * @param sliceSize The number of slices to rotate
 * @param numTurns The number of times to rotate it
 * @returns The new cube data
 */
export function rotateCubeInternalSlice(
  cube: DeepReadonly<CubeData>,
  axis: CubeAxis,
  sliceStart: number,
  sliceSize: number,
  numTurns: number,
): CubeData {
  const [newCube, size, rotation] = _setupManipulation(cube, numTurns);
  assert(
    isBoundedInteger(sliceStart, 1, size - 2),
    `sliceStart ∈ [1, ${size - 2}]`,
  );
  assert(
    isBoundedInteger(sliceStart + sliceSize, 2, size - 1),
    `sliceEnd ∈ [2, ${size - 1}]`,
  );
  return _rotateCubeSlice(newCube, size, axis, sliceStart, sliceSize, rotation);
}

/**
 * Rotate a slice of a cube, referentially from a particular face
 * @param cube The cube to be sliced
 * @param face The face that is being viewed during the slice
 * @param axis The axis being sliced on
 * @param sliceStart How far into the cube to start slicing
 * @param sliceSize How many layers to include in the slice
 * @param direction The direction being sliced (relative to `faceRef`)
 * @param numTurns How many times to rotate the slice in that direction
 * @returns A modified cube
 */
export function rotateCubeSliceFromFace(
  cube: DeepReadonly<CubeData>,
  face: CubeSide,
  axis: CubeAxis,
  sliceStart: number,
  sliceSize: number,
  direction: SliceDirection,
  numTurns: number,
): CubeData {
  const [newCube, size, rotation] = _setupManipulation(cube, numTurns);
  assert(
    isBoundedInteger(sliceStart, 1, size - 2),
    `sliceStart ∈ [1, ${size - 2}]`,
  );
  assert(
    isBoundedInteger(sliceStart + sliceSize, 2, size - 1),
    `sliceEnd ∈ [2, ${size - 1}]`,
  );
  return _rotateCubeSliceDirectionally(
    newCube,
    size,
    face,
    axis,
    sliceStart,
    sliceSize,
    direction,
    rotation,
  );
}

/**
 * Rotate slices along the axis that is perpendicular to the current face
 * @param cube The cube being modified
 * @param face The face being faced
 * @param sliceStart How far into the cube to start slicing
 * @param sliceSize How many slices to take
 * @param numTurns How many times to rotate it
 * @returns The modified cube
 */
export function rotatePerpendicularSlice(
  cube: DeepReadonly<CubeData>,
  face: CubeSide,
  sliceStart: number,
  sliceSize: number,
  numTurns: number,
): CubeData {
  const [newCube, size, rotation] = _setupManipulation(cube, numTurns);
  assert(
    isBoundedInteger(sliceStart, 1, size - 2),
    `sliceStart ∈ [1, ${size - 2}]`,
  );
  assert(
    isBoundedInteger(sliceStart + sliceSize, 2, size - 1),
    `sliceEnd ∈ [2, ${size - 1}]`,
  );
  return _rotateCrossSectionWithFacing(
    newCube,
    size,
    face,
    sliceStart,
    sliceSize,
    rotation,
  );
}

/**
 * Refocus and rotate the cube such that a new face is in focus (i.e. is
 * side #2)
 * @param cube The cube to be refocused
 * @param face The face that should be focused on
 * @returns The new cube layout data
 */
export function refocusCube(
  cube: DeepReadonly<CubeData>,
  face: CubeSide,
): CubeData {
  const [newCube, size, _] = _setupManipulation(cube, 0);
  return _focusCubeFace(newCube, size, face);
}

/**
 * Rotate an entire cube while facing a certain face
 * @param cube The cube to be rotated
 * @param face The face that is our reference point
 * @param direction Which direction to rotate in
 * @param numTurns How many times to rotate it
 * @returns The cube post rotation
 */
export function rotateCubeFromFace(
  cube: DeepReadonly<CubeData>,
  face: CubeSide,
  direction: SliceDirection,
  numTurns: number,
): CubeData {
  const [newCube, size, rotation] = _setupManipulation(cube, numTurns);
  return _rotateCubeDirectionally(newCube, size, face, direction, rotation);
}

/**
 * Rotate an entire cube
 * @param cube The cube to be rotated
 * @param axis The axis of rotation
 * @param numTurns How many times to rotate it
 * @returns The cube post rotation
 */
export function rotateCube(
  cube: DeepReadonly<CubeData>,
  axis: CubeAxis,
  numTurns: number,
): CubeData {
  const [newCube, size, rotation] = _setupManipulation(cube, numTurns);
  return _rotateCube(newCube, size, axis, rotation);
}
