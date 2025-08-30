import { Maybe } from "@/common";
import React from "react";
import { WebGLUniformLocationList } from "./useWebGlContext";

interface IWebGlUniformVariableProps {
  readonly gl: Maybe<WebGLRenderingContext>;
  readonly program: Maybe<WebGLProgram>;
  readonly uniformVarLabel: string;
  /** Attribute variables that are available to the program */
  readonly uniformVars: WebGLUniformLocationList;
}

export const WebGlUniformVariable: React.FC<
  IWebGlUniformVariableProps
> = props => {
  const { gl, program, uniformVarLabel, uniformVars } = props;

  if (!gl || !program) {
    return;
  }

  uniformVars[uniformVarLabel] = gl.getUniformLocation(
    program,
    uniformVarLabel,
  );

  return null;
};

export default WebGlUniformVariable;
