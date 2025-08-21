import React, { useCallback, useMemo } from "react";
import { CubeActions, CubeActionType } from "@components/cubes";
import { CubeAxis, CubeSide } from "@model/cube";
import { assert, forceNever } from "@/common";
import styles, { 
    clockwise, antiClockwise, sliceUp, sliceDown, sliceLeft, sliceRight,
    actionButton, focusFace, 
} from "./geometry-buttons.module.scss";
import { RotationAmount } from "@model/geometry";

/**
 * The direction to rotate a face
 */
export enum FaceRotationDirection {
    /** Rotate the face clockwise */
    Clockwise,
    /** Rotate the face counter-clockwise */
    CounterClockwise
}

/**
 * The direction to rotate an internal layer (slice)
 */
export enum SliceDirection {
    /** Rotate the face upwards, i.e. towards row 0 */
    Up,
    /** Rotate the face downwards, i.e. towards row N */
    Down,
    /** Rotate the face to the left, i.e. towards col 0 */
    Left,
    /** Rotate the face to the right, i.e. towards col N */
    Right
}

interface IFaceRotationButtonProps {
    readonly faceId: CubeSide;
    readonly rotationDirection: FaceRotationDirection;
    readonly dispatch: React.Dispatch<CubeActions>;
}

/**
 * Button that can be used to rotate a cube face
 */
export const FaceRotationButton
    : React.FC<IFaceRotationButtonProps> = props => {
        const { faceId, rotationDirection, dispatch } = props;
        const className = useMemo(() => {
            const direction = 
                rotationDirection === FaceRotationDirection.Clockwise 
                    ? clockwise : antiClockwise;
            return [actionButton, direction].join(" ");
        }, [rotationDirection]);

        const onClick = useCallback(() => 
            dispatch({
                type: CubeActionType.RotateFace,
                sideId: faceId,
                rotationCount: 
                    rotationDirection === FaceRotationDirection.Clockwise 
                        ? RotationAmount.Clockwise 
                        : RotationAmount.CounterClockwise
            }),
            [rotationDirection, faceId, dispatch]
        );
        const title = useMemo(() => 
            `Rotate Face ${faceId} ${
                rotationDirection === FaceRotationDirection.Clockwise 
                    ? "clockwise" : "counter-clockwise"
            }`, 
            [faceId, rotationDirection]
        );

        return (
            <button 
                onClick={onClick} 
                className={className}
                role="button"
                title={title}
            >
            </button>
        );
}

interface ISliceRotationButtonProps {
    readonly axis: CubeAxis;
    readonly sliceStart: number;
    readonly sliceSize?: number;
    readonly rotationDirection: SliceDirection;
    readonly sideReference?: CubeSide;
    readonly size: number;
    readonly dispatch: React.Dispatch<CubeActions>;
}

function calculateRotationCount(
    axis: CubeAxis, 
    direction: SliceDirection, 
    side: CubeSide | undefined
) : RotationAmount {
    switch (side) {
        case undefined:
            // Treat up as clockwise, and anything else as anticlockwise
            // This would only happen on the sidebar
            return direction === SliceDirection.Up 
                ? RotationAmount.Clockwise : RotationAmount.CounterClockwise;
        case CubeSide.Left:
            switch (axis) {
                case "X":
                    switch (direction) {
                        case SliceDirection.Up:
                        case SliceDirection.Down:
                            assert(false);
                        case SliceDirection.Left:
                            return RotationAmount.Clockwise;
                        case SliceDirection.Right:
                            return RotationAmount.CounterClockwise;
                        default:
                            forceNever(direction);
                    }
                case "Z":
                    switch (direction) {
                        case SliceDirection.Up:
                            return RotationAmount.Clockwise;
                        case SliceDirection.Down:
                            return RotationAmount.CounterClockwise;
                        case SliceDirection.Left:
                        case SliceDirection.Right:
                            assert(false);
                        default:
                            forceNever(direction);
                    }
                case "Y":
                    assert(false);
                default:
                    forceNever(axis);
            }
        case CubeSide.Front:
            switch (axis) {
                case "X":
                    switch (direction) {
                        case SliceDirection.Up:
                        case SliceDirection.Down:
                            assert(false);
                        case SliceDirection.Left:
                            return RotationAmount.Clockwise;
                        case SliceDirection.Right:
                            return RotationAmount.CounterClockwise;
                        default:
                            forceNever(direction);
                    }
                case "Y":
                    switch (direction) {
                        case SliceDirection.Up:
                            return RotationAmount.Clockwise;
                        case SliceDirection.Down:
                            return RotationAmount.CounterClockwise;
                        case SliceDirection.Left:
                        case SliceDirection.Right:
                            assert(false);
                        default:
                            forceNever(direction);
                    }
                case "Z":
                    assert(false);
                default:
                    forceNever(axis);
            }
        case CubeSide.Right:
            switch (axis) {
                case "X":
                    switch (direction) {
                        case SliceDirection.Up:
                        case SliceDirection.Down:
                            assert(false);
                        case SliceDirection.Left:
                            return RotationAmount.Clockwise;
                        case SliceDirection.Right:
                            return RotationAmount.CounterClockwise;
                        default:
                            forceNever(direction);
                    }
                case "Z":
                    switch (direction) {
                        case SliceDirection.Up:
                            return RotationAmount.CounterClockwise;
                        case SliceDirection.Down:
                            return RotationAmount.Clockwise;
                        case SliceDirection.Left:
                        case SliceDirection.Right:
                            assert(false);
                        default:
                            forceNever(direction);
                    }
                case "Y":
                    assert(false);
                default:
                    forceNever(axis);
            }
        case CubeSide.Back:
            switch (axis) {
                case "X":
                    switch (direction) {
                        case SliceDirection.Up:
                        case SliceDirection.Down:
                            assert(false);
                        case SliceDirection.Left:
                            return RotationAmount.Clockwise;
                        case SliceDirection.Right:
                            return RotationAmount.CounterClockwise;
                        default:
                            forceNever(direction);
                    }
                case "Y":
                    switch (direction) {
                        case SliceDirection.Up:
                            return RotationAmount.CounterClockwise;
                        case SliceDirection.Down:
                            return RotationAmount.Clockwise;
                        case SliceDirection.Left:
                        case SliceDirection.Right:
                            assert(false);
                        default:
                            forceNever(direction);
                    }
                case "Z":
                    assert(false);
                default:
                    forceNever(axis);
            }
        case CubeSide.Top:
            switch (axis) {
                case "X":
                    assert(false);
                case "Y":
                    switch (direction) {
                        case SliceDirection.Up:
                            return RotationAmount.Clockwise;
                        case SliceDirection.Down:
                            return RotationAmount.CounterClockwise;
                        case SliceDirection.Left:
                        case SliceDirection.Right:
                            assert(false);
                        default:
                            forceNever(direction);
                    }
                case "Z":
                    switch (direction) {
                        case SliceDirection.Up:
                        case SliceDirection.Down:
                            assert(false);
                        case SliceDirection.Left:
                            return RotationAmount.CounterClockwise;
                        case SliceDirection.Right:
                            return RotationAmount.Clockwise;
                        default:
                            forceNever(direction);
                    }
                default:
                    forceNever(axis);
            }
        case CubeSide.Bottom:
            switch (axis) {
                case "X":
                    assert(false);
                case "Y":
                    switch (direction) {
                        case SliceDirection.Up:
                            return RotationAmount.Clockwise;
                        case SliceDirection.Down:
                            return RotationAmount.CounterClockwise;
                        case SliceDirection.Left:
                        case SliceDirection.Right:
                            assert(false);
                        default:
                            forceNever(direction);
                    }
                case "Z":
                    switch (direction) {
                        case SliceDirection.Up:
                        case SliceDirection.Down:
                            assert(false);
                        case SliceDirection.Left:
                            return RotationAmount.Clockwise;
                        case SliceDirection.Right:
                            return RotationAmount.CounterClockwise;
                        default:
                            forceNever(direction);
                    }
                default:
                    forceNever(axis);
            }
        default:
            forceNever(side);
    }
}

