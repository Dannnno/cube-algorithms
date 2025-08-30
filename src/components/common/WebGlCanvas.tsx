import { forceNever, Tuple } from "@/common";
import { useTimer } from "@/hooks/useTimer";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
} from "react";

export enum WebGlContextLevel {
  Level1 = "webgl",
}

type RGBA = Tuple<number, 4>;

/**
 * Information about a WebGL Program
 */
export interface IWebGLDrawingProps {
  /** The WebGL rendering context, used to issue WebGL API calls */
  readonly gl: WebGLRenderingContext;
  /** The current WebGL program being executed */
  readonly program: WebGLProgram;
  /** Locations of generic vertex attribute variables in the shader program(s) */
  readonly attribLocations: Record<string, number>;
  /** Uniform variable locations in the WebGL program */
  readonly uniformLocations: Record<string, WebGLUniformLocation | null>;
  /** Buffers we can access during the WebGL drawing program */
  readonly buffers: Record<string, WebGLBuffer>;
}

interface IWebGlCanvasProps {
  readonly level: WebGlContextLevel;
  readonly vertexSource: string;
  readonly fragmentSource: string;
  readonly clearColor?: RGBA;

  readonly children: (props: IWebGLDrawingProps) => React.ReactNode;
}
type ReactCanvasProps = React.DetailedHTMLProps<
  React.CanvasHTMLAttributes<HTMLCanvasElement>,
  HTMLCanvasElement
>;
type WebGlCanvasProps = Omit<ReactCanvasProps, keyof IWebGlCanvasProps>
  & IWebGlCanvasProps;

function useWebGlContext(
  canvasRef: React.RefObject<HTMLCanvasElement>,
): [Partial<IWebGLDrawingProps>, React.Dispatch<Partial<IWebGLDrawingProps>>] {
  return useReducer(webGlReducer, canvasRef, makeWebGlReducer);
}

export const WebGlCanvas: React.FC<WebGlCanvasProps> = props => {
  const {
    level,
    children,
    width,
    height,
    clearColor = [0, 0, 0, 1],
    vertexSource,
    fragmentSource,
  } = props;
  const [gl, setGl] = useState<WebGLRenderingContext | null | undefined>();
  const [glProgram, setGlProgram] = useState<WebGLProgram | null | undefined>();
  const [_isDeleted, setIsDeleted] = useState(false);

  // Warn if WebGL isn't supported
  const [warningLevel, setWarningLevel] = useState<0 | 1>(0);
  const updateWarningCallback = useCallback(
    () => setWarningLevel(1),
    [setWarningLevel],
  );
  const timerCallback = useTimer(3, updateWarningCallback);

  // Setup WebGL
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => setGl(canvasRef.current?.getContext?.(level, {})), []);
  useEffect(() => {
    let program: WebGLProgram | undefined | null = null;
    if (gl) {
      timerCallback(); // Cancel our warning
      gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
      gl.clear(gl.COLOR_BUFFER_BIT);
      program = initShaderProgram(gl, vertexSource, fragmentSource);
      setGlProgram(program);
      setIsDeleted(false);
    }
    return () => cleanupWebGlContext(gl, program, setIsDeleted);
  }, [gl, setGlProgram, vertexSource, fragmentSource, setIsDeleted]);

  const warning = !!gl ? null : warningLevel === 0 ? (
    <p>Loading WebGL rendering engine...</p>
  ) : warningLevel === 1 ? (
    <p>
      Loading WebGL rendering engine...
      <br />
      <i>This is taking a while - your browser might not support it!</i>
    </p>
  ) : (
    forceNever(warningLevel)
  );

  return (
    <>
      {warning}
      <canvas width={width} height={height} ref={canvasRef}>
        {!!gl && !!glProgram && children(gl, glProgram)}
      </canvas>
    </>
  );
};

function cleanupWebGlContext(
  gl: WebGLRenderingContext | undefined | null,
  program: WebGLProgram | undefined | null,
  setIsDeleted: React.Dispatch<React.SetStateAction<boolean>>,
): void {
  setIsDeleted(isCurDeleted => {
    if (!isCurDeleted && gl && program) {
      const shaders = gl.getAttachedShaders(program) ?? [];
      for (const shader of shaders) {
        gl.detachShader(program, shader);
      }
      for (const shader of shaders) {
        gl.deleteShader(shader);
      }
      gl.deleteProgram(program);
    }
    return true;
  });
}

function initShaderProgram(
  gl: WebGLRenderingContext,
  vsSource: string,
  fsSource: string,
): WebGLProgram | null {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  if (!vertexShader) {
    return null;
  }
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
  if (!fragmentShader) {
    gl.deleteShader(vertexShader);
    return null;
  }
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error(
      `Unable to initialize the shader program: ${gl.getProgramInfoLog(
        shaderProgram,
      )}`,
    );
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }
  return shaderProgram;
}

function loadShader(
  gl: WebGLRenderingContext,
  type: ShaderType,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) {
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(
      `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`,
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

const enum ShaderType {
  VERTEX_SHADER = 35633,
  FRAGMENT_SHADER = 35632,
}
