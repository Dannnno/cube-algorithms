import { assert, forceNever, isBoundedInteger } from "@/common";
import {
  IInvalidStep,
  InvalidStepReason,
  _getCleanAlgorithmSteps,
  interpretAlgorithm,
} from "@/model/algorithm";
import { CubeSide } from "@/model/cube";
import { RotationAmount } from "@/model/geometry";
import { Draft } from "immer";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useImmerReducer } from "use-immer";
import { IconButton } from "../common";
import { CubeActionType, CubeActions, getInvertedAction } from "../cubes";
import {
  algorithmParseArea,
  buttons,
  hasErrors,
  hilite,
  invalidStep,
  parsedAlgorithm,
  runAlgorithm,
  step,
  tooltip,
} from "./algorithm-parse.module.scss";

interface IAlgorithmExecutorProps {
  readonly cubeSize: number;
  readonly cubeDispatch: React.Dispatch<CubeActions>;
}

export const AlgorithmExecutor: React.FC<IAlgorithmExecutorProps> = props => {
  const { cubeSize, cubeDispatch } = props;
  const [algorithm, algorithmDispatch] = useExecutableAlgorithm(
    2000,
    cubeSize,
    cubeDispatch,
  );
  const emptyObject = useMemo(() => ({}), []);
  const stepwiseObject = useMemo(() => ({ stepwise: true }), []);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (event.target.value) {
        algorithmDispatch({
          type: ActionType.UpdateAlgorithm,
          algorithm: event.target.value,
        });
      } else {
        algorithmDispatch({ type: ActionType.Reset });
      }
    },
    [algorithmDispatch],
  );

  return (
    <>
      <div className={algorithmParseArea}>
        <textarea
          ref={textAreaRef}
          onChange={onChange}
          value={algorithm.algorithm}
        ></textarea>
        <div className={buttons}>
          <ActionButton
            iconKey="cycle"
            alt="Clear algorithm"
            type={ActionType.Reset}
            allowedTypes={algorithm.allowedActions}
            dispatch={algorithmDispatch}
            args={emptyObject}
          />
        </div>
      </div>
      <ParseResults algorithm={algorithm} />
      <div className={runAlgorithm}>
        <ActionButton
          iconKey="previous-button"
          alt="Execute Prior Step"
          type={ActionType.PlayPrevious}
          allowedTypes={algorithm.allowedActions}
          dispatch={algorithmDispatch}
          args={stepwiseObject}
        />
        <ActionButton
          iconKey="pause-button"
          alt="Stop Executing"
          type={ActionType.Pause}
          allowedTypes={algorithm.allowedActions}
          dispatch={algorithmDispatch}
          args={emptyObject}
        />
        <ActionButton
          iconKey="play-button"
          alt="Run Algorithm"
          type={ActionType.Play}
          allowedTypes={algorithm.allowedActions}
          dispatch={algorithmDispatch}
          args={emptyObject}
        />
        <ActionButton
          iconKey="next-button"
          alt="Execute Next Step"
          type={ActionType.PlayNext}
          allowedTypes={algorithm.allowedActions}
          dispatch={algorithmDispatch}
          args={stepwiseObject}
        />
        <ActionButton
          iconKey="fast-forward-button"
          alt="Finish Algorithm"
          type={ActionType.End}
          allowedTypes={algorithm.allowedActions}
          dispatch={algorithmDispatch}
          args={emptyObject}
        />
      </div>
    </>
  );
};

interface IParseResultsProps {
  readonly algorithm: IState;
}