function calculateOffsetIndex(
    cubeSize: number, 
    axis: CubeAxis, 
    offsetIndex: number, 
    sideRef: CubeSide | undefined
): number {
    switch (sideRef) {
        // This should only be if we came from a sidebar or something
        case undefined:
            return offsetIndex; 
        // For these, just return it as normal
        case CubeSide.Left:
        case CubeSide.Front:
        case CubeSide.Top:
            return offsetIndex;
        // Because of weird decisions made when I wrote the underlying matrix 
        // math, I need to invert these sides
        case CubeSide.Right:
        case CubeSide.Back:
            // but only for the vertical axis
            switch (axis) {
                case "X":
                    return offsetIndex;
                case "Y":
                case "Z":
                    return cubeSize - offsetIndex - 1;
                default:
                    forceNever(axis);
            }
        case CubeSide.Bottom:
            // and only on the horizontal axis, which is the Z axis
            return axis === "Z" ? cubeSize - offsetIndex - 1 : offsetIndex;
        default:
            forceNever(sideRef);
    }
}

/**
 * Button that can be used to rotate a cube slice
 */
export const SliceRotationButton
    : React.FC<ISliceRotationButtonProps> = props => {
        const { 
            axis, sliceStart, sliceSize = 1, rotationDirection, sideReference,
            size, dispatch 
        } = props;
        const [
            className, rotCount, titleDesc, offsetIndex, offsetSize
        ] = useMemo(() => {
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

            return [
                [actionButton, directionClassName].join(" "),
                calculateRotationCount(axis, rotationDirection, sideReference),
                dirTitleName,
                calculateOffsetIndex(size, axis, sliceStart, sideReference),
                sliceSize
            ];
        }, [rotationDirection, axis, sideReference, size]);

        const onClick = useCallback(() => 
            dispatch({
                type: CubeActionType.RotateInternal,
                axis,
                offsetIndex,
                offsetSize,
                rotationCount: rotCount
            }),
            [rotationDirection, axis, sliceStart, sliceSize, dispatch, rotCount]
        );
        const title = useMemo(
            () =>  {
                if (sliceSize === 1) {
                    return `Rotate ${axis}-axis [${sliceStart}] ${titleDesc}`;
                }
                const sliceEnd = sliceStart+sliceSize-1;
                return `Rotate ${axis}-axis [${sliceStart}-${sliceEnd}] ${
                    titleDesc}`;
            },
            [titleDesc, sliceStart, sliceSize]
        );

        return (
            <button 
                onClick={onClick} 
                className={className}
                role="button"
                title={title}
            >
            </button>
        );
}

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
            focusFace: sideId
        });
    }, [cubeDispatch, sideId]);

    return (
        <button 
            onClick={callback} 
            className={`${actionButton} ${focusFace}`}
            role="button"
            title={`Focus Face ${sideId}`}
            disabled={sideId === CubeSide.Front}
        >
        </button>
    );
}