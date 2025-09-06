import fc from "fast-check";
import { describe, it } from "vitest";
import { CubeCommands, fcCubeSizes, getTestCube } from "../utility";

describe("puzzle cubes with composed actions", () => {
  it("should always have a valid cube", () =>
    fc.assert(
      fc.property(fcCubeSizes, fc.commands(CubeCommands), (cubeSize, cmds) => {
        const s = () => ({
          model: { cubeSize, commandList: [] },
          real: getTestCube(cubeSize),
        });
        fc.modelRun(s, cmds);
      }),
    ));
});
