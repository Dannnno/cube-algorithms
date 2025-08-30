import { DeepReadonly, forceNever } from "@/common";
import {
  CubeAxis,
  CubeCellValue,
  CubeSide,
  CubeSideData,
  FaceRotationDirection,
  SliceDirection,
  forEachCellOnSide,
  forEachSide,
  getCubeSize,
} from "@model/cube";
import React, { useMemo } from "react";
import {
  FaceRotationButton,
  FocusFaceButton,
  RotateCubeButtonContainer,
  SliceRotationButton,
} from "../workflow/";
import { CubeRenderStyle, IReactCubeProps } from "./generic-cube";
import styles, {
  actionButtonWrapper,
  back,
  bottom,
  cell,
  control,
  controlButton,
  cube,
  cubeContainer,
  cubePerspective,
  face,
  flat,
  front,
  left,
  perspectiveWrapper,
  right,
  threeD,
  top,
} from "./rendered-cube.module.scss";
import { CubeActions } from "./usePuzzleCube";
import { WebGlCube } from "./webgl-cube";

function asCssVars(
  ...pairs: readonly (readonly [string, string | number])[]
): React.CSSProperties {
  return Object.fromEntries(pairs) as React.CSSProperties;
}

/**
 * Component that renders a 3-dimensional puzzle cube.
 */
export const RenderedCube: React.FC<IReactCubeProps> = props => {
  const { cubeData, cubeDispatch, renderStyle } = props;
  const size = getCubeSize(cubeData);
  const cssVars = asCssVars(["--side-size", size]);

  let renderStyleClass: string;
  switch (renderStyle) {
    case CubeRenderStyle.Flat:
      renderStyleClass = flat;
      break;
    case CubeRenderStyle.ThreeD:
      renderStyleClass = threeD;
      break;
    case CubeRenderStyle.ThreeDWebGl:
      return <WebGlCube {...props} />;
    default:
      forceNever(renderStyle);
  }

  const sides: React.ReactElement[] = [];
  forEachSide(cubeData, (sideId, data) =>
    sides.push(
      <RenderedCubeSide
        key={sideId}
        sideId={sideId}
        size={size}
        side={data}
        cubeDispatch={cubeDispatch}
      />,
    ),
  );

  return (
    <>
      <div className={`${cubeContainer} ${renderStyleClass}`} style={cssVars}>
        <div className={control}>
          <div className={controlButton}>
            <RotateCubeButtonContainer dispatch={cubeDispatch} />
          </div>
        </div>
        <div className={perspectiveWrapper}>
          <div className={cubePerspective}>
            <div className={cube}>{...sides}</div>
          </div>
        </div>
      </div>
    </>
  );
};

interface ICubeSideProps {
  readonly size: number;
  readonly sideId: CubeSide;
  readonly side: DeepReadonly<CubeSideData>;
  readonly cubeDispatch: React.Dispatch<CubeActions>;
}

const RenderedCubeSide: React.FC<ICubeSideProps> = props => {
  const { side, sideId, size, cubeDispatch } = props;

  const values: React.ReactElement[] = [];
  forEachCellOnSide(side, size, (row, col, value) => {
    values.push(
      <RenderedCubeCell
        size={size}
        sideId={sideId}
        value={value}
        rowNum={row}
        colNum={col}
        cubeDispatch={cubeDispatch}
      />,
    );
  });
  const className = [left, front, right, back, top, bottom][sideId - 1];

  return (
    <div data-side-id={sideId} className={`${face} ${className}`}>
      {...values}
    </div>
  );
};

interface ICubeValueProps {
  readonly size: number;
  readonly sideId: CubeSide;
  readonly value: CubeCellValue;
  readonly rowNum: number;
  readonly colNum: number;
  readonly cubeDispatch: React.Dispatch<CubeActions>;
}

function useSlotButton(
  sideId: CubeSide,
  size: number,
  row: number,
  col: number,
  dispatch: React.Dispatch<CubeActions>,
): React.ReactElement | null {
  return useMemo(() => {
    const half = Math.floor(size / 2);
    /**
     * Odd Parity:
     * +------------+------------+-------------+
     * |            |            |             |
     * | Face-Left  |  Slice Up  |  Face-Right |
     * |            |            |             |
     * +------------+------------+-------------+
     * |            |            |             |
     * | Slice Left |    Focus   | Slice Right |
     * |            |            |             |
     * +------------+------------+-------------+
     * |            |            |             |
     * |            | Slice Down |             |
     * |            |            |             |
     * +------------+------------+-------------+
     *
     * Even Parity will be the same, but choose the top-left option
     * available. A 2x2x2 cube loses the slices and puts focus in the
     * bottom right.
     */

    // Focus
    if (row === half && col === half) {
      return <FocusFaceButton cubeDispatch={dispatch} sideId={sideId} />;
    }

    // Vertical Slice
    if ((row === 0 || row === size - 1) && col !== 0 && col !== size - 1) {
      const direction = row === 0 ? SliceDirection.Up : SliceDirection.Down;
      let axis: CubeAxis;
      switch (sideId) {
        case CubeSide.Left:
        case CubeSide.Right:
          axis = "Z";
          break;
        case CubeSide.Front:
        case CubeSide.Back:
        case CubeSide.Top:
        case CubeSide.Bottom:
          axis = "Y";
          break;
        default:
          forceNever(sideId);
      }
      return (
        <SliceRotationButton
          dispatch={dispatch}
          rotationDirection={direction}
          axis={axis}
          sliceStart={col}
          sideReference={sideId}
          size={size}
        />
      );
    }

    // Horizontal Slice
    if (row !== 0 && row !== size - 1 && (col === 0 || col === size - 1)) {
      const direction: SliceDirection =
        col === 0 ? SliceDirection.Left : SliceDirection.Right;
      let axis: CubeAxis;
      switch (sideId) {
        case CubeSide.Left:
        case CubeSide.Front:
        case CubeSide.Right:
        case CubeSide.Back:
          axis = "X";
          break;
        case CubeSide.Top:
        case CubeSide.Bottom:
          axis = "Z";
          break;
        default:
          forceNever(sideId);
      }
      return (
        <SliceRotationButton
          dispatch={dispatch}
          rotationDirection={direction}
          axis={axis}
          sliceStart={row}
          sideReference={sideId}
          size={size}
        />
      );
    }

    // Rotate Face
    if (row === 0 && (col === 0 || col === size - 1)) {
      const direction =
        col === 0
          ? FaceRotationDirection.CounterClockwise
          : FaceRotationDirection.Clockwise;
      return (
        <FaceRotationButton
          dispatch={dispatch}
          faceId={sideId}
          rotationDirection={direction}
        />
      );
    }
    return null;
  }, [sideId, size, row, col, dispatch]);
}

const RenderedCubeCell: React.FC<ICubeValueProps> = props => {
  const { size, sideId, value, rowNum, colNum, cubeDispatch } = props;
  const button = useSlotButton(sideId, size, rowNum, colNum, cubeDispatch);

  return (
    <div
      data-side-id={sideId}
      data-row-num={rowNum}
      data-col-num={colNum}
      data-cur-value={value}
      className={`${cell} ${styles[`side-${value}`]}`}
    >
      <div className={actionButtonWrapper}>{button}</div>
    </div>
  );
};

export default RenderedCube;
