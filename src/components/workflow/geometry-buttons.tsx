import { forceNever } from "@/common";
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
  clockwise,
  focusFace,
  sliceDown,
  sliceLeft,
  sliceRight,
  sliceUp,
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

  return (
    <button
      onClick={onClick}
      className={className}
      title={title}
      aria-label={title}
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
  const [className, titleDesc] = useMemo(() => {
    let directionClassName: string;
    let dirTitleName: string;
    switch (rotationDirection) {
      case SliceDirection.Up:
        directionClassName = sliceUp;
        dirTitleName = "up";
        break;
      case SliceDirection.Down:
        directionClassName = sliceDown;
        dirTitleName = "down";
        break;
      case SliceDirection.Left:
        directionClassName = sliceLeft;
        dirTitleName = "left";
        break;
      case SliceDirection.Right:
        directionClassName = sliceRight;
        dirTitleName = "right";
        break;
      default:
        forceNever(rotationDirection);
    }

    return [[actionButton, directionClassName].join(" "), dirTitleName];
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

  return (
    <button
      onClick={onClick}
      className={className}
      title={title}
      aria-label={title}
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
      type: CubeActionType.RotateCube,
      focusFace: sideId,
    });
  }, [cubeDispatch, sideId]);

  return (
    <button
      onClick={callback}
      className={`${actionButton} ${focusFace}`}
      title={`Focus Face ${sideId}`}
      aria-label={`Focus Face ${sideId}`}
      disabled={sideId === CubeSide.Front}
    ></button>
  );
};
