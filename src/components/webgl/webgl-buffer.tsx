import { Maybe } from "@/common";
import React from "react";
import { WebGLBufferList } from "./useWebGlContext";

interface IWebGlBufferProps {
  readonly gl: Maybe<WebGLRenderingContext>;
  readonly program: Maybe<WebGLProgram>;
  readonly bufferLabel: string;
  /** Buffers that are available to the program */
  readonly buffers: WebGLBufferList;
  readonly values: readonly number[];
  readonly constructor: Uint16ArrayConstructor | Float32ArrayConstructor;
}

export const WebGlBuffer: React.FC<IWebGlBufferProps> = props => {
  const { gl, program, values, bufferLabel, buffers, constructor } = props;

  if (!gl || !program) {
    return;
  }

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new constructor(values), gl.STATIC_DRAW);
  buffers[bufferLabel] = buffer;

  return null;
};

export default WebGlBuffer;
