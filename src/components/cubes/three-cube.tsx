import { DeepReadonly, forceNever, Tuple } from "@/common";
import { CubeSide, getCubeSize } from "@/model/cube";
import { subCubeColor } from "@/model/geometry";
import { Canvas } from "@react-three/fiber";
import React, { useCallback, useRef, useState } from "react";
import * as THREE from "three";
import { IReactCubeProps } from "./generic-cube";
import { usePuzzleCubeHash } from "./usePuzzleCube";

export const Scene: React.FC<IReactCubeProps> = props => {
  const { cubeData } = props;
  usePuzzleCubeHash(cubeData);
  const boxes: React.ReactElement[] = [];
  const cubeSize = getCubeSize(cubeData);
  const scale = 1; //6 / cubeSize;
  const startAt = Math.floor(cubeSize / 2);
  for (let i = 0; i < cubeSize; ++i) {
    const x = i - startAt;
    for (let j = 0; j < cubeSize; ++j) {
      const y = j - startAt;
      for (let k = 0; k < cubeSize; ++k) {
        const z = k - startAt;
        boxes.push(
          <Box
            scenePosition={[scale * x, scale * y, scale * z]}
            sideColors={subCubeColor(cubeData, i, j, k)}
            scale={scale}
          />,
        );
      }
    }
  }
  return (
    <Canvas
      frameloop="demand"
      camera={{
        position: [
          Math.sqrt(cubeSize ** 2 + cubeSize ** 2),
          1.25 * cubeSize,
          1.5 * cubeSize,
        ],
        fov: 60,
      }}
    >
      <CanvasHelpers cubeSize={cubeSize} />
      <ambientLight intensity={Math.PI / 2} />
      <spotLight
        position={[10 * scale, 10 * scale, 10 * scale]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={Math.PI}
      />
      <pointLight
        position={[-10 * scale, -10 * scale, -10 * scale]}
        decay={0}
        intensity={Math.PI}
      />
      {boxes}
    </Canvas>
  );
};

const CanvasHelpers: React.FC<{ readonly cubeSize: number }> = ({
  cubeSize,
}) => {
  const [showHelpers, setShowHelpers] = useState(false);
  //   const camera = useThree(state => state.camera);
  return (
    <>
      {showHelpers && (
        <>
          {/* {camera && <cameraHelper camera={camera} />} */}
          <gridHelper
            args={[Math.ceil(cubeSize * 1.5), Math.ceil(cubeSize * 1.5)]}
          />
          <axesHelper args={[Math.ceil(cubeSize * 1.25)]} />
        </>
      )}
    </>
  );
};

type Position = DeepReadonly<Tuple<number, 3>>;

const Box: React.FC<{
  readonly scenePosition: Position;
  readonly sideColors: DeepReadonly<Tuple<CubeSide | undefined, 6>>;
  readonly scale: number;
}> = props => {
  const { scenePosition, sideColors, scale } = props;
  const boxRef = useRef<THREE.BoxGeometry>(null);

  const onUpdate = useCallback(
    (box: THREE.BoxGeometry) => {
      box.toNonIndexed();
      const position = box.getAttribute("position");
      const numVertices = position.count / 6;
      const cubeColors = translateSidesToColors(sideColors);

      const colors = [];
      for (let i = 0; i < 6; ++i) {
        const color = new THREE.Color(cubeColors[i]);
        for (let j = 0; j < numVertices; ++j) {
          colors.push(color.r, color.g, color.b);
        }
      }
      box.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    },
    [sideColors],
  );

  return (
    <>
      <mesh position={scenePosition} scale={scale}>
        <boxGeometry ref={boxRef} args={[1, 1, 1]} onUpdate={onUpdate} />
        <meshPhongMaterial vertexColors />
      </mesh>
      <lineSegments position={scenePosition} scale={scale}>
        <edgesGeometry args={[boxRef.current, 1]} />
        <lineBasicMaterial color={"black"} />
      </lineSegments>
    </>
  );
};

function translateSidesToColors(
  sides: DeepReadonly<Tuple<CubeSide | undefined, 6>>,
): Tuple<THREE.Color, 6> {
  const [left, front, right, back, top, bottom] = sides;
  const swizzled = [right, left, top, bottom, front, back];
  return swizzled.map(translateSideToColor) as Tuple<THREE.Color, 6>;
}

function translateSideToColor(side: CubeSide | undefined): THREE.Color {
  switch (side) {
    case CubeSide.Front:
      return new THREE.Color("blue");
    case CubeSide.Back:
      return new THREE.Color("green");
    case CubeSide.Left:
      return new THREE.Color("red");
    case CubeSide.Right:
      return new THREE.Color(0xf28c28);
    case CubeSide.Top:
      return new THREE.Color("white");
    case CubeSide.Bottom:
      return new THREE.Color("yellow");
    case undefined:
      return new THREE.Color("black");
    default:
      forceNever(side);
  }
}
