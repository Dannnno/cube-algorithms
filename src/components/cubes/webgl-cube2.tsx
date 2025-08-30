import { Tuple } from "@/common";
import { WebGlBuffer, WebGlCanvas } from "../webgl";
import { IRequiredWebGLContextResult, RGBA } from "../webgl/useWebGlContext";

interface IWebGlCubeProps {}
export const WebGlCube: React.FC<IWebGlCubeProps> = props => {
  const vSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `;
  const fSource = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
  `;
  return (
    <WebGlCanvas
      width={1024}
      height={512}
      vertexSource={vSource}
      fragmentSource={fSource}
    >
      {glWrapper => <_WebGlCube {...glWrapper} />}
    </WebGlCanvas>
  );
};

const _WebGlCube: React.FC<IRequiredWebGLContextResult> = props => {
  const { gl, program, buffers, attributeVars, uniformVars } = props;
  const positionBuffer = [
    // Front face
    -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
    // Back face
    -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,
    // Top face
    -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,
    // Bottom face
    -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
    // Right face
    1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,
    // Left face
    -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0,
  ];

  const faceColors: Tuple<RGBA, 6> = [
    [0.0, 0.0, 1.0, 1.0], // Front face: blue
    [0.0, 1.0, 0.0, 1.0], // Back face: green
    [1.0, 1.0, 1.0, 1.0], // Top face: white
    [1.0, 1.0, 0.0, 1.0], // Bottom face: yellow
    [1.0, 0.5, 0.0, 1.0], // Right face: orange
    [1.0, 0.0, 0.0, 1.0], // Left face: red
  ];
  // Convert the array of colors into a table for all the vertices.
  let colors: number[] = [];
  for (const c of faceColors) {
    // Repeat each color four times for the four vertices of the face
    colors = colors.concat(c, c, c, c);
  }

  // prettier-ignore
  const indices = [
     0,  1,  2,      0,  2,  3,    // front
     4,  5,  6,      4,  6,  7,    // back
     8,  9,  10,     8,  10, 11,   // top
     12, 13, 14,     12, 14, 15,   // bottom
     16, 17, 18,     16, 18, 19,   // right
     20, 21, 22,     20, 22, 23,   // left
  ];
  return (
    <>
      <WebGlBuffer
        bufferLabel="position"
        buffers={buffers}
        gl={gl}
        program={program}
        values={positionBuffer}
        constructor={Float32Array}
      />
      <WebGlBuffer
        bufferLabel="color"
        buffers={buffers}
        gl={gl}
        program={program}
        values={colors}
        constructor={Float32Array}
      />
      <WebGlBuffer
        bufferLabel="indices"
        buffers={buffers}
        gl={gl}
        program={program}
        values={indices}
        constructor={Uint16Array}
      />
    </>
  );
};
export default WebGlCube;
