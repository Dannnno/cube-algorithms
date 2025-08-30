import { Maybe } from "@/common";
import React from "react";
import { WebGLAttributeLocationList } from "./useWebGlContext";

interface IWebGlAttributeVariableProps {
  readonly gl: Maybe<WebGLRenderingContext>;
  readonly program: Maybe<WebGLProgram>;
  readonly attributeLabel: string;
  /** Attribute variables that are available to the program */
  readonly attributeVars: WebGLAttributeLocationList;
}

export const WebGlAttributeVariable: React.FC<
  IWebGlAttributeVariableProps
> = props => {
  const { gl, program, attributeLabel, attributeVars } = props;

  if (!gl || !program) {
    return;
  }

  attributeVars[attributeLabel] = gl.getAttribLocation(program, attributeLabel);

  return null;
};

export default WebGlAttributeVariable;
