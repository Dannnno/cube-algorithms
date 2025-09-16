import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { CubeActionType, CubeActions } from "../../../src/components/cubes";
import {
  InvalidStepReason,
  _getCleanAlgorithmSteps,
  interpretAlgorithm,
  validateActions,
} from "../../../src/model/algorithm";
import { CubeSide } from "../../../src/model/cube";
import { fcAlgCubeSize, fcAlgorithmText } from "./fcAlgorithm";

describe("interpretAlgorithm", () => {
  const algorithms = [
    ["R L' U2 D F2 B'", true],
    ["RLU", false],
  ] as const;
  it.each(algorithms)("should parse $0", (alg, expIsValid) =>
    fc.assert(
      fc.property(fcAlgCubeSize, cubeSize => {
        const { isValid, invalidSteps, steps } = interpretAlgorithm(
          alg,
          cubeSize,
        );
        expect(isValid, "isValid").toBe(expIsValid);
        if (!expIsValid) {
          expect(invalidSteps.length).toBe(1);
          const {
            stepIndex,
            step,
            stepLiteral,
            invalidReason,
            invalidReasonDesc,
          } = invalidSteps[0];
          expect(stepIndex).toBe(0);
          expect(step).toBeUndefined();
          expect(stepLiteral).toBe(alg);
          expect(invalidReason).toBe(InvalidStepReason.SyntaxError);
          expect(invalidReasonDesc).toMatch(
            /Line 1, col \d+: expected end of input/,
          );
          expect(steps).toStrictEqual([]);
        } else {
          expect(invalidSteps).toStrictEqual([]);
        }
      }),
    ),
  );

  it("should parse generated algorithms", () =>
    fc.assert(
      fc.property(fcAlgCubeSize, fcAlgorithmText, (cubeSize, algorithm) => {
        const result = interpretAlgorithm(algorithm, cubeSize);
        expect(result.isValid, "isValid").toBeTruthy();
        expect(result.invalidSteps.length, "invalidSteps.length").toBe(0);
        expect(result.steps.length, "steps.length").toBe(
          _getCleanAlgorithmSteps(algorithm).length,
        );
      }),
    ));
});

describe.skip("validateActions", () => {
  // prettier-ignore
  const testCases: [CubeActions[], number, boolean][] = [
    [
        [{type: CubeActionType.RotateFace, sideId: CubeSide.Left, rotationCount: 1}], 
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
      } else {
        expect(invalidSteps.length, "invalidSteps").toBeGreaterThan(0);
      }
    },
  );
});
