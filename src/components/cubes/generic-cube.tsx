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
}

/**
 * Properties for aesthetic puzzle cubes
 */
export interface IPrettyPuzzleCubeProps extends IReactCubeProps {
  /**
   * A mapping between a given cell value and how it should be styled.
   */
  readonly styleMap?: PuzzleCubeCellStyleMap;
  /**
   * How to take actions on a cube
   */
  readonly cubeDispatch: React.Dispatch<CubeActions>;
}
