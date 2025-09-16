import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { CubeActionType, CubeActions } from "../../../src/components/cubes";
import {
  InvalidStepReason,
  _getCleanAlgorithmSteps,
  interpretAlgorithm,
  validateActions,
} from "../../../src/model/algorithm";
import { CubeSide, SliceDirection } from "../../../src/model/cube";
import { checkAllActionInvariants } from "../utility";
import { fcAlgCubeSize, fcAlgorithmText } from "./fcAlgorithm";

describe("interpretAlgorithm", () => {
  const algorithms = [
    ["R L' U2 D F2 B'", true, 2],
    ["RLU", false, 2],
    ["M E2 S'", true, 3],
    ["X Y' Z2", true, 2],
  ] as const;
  it.each(algorithms)("should parse $0", (alg, expIsValid, minSize) =>
    fc.assert(
      fc.property(fcAlgCubeSize, cubeSize => {
        const { isValid, invalidSteps, steps } = interpretAlgorithm(
          alg,
          cubeSize,
        );
        const actuallyExpectedValid = expIsValid && cubeSize >= minSize;
        expect(isValid, "isValid").toBe(actuallyExpectedValid);
        if (!actuallyExpectedValid) {
          if (!expIsValid) {
            expect(invalidSteps.length, "invalidSteps.length").toBe(1);
            const {
              stepIndex,
              step,
              stepLiteral,
              invalidReason,
              invalidReasonDesc,
            } = invalidSteps[0];
            expect(stepIndex, "stepIndex").toBe(0);
            expect(step, "step").toBeUndefined();
            expect(stepLiteral, "stepLiteral").toBe(alg);
            expect(invalidReason, "invalidReason").toBe(
              InvalidStepReason.SyntaxError,
            );
            expect(invalidReasonDesc, "invalidReasonDesc").toMatch(
              /Line 1, col \d+: expected end of input/,
            );
            expect(steps, "steps").toStrictEqual([]);
          }
        } else {
          expect(invalidSteps, "invalidSteps").toStrictEqual([]);
          checkAllActionInvariants(steps);
        }
      }),
    ),
  );

  const failingAlgorithms = [
    [
      "M E2 S'",
      [
        InvalidStepReason.SlicesNotAllowed,
        InvalidStepReason.SlicesNotAllowed,
        InvalidStepReason.SlicesNotAllowed,
      ],
      2,
    ],
    [
      "F M E2 S'",
      [
        ,
        InvalidStepReason.SlicesNotAllowed,
        InvalidStepReason.SlicesNotAllowed,
        InvalidStepReason.SlicesNotAllowed,
      ],
      2,
    ],
  ] as const;
  it.each(failingAlgorithms)("Should not parse $0", (alg, errors, size) => {
    const { isValid, invalidSteps, steps } = interpretAlgorithm(alg, size);
    const algLit = _getCleanAlgorithmSteps(alg);
    expect(isValid, "isValid").toBeFalsy();

    const expectedErrors = errors
      .map((err, ix) => ({
        stepIndex: ix,
        stepLiteral: algLit[ix],
        step: steps[ix],
        invalidReason: err,
        invalidReasonDesc: undefined,
      }))
      .filter(({ invalidReason }) => invalidReason !== undefined);
    expect(invalidSteps, "invalidSteps").toStrictEqual(expectedErrors);
  });

  it("should parse generated algorithms", () =>
    fc.assert(
      fc.property(
        fcAlgCubeSize.filter(size => size > 2),
        fcAlgorithmText,
        (cubeSize, { algorithm, minSizes }) => {
          const result = interpretAlgorithm(algorithm, cubeSize);
          const expectedToBeValid = minSizes.every(size => size <= cubeSize);
          const expectedBadIndices = minSizes
            .map((size, ix) => (size > cubeSize ? ix : undefined))
            .filter(ix => ix !== undefined);
          expect(result.isValid, "isValid").toBe(expectedToBeValid);
          expect(result.invalidSteps.length, "invalidSteps.length").toBe(
            expectedBadIndices.length,
          );
          expect(result.steps.length, "steps.length").toBe(
            _getCleanAlgorithmSteps(algorithm).length,
          );
          for (const badIndex of expectedBadIndices) {
            expect(
              result.invalidSteps.some(
                ({ stepIndex }) => badIndex === stepIndex,
              ),
            );
          }
          for (const { stepIndex } of result.invalidSteps) {
            expect(expectedBadIndices.some(badIndex => badIndex === stepIndex));
          }
          checkAllActionInvariants(result.steps);
        },
      ),
    ));
});

describe("validateActions", () => {
  // prettier-ignore
  const testCases: [CubeActions[], number, boolean][] = [
    [
        [{ type: CubeActionType.RotateFace, sideId: CubeSide.Left, rotationCount: 1 }], 
        3, 
        true
    ],
    [
        [{ type: CubeActionType.RotateSlice, axis: "X", refSide: CubeSide.Left, rotationCount: 1, direction: SliceDirection.Left }], 
        2, 
        false
    ],
    [
        [{ type: CubeActionType.RotateSlice, axis: "Z", refSide: CubeSide.Left, rotationCount: 1, direction: SliceDirection.Up }], 
        3, 
        true
    ],
    [
        [{ type: CubeActionType.RotateCube, axis: "Y", rotationCount: 1 }], 
        3, 
        true
    ],
  ];

  it.each(testCases)(
    "Should validate an action",
    (actions, cubeSize, expValid) => {
      const { isValid, invalidSteps, steps } = validateActions(
        actions,
        cubeSize,
      );
      expect(steps, "steps").toStrictEqual(actions);
      expect(isValid, "isValid").toBe(expValid);
      if (expValid) {
        expect(invalidSteps, "invalidSteps").toStrictEqual([]);
        checkAllActionInvariants(steps);
      } else {
        expect(invalidSteps.length, "invalidSteps").toBeGreaterThan(0);
      }
    },
  );
});
