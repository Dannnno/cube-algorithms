import { DeepReadonly, isBoundedInteger } from "@/common";
import { CubeData, getCubeSize } from "@/model/cube";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  CubeActionType,
  CubeActions,
  CubeRenderStyle,
  usePuzzleCube,
  usePuzzleCubeHash,
} from "../cubes";
import {
  controlPanelSidebar,
  reset,
  resize,
  styleSelect,
} from "./control-panel.module.scss";
import { RotateCubeButtonContainer } from "./geometry-buttons";

interface IControlPanelProps {
  /** How to control the cube */
  readonly dispatch: React.Dispatch<CubeActions>;
  /** The cube being controlled */
  readonly puzzleCube: DeepReadonly<CubeData>;
  /** The length of one side of the cube */
  readonly cubeSize: number;
  /** Set the reactive cube size */
  readonly setCubeSize: React.Dispatch<React.SetStateAction<number>>;
  /** The style in which to render the cube */
  readonly renderStyle: CubeRenderStyle;
  /** Set the reactive rendering style */
  readonly setCubeRenderStyle: React.Dispatch<
    React.SetStateAction<CubeRenderStyle>
  >;
}

/**
 * Component that shows controls to display a cube
 */
export const ControlPanel: React.FC<IControlPanelProps> = props => {
  const {
    dispatch,
    puzzleCube,
    cubeSize,
    setCubeSize,
    renderStyle,
    setCubeRenderStyle,
  } = props;
  const [resizeEnabled, setResizeEnabled] = useState(false);
  const [resetEnabled, setResetEnabled] = useState(false);

  const [defaultCubeOfSize, resizeDispatch] = usePuzzleCube(cubeSize);
  const cubeHash = usePuzzleCubeHash(puzzleCube);
  const defaultCubeHash = usePuzzleCubeHash(defaultCubeOfSize);
  const cubeHasChanged = useMemo(
    () => cubeHash !== defaultCubeHash,
    [cubeHash, defaultCubeHash],
  );
  const calculatedSize = useMemo(() => getCubeSize(puzzleCube), [puzzleCube]);

  useEffect(() => setResetEnabled(cubeHasChanged), [cubeHasChanged]);

  const cubeStyleOptions = useMemo(
    () =>
      Object.values(CubeRenderStyle).map(value => (
        <option value={value} key={value}>
          {value}
        </option>
      )),
    [renderStyle],
  );

  const onCubeStyleOptionChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) =>
      setCubeRenderStyle(event.target.value as CubeRenderStyle),
    [renderStyle],
  );

  const onClickResetCube = useCallback(() => {
    if (resetEnabled && cubeHasChanged) {
      dispatch({
        type: CubeActionType.ResetCube,
      });
    }
  }, [dispatch, resetEnabled, cubeHasChanged]);

  const onClickResizeCube = useCallback(() => {
    if (resizeEnabled && cubeSize !== calculatedSize) {
      dispatch({
        type: CubeActionType.ResizeCube,
        newSize: cubeSize,
      });
      resizeDispatch({
        type: CubeActionType.ResizeCube,
        newSize: cubeSize,
      });
      setResizeEnabled(false);
    }
  }, [cubeSize, dispatch, resizeEnabled, setResizeEnabled, calculatedSize]);

  const onSizeOptionChange = useCallback(() => {
    const input = document.getElementById(
      "resize-input",
    ) as HTMLInputElement | null;
    if (!input) {
      return;
    }
    const newSize = Number.parseInt(input.value);
    if (isBoundedInteger(newSize, 2, 9)) {
      setCubeSize(newSize);
      setResizeEnabled(newSize !== calculatedSize);
    }
  }, [setCubeSize, calculatedSize]);

  return (
    <>
      <div className={controlPanelSidebar}>
        <div className={resize}>
          <label htmlFor="resize-input">New Size: </label>
          <select
            id="resize-input"
            name="resize-input"
            value={cubeSize}
            onChange={onSizeOptionChange}
          >
            {Array.from({ length: 7 }, (_, ix) => (
              <option key={ix + 2} value={ix + 2}>
                {ix + 2}
              </option>
            ))}
          </select>
          &nbsp;
          <label htmlFor="resize-input-button">Resize: </label>
          <button
            id="resize-input-button"
            name="resize-input-button"
            title={`Resize the cube to be ${cubeSize}x${cubeSize}x${cubeSize}`}
            aria-label={`Resize the cube to be ${cubeSize}x${cubeSize}x${cubeSize}`}
            onClick={onClickResizeCube}
            disabled={!resizeEnabled}
          ></button>
        </div>

        <div className={reset}>
          <label htmlFor="reset-button">Reset: </label>
          <button
            id="reset-button"
            name="reset-button"
            title={`Reset the cube`}
            aria-label={`Reset the cube`}
            onClick={onClickResetCube}
            disabled={!resetEnabled}
          ></button>
        </div>

        <div className={styleSelect}>
          <label htmlFor="cube-style-select">Pick a cube style:&nbsp;</label>
          <select
            name="cube-style"
            id="cube-style-select"
            required
            onChange={onCubeStyleOptionChange}
            value={renderStyle}
          >
            {cubeStyleOptions}
          </select>
        </div>

        <div>
          <label>Rotate Whole Cube: </label>
          <RotateCubeButtonContainer dispatch={dispatch} />
        </div>
      </div>
    </>
  );
};

export default ControlPanel;
