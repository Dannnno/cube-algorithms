import { assert, DeepReadonly, forceNever, isBoundedInteger } from "@/common";
import { CubeActions, CubeActionType } from "@/components/cubes";
import { _getActionSemantics } from "./actions";
import { _getAlgorithmParser } from "./parser";

/**
 * An algorithm to be executed
 */
export interface IAlgorithm {
  /** Whether the algorithm is valid */
  readonly isValid: boolean;
  /** The steps of the algorithm (may include invalid steps if `isValid` is `true`) */
  readonly steps: DeepReadonly<CubeActions[]>;
  /** The steps that are invalid */
  readonly invalidSteps: DeepReadonly<IInvalidStep[]>;
}

/**
 * A step of the algorithm that is invalid
 */
export interface IInvalidStep {
  /** Which step it is */
  readonly stepIndex: number;
  /** The literal text of the step, if known */
  readonly stepLiteral?: string;
  /** The effective step, if known */
  readonly step?: CubeActions;
  /** The reason the step is invalid */
  readonly invalidReason: InvalidStepReason;
  /** A detailed error message explaining the invalid reason */
  readonly invalidReasonDesc?: string;
}

/** A reason a step of an algorithm is invalid */
export enum InvalidStepReason {
  /** There is a syntax error in the step */
  SyntaxError,
  /** Slices are not allowed for this cube size */
  SlicesNotAllowed,
  /** The slice would extend beyond the end of the cube */
  SliceSizeTooLarge,
  /** The start of the slice is out of range */
  SliceIndexOutOfRange,
}

/**
 * Given an algorithm, interpret it as a series of executable steps
 * @param algorithm The algorithm to be evaluated
 * @param cubeSize The size of the cube this is being evaluated against
 * @returns The algorithm
 */
export function interpretAlgorithm(
  algorithm: string,
  cubeSize: number,
): IAlgorithm {
  const parser = _getAlgorithmParser();
  const semantics = _getActionSemantics(parser);
  const match = parser.match(algorithm);
  if (!match.succeeded()) {
    return {
      isValid: false,
      steps: [],
      invalidSteps: [
        {
          step: undefined,
          stepIndex: 0,
          stepLiteral: algorithm,
          invalidReason: InvalidStepReason.SyntaxError,
          invalidReasonDesc: match.shortMessage,
        },
      ],
    };
  }

  const adapter = semantics(match);
  const actions = adapter.execute();
  return _validateActions(
    actions,
    _getCleanAlgorithmSteps(algorithm),
    cubeSize,
  );
}

/**
 * Given a series of actions, validate them against a particular cube
 * @param actions The actions to be validated
 * @param cubeSize The size of the cube
 * @returns The full validated algorithm
 */
export function validateActions(
  actions: readonly CubeActions[],
  cubeSize: number,
): IAlgorithm {
  return _validateActions(actions, [], cubeSize);
}

function _validateActions(
  actions: readonly CubeActions[],
  steps: readonly string[],
  cubeSize: number,
): IAlgorithm {
  const allSteps: CubeActions[] = [];
  const invalidSteps: IInvalidStep[] = [];

  actions.forEach((act, ix) => {
    const stepLiteral = steps.at(ix);
    allSteps.push(act);
    const stepIsInvalid = _validateStep(act, cubeSize);
    if (stepIsInvalid.isInvalid) {
      const { reason, reasonDesc } = stepIsInvalid;
      invalidSteps.push({
        stepIndex: ix,
        step: act,
        stepLiteral,
        invalidReason: reason,
        invalidReasonDesc: reasonDesc,
      });
    }
  });

  return {
    isValid: invalidSteps.length === 0,
    steps: allSteps,
    invalidSteps,
  };
}

function _validateStep(
  action: CubeActions,
  cubeSize: number,
): IValidStepResult | IInvalidStepResult {
  switch (action.type) {
    case CubeActionType.RotateFace:
    case CubeActionType.ResetCube:
    case CubeActionType.FocusCube:
    case CubeActionType.ResizeCube:
    case CubeActionType.RotateCube:
    case CubeActionType.RotateCubeFromFace:
      return { isInvalid: false };
    case CubeActionType.RotateFaceDeepTurn:
      return _validateSliceIndices(cubeSize, 1, action.depth - 1);
    case CubeActionType.RotateSlice:
      return _validateSliceIndices(
        cubeSize,
        action.offsetIndex,
        action.offsetSize,
      );
    default:
      forceNever(action);
  }
}

function _validateSliceIndices(
  cubeSize: number,
  offsetIndex: number | undefined,
  offsetSize: number | undefined,
): IValidStepResult | IInvalidStepResult {
  if (cubeSize === 2) {
    return { isInvalid: true, reason: InvalidStepReason.SlicesNotAllowed };
  }

  if (offsetIndex === undefined) {
    assert(offsetSize === undefined, `Can't have a defined size but no index`);
    return { isInvalid: false };
  }

  if (!isBoundedInteger(offsetIndex, 1, cubeSize - 2)) {
    return { isInvalid: true, reason: InvalidStepReason.SliceIndexOutOfRange };
  }

  if (
    offsetSize !== undefined
    && !isBoundedInteger(offsetIndex + offsetSize, 2, cubeSize - 1)
  ) {
    return { isInvalid: true, reason: InvalidStepReason.SliceSizeTooLarge };
  }

  return { isInvalid: false };
}

interface IValidStepResult {
  readonly isInvalid: false;
}

interface IInvalidStepResult {
  readonly isInvalid: true;
  readonly reason: InvalidStepReason;
  readonly reasonDesc?: string;
}

/**
 * Get a cleaned up set of algorithm steps
 * @param algorithm The algorithm steps
 * @returns Array of steps without any extraneous whitespace
 */
export function _getCleanAlgorithmSteps(algorithm: string): string[] {
  return algorithm
    .split(" ")
    .map(v => v.trim())
    .filter(v => v);
}
