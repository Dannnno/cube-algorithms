import { forceNever } from "@/common";
import { CubeData, CubeSide, SliceDirection } from "../cube";
import { RotationAmount } from "./constants";
import { _rotateCubeDirectionally } from "./rotate-cube";

/**
 * Refocus and rotate the cube such that a new face is in focus (i.e. is
 * side #2)
 * @param cube The cube to be refocused
 * @param size The size of the cube
 * @param focusFace The face that should be focused on
 * @returns The new cube layout data
 */
export function _focusCubeFace(
  cube: CubeData,
  size: number,
  focusFace: CubeSide,
): CubeData {
  switch (focusFace) {
    case CubeSide.Front:
      return cube;
    case CubeSide.Back:
      return _rotateCubeDirectionally(
        cube,
        size,
        CubeSide.Front,
        SliceDirection.Left,
        RotationAmount.Halfway,
      );
    case CubeSide.Left:
      return _rotateCubeDirectionally(
        cube,
        size,
        CubeSide.Front,
        SliceDirection.Right,
        RotationAmount.Clockwise,
      );
    case CubeSide.Right:
      return _rotateCubeDirectionally(
        cube,
        size,
        CubeSide.Front,
        SliceDirection.Left,
        RotationAmount.Clockwise,
      );
    case CubeSide.Top:
      return _rotateCubeDirectionally(
        cube,
        size,
        CubeSide.Front,
        SliceDirection.Down,
        RotationAmount.Clockwise,
      );
    case CubeSide.Bottom:
      return _rotateCubeDirectionally(
        cube,
        size,
        CubeSide.Front,
        SliceDirection.Up,
        RotationAmount.Clockwise,
      );
    default:
      forceNever(focusFace);
  }
}
