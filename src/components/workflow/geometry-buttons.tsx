import React, { useCallback, useMemo } from "react";
import { CubeActions, CubeActionType } from "@components/cubes";
import { CubeSide } from "@model/cube";
import { forceNever } from "@/common";
import styles, { 
    sidebar, rotateButton, buttonRow
} from "./geometry-buttons.module.scss";

interface IGeometrySidebarProps {
    readonly cubeDispatch: React.Dispatch<CubeActions>;
}

/**
 * Component that handle buttons to manipulate the cube
 */
export const GeometrySidebar: React.FC<IGeometrySidebarProps> = props => {
    return (
        <div className={sidebar}>
            <RotateButtonRow {...props} sideId={1} />
            <RotateButtonRow {...props} sideId={2} />
            <RotateButtonRow {...props} sideId={3} />
            <RotateButtonRow {...props} sideId={4} />
            <RotateButtonRow {...props} sideId={5} />
            <RotateButtonRow {...props} sideId={6} />
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

const RotateButtonRow: React.FC<IRotateFaceButtonRowProps> = props => {
    const { sideId } = props;
    const heading = useMemo(
        () => <h3>Rotate Face {props.sideId}</h3>, 
        [sideId]
    );

    return (
        <div>
            {heading}
            <div className={buttonRow}>
                <RotateButton 
                    {...props} 
                    direction={Direction.Clockwise} 
                    numRotations={1} 
                />
                <RotateButton 
                    {...props} 
                    direction={Direction.CounterClockwise} 
                    numRotations={3} 
                />
            </div>
        </div>
    );
};

interface IRotateFaceButtonProps extends IRotateFaceButtonRowProps {
    readonly direction: Direction;
    readonly numRotations: number;
}

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

const RotateButton: React.FC<IRotateFaceButtonProps> = props => {
    const { direction, numRotations, cubeDispatch, sideId } = props;

    const icon = useRotationIcon(direction);

    const callback = useCallback(() => 
        cubeDispatch({
            type: CubeActionType.RotateFace,
            sideId: sideId,
            rotationCount: numRotations
        }),
        [cubeDispatch, sideId, numRotations]);

    return (
        <button onClick={callback} className={rotateButton}>
            <img src={icon} />
        </button>
    )
};

export default GeometrySidebar;