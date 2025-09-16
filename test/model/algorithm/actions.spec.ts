import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { cross } from "../../../src/common";
import { CubeActionType } from "../../../src/components/cubes";
import { _getCleanAlgorithmSteps } from "../../../src/model/algorithm";
import { _getActionSemantics } from "../../../src/model/algorithm/actions";
import { _getAlgorithmParser } from "../../../src/model/algorithm/parser";
import { CubeSide } from "../../../src/model/cube";
import { RotationAmount } from "../../../src/model/geometry";
import { CubeCommands, fcCompareActionWithActual } from "../utility";
import { fcAlgCubeSize, fcAlgorithmText } from "./fcAlgorithm";

describe("_getActionSemantics", () => {
  it("should be able to parse valid generated expressions", () =>
    fc.assert(
      fc.property(fcAlgorithmText, alg => {
        const parser = _getAlgorithmParser();
        const semantics = _getActionSemantics(parser);
        const match = parser.match(alg);
        const adapter = semantics(match);
        const result = adapter.execute();
        expect(result.length).toBe(_getCleanAlgorithmSteps(alg).length);
      }),
    ));

  describe("Face Rotations (Exhaustive)", () => {
    const cubeSides = [
      CubeSide.Front,
      CubeSide.Top,
      CubeSide.Right,
      CubeSide.Back,
      CubeSide.Left,
      CubeSide.Bottom,
    ];
    const cubeRot = [
      RotationAmount.Clockwise,
      RotationAmount.Halfway,
      RotationAmount.CounterClockwise,
    ];
    const faces = ["F", "U", "R", "B", "L", "D"];
    const rotations = ["", "2", "'"];

    const tests = cross(faces, rotations);
    const expected = cross(cubeSides, cubeRot);

    const cases = tests.map(([face, rot], ix) => ({
      step: `${face}${rot}`,
      action: expected[ix],
    }));

    it.each(cases)("Should get an action for $step", ({ step, action }) => {
      const parser = _getAlgorithmParser();
      const semantics = _getActionSemantics(parser);
      const match = parser.match(step);
      const adapter = semantics(match);
      const actualActions = adapter.execute();
      expect(actualActions.length).toBe(1);
      expect(actualActions[0].type).toBe(CubeActionType.RotateFace);
      expect(actualActions[0].sideId).toBe(action[0]);
      expect(actualActions[0].rotationCount).toBe(action[1]);
    });

    it("Should be equivalent to an action", () =>
      fc.assert(
        fc.property(
          fc.nat({ max: cases.length - 1 }),
          fcAlgCubeSize,
          fc.commands(CubeCommands, { size: "xsmall" }),
          (caseIx, cubeSize, cmds) => {
            const { step, action } = cases[caseIx];
            fcCompareActionWithActual(cubeSize, cmds, step, [
              {
                type: CubeActionType.RotateFace,
                sideId: action[0],
                rotationCount: action[1],
              },
            ]);
          },
        ),
      ));
  });
});
