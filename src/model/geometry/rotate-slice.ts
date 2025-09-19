import { assert, DeepReadonly, isBoundedInteger } from "@/common";
import { CubeAxis, CubeData, CubeSide, SliceDirection } from "../cube";
import { RotationAmount } from "./constants";
import {
  _normalizeRotations,
  axisIsValidForFace,
  directionIsValidForFaceAndAxis,
} from "./helpers";
import { _invertSlice, _rotateCrossSection } from "./primitives";

/**
 * Rotate slices
 * @param cube The cube being rotated (will be mutated)
 * @param size The size of the cube
 * @param axis The axis being rotated about
 * @param sliceStart How far into the cube to start rotating
 * @param sliceSize The number of slices to rotate
 * @param rotation How many times to rotate
 * @returns The modified cube data
 */
export function _rotateCubeSlice(
  cube: CubeData,
  size: number,
  axis: CubeAxis,
  sliceStart: number,
  sliceSize: number,
  rotation: RotationAmount,
): CubeData {
  assert(
    isBoundedInteger(sliceStart, 0, size - 1),
    `sliceStart ∈ [0, ${size})`,
  );
  assert(
    isBoundedInteger(sliceStart + sliceSize, 1, size),
    `sliceSize ∈ [1, ${size}]`,
  );

  if (rotation === RotationAmount.None) {
    return cube;
  }

  const indices: number[] = [];
  const end = sliceStart + sliceSize;
  for (let index = sliceStart; index < end; ++index) {
    indices.push(index);
  }

  return _rotateCrossSection(cube, size, axis, rotation, indices);
}

/**
 * Rotate a slice of a cube, referentially from a particular face
 * @param cube The cube to be sliced
 * @param size The cube edge length
 * @param face The face that is being viewed during the slice
 * @param axis The axis being sliced on
 * @param sliceStart How far into the cube to start slicing
 * @param sliceSize How many layers to include in the slice
 * @param direction The direction being sliced (relative to `faceRef`)
 * @param rotation How many times to rotate the slice in that direction
 * @returns A modified cube
 */
export function _rotateCubeSliceDirectionally(
  cube: CubeData,
  size: number,
  face: CubeSide,
  axis: CubeAxis,
  sliceStart: number,
  sliceSize: number,
  direction: SliceDirection,
  rotation: number,
): CubeData {
  assert(
    axisIsValidForFace(face, axis),
    `The face and axis should be compatible`,
  );
  assert(
    directionIsValidForFaceAndAxis(face, axis, direction),
    `The direction should be compatible`,
  );
  assert(
    isBoundedInteger(sliceStart, 0, size - 1),
    `sliceStart ∈ [0, ${size})`,
  );
  assert(
    isBoundedInteger(sliceStart + sliceSize, 1, size),
    `sliceSize ∈ [1, ${size}]`,
  );

  const { isIndexInverted, sign } = _getDirectionSign(axis, face, direction);
  const trueOffsetStart = isIndexInverted
    ? _invertSlice(size, sliceStart, sliceSize)
    : sliceStart;
  const trueRotCount = _normalizeRotations(sign * rotation);

  return _rotateCubeSlice(
    cube,
    size,
    axis,
    trueOffsetStart,
    sliceSize,
    trueRotCount,
  );
}

const DIRECTION_SIGN_MAP: DeepReadonly<
  Record<
    CubeSide,
    Partial<
      Record<
        CubeAxis,
        Partial<
          Record<SliceDirection, { isIndexInverted: boolean; sign: 1 | -1 }>
        >
      >
    >
  >
> = {
  [CubeSide.Left]: {
    X: {
      [SliceDirection.Left]: { isIndexInverted: false, sign: 1 },
      [SliceDirection.Right]: { isIndexInverted: false, sign: -1 },
    },
    Z: {
      [SliceDirection.Up]: { isIndexInverted: false, sign: 1 },
      [SliceDirection.Down]: { isIndexInverted: false, sign: -1 },
    },
  },
  [CubeSide.Right]: {
    X: {
      [SliceDirection.Left]: { isIndexInverted: false, sign: 1 },
      [SliceDirection.Right]: { isIndexInverted: false, sign: -1 },
    },
    Z: {
      [SliceDirection.Up]: { isIndexInverted: true, sign: -1 },
      [SliceDirection.Down]: { isIndexInverted: true, sign: 1 },
    },
  },
  [CubeSide.Front]: {
    X: {
      [SliceDirection.Left]: { isIndexInverted: false, sign: 1 },
      [SliceDirection.Right]: { isIndexInverted: false, sign: -1 },
    },
    Y: {
      [SliceDirection.Up]: { isIndexInverted: false, sign: 1 },
      [SliceDirection.Down]: { isIndexInverted: false, sign: -1 },
    },
  },
  [CubeSide.Back]: {
    X: {
      [SliceDirection.Left]: { isIndexInverted: false, sign: 1 },
      [SliceDirection.Right]: { isIndexInverted: false, sign: -1 },
    },
    Y: {
      [SliceDirection.Up]: { isIndexInverted: true, sign: -1 },
      [SliceDirection.Down]: { isIndexInverted: true, sign: 1 },
    },
  },
  [CubeSide.Top]: {
    Z: {
      [SliceDirection.Left]: { isIndexInverted: false, sign: -1 },
      [SliceDirection.Right]: { isIndexInverted: false, sign: 1 },
    },
    Y: {
      [SliceDirection.Up]: { isIndexInverted: false, sign: 1 },
      [SliceDirection.Down]: { isIndexInverted: false, sign: -1 },
    },
  },
  [CubeSide.Bottom]: {
    Z: {
      [SliceDirection.Left]: { isIndexInverted: true, sign: 1 },
      [SliceDirection.Right]: { isIndexInverted: true, sign: -1 },
    },
    Y: {
      [SliceDirection.Up]: { isIndexInverted: false, sign: 1 },
      [SliceDirection.Down]: { isIndexInverted: false, sign: -1 },
    },
  },
};

function _getDirectionSign(
  axis: CubeAxis,
  face: CubeSide,
  direction: SliceDirection,
): Readonly<{ isIndexInverted: boolean; sign: 1 | -1 }> {
  const axisLookup = DIRECTION_SIGN_MAP[face];
  const directionLookup = axisLookup[axis];
  const sign = directionLookup?.[direction];
  assert(sign, `Axis, face, and direction must make sense`);
  return sign;
}
