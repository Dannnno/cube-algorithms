import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { cross, zip } from "../../../src/common";
import {
  CubeActionType,
  CubeActions,
  ICubeRotateFaceAction,
  ICubeRotateFaceDeepAction,
  ICubeRotateSliceAction,
} from "../../../src/components/cubes";
import { _getCleanAlgorithmSteps } from "../../../src/model/algorithm";
import { _getActionSemantics } from "../../../src/model/algorithm/actions";
import { _getAlgorithmParser } from "../../../src/model/algorithm/parser";
import { CubeSide, SliceDirection } from "../../../src/model/cube";
import { RotationAmount } from "../../../src/model/geometry";
import {
  CubeCommands,
  checkAllActionInvariants,
  fcCompareActionWithActual,
} from "../utility";
import { fcAlgCubeSize, fcAlgorithmText } from "./fcAlgorithm";

describe("_getActionSemantics", () => {
  it("should be able to parse valid generated expressions", () =>
    fc.assert(
      fc.property(fcAlgorithmText, ({ algorithm }) => {
        const [result, cleanSteps] = _parseAndExecute(algorithm);
        expect(result.length).toBe(cleanSteps.length);
        checkAllActionInvariants(result);
      }),
    ));

  describe("Face Rotations (Exhaustive)", () => {
    const expected = _crossFaceActions();
    const algorithmSteps = _crossAlgSteps(["F", "U", "R", "B", "L", "D"]);
    const cases = _getTestCases(algorithmSteps, expected);

    it.each(cases)("Should get an action for $step", ({ step, action }) => {
      const [actualActions, ..._] = _parseAndExecute(step);
      expect(actualActions).toStrictEqual([action]);
      checkAllActionInvariants(actualActions);
    });

    it("Should be equivalent to an action", () =>
      fc.assert(
        fc.property(
          fc.nat({ max: cases.length - 1 }),
          fcAlgCubeSize,
          fc.commands(CubeCommands, { size: "xsmall" }),
          (caseIx, cubeSize, cmds) => {
            const { step, action } = cases[caseIx];
            fcCompareActionWithActual(cubeSize, cmds, step, [action]);
          },
        ),
      ));
  });

  describe("Slice Rotations (Exhaustive)", () => {
    const actions: Omit<ICubeRotateSliceAction, "rotationCount">[] = [
      {
        type: CubeActionType.RotateSlice,
        axis: "Y",
        refSide: CubeSide.Front,
        direction: SliceDirection.Down,
      },
      {
        type: CubeActionType.RotateSlice,
        axis: "X",
        refSide: CubeSide.Left,
        direction: SliceDirection.Right,
      },
      {
        type: CubeActionType.RotateSlice,
        axis: "Z",
        refSide: CubeSide.Left,
        direction: SliceDirection.Up,
      },
    ];
    const tests = _crossAlgSteps(["M", "E", "S"]);
    const expected = _crossSliceActions(actions);
    const cases = _getTestCases(tests, expected);

    it.each(cases)("Should get an action for $step", ({ step, action }) => {
      const [actualActions, ..._] = _parseAndExecute(step);
      expect(actualActions).toStrictEqual([action]);
      checkAllActionInvariants(actualActions);
    });

    it("Should be equivalent to an action", () =>
      fc.assert(
        fc.property(
          fc.nat({ max: cases.length - 1 }),
          fcAlgCubeSize.filter(v => v > 2),
          fc.commands(CubeCommands, { size: "xsmall" }),
          (caseIx, cubeSize, cmds) => {
            const { step, action } = cases[caseIx];
            fcCompareActionWithActual(cubeSize, cmds, step, [action]);
          },
        ),
      ));
  });

  describe("Cube Rotations (Exhaustive)", () => {
    // NOTE THE DIFFERENCE: algorithm terminology is different from the axis
    // labels I picked when I started developing this, and its too much work to
    // change it now
    const axes = ["Y", "X", "Z", "Y", "X", "Z"];
    const cubeRot = [
      RotationAmount.Clockwise,
      RotationAmount.Halfway,
      RotationAmount.CounterClockwise,
    ];
    const tests = _crossAlgSteps(["X", "Y", "Z", "x", "y", "z"]);
    const expected = cross(axes, cubeRot).map(
      ([axis, rotationCount]) =>
        ({ type: CubeActionType.RotateCube, axis, rotationCount }) as const,
    );
    const cases = _getTestCases(tests, expected);

    it.each(cases)("Should get an action for $step", ({ step, action }) => {
      const [actualActions, ..._] = _parseAndExecute(step);
      expect(actualActions).toStrictEqual([action]);
      checkAllActionInvariants(actualActions);
    });

    it("Should be equivalent to an action", () =>
      fc.assert(
        fc.property(
          fc.nat({ max: cases.length - 1 }),
          fcAlgCubeSize,
          fc.commands(CubeCommands, { size: "xsmall" }),
          (caseIx, cubeSize, cmds) => {
            const { step, action } = cases[caseIx];
            fcCompareActionWithActual(cubeSize, cmds, step, [action]);
          },
        ),
      ));
  });

  describe("Deep Turns (Exhaustive)", () => {
    describe("3x3 Deep Turns", () => {
      const tests = _crossAlgSteps(["f", "u", "r", "b", "l", "d"]);
      const expectedActions = _crossDeepFaceActions([1]);
      const cases = _getTestCases(tests, expectedActions);

      it.each(cases)("Should get an action for $step", ({ step, action }) => {
        const [actualActions, ..._] = _parseAndExecute(step);
        expect(actualActions).toStrictEqual([action]);
        checkAllActionInvariants(actualActions);
      });

      it("Should be equivalent to an action", () =>
        fc.assert(
          fc.property(
            fc.nat({ max: cases.length - 1 }),
            fcAlgCubeSize.filter(size => size > 2),
            fc.commands(CubeCommands, { size: "xsmall" }),
            (caseIx, cubeSize, cmds) => {
              const { step, action } = cases[caseIx];
              fcCompareActionWithActual(cubeSize, cmds, step, [action]);
            },
          ),
        ));
    });

    describe("3x3 Deep Turns - Japanese Notation", () => {
      const tests = _crossAlgSteps(["Fw", "Uw", "Rw", "Bw", "Lw", "Dw"]);
      const expectedActions = _crossDeepFaceActions([1]);
      const cases = _getTestCases(tests, expectedActions);

      it.each(cases)("Should get an action for $step", ({ step, action }) => {
        const [actualActions, ..._] = _parseAndExecute(step);
        expect(actualActions).toStrictEqual([action]);
        checkAllActionInvariants(actualActions);
      });

      it("Should be equivalent to an action", () =>
        fc.assert(
          fc.property(
            fc.nat({ max: cases.length - 1 }),
            fcAlgCubeSize.filter(size => size > 2),
            fc.commands(CubeCommands, { size: "xsmall" }),
            (caseIx, cubeSize, cmds) => {
              const { step, action } = cases[caseIx];
              fcCompareActionWithActual(cubeSize, cmds, step, [action]);
            },
          ),
        ));
    });

    describe("4x4 Deep Turns LaTeX Subscripts", () => {
      const subscripts = [2, 3, 4, 5];
      const tests = _crossAlgSteps(
        cross(["F", "U", "R", "B", "L", "D"], subscripts).map(
          ([face, sub]) => `${face}_${sub}`,
        ),
      );
      const expectedActions = _crossDeepFaceActions(subscripts.map(v => v - 1));
      const cases = _getTestCases(tests, expectedActions);

      it.each(cases)("Should get an action for $step", ({ step, action }) => {
        const [actualActions, ..._] = _parseAndExecute(step);
        expect(actualActions).toStrictEqual([action]);
        checkAllActionInvariants(actualActions);
      });

      it("Should be equivalent to an action", () =>
        fc.assert(
          fc.property(
            fc
              .tuple(
                fc.nat({ max: cases.length - 1 }),
                fcAlgCubeSize.filter(size => size > 2),
              )
              .filter(
                ([caseIx, cubeSize]) =>
                  (cases[caseIx].action as ICubeRotateFaceDeepAction).depth
                  < cubeSize - 1,
              ),
            fc.commands(CubeCommands, { size: "xsmall" }),
            ([caseIx, cubeSize], cmds) => {
              const { step, action } = cases[caseIx];
              fcCompareActionWithActual(cubeSize, cmds, step, [action]);
            },
          ),
        ));
    });

    describe("4x4 Deep Turns Unicode Subscripts", () => {
      const subscripts = [2, 3, 4, 5];
      const tests = _crossAlgSteps(
        cross(["F", "U", "R", "B", "L", "D"], subscripts).map(
          ([face, sub]) => `${face}${String.fromCodePoint(8320 + sub)}`, // \u2080 === 8320 in base10
        ),
      );
      const expectedActions = _crossDeepFaceActions(subscripts.map(v => v - 1));
      const cases = _getTestCases(tests, expectedActions);

      it.each(cases)("Should get an action for $step", ({ step, action }) => {
        const [actualActions, ..._] = _parseAndExecute(step);
        expect(actualActions).toStrictEqual([action]);
        checkAllActionInvariants(actualActions);
      });

      it("Should be equivalent to an action", () =>
        fc.assert(
          fc.property(
            fc
              .tuple(
                fc.nat({ max: cases.length - 1 }),
                fcAlgCubeSize.filter(size => size > 2),
              )
              .filter(
                ([caseIx, cubeSize]) =>
                  (cases[caseIx].action as ICubeRotateFaceDeepAction).depth
                  < cubeSize - 1,
              ),
            fc.commands(CubeCommands, { size: "xsmall" }),
            ([caseIx, cubeSize], cmds) => {
              const { step, action } = cases[caseIx];
              fcCompareActionWithActual(cubeSize, cmds, step, [action]);
            },
          ),
        ));
    });

    describe("5x5 Deep Turns Prefixed", () => {
      const subscripts = [3, 4, 5];
      const tests = _crossAlgSteps(
        cross(["Fw", "Uw", "Rw", "Bw", "Lw", "Dw"], subscripts).map(
          ([face, sub]) => `${sub}${face}`,
        ),
      );
      const expectedActions = _crossDeepFaceActions(subscripts.map(v => v - 1));
      const cases = _getTestCases(tests, expectedActions);

      it.each(cases)("Should get an action for $step", ({ step, action }) => {
        const [actualActions, ..._] = _parseAndExecute(step);
        expect(actualActions).toStrictEqual([action]);
        checkAllActionInvariants(actualActions);
      });

      it("Should be equivalent to an action", () =>
        fc.assert(
          fc.property(
            fc
              .tuple(
                fc.nat({ max: cases.length - 1 }),
                fcAlgCubeSize.filter(size => size > 2),
              )
              .filter(
                ([caseIx, cubeSize]) =>
                  (cases[caseIx].action as ICubeRotateFaceDeepAction).depth
                  < cubeSize - 1,
              ),
            fc.commands(CubeCommands, { size: "xsmall" }),
            ([caseIx, cubeSize], cmds) => {
              const { step, action } = cases[caseIx];
              fcCompareActionWithActual(cubeSize, cmds, step, [action]);
            },
          ),
        ));
    });
  });
});

