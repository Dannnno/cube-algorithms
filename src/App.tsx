import React, { } from 'react';
import styles, { 
  cubePlayground, majorSettings, cube 
} from './App.module.scss';
import CubePicker, { usePuzzleCube } from '@components/cubes';
import { Credits, GeometrySidebar } from '@components/workflow';

const App: React.FC<{}> = () => {
  const [puzzleCube, cubeDispatch] = usePuzzleCube();

  return (
    <>
      <div className={cubePlayground}>
        <div className={majorSettings}>
        </div>
        <div className={cube}>
          <CubePicker {...puzzleCube} />
        </div>
        <GeometrySidebar cubeDispatch={cubeDispatch} />
      </div>
      <Credits />
    </>
  )
};

export default App;