const ParseResults: React.FC<IParseResultsProps> = props => {
  const {
    algorithm: { parse, algorithm, invalidSteps, actions, index, playback },
  } = props;
  if (parse === ParseStatus.Unparsed) {
    return null;
  }

  const className = [
    parsedAlgorithm,
    parse === ParseStatus.Invalid ? hasErrors : "",
  ]
    .filter(v => v)
    .join(" ");
  const clean = _getCleanAlgorithmSteps(algorithm);
  const nodes: React.ReactNode[] = [];
  if (invalidSteps[0]?.invalidReason === InvalidStepReason.SyntaxError) {
    nodes.push(
      <span
        className={`${step} ${tooltip} ${invalidStep}`}
        // data-tooltip-position="top"
        data-tooltip={formatStepTooltip(undefined, invalidSteps[0])}
        key={0}
      >
        {algorithm}
      </span>,
    );
  } else {
    clean.forEach((cleanStep, ix) => {
      const isInvalid = invalidSteps.find(step => step.stepIndex === ix);
      const action = actions.at(ix);
      const classNames = [
        step,
        tooltip,
        isInvalid ? invalidStep : "",
        playback !== PlaybackStatus.Paused
        && playback !== PlaybackStatus.Done
        && index === ix
          ? hilite
          : "",
      ]
        .filter(v => v)
        .join(" ");
      nodes.push(
        <span
          className={classNames}
          // data-tooltip-position="top"
          data-tooltip={formatStepTooltip(action, isInvalid)}
          key={ix}
        >
          {cleanStep}
        </span>,
      );
    });
  }

  return <div className={className}>{nodes}</div>;
};

function formatStepTooltip(
  action: CubeActions | undefined,
  invalidStep: IInvalidStep | undefined,
): string {
  if (!action && !invalidStep) {
    return "";
  }

  if (!action) {
    assert(invalidStep);
    return formatErrorTooltip(invalidStep);
  }

  if (!invalidStep) {
    assert(action);
    return formatActionTooltip(action);
  }

  assert(action && invalidStep);
  return `Cannot ${downFirst(formatActionTooltip(action))} because ${downFirst(formatErrorTooltip(invalidStep))}`;
}

function formatErrorTooltip(invalidStep: IInvalidStep): string {
  switch (invalidStep.invalidReason) {
    case InvalidStepReason.SyntaxError:
      return invalidStep.invalidReasonDesc
        ? `There is a syntax error in the algorithm: ${invalidStep.invalidReasonDesc}`
        : `There is a syntax error in the algorithm`;
    case InvalidStepReason.SlicesNotAllowed:
      return `Slicing actions are not allowed for cubes without internal layers`;
    case InvalidStepReason.SliceSizeTooLarge:
      return `The slice would extend beyond the end of the cube`;
    case InvalidStepReason.SliceIndexOutOfRange:
      return `The slice would start beyond the end of the cube`;
    default:
      forceNever(invalidStep.invalidReason);
  }
}

function formatActionTooltip(action: CubeActions): string {
  switch (action.type) {
    case CubeActionType.RotateFace:
      return `Rotate the ${_face(action.sideId)} face ${_rot(action.rotationCount)}`;
    case CubeActionType.RotateFaceDeepTurn:
      return `Rotate the ${_face(action.sideId)} face and ${action.depth - 1} additional ${action.depth > 2 ? "layers" : "layer"} ${_rot(action.rotationCount)}`;
    case CubeActionType.RotateSlice:
      // In an algorithm, this is the only way it should show up
      assert(!action.offsetIndex && !action.offsetSize);
      return `Rotate all layers ${_rot(action.rotationCount)} along the ${action.axis} axis`;
    case CubeActionType.RotatePerpendicularSlice:
      if (action.sliceSize === 1) {
        return `Rotate layer ${action.sliceStart} of the ${_face(action.face)} face ${_rot(action.rotationCount)}`;
      }
      return `Rotate layers ${action.sliceStart}-${action.sliceStart + action.sliceSize - 1} of the ${_face(action.face)} face ${_rot(action.rotationCount)}`;
    case CubeActionType.RotateCube:
      return `Rotate the cube ${_rot(action.rotationCount)} along the ${action.axis}`;
    // None of these are going to show up in an algorithm
    case CubeActionType.ResetCube:
    case CubeActionType.FocusCube:
    case CubeActionType.ResizeCube:
    case CubeActionType.RotateCubeFromFace:
      assert(false);
    default:
      forceNever(action);
  }
}

function _face(face: CubeSide): string {
  switch (face) {
    case CubeSide.Front:
      return "front";
    case CubeSide.Back:
      return "back";
    case CubeSide.Left:
      return "left";
    case CubeSide.Right:
      return "right";
    case CubeSide.Top:
      return "top";
    case CubeSide.Bottom:
      return "bottom";
    default:
      forceNever(face);
  }
}

function _rot(rotation: RotationAmount): string {
  switch (rotation) {
    case RotationAmount.None:
      assert(false);
    case RotationAmount.Clockwise:
      return "clockwise";
    case RotationAmount.CounterClockwise:
      return "counter-clockwise";
    case RotationAmount.Halfway:
      return "180°";
    default:
      forceNever(rotation);
  }
}

function downFirst(s: string): string {
  return `${s[0].toLowerCase()}${s.slice(1)}`;
}

interface IActionButtonProps<T extends ActionType> {
  readonly type: T;
  readonly allowedTypes: readonly ActionType[];
  readonly dispatch: React.Dispatch<Action>;
  readonly iconKey: string;
  readonly args: Omit<Action, "type">;
  readonly alt: string;
}

function ActionButton<T extends ActionType>(
  props: IActionButtonProps<T>,
): React.ReactNode {
  const { iconKey, alt, type, allowedTypes, dispatch, args } = props;
  const onClick = useCallback(() => {
    dispatch({ type, ...args } as any);
  }, [dispatch, type, args]);
  const disabled = useMemo(
    () => !allowedTypes.includes(type),
    [allowedTypes, type],
  );
  return (
    <IconButton
      iconKey={iconKey}
      label=""
      onClick={onClick}
      alt={alt}
      labelAsText
      disabled={disabled}
    />
  );
}

function useExecutableAlgorithm(
  delay: number,
  cubeSize: number,
  cubeDispatch: React.Dispatch<CubeActions>,
): [IState, React.Dispatch<Action>] {
  const executeReducer = useCallback(
    (draft: Draft<IState>, action: Action): void => {
      if (!draft.allowedActions.includes(action.type)) {
        console.error(`Action ${action.type} is not allowed right now`);
        return;
      }

      let reset = false;
      let runAtIndex = -1;
      let invertAtIndex = -1;
      let shouldParse = false;
      switch (action.type) {
        case ActionType.ChangeSpeed:
          draft.delay = action.delay;
          break;
        case ActionType.End:
          draft.playback = PlaybackStatus.NoDelay;
          break;
        case ActionType.Parse:
          shouldParse = true;
          break;
        case ActionType.Pause:
          draft.playback = PlaybackStatus.Paused;
          break;
        case ActionType.Play:
          draft.playback = PlaybackStatus.Running;
          runAtIndex = draft.index;
          break;
        case ActionType.PlayNext:
          runAtIndex = draft.index;
          draft.playback = action.stepwise
            ? PlaybackStatus.StepWise
            : draft.playback;
          ++draft.index;
          break;
        case ActionType.PlayPrevious:
          invertAtIndex = draft.index;
          runAtIndex = --draft.index;
          draft.playback = action.stepwise
            ? PlaybackStatus.StepWise
            : draft.playback;
          break;
        case ActionType.Reset:
          reset = true;
          break;
        case ActionType.UpdateAlgorithm:
          draft.algorithm = action.algorithm;
          shouldParse = true;
          break;
        default:
          forceNever(action);
      }

      if (reset) {
        draft.actions = [];
        draft.algorithm = "";
        draft.allowedActions = [
          ActionType.UpdateAlgorithm,
          ActionType.ChangeSpeed,
        ];
        draft.delay = delay;
        draft.index = 0;
        draft.invalidSteps = [];
        draft.parse = ParseStatus.Unparsed;
        draft.playback = PlaybackStatus.Paused;
        return;
      }

      if (shouldParse) {
        const { steps, invalidSteps, isValid } = interpretAlgorithm(
          draft.algorithm,
          draft.cubeSize,
        );

        draft.allowedActions = [
          ActionType.UpdateAlgorithm,
          ActionType.ChangeSpeed,
          ActionType.Parse,
          ActionType.Reset,
        ];
        if (isValid) {
          draft.allowedActions.push(
            ActionType.Play,
            ActionType.PlayNext,
            ActionType.End,
          );
        } else {
          draft.allowedActions = draft.allowedActions.filter(
            act =>
              act !== ActionType.Play
              && act !== ActionType.PlayNext
              && act !== ActionType.End,
          );
        }

        draft.playback = PlaybackStatus.Paused;
        draft.index = 0;
        draft.parse = isValid ? ParseStatus.Valid : ParseStatus.Invalid;
        draft.invalidSteps = invalidSteps;
        draft.actions = steps;
        return;
      }

      if (draft.playback === PlaybackStatus.NoDelay) {
        for (let ix = draft.index; ix < draft.actions.length; ++ix) {
          cubeDispatch(Object.assign({}, draft.actions[ix]));
        }
        draft.index = draft.actions.length;
      } else {
        if (invertAtIndex !== -1) {
          cubeDispatch(getInvertedAction(draft.actions[invertAtIndex]));
        }
        if (isBoundedInteger(runAtIndex, 0, draft.actions.length - 1)) {
          cubeDispatch(Object.assign({}, draft.actions[runAtIndex]));
        }
      }

      if (draft.index <= 0) {
        draft.index = 0;
        draft.allowedActions = draft.allowedActions.filter(
          act => act !== ActionType.PlayPrevious,
        );
      } else {
        draft.allowedActions.push(ActionType.PlayPrevious);
      }

      if (draft)
        if (draft.index === draft.actions.length - 1) {
          draft.allowedActions = draft.allowedActions.filter(
            act => act !== ActionType.PlayNext,
          );
        } else if (draft.index >= draft.actions.length) {
          draft.playback = PlaybackStatus.Done;
        } else {
          draft.allowedActions.push(ActionType.Play);
        }

      if (draft.playback === PlaybackStatus.Done) {
        draft.index = draft.actions.length;
        draft.allowedActions = draft.allowedActions.filter(
          act =>
            act !== ActionType.PlayNext
            && act !== ActionType.Play
            && act !== ActionType.End,
        );
      }
    },
    [delay, cubeDispatch],
  );

  const [state, dispatch] = useImmerReducer(executeReducer, {
    playback: PlaybackStatus.Paused,
    cubeSize,
    index: 0,
    delay,
    allowedActions: [ActionType.UpdateAlgorithm, ActionType.ChangeSpeed],
    parse: ParseStatus.Unparsed,
    algorithm: "",
    invalidSteps: [],
    actions: [],
  });

  // respond to resize events
  useEffect(() => {
    void cubeSize;
    dispatch({ type: ActionType.Parse });
  }, [cubeSize, dispatch]);

  // Set up the recurring event
  const [_lastEventInstant, setLastEventInstant] = React.useState(Date.now());
  const { delay: curDelay, playback } = state;
  const playbackEvent = useCallback(
    () =>
      setLastEventInstant(curInstant => {
        const now = Date.now();
        if (
          now - curInstant >= curDelay
          && playback === PlaybackStatus.Running
        ) {
          dispatch({ type: ActionType.PlayNext, stepwise: false });
          return now;
        }
        return curInstant;
      }),
    [curDelay, playback],
  );

  useEffect(() => {
    const intervalId = window.setInterval(playbackEvent, 100);
    return () => window.clearInterval(intervalId);
  }, [playbackEvent]);

  return [state, dispatch];
}

