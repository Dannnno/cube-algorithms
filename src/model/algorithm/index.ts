import { DeepReadonly } from "@/common";
import { CubeActions } from "@/components/cubes";
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
  _action: CubeActions,
  _cubeSize: number,
): IValidStepResult | IInvalidStepResult {
  // Right now there are no reasons this would be invalid as long as we've passed parsing
  // This will change when we get slices and deep turns
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
