import { CubeAxis, CubeData, CubeSide, SliceDirection } from "../cube";
import { RotationAmount } from "./constants";
import {
  _normalizeRotations,
  _reverseRotation,
  getPerpendicularFaces,
} from "./helpers";
import { _rotateFaceMatrix } from "./primitives";
import { _rotateCubeSlice } from "./rotate-slice";

/**
 * Rotate a cube about an axis
 * @param cube The cube to be rotated (will be mutated)
 * @param size The cube edge length
 * @param axis Which axis to rotate on
 * @param rotation How much to rotate the cube
 * @returns The rotated cube
 */
export function _rotateCube(
  cube: CubeData,
  size: number,
  axis: CubeAxis,
  rotation: RotationAmount,
): CubeData {
  // Do all of the slices
  _rotateCubeSlice(cube, size, axis, 0, size, rotation);

  // Then fix the perpendicular faces
  const [front, back] = getPerpendicularFaces(axis);
  _rotateFaceMatrix(cube, size, front, rotation);
  _rotateFaceMatrix(cube, size, back, _reverseRotation(rotation));
  return cube;
}

/**
 * Rotate a cube in a cardinal direction while oriented towards a given face
 * @param cube The cube to be rotated
 * @param size The cube edge length
 * @param face The face oriented towards the caller
 * @param direction Which direction to rotate the cube in
 * @param rotation How much to rotate it
 * @returns The rotated cube
 */
export function _rotateCubeDirectionally(
  cube: CubeData,
  size: number,
  face: CubeSide,
  direction: SliceDirection,
  rotation: RotationAmount,
): CubeData {
  const [axis, sign] = CUBE_FACE_DIRECTION[face][direction];
  return _rotateCube(cube, size, axis, _normalizeRotations(rotation * sign));
}
const CUBE_FACE_DIRECTION: Record<
  CubeSide,
  Record<SliceDirection, readonly [CubeAxis, 1 | -1]>
> = {
  [CubeSide.Left]: {
    [SliceDirection.Left]: [CubeAxis.Equatorial, 1],
    [SliceDirection.Right]: [CubeAxis.Equatorial, -1],
    [SliceDirection.Up]: [CubeAxis.Standing, 1],
    [SliceDirection.Down]: [CubeAxis.Standing, -1],
  },
  [CubeSide.Front]: {
    [SliceDirection.Left]: [CubeAxis.Equatorial, 1],
    [SliceDirection.Right]: [CubeAxis.Equatorial, -1],
    [SliceDirection.Up]: [CubeAxis.Middle, 1],
    [SliceDirection.Down]: [CubeAxis.Middle, -1],
  },
  [CubeSide.Right]: {
    [SliceDirection.Left]: [CubeAxis.Equatorial, 1],
    [SliceDirection.Right]: [CubeAxis.Equatorial, -1],
    [SliceDirection.Up]: [CubeAxis.Standing, -1],
    [SliceDirection.Down]: [CubeAxis.Standing, 1],
  },
  [CubeSide.Back]: {
    [SliceDirection.Left]: [CubeAxis.Equatorial, 1],
    [SliceDirection.Right]: [CubeAxis.Equatorial, -1],
    [SliceDirection.Up]: [CubeAxis.Middle, -1],
    [SliceDirection.Down]: [CubeAxis.Middle, 1],
  },
  [CubeSide.Top]: {
    [SliceDirection.Left]: [CubeAxis.Standing, -1],
    [SliceDirection.Right]: [CubeAxis.Standing, 1],
    [SliceDirection.Up]: [CubeAxis.Middle, 1],
    [SliceDirection.Down]: [CubeAxis.Middle, -1],
  },
  [CubeSide.Bottom]: {
    [SliceDirection.Left]: [CubeAxis.Standing, 1],
    [SliceDirection.Right]: [CubeAxis.Standing, -1],
    [SliceDirection.Up]: [CubeAxis.Middle, 1],
    [SliceDirection.Down]: [CubeAxis.Middle, -1],
  },
};
