import { DeepReadonly } from "@common/generics";
import { CubeData, CubeSide } from "@model/cube";
import { CubeActions } from "./usePuzzleCube";

/**
 * How to style a given cell in the cube
 */
interface IPuzzleCubeCellStyle {
  /** The color to use as the background */
  readonly color: string;
}

/**
 * A rendering style for the puzzle cube
 */
export enum CubeRenderStyle {
  /** No render style */
  None = "",
  /** Flattened (i.e. unrolled) */
  Flat = "Flat",
  /** Three-dimensional */
  ThreeD = "3D",
}

/**
 * Map from a cube side to its rendering style.
 */
export type PuzzleCubeCellStyleMap = Readonly<
  Record<CubeSide, IPuzzleCubeCellStyle>
>;

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

/**
 * Properties for aesthetic puzzle cubes
 */
export interface IPrettyPuzzleCubeProps extends IReactCubeProps {
  /**
   * A mapping between a given cell value and how it should be styled.
   */
  readonly styleMap?: PuzzleCubeCellStyleMap;
}
