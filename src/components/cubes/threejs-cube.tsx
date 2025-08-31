import { forceNever, Maybe } from "@/common";
import { CubeCellValue, forEachBlockInCube } from "@/model/cube";
import { Canvas, ThreeElements, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import useMeasure from "react-use-measure";
import * as THREE from "three";
import { IReactCubeProps } from "./generic-cube";

const Box: React.FC<ThreeElements["mesh"] & { color: string[] }> = props => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (!meshRef.current) {
      return;
    }
    // meshRef.current.rotation.x += delta;
    // meshRef.current.rotation.y += delta;
    // meshRef.current.rotation.z += delta;
  });
  const count = 6;
  let soFar = 0 - count;
  return (
    <mesh {...props} ref={meshRef} scale={0.5}>
      <boxGeometry
        args={[1, 1, 1]}
        groups={[
          { start: (soFar += count), count, materialIndex: 2 },
          { start: (soFar += count), count, materialIndex: 0 },
          { start: (soFar += count), count, materialIndex: 4 },
          { start: (soFar += count), count, materialIndex: 5 },
          { start: (soFar += count), count, materialIndex: 1 },
          { start: (soFar += count), count, materialIndex: 3 },
        ]}
      />
      {props.color.map((color, ix) => (
        <meshBasicMaterial color={color} key={ix} attach={`material-${ix}`} />
      ))}
    </mesh>
  );
};

function sideToColor(
  side: Maybe<CubeCellValue>,
): "red" | "blue" | "orange" | "black" | "green" | "white" | "yellow" {
  switch (side) {
    case 1:
      return "red";
    case 2:
      return "blue";
    case 3:
      return "orange";
    case 4:
      return "green";
    case 5:
      return "white";
    case 6:
      return "yellow";
    case undefined:
    case null:
      return "black";
    default:
      forceNever(side);
  }
}

export const ThreeJsCube: React.FC<IReactCubeProps> = props => {
  const { cubeData } = props;
  const [ref, bounds] = useMeasure();
  const boxes: React.ReactNode[] = [];
  forEachBlockInCube(cubeData, (sides, [depth, row, col]) =>
    boxes.push(
      <Box
        key={`${depth}|${row}|${col}`}
        position={[row, col, depth]}
        color={sides.map(sideToColor)}
      />,
    ),
  );
  return (
    <Canvas
      fallback={
        <p>Sorry, WebGL is not supported. Pick a different rendering mode.</p>
      }
      ref={ref}
    >
      <perspectiveCamera
        args={[45, 2, 1, 1000]}
        position={[3, 4, 5]}
        attach="scene"
      />
      <ambientLight intensity={Math.PI / 2} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={Math.PI}
      />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      {...boxes}
    </Canvas>
  );
};
