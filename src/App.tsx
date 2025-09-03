import {
  CubeRenderStyle,
  RenderedCube,
  usePuzzleCube,
} from "@components/cubes";
import { ControlPanel, Credits } from "@components/workflow";
import React, { useState } from "react";
import { controlPanel, cube, cubePlayground, foot } from "./App.module.scss";

const App: React.FC<{}> = () => {
  const [size, setSize] = useState(3);
  const [puzzleCube, cubeDispatch] = usePuzzleCube(size);
  const [renderStyle, setCubeRenderStyle] = useState(CubeRenderStyle.Flat);

  return (
    <>
      <div className={cubePlayground}>
        <div className={controlPanel}>
          <ControlPanel
            puzzleCube={puzzleCube}
            dispatch={cubeDispatch}
            cubeSize={size}
            setCubeSize={setSize}
            renderStyle={renderStyle}
            setCubeRenderStyle={setCubeRenderStyle}
          />
        </div>

        <div className={cube}>
          <RenderedCube
            cubeData={puzzleCube}
            cubeDispatch={cubeDispatch}
            renderStyle={renderStyle}
          />
        </div>
        <div className={foot}>
          <Credits />
        </div>
      </div>
    </>
  );
};

export default App;
