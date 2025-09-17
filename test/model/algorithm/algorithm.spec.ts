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
    ["R L' U2 D F2 B'", 2],
    ["M E2 S'", 3],
    ["X Y' Z2 x' y2 z", 2],
    ["d2 l' r u2 f' b", 3],
    ["Fw Rw' Dw2 Bw2 Lw' Uw", 3],
    ["F_2 R_2' L_22 U\u{2082} B\u{2082}' D\u{2082}2", 3],
    ["F_3 R_3' L_32 U\u{2083} B\u{2083}' D\u{2083}2", 4],
    ["F_4 R_4' L_42 U\u{2084} B\u{2084}' D\u{2084}2", 5],
    ["F_5 R_5' L_52 U\u{2085} B\u{2085}' D\u{2085}2", 6],
    ["3Fw 3Rw' 3Uw2 3Bw2 3Lw 3Bw'", 4],
    ["4Fw 4Rw' 4Uw2 4Bw2 4Lw 4Bw'", 5],
    ["5Fw 5Rw' 5Uw2 5Bw2 5Lw 5Bw'", 6],
  ] as const;
  it.each(algorithms)("should parse $0", (alg, minSize) =>
    fc.assert(
      fc.property(fcAlgCubeSize, cubeSize => {
        const { isValid, invalidSteps, steps } = interpretAlgorithm(
          alg,
          cubeSize,
        );
        const expectedValidity = cubeSize >= minSize;
        expect(isValid, "isValid").toBe(expectedValidity);
        if (!expectedValidity) {
          expect(invalidSteps.length).toBeGreaterThan(0);
        } else {
          expect(invalidSteps, "invalidSteps").toStrictEqual([]);
          checkAllActionInvariants(steps);
        }
      }),
      { seed: 1813871234, path: "1", endOnFailure: true },
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
    ["d", [InvalidStepReason.SlicesNotAllowed], 2],
    ["Uw", [InvalidStepReason.SlicesNotAllowed], 2],
    ["3Fw", [InvalidStepReason.SlicesNotAllowed], 2],
    ["R_2", [InvalidStepReason.SlicesNotAllowed], 2],
    ["B\u{2082}", [InvalidStepReason.SlicesNotAllowed], 2],
    ["5Lw", [InvalidStepReason.SliceSizeTooLarge], 4],
    ["D_5", [InvalidStepReason.SliceSizeTooLarge], 5],
    ["B\u{2085}", [InvalidStepReason.SliceSizeTooLarge], 5],
    ["RLU", [InvalidStepReason.SyntaxError], 2],
  ] as const;
  it.each(failingAlgorithms)("Should not parse $0", (alg, errors, size) => {
    const { isValid, invalidSteps, steps } = interpretAlgorithm(alg, size);
    const algLit = _getCleanAlgorithmSteps(alg);
    expect(isValid, "isValid").toBeFalsy();

    const expectedErrors = errors
      .map((err: InvalidStepReason | undefined, ix: number) => ({
        stepIndex: ix,
        stepLiteral: algLit[ix],
        step: steps[ix],
        invalidReason: err,
        invalidReasonDesc:
          err === InvalidStepReason.SyntaxError
            ? "Line 1, col 2: expected end of input"
            : undefined,
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
  const testCases: [CubeActions[], number, boolean][] = [
    [
      [
        {
          type: CubeActionType.RotateFace,
          sideId: CubeSide.Left,
          rotationCount: 1,
        },
      ],
      3,
      true,
    ],
    [
      [
        {
          type: CubeActionType.RotateSlice,
          axis: "X",
          refSide: CubeSide.Left,
          rotationCount: 1,
          direction: SliceDirection.Left,
        },
      ],
      2,
      false,
    ],
    [
      [
        {
          type: CubeActionType.RotateSlice,
          axis: "Z",
          refSide: CubeSide.Left,
          rotationCount: 1,
          direction: SliceDirection.Up,
        },
      ],
      3,
      true,
    ],
    [
      [
        {
          type: CubeActionType.RotateSlice,
          axis: "Y",
          refSide: CubeSide.Front,
          rotationCount: 1,
          direction: SliceDirection.Left,
          offsetIndex: 3,
        },
      ],
      3,
      false,
    ],
    [
      [
        {
          type: CubeActionType.RotateSlice,
          axis: "Y",
          refSide: CubeSide.Front,
          rotationCount: 1,
          direction: SliceDirection.Left,
          offsetIndex: 3,
        },
      ],
      5,
      true,
    ],
    [
      [
        {
          type: CubeActionType.RotateSlice,
          axis: "Y",
          refSide: CubeSide.Front,
          rotationCount: 1,
          direction: SliceDirection.Left,
          offsetIndex: 1,
          offsetSize: 2,
        },
      ],
      3,
      false,
    ],
    [
      [
        {
          type: CubeActionType.RotateSlice,
          axis: "Y",
          refSide: CubeSide.Front,
          rotationCount: 1,
          direction: SliceDirection.Left,
          offsetIndex: 2,
          offsetSize: 2,
        },
      ],
      5,
      true,
    ],
    [
      [
        {
          type: CubeActionType.RotateFaceDeepTurn,
          sideId: CubeSide.Front,
          rotationCount: 1,
          depth: 2,
        },
      ],
      5,
      true,
    ],
    [
      [
        {
          type: CubeActionType.RotateFaceDeepTurn,
          sideId: CubeSide.Front,
          rotationCount: 1,
          depth: 2,
        },
      ],
      2,
      false,
    ],
    [
      [
        {
          type: CubeActionType.RotateFaceDeepTurn,
          sideId: CubeSide.Front,
          rotationCount: 1,
          depth: 6,
        },
      ],
      5,
      false,
    ],
    [
      [{ type: CubeActionType.RotateCube, axis: "Y", rotationCount: 1 }],
      3,
      true,
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
