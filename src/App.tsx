import React, { useCallback, useMemo, useState } from 'react';
import styles, { 
  cubePlayground, majorSettings, cube 
} from './App.module.scss';
import CubePicker, { CubeActionType, usePuzzleCube } from '@components/cubes';
import { Credits, GeometrySidebar } from '@components/workflow';
import { isBoundedInteger } from '@common/type-guard';
import { getCubeSize } from './model/geometry';

const App: React.FC<{}> = () => {
  const [size, setSize] = useState(3);
  const [resizeEnabled, setResizeEnabled] = useState(false);
  const [puzzleCube, cubeDispatch] = usePuzzleCube(size);
  const calculatedSize = useMemo(
    () => getCubeSize(puzzleCube.cubeData), [puzzleCube.cubeData]
  );

  const resizeCube = useCallback(() => {
    if (resizeEnabled && size !== calculatedSize) {
      cubeDispatch({
        type: CubeActionType.ResizeCube,
        newSize: size
      });
      setResizeEnabled(false);
    }
  }, [size, cubeDispatch, resizeEnabled, setResizeEnabled, calculatedSize]);

  const onSizeChange = useCallback(() => {
    const input = 
      document.getElementById("resize-input") as HTMLInputElement | null;
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
        <div className={majorSettings}>
          <label htmlFor="resize-input">New Size: </label>
          <select 
            id="resize-input" 
            name="resize-input" 
            value={size} 
            onChange={onSizeChange}
          >
            {
              Array.from(
                {length: 7}, 
                (_, ix) => <option key={ix+2} value={ix+2}>{ix+2}</option>
              )
            }
          </select>
          <button onClick={resizeCube} disabled={!resizeEnabled}>
            <img width={50} height={50} src="/src/assets/progression.svg"/>
          </button>
        </div>
        <GeometrySidebar cubeDispatch={cubeDispatch} />
        <div className={cube}>
          <CubePicker {...puzzleCube} />
        </div>
      </div>
      <Credits />
    </>
  )
};

export default App;
