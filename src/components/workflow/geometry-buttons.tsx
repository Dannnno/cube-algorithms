import { forceNever } from "@/common";
import { ArrowKey, KeyboardShortcut, useKeyboardShortcut } from "@/hooks";
import { CubeActionType, CubeActions } from "@components/cubes";
import {
  CubeAxis,
  CubeSide,
  FaceRotationDirection,
  SliceDirection,
} from "@model/cube";
import { RotationAmount } from "@model/geometry";
import React, { useCallback, useMemo } from "react";
import {
  actionButton,
  antiClockwise,
  center,
  clockwise,
  down,
  focusFace,
  left,
  right,
  rotateCubeButton,
  rotateWholeCubeButton,
  sliceDown,
  sliceLeft,
  sliceRight,
  sliceUp,
  up,
  zDown,
  zUp,
} from "./geometry-buttons.module.scss";

interface IFaceRotationButtonProps {
  readonly faceId: CubeSide;
  readonly rotationDirection: FaceRotationDirection;
  readonly dispatch: React.Dispatch<CubeActions>;
}

/**
 * Button that can be used to rotate a cube face
 */
export const FaceRotationButton: React.FC<IFaceRotationButtonProps> = props => {
  const { faceId, rotationDirection, dispatch } = props;
  const className = useMemo(() => {
    const direction =
      rotationDirection === FaceRotationDirection.Clockwise
        ? clockwise
        : antiClockwise;
    return [actionButton, direction].join(" ");
  }, [rotationDirection]);

  const onClick = useCallback(
    () =>
      dispatch({
        type: CubeActionType.RotateFace,
        sideId: faceId,
        rotationCount:
          rotationDirection === FaceRotationDirection.Clockwise
            ? RotationAmount.Clockwise
            : RotationAmount.CounterClockwise,
      }),
    [rotationDirection, faceId, dispatch],
  );
  const title = useMemo(
    () =>
      `Rotate Face ${faceId} ${
        rotationDirection === FaceRotationDirection.Clockwise
          ? "clockwise"
          : "counter-clockwise"
      }`,
    [faceId, rotationDirection],
  );
  const shortcut = `Ctrl+Alt+${faceId}+${
    rotationDirection === FaceRotationDirection.Clockwise ? "C" : "V"
  }` as const;
  useKeyboardShortcut(shortcut, onClick);
  const safeTitle = `${title} (${shortcut})`;

  return (
    <button
      onClick={onClick}
      className={className}
      title={safeTitle}
      aria-label={safeTitle}
      tabIndex={0}
    ></button>
  );
};

interface ISliceRotationButtonProps {
  readonly axis: CubeAxis;
  readonly sliceStart: number;
  readonly sliceSize?: number;
  readonly rotationDirection: SliceDirection;
  readonly sideReference: CubeSide;
  readonly size: number;
  readonly dispatch: React.Dispatch<CubeActions>;
}

/**
 * Button that can be used to rotate a cube slice
 */
export const SliceRotationButton: React.FC<
  ISliceRotationButtonProps
> = props => {
  const {
    axis,
    sliceStart,
    sliceSize = 1,
    rotationDirection,
    sideReference,
    size,
    dispatch,
  } = props;
  const [className, titleDesc, arrowKey] = useMemo(() => {
    let directionClassName: string;
    let dirTitleName: string;
    let arrowKey: ArrowKey;
    switch (rotationDirection) {
      case SliceDirection.Up:
        directionClassName = sliceUp;
        dirTitleName = "up";
        arrowKey = "ArrowUp";
        break;
      case SliceDirection.Down:
        directionClassName = sliceDown;
        dirTitleName = "down";
        arrowKey = "ArrowDown";
        break;
      case SliceDirection.Left:
        directionClassName = sliceLeft;
        dirTitleName = "left";
        arrowKey = "ArrowLeft";
        break;
      case SliceDirection.Right:
        directionClassName = sliceRight;
        dirTitleName = "right";
        arrowKey = "ArrowRight";
        break;
      default:
        forceNever(rotationDirection);
    }

    return [
      [actionButton, directionClassName].join(" "),
      dirTitleName,
      arrowKey,
    ];
  }, [rotationDirection, axis, sideReference, size]);

  const onClick = useCallback(
    () =>
      dispatch({
        type: CubeActionType.RotateSlice,
        axis,
        offsetIndex: sliceStart,
        offsetSize: sliceSize,
        rotationCount: 1,
        direction: rotationDirection,
        refSide: sideReference,
      }),
    [rotationDirection, axis, sliceStart, sliceSize, dispatch, sideReference],
  );
  const title = useMemo(() => {
    if (sliceSize === 1) {
      return `Rotate ${axis}-axis [${sliceStart}] ${titleDesc}`;
    }
    const sliceEnd = sliceStart + sliceSize - 1;
    return `Rotate ${axis}-axis [${sliceStart}-${sliceEnd}] ${titleDesc}`;
  }, [titleDesc, sliceStart, sliceSize]);
  const shortcut =
    sliceSize > 1
      ? undefined
      : size === 3
        ? (`Ctrl+Alt+${sideReference}+${arrowKey}` as KeyboardShortcut)
        : (`Ctrl+Alt+${sideReference}+${arrowKey}+${sliceStart}` as KeyboardShortcut);
  useKeyboardShortcut(shortcut, onClick);
  const safeTitle = shortcut ? `${title} (${shortcut})` : title;

  return (
    <button
      onClick={onClick}
      className={className}
      title={safeTitle}
      aria-label={safeTitle}
    ></button>
  );
};

