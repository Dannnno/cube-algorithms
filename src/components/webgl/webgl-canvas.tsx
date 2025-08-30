import React, { useRef } from "react";
import useWebGlContext, {
  IRequiredWebGLContextResult,
  IWebGLContextProps,
} from "./useWebGlContext";
import WebGlUnsupportedWarning from "./webgl-unsupported-warning";

interface IWebGlCanvasProps {
  /** How wide the canvas should be */
  readonly width: number;
  /** How tall the canvas should be */
  readonly height: number;
  /** How to render the children */
  readonly children: (gl: IRequiredWebGLContextResult) => React.ReactNode;
}

type WebGlCanvasProps = IWebGLContextProps & IWebGlCanvasProps;

export const WebGlCanvas: React.FC<WebGlCanvasProps> = props => {
  const { width, height, children } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // gl and program will both be defined iff the browser supports it and there
  // are no errors with the shader soruce code provided
  const gl = useWebGlContext(canvasRef, props, 3);

  // You MUST render the canvas even (especially!) if gl/program aren't yet
  // defined, because otherwise we'll never attach the ref, and then never
  // be able to create them
  return (
    <>
      <WebGlUnsupportedWarning level={gl.supportLevel} />
      <canvas ref={canvasRef} width={width} height={height}>
        {!!gl.program && !!gl.gl && children(gl as IRequiredWebGLContextResult)}
      </canvas>
    </>
  );
};

export default WebGlCanvas;
