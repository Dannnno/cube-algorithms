import React, { useCallback, useMemo } from "react";
import { CubeActions, CubeActionType } from "@components/cubes";
import { CubeAxis, CubeSide } from "@model/cube";
import { forceNever } from "@/common";
import styles, { 
    sidebar, rotateButton, buttonRow
} from "./geometry-buttons.module.scss";
import { RotationAmount } from "@/model/geometry";

interface IGeometrySidebarProps {
    readonly cubeDispatch: React.Dispatch<CubeActions>;
}

/**
 * Component that handle buttons to manipulate the cube
 */
export const GeometrySidebar: React.FC<IGeometrySidebarProps> = props => {
    return (
        <div className={sidebar}>
            <RotateButtonRow {...props} sideId={CubeSide.Left} />
            <RotateButtonRow {...props} sideId={CubeSide.Front} />
            <RotateButtonRow {...props} sideId={CubeSide.Right} />
            <RotateButtonRow {...props} sideId={CubeSide.Back} />
            <RotateButtonRow {...props} sideId={CubeSide.Top} />
            <RotateButtonRow {...props} sideId={CubeSide.Bottom} />

            <RotateButtonRow {...props} axis={"X"} offsetStart={1} />
            <RotateButtonRow {...props} axis={"Y"} offsetStart={1} />
            <RotateButtonRow {...props} axis={"Z"} offsetStart={1} />
            
            <FocusButton {...props} sideId={CubeSide.Left} />
            <FocusButton {...props} sideId={CubeSide.Front} />
            <FocusButton {...props} sideId={CubeSide.Right} />
            <FocusButton {...props} sideId={CubeSide.Back} />
            <FocusButton {...props} sideId={CubeSide.Top} />
            <FocusButton {...props} sideId={CubeSide.Bottom} />
        </div>
    );
};

enum Direction {
    Clockwise,
    CounterClockwise
}

interface IRotateFaceButtonRowProps extends IGeometrySidebarProps {
    readonly sideId: CubeSide;
    
}

interface IRotateSliceButtonRowProps extends IGeometrySidebarProps {
    readonly axis: CubeAxis;
    readonly offsetStart: number;
    readonly offsetSize?: number;
}

type RotateButtonRowProps = IRotateFaceButtonRowProps | IRotateSliceButtonRowProps;

const RotateButtonRow: React.FC<RotateButtonRowProps> = props => {
    const heading = useMemo(() => {
        if ("sideId" in props) {
            return <h3>Rotate Face {props.sideId}</h3>
        } else {
            return (
                <>
                    <h3>Rotate {props.axis} Axis</h3>
                </>
            );
        }
    }, [props]);

    return (
        <div>
            {heading}
            <div className={buttonRow}>
                <RotateButton 
                    {...props} 
                    direction={Direction.Clockwise} 
                    numRotations={RotationAmount.Clockwise} 
                />
                <RotateButton 
                    {...props} 
                    direction={Direction.CounterClockwise} 
                    numRotations={RotationAmount.CounterClockwise} 
                />
            </div>
        </div>
    );
};

interface IRotateButtonProps {
    readonly direction: Direction;
    readonly numRotations: number;
}

type RotateFaceButtonProps = IRotateButtonProps & IRotateFaceButtonRowProps;
type RotateSliceButtonProps = IRotateButtonProps & IRotateSliceButtonRowProps;
type RotateButtonProps = RotateFaceButtonProps | RotateSliceButtonProps;

function useRotationIcon(direction: Direction): string {
    return useMemo(() => {
        switch (direction) {
            case Direction.Clockwise:
                return "/src/assets/clockwise-rotation.svg";
            case Direction.CounterClockwise:
                return "/src/assets/anticlockwise-rotation.svg";
            default:
                forceNever(direction);
        }
    }, [direction]);
}

const RotateButton: React.FC<RotateButtonProps> = props => {
    const { direction, numRotations, cubeDispatch } = props;

    const icon = useRotationIcon(direction);

    const callback = useMemo(() => {
        if ("sideId" in props) {
            return () => {
                cubeDispatch({
                    type: CubeActionType.RotateFace,
                    sideId: props.sideId,
                    rotationCount: numRotations
                });
            };
        } else {
            return () => {
                cubeDispatch({
                    type: CubeActionType.RotateInternal,
                    axis: props.axis,
                    offsetIndex: props.offsetStart,
                    offsetSize: props.offsetSize ?? 1,
                    rotationCount: numRotations
                });
            };
        }
    }, [cubeDispatch, props]);

    return (
        <button onClick={callback} className={rotateButton}>
            <img src={icon} />
        </button>
    )
};

interface IFocusButtonProps extends IGeometrySidebarProps {
    readonly sideId: CubeSide;
}

const FocusButton: React.FC<IFocusButtonProps> = props => {
    const { cubeDispatch, sideId } = props;
    const callback = useCallback(() => {
        cubeDispatch({
            type: CubeActionType.RotateCube,
            focusFace: sideId
        });
    }, [cubeDispatch, sideId]);

    return (
        <div>
            <h3>Focus Face {sideId}</h3>
            <button onClick={callback} className={rotateButton}>
                <img src="/src/assets/eye-target.svg" />
            </button>
        </div>
    );
}

export default GeometrySidebar;