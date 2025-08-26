import React, { useCallback, useMemo, useState } from 'react';
import styles, { 
  cubePlayground, cube, resize, reset, styleSelect,
} from './App.module.scss';
import { 
  usePuzzleCube, CubeActionType, FlatCube, ThreeDimCube 
} from '@components/cubes';
import { Credits } from '@components/workflow';
import { forceNever, isBoundedInteger } from '@/common';
import { getCubeSize } from '@model/cube';

const App: React.FC<{}> = () => {
  const [size, setSize] = useState(3);
  const [cubeStyle, setCubeStyle] = useState(CubeStyle.Flat);
  const [resizeEnabled, setResizeEnabled] = useState(false);
  
  const [puzzleCube, cubeDispatch] = usePuzzleCube(size);
  const calculatedSize = useMemo(
    () => getCubeSize(puzzleCube.cubeData), [puzzleCube.cubeData]
  );
  
  const cubeStyleOptions = useMemo(() => 
      Object.keys(CubeStyleOptions).map(
          id => <option value={id} key={id}>{id}</option>
      ), 
      [cubeStyle]);

  const onCubeStyleOptionChange = useCallback(
      (event: React.ChangeEvent<HTMLSelectElement>) => 
          setCubeStyle(event.target.value as CubeStyle),
      [cubeStyle]);

  const onClickResetCube = useCallback(
    () => cubeDispatch({
      type: CubeActionType.ResetCube,
    }), 
    [cubeDispatch]
  );

  const onClickResizeCube = useCallback(() => {
    if (resizeEnabled && size !== calculatedSize) {
      cubeDispatch({
        type: CubeActionType.ResizeCube,
        newSize: size
      });
      setResizeEnabled(false);
    }
  }, [size, cubeDispatch, resizeEnabled, setResizeEnabled, calculatedSize]);

  const onSizeOptionChange = useCallback(() => {
    const input 
      = document.getElementById("resize-input") as HTMLInputElement | null;
    if (!input) {
      return;
    }
    const newSize = Number.parseInt(input.value);
    if (isBoundedInteger(newSize, 2, 9)) {
      setSize(newSize);
      setResizeEnabled(newSize !== calculatedSize);
    }
  }, [setSize, calculatedSize]);

  const cubeProps = {
    cubeDispatch, ...puzzleCube
  }
  
  let renderedCube: React.ReactElement;
  switch (cubeStyle) {
    case CubeStyle.Flat:
      renderedCube = <FlatCube {...cubeProps}  />;
      break;
    case CubeStyle.ThreeD:
      renderedCube = <ThreeDimCube {...cubeProps} />;
      break;
    case CubeStyle.None:
      renderedCube = <p>Select a rendering style above.</p>;
      break;
    default:
      forceNever(cubeStyle);
   }

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
            {
              Array.from(
                {length: 7}, 
                (_, ix) => <option key={ix+2} value={ix+2}>{ix+2}</option>
              )
            }
          </select>
          &nbsp;
          <label htmlFor="resize-input-button">Resize: </label>
          <button 
            id="resize-input-button"  
            name="resize-input-button"
            role="button"
            title={`Resize the cube to be ${size}x${size}x${size}`}
            onClick={onClickResizeCube} 
            disabled={!resizeEnabled}
          >
          </button>
        </div>
        
        <div className={reset}>
          <label htmlFor="reset-button">Reset: </label>
          <button 
            id="reset-button"  
            name="reset-button"
            role="button"
            title={`Reset the cube`}
            onClick={onClickResetCube} 
          >
          </button>
        </div>
        
        <div className={styleSelect}>
          <label htmlFor="cube-style-select">
              Pick a cube style:&nbsp;
          </label>
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
          {renderedCube}
        </div>
      </div>

      <Credits />
    </>
  )
};

enum CubeStyle {
    None = "",
    Flat = "Flat",
    ThreeD = "3D"
}

const CubeStyleOptions = {
    [CubeStyle.None]: CubeStyle.None,
    [CubeStyle.Flat]: CubeStyle.Flat,
    [CubeStyle.ThreeD]: CubeStyle.ThreeD
} as const;

export default App;