interface IFocusButtonProps {
  readonly sideId: CubeSide;
  readonly cubeDispatch: React.Dispatch<CubeActions>;
}

/**
 * Button that can be used to bring focus to a particular face
 */
export const FocusFaceButton: React.FC<IFocusButtonProps> = props => {
  const { cubeDispatch, sideId } = props;
  const callback = useCallback(() => {
    cubeDispatch({
      type: CubeActionType.FocusCube,
      focusFace: sideId,
    });
  }, [cubeDispatch, sideId]);
  const shortcut = `Ctrl+Alt+${sideId}+F` as const;
  useKeyboardShortcut(shortcut, callback);
  const safeTitle = `Focus Face ${sideId} (${shortcut})`;

  return (
    <button
      onClick={callback}
      className={`${actionButton} ${focusFace}`}
      title={safeTitle}
      aria-label={safeTitle}
      disabled={sideId === CubeSide.Front}
    ></button>
  );
};

interface IRotateCubeButtonContainerProps {
  readonly dispatch: React.Dispatch<CubeActions>;
}

export const RotateCubeButtonContainer: React.FC<
  IRotateCubeButtonContainerProps
> = props => {
  const { dispatch } = props;
  return (
    <div className={rotateWholeCubeButton}>
      <div className={`${rotateCubeButton} ${zUp}`}>
        <RotateWholeCubeButton
          dispatch={dispatch}
          axis="Z"
          direction={SliceDirection.Up}
          shortcut="Ctrl+Alt+Q"
        />
      </div>
      <div className={`${rotateCubeButton} ${up}`}>
        <RotateWholeCubeButton
          dispatch={dispatch}
          axis="Y"
          direction={SliceDirection.Up}
          shortcut="Ctrl+Alt+W"
        />
      </div>
      <div className={`${rotateCubeButton} ${left}`}>
        <RotateWholeCubeButton
          dispatch={dispatch}
          axis="X"
          direction={SliceDirection.Left}
          shortcut="Ctrl+Alt+A"
        />
      </div>
      <div className={`${rotateCubeButton} ${right}`}>
        <RotateWholeCubeButton
          dispatch={dispatch}
          axis="X"
          direction={SliceDirection.Right}
          shortcut="Ctrl+Alt+D"
        />
      </div>
      <div className={`${rotateCubeButton} ${down}`}>
        <RotateWholeCubeButton
          dispatch={dispatch}
          axis="Y"
          direction={SliceDirection.Down}
          shortcut="Ctrl+Alt+S"
        />
      </div>
      <div className={`${rotateCubeButton} ${zDown}`}>
        <RotateWholeCubeButton
          dispatch={dispatch}
          axis="Z"
          direction={SliceDirection.Down}
          shortcut="Ctrl+Alt+E"
        />
      </div>
      <div className={`${rotateCubeButton} ${center}`}>
        <img src="/puzzle_cube.png"></img>
      </div>
    </div>
  );
};

interface IRotateWholeCubeButtonProps {
  readonly dispatch: React.Dispatch<CubeActions>;
  readonly direction: SliceDirection;
  readonly axis: CubeAxis;
  readonly shortcut: KeyboardShortcut;
}

const RotateWholeCubeButton: React.FC<IRotateWholeCubeButtonProps> = props => {
  const { dispatch, direction, axis, shortcut } = props;
  const [className, sign, title] = useMemo(() => {
    const [className, sign, title] =
      ROTATE_CUBE_CLASSNAME_MAPPING[axis][direction]!;
    return [className, sign, `${title} (${shortcut})`];
  }, [axis, direction]);
  const callback = useCallback(
    () =>
      dispatch({
        type: CubeActionType.RotateCube,
        axis,
        rotationCount: 1 * sign,
      }),
    [axis, sign],
  );
  useKeyboardShortcut(shortcut, callback);

  return (
    <button
      onClick={callback}
      className={`${actionButton} ${className}`}
      title={title}
      aria-label={title}
    ></button>
  );
};

const ROTATE_CUBE_CLASSNAME_MAPPING: Record<
  CubeAxis,
  Partial<Record<SliceDirection, readonly [string, number, string]>>
> = {
  X: {
    [SliceDirection.Left]: [sliceLeft, 1, "Rotate the cube left on the X-axis"],
    [SliceDirection.Right]: [
      sliceRight,
      -1,
      "Rotate the cube right on the X-axis",
    ],
  },
  Y: {
    [SliceDirection.Up]: [sliceUp, 1, "Rotate the cube up on the Y-axis"],
    [SliceDirection.Down]: [
      sliceDown,
      -1,
      "Rotate the cube down on the Y-axis",
    ],
  },
  Z: {
    [SliceDirection.Up]: [clockwise, 1, "Rotate the cube up on the Z-axis"],
    [SliceDirection.Down]: [
      antiClockwise,
      -1,
      "Rotate the cube down on the Z-axis",
    ],
  },
};
