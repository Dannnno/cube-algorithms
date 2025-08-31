import { DeepReadonly } from "@common/generics";
import { CubeData } from "@model/cube";
import { CubeActions } from "./usePuzzleCube";

/**
 * A rendering style for the puzzle cube
 */
export enum CubeRenderStyle {
  /** Flattened (i.e. unrolled) */
  Flat = "Flat",
  /** Three-dimensional */
  ThreeD = "3D",
  /** Three-dimensional with WebGL */
  ThreeJs = "3D (ThreeJS)",
}

/**
 * Data model for a React FC on a puzzle cube
 */
export interface IReactCubeProps {
  /** The current state of the cube */
  readonly cubeData: DeepReadonly<CubeData>;
  /**
   * How to take actions on a cube
   */
  readonly cubeDispatch: React.Dispatch<CubeActions>;
  /**
   * How the cube should be rendered
   */
  readonly renderStyle: CubeRenderStyle;
}
