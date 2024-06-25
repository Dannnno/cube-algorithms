import React, { useState, useCallback } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import styles, { logo, react, card } from './App.module.scss';
import FlatCube from "./components/flat-cube";
import Cube from "./models/geometry.ts";

const App: React.FC<{}> = () => {
  const [count, setCount] = useState(0)
  const increment = useCallback(() => setCount(count => count + 1));
  const [cube, setCube] = useState(new Cube(3));

  return (
    <>
      <FlatCube cube={cube} />
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className={logo} alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className={`${logo} ${react}`} alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className={card}>
        <button onClick={increment}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className={styles["read-the-docs"]}>
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
};

export default App;
