import { CubeData, CubeSide } from "../cube";
import { RotationAmount } from "./constants";
import { _rotateCrossSectionWithFacing, _rotateFaceMatrix } from "./primitives";

/**
 * Rotate a cube face, and optionally one or more slices
 * @param cube The cube
 * @param size The cube edge length
 * @param face Which face is being rotated
 * @param rotation The number of times to rotate the face
 * @param depth How deeply to rotate the face (i.e. how many internal slices)
 * @returns The modified cube
 */
export function _rotateCubeFace(
  cube: CubeData,
  size: number,
  face: CubeSide,
  rotation: RotationAmount,
  depth: number,
): CubeData {
  if (rotation === RotationAmount.None) {
    return cube;
  }

  _rotateFaceMatrix(cube, size, face, rotation);
  _rotateCrossSectionWithFacing(cube, size, face, 0, depth, rotation);

  return cube;
}
