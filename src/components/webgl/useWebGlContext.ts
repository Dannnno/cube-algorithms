import { Maybe, Tuple } from "@/common";
import useTimer from "@/hooks/useTimer";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { WebGlUnsupportedLevel } from "./webgl-unsupported-warning";

export type RGBA = Tuple<number, 4>;

/**
 * Render one frame of the animation
 * @param currentTime Time (in ms) since start was called
 * @param timeSinceLastCall Time (in ms) since the last time this function was called
 */
type Animate = (currentTime: number, timeSinceLastCall: number) => void;

/**
 * Properties used to create and initialize a WebGl Program and context
 */
export interface IWebGLContextProps {
  /** The source code for the vertex shader */
  readonly vertexSource: string;
  /** The source code for the fragment shader */
  readonly fragmentSource: string;
  /** The clear color to reset the scene with. Defaults to black. */
  readonly clearColor?: RGBA;
  /** Function that can render the scene */
  //   readonly render: Animate;
}

/** List of buffers (name-indexed) that are known to the program */
export type WebGLBufferList = Record<string, WebGLBuffer>;
/** List of attribute variable locations (name-indexed) in the program */
export type WebGLAttributeLocationList = Record<string, number>;
/** List of uniform variable locations (name-indexed) in the program */
export type WebGLUniformLocationList = Record<
  string,
  Maybe<WebGLUniformLocation>
>;
/**
 * The overall program context
 */
export interface IWebGLContextResult {
  /** WebGL context object */
  readonly gl: Maybe<WebGLRenderingContext>;
  /** WebGL program object */
  readonly program: Maybe<WebGLProgram>;
  /** Level of detected WebGL support */
  readonly supportLevel: WebGlUnsupportedLevel;
  /** Request an animation frame */
  readonly startRender: () => void;
  /** Buffers that are available to the program */
  readonly buffers: WebGLBufferList;
  /** Attribute variables that are available to the program */
  readonly attributeVars: WebGLAttributeLocationList;
  /** Uniform variables that are available to the program */
  readonly uniformVars: WebGLUniformLocationList;
}
/**
 * The overall program context
 */
export interface IRequiredWebGLContextResult {
  /** WebGL context object */
  readonly gl: WebGLRenderingContext;
  /** WebGL program object */
  readonly program: WebGLProgram;
  /** Level of detected WebGL support */
  readonly supportLevel: WebGlUnsupportedLevel;
  /** Request an animation frame */
  readonly startRender: () => void;
  /** Buffers that are available to the program */
  readonly buffers: WebGLBufferList;
  /** Attribute variables that are available to the program */
  readonly attributeVars: WebGLAttributeLocationList;
  /** Uniform variables that are available to the program */
  readonly uniformVars: WebGLUniformLocationList;
}

/**
 * Use WebGL context in a React app
 * @param canvasRef Reference to the canvas that WebGL will be running in
 * @param glProps Properties to initialize the WebGL program and context
 * @param webGlTimeout How long to wait for confirmation that WebGL is supported
 * @returns The WebGL context/program
 */
export function useWebGlContext(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  glProps: IWebGLContextProps,
  webGlTimeout: number = 3,
): IWebGLContextResult {
  const {
    vertexSource,
    fragmentSource,
    clearColor = [0, 0, 0, 1],
    render: doRender,
  } = glProps;
  const [_isDisposed, setIsDisposed] = useState(false);
  const [gl, setGl] = useState<Maybe<WebGLRenderingContext>>(null);
  const [program, setProgram] = useState<Maybe<WebGLProgram>>(null);
  const [supportLevel, setSupportLevel] = useState<WebGlUnsupportedLevel>(
    WebGlUnsupportedLevel.UnknownSupport,
  );
  const [startAnimateTime, setStartAnimateTime] = useState(0);
  const [_lastRenderTime, setLastRenderTime] = useState(0);
  const [_lastAnimationFrame, setLastAnimationFrame] = useState(-1);

  const onWebGlTimeout = useCallback(
    () => setSupportLevel(WebGlUnsupportedLevel.KnownNotSupported),
    [],
  );
  const cancelTimer = useTimer(webGlTimeout, onWebGlTimeout);

  useLayoutEffect(() => setGl(canvasRef.current?.getContext?.("webgl")), []);

  useEffect(() => {
    let shaderProgram: Maybe<WebGLProgram> = null;
    if (gl) {
      cancelTimer({ cancel: true });
      setIsDisposed(false);
      setSupportLevel(WebGlUnsupportedLevel.KnownSupported);
      const [r, g, b, a] = clearColor;
      gl.clearColor(r, g, b, a);
      gl.clear(gl.COLOR_BUFFER_BIT);
      shaderProgram = initShaderProgram(gl, vertexSource, fragmentSource);
      setProgram(shaderProgram);
    }
    return () =>
      setIsDisposed(isAlreadyDisposed => {
        if (!isAlreadyDisposed && gl && shaderProgram) {
          const shaders = gl.getAttachedShaders(shaderProgram) ?? [];
          for (const shader of shaders) {
            gl.detachShader(shaderProgram, shader);
          }
          for (const shader of shaders) {
            gl.deleteShader(shader);
          }
          gl.deleteProgram(shaderProgram);
        }
        setLastAnimationFrame(actualLastFrame => {
          if (actualLastFrame >= 0) {
            cancelAnimationFrame(actualLastFrame);
          }
          return -1;
        });
        return true;
      });
  }, [gl, cancelTimer, clearColor, vertexSource, fragmentSource]);

  const render = useCallback(
    (now: DOMHighResTimeStamp): void => {
      setLastRenderTime(lastLastRenderTime => {
        doRender(now - startAnimateTime, now - lastLastRenderTime);
        setLastAnimationFrame(requestAnimationFrame(render));
        return now;
      });
    },
    [doRender, startAnimateTime],
  );

  const firstRender = useCallback(
    (now: DOMHighResTimeStamp): void => {
      setLastRenderTime(now);
      setStartAnimateTime(now);
      requestAnimationFrame(render);
    },
    [render],
  );

  const startRender = useCallback(() => {
    setLastRenderTime(0);
    setStartAnimateTime(0);
    requestAnimationFrame(firstRender);
  }, [firstRender]);

  return {
    supportLevel,
    gl,
    program,
    startRender,
    buffers: {},
    attributeVars: {},
    uniformVars: {},
  };
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
  type: number,
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

export default useWebGlContext;
