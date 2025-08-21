import React, {  } from 'react';
import styles, { 
  cubePlayground, majorSettings, cube
} from './App.module.scss';
import CubePicker, { usePuzzleCube } from '@components/cubes';

const App: React.FC<{}> = () => {
  const [puzzleCube, _cubeDispatch] = usePuzzleCube(3);

  return (
    <>
      <div className={cubePlayground}>
        <div className={majorSettings}>
        </div>
        <div className={cube}>
          <CubePicker {...puzzleCube} />
        </div>
      </div>
    </>
  )
};

export default App;