enum ParseStatus {
  Unparsed,
  Valid,
  Invalid,
}

enum PlaybackStatus {
  Paused,
  Running,
  StepWise,
  Done,
  NoDelay,
}

interface IState {
  readonly playback: PlaybackStatus;
  readonly cubeSize: number;
  readonly index: number;
  readonly delay: number;
  readonly allowedActions: readonly ActionType[];
  readonly parse: ParseStatus;
  readonly algorithm: string;
  readonly invalidSteps: readonly IInvalidStep[];
  readonly actions: readonly CubeActions[];
}

enum ActionType {
  ChangeSpeed,
  End,
  Parse,
  Pause,
  Play,
  PlayNext,
  PlayPrevious,
  Reset,
  UpdateAlgorithm,
}

interface IAction<T extends ActionType> {
  readonly type: T;
}
interface IChangeSpeedAction extends IAction<ActionType.ChangeSpeed> {
  readonly delay: number;
}
interface IUpdateAction extends IAction<ActionType.UpdateAlgorithm> {
  readonly algorithm: string;
}
interface IStepwiseAction
  extends IAction<ActionType.PlayNext | ActionType.PlayPrevious> {
  readonly stepwise: boolean;
}
type ArglessAction = IAction<
  Exclude<
    ActionType,
    (IChangeSpeedAction | IUpdateAction | IStepwiseAction)["type"]
  >
>;
type Action =
  | IChangeSpeedAction
  | IUpdateAction
  | ArglessAction
  | IStepwiseAction;
