import { forceNever } from "@/common";
import { CubeSide, getCubeSize } from "@/model/cube";
import { subCubeColor } from "@/model/geometry";
import { ArcballControls } from "@react-three/drei";
import { Canvas, ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import React, { memo, useCallback, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { IReactCubeProps } from "./generic-cube";

export const Scene: React.FC<IReactCubeProps> = props => {
  const { cubeData } = props;
  const boxes: React.ReactElement[] = [];
  const cubeSize = getCubeSize(cubeData);
  const scale = 1;
  const startAt = Math.floor(cubeSize / 2);
  const [selectedNode, setSelectedNode] = useState("");
  const onPointerMiss = useCallback(() => setSelectedNode(""), []);

  for (let i = 0; i < cubeSize; ++i) {
    const x = i - startAt;
    for (let j = 0; j < cubeSize; ++j) {
      const y = j - startAt;
      for (let k = 0; k < cubeSize; ++k) {
        const z = k - startAt;
        const [left, front, right, back, top, bottom] = subCubeColor(
          cubeData,
          i,
          j,
          k,
        );
        boxes.push(
          <Box
            left={left}
            front={front}
            right={right}
            back={back}
            top={top}
            bottom={bottom}
            xPos={x}
            yPos={y}
            zPos={z}
            scale={scale}
            key={`${i}${j}${k}`}
            id={`${i}${j}${k}`}
            isSelected={selectedNode === `${i}${j}${k}`}
            setSelectedNode={setSelectedNode}
          />,
        );
      }
    }
  }
  const cameraPosition = useMemo(
    () =>
      [
        Math.sqrt(cubeSize ** 2 + cubeSize ** 2),
        1.25 * cubeSize,
        1.5 * cubeSize,
      ] as const,
    [cubeSize],
  );

  //   frameloop="demand"
  return (
    <Canvas
      camera={{ position: cameraPosition, fov: 60 }}
      onPointerMissed={onPointerMiss}
    >
      <ArcballControls />
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
  const camera = useThree(state => state.camera);
  const gl = useThree(state => state.gl);
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

const Box: React.FC<{
  readonly setSelectedNode: React.Dispatch<React.SetStateAction<string>>;
  readonly isSelected: boolean;
  readonly id: string;

  readonly scale: number;

  readonly front: CubeSide | undefined;
  readonly back: CubeSide | undefined;
  readonly left: CubeSide | undefined;
  readonly right: CubeSide | undefined;
  readonly top: CubeSide | undefined;
  readonly bottom: CubeSide | undefined;

  readonly xPos: number;
  readonly yPos: number;
  readonly zPos: number;
}> = memo(
  ({
    setSelectedNode,
    isSelected,
    id,
    scale,
    front,
    back,
    left,
    right,
    top,
    bottom,
    xPos,
    yPos,
    zPos,
  }) => {
    const [actualScale, setActualScale] = useState(scale);
    const [lastPoint, setLastPoint] = useState<THREE.Vector2 | null>(null);
    const onPointerDown = useCallback((event: ThreeEvent<PointerEvent>) => {
      event.stopPropagation();
      setSelectedNode(id);
      console.log("DOWN", event.pointer);
      setLastPoint(event.pointer.clone());
    }, []);
    const onPointerUp = useCallback(
      (event: ThreeEvent<PointerEvent>) => {
        if (!lastPoint) {
          return;
        }
        event.stopPropagation();
        console.log(
          "UP",
          lastPoint,
          event.pointer,
          event.pointer.distanceTo(lastPoint),
        );
        setLastPoint(null);
      },
      [lastPoint],
    );
    const meshRef = useRef<THREE.Mesh>(null);
    const lineRef = useRef<THREE.LineSegments>(null);

    useFrame((_state, delta) => {
      if (!isSelected) {
        return;
      }
      meshRef.current!.rotateX(delta);
      lineRef.current!.rotateX(delta);
    });

    const scenePosition = [
      actualScale * xPos,
      actualScale * yPos,
      actualScale * zPos,
    ] as const;
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1).toNonIndexed();
    const position = boxGeometry.getAttribute("position");
    const numVertices = position.count / 6;
    const color = new THREE.Color();
    const colorOrder = [right, left, top, bottom, front, back];

    const colors = [];
    for (let i = 0; i < 6; ++i) {
      color.set(translateSideToColor(colorOrder[i]));
      for (let j = 0; j < numVertices; ++j) {
        colors.push(color.r, color.g, color.b);
      }
    }
    boxGeometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(colors, 3),
    );

    return (
      <>
        <mesh
          ref={meshRef}
          position={scenePosition}
          scale={actualScale}
          geometry={boxGeometry}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          <meshBasicMaterial vertexColors />
        </mesh>
        <lineSegments
          ref={lineRef}
          position={scenePosition}
          scale={actualScale}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          <edgesGeometry args={[boxGeometry, 1]} />
          <lineBasicMaterial color="black" />
        </lineSegments>
      </>
    );
  },
);

function translateSideToColor(
  side: CubeSide | undefined,
): THREE.ColorRepresentation {
  switch (side) {
    case CubeSide.Front:
      return "blue";
    case CubeSide.Back:
      return "green";
    case CubeSide.Left:
      return "red";
    case CubeSide.Right:
      return 0xf28c28;
    case CubeSide.Top:
      return "white";
    case CubeSide.Bottom:
      return "yellow";
    case undefined:
      return "black";
    default:
      forceNever(side);
  }
}
