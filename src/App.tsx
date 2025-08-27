import { isBoundedInteger } from "@/common";
import {
  CubeActionType,
  CubeRenderStyle,
  RenderedCube,
  usePuzzleCube,
} from "@components/cubes";
import { Credits } from "@components/workflow";
import { getCubeSize } from "@model/cube";
import React, { useCallback, useMemo, useState } from "react";
import {
  cube,
  cubePlayground,
  reset,
  resize,
  styleSelect,
} from "./App.module.scss";

const App: React.FC<{}> = () => {
  const [size, setSize] = useState(3);
  const [cubeStyle, setCubeStyle] = useState(CubeRenderStyle.Flat);
  const [resizeEnabled, setResizeEnabled] = useState(false);

  const [puzzleCube, cubeDispatch] = usePuzzleCube(size);
  const calculatedSize = useMemo(() => getCubeSize(puzzleCube), [puzzleCube]);

  const cubeStyleOptions = useMemo(
    () =>
      Object.entries(CubeRenderStyle).map(([key, value]) => (
        <option value={value} key={key}>
          {key}
        </option>
      )),
    [cubeStyle],
  );

  const onCubeStyleOptionChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) =>
      setCubeStyle(event.target.value as CubeRenderStyle),
    [cubeStyle],
  );

  const onClickResetCube = useCallback(
    () =>
      cubeDispatch({
        type: CubeActionType.ResetCube,
      }),
    [cubeDispatch],
  );

  const onClickResizeCube = useCallback(() => {
    if (resizeEnabled && size !== calculatedSize) {
      cubeDispatch({
        type: CubeActionType.ResizeCube,
        newSize: size,
      });
      setResizeEnabled(false);
    }
  }, [size, cubeDispatch, resizeEnabled, setResizeEnabled, calculatedSize]);

  const onSizeOptionChange = useCallback(() => {
    const input = document.getElementById(
      "resize-input",
    ) as HTMLInputElement | null;
    if (!input) {
      return;
    }
    const newSize = Number.parseInt(input.value);
    if (isBoundedInteger(newSize, 2, 9)) {
      setSize(newSize);
      setResizeEnabled(newSize !== calculatedSize);
    }
  }, [setSize, calculatedSize]);

  return (
    <>
      <div className={cubePlayground}>
        <div className={resize}>
          <label htmlFor="resize-input">New Size: </label>
          <select
            id="resize-input"
            name="resize-input"
            value={size}
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
            title={`Resize the cube to be ${size}x${size}x${size}`}
            aria-label={`Resize the cube to be ${size}x${size}x${size}`}
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
          ></button>
        </div>

        <div className={styleSelect}>
          <label htmlFor="cube-style-select">Pick a cube style:&nbsp;</label>
          <select
            name="cube-style"
            id="cube-style-select"
            required
            onChange={onCubeStyleOptionChange}
            value={cubeStyle}
          >
            {cubeStyleOptions}
          </select>
        </div>

        <div className={cube}>
          <RenderedCube
            cubeData={puzzleCube}
            cubeDispatch={cubeDispatch}
            renderStyle={cubeStyle}
          />
        </div>
      </div>

      <Credits />
    </>
  );
};

export default App;