function _parseAndExecute(algorithm: string): [CubeActions[], string[]] {
  const parser = _getAlgorithmParser();
  const semantics = _getActionSemantics(parser);
  const match = parser.match(algorithm);
  const adapter = semantics(match);
  const result = adapter.execute();
  return [result, _getCleanAlgorithmSteps(algorithm)];
}

function _getTestCases(
  steps: readonly string[],
  expected: readonly CubeActions[],
): { step: string; action: CubeActions }[] {
  const result: { step: string; action: CubeActions }[] = [];
  zip(steps, expected, (step, action) => result.push({ step, action }));
  return result;
}

function _crossAlgSteps(steps: readonly string[]): string[] {
  const rotations = ["", "2", "'"];
  return cross(steps, rotations).map(([step, rot]) => `${step}${rot}`);
}

function _crossFaceActions(
  crossWith: readonly unknown[] = [],
): ICubeRotateFaceAction[] {
  const cubeSides: CubeSide[] = [
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
  return cross(
    crossWith.length
      ? cross(cubeSides, crossWith).map(([l, _r]) => l)
      : cubeSides,
    cubeRot,
  ).map(([sideId, rotationCount]) => ({
    type: CubeActionType.RotateFace,
    sideId,
    rotationCount,
  }));
}

function _crossDeepFaceActions(
  depths: readonly number[],
): ICubeRotateFaceDeepAction[] {
  const cubeSides: CubeSide[] = [
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
  return cross(cross(cubeSides, depths), cubeRot).map(
    ([[sideId, depth], rotationCount]) => ({
      type: CubeActionType.RotateFaceDeepTurn,
      sideId,
      rotationCount,
      depth,
    }),
  );
}

function _crossSliceActions(
  slices: Omit<ICubeRotateSliceAction, "rotationCount">[],
): ICubeRotateSliceAction[] {
  const cubeRot = [
    RotationAmount.Clockwise,
    RotationAmount.Halfway,
    RotationAmount.CounterClockwise,
  ];
  return cross(slices, cubeRot).map(([slice, rotationCount]) => ({
    ...slice,
    rotationCount,
  }));
}
