import React, { useReducer } from "react";
import { CubeAxis, CubeData, CubeSide } from "@model/cube";
import { forceNever } from "@/common";
import { IReactCubeProps } from "@components/cubes";
import { 
    rotateCubeFace, rotateCubeInternalSlice 
} from "@model/geometry";

/**
 * Actions that can be taken on a cube
 */
export const enum CubeActionType {
    /**
     * Rotate a face clockwise
     */
    RotateFace,
    /**
     * Rotate an internal slice clockwise
     */
    RotateInternal,
    /**
     * Reset the cube to it's default shape and layout
     */
    ResetCube,
    /**
     * Rotate the cube so a new face is the "front" face (i.e. face #2)
     */
    RotateCube,
    /**
     * Resize the cube. Also resets shape and layout
     */
    ResizeCube,
}

interface IActionBase<T extends CubeActionType = CubeActionType> {
    /** The type of action to be taken on the cube */
    readonly type: T;
}

interface ICubeRotateFaceAction 
    extends IActionBase<CubeActionType.RotateFace> 
{
    /** The face that will be rotated */
    readonly sideId: CubeSide;
    /** How many times to rotate that face clockwise */
    readonly rotationCount: number;
}

interface ICubeRotateInternalAction 
    extends IActionBase<CubeActionType.RotateInternal> 
{
    /** Which axis to rotate the internal slices on */
    readonly axis: CubeAxis;
    /** How far into the cube to slice it */
    readonly offsetIndex: number;
    /** How many rows to slice at a time */
    readonly offsetSize: number;
    /** How many clockwise rotations to do */
    readonly rotationCount: number;
}

type CubeResetCubeAction = IActionBase<CubeActionType.ResetCube>;

interface ICubeResizeAction 
    extends IActionBase<CubeActionType.ResizeCube>
{
    /** How large to make the new cube */
    readonly newSize: number;
}

interface ICubeRotateCubeAction 
    extends IActionBase<CubeActionType.RotateCube> 
{
    /** The face to re-focus on */
    readonly focusFace: CubeSide;
}

/**
 * The types of actions that can be dispatched to modify a puzzle cube
 */
export type CubeActions = 
    ICubeRotateFaceAction 
    | ICubeRotateInternalAction 
    | CubeResetCubeAction 
    | ICubeRotateCubeAction
    | ICubeResizeAction;

/**
 * Custom hook to use a custom puzzle cube
 * @param initialSize The initial size of the cube
 * @returns React reducer to manage the cube
 */
export function usePuzzleCube(
    initialSize: number = 3
): [IReactCubeProps, React.Dispatch<CubeActions>] {
    return useReducer(puzzleReducer, initialSize, makeDefaultCube);
}

function makeDefaultCube(size: number): IReactCubeProps {
    return {
        cubeData: buildCubeOfSize(size),
    }
}

function buildCubeOfSize(size: number): CubeData {
    return [
        Array.from({length: size*size}, _ => 1),
        Array.from({length: size*size}, _ => 2),
        Array.from({length: size*size}, _ => 3),
        Array.from({length: size*size}, _ => 4),
        Array.from({length: size*size}, _ => 5),
        Array.from({length: size*size}, _ => 6)
    ];
}

const puzzleReducer: React.Reducer<IReactCubeProps, CubeActions> = 
    (state: IReactCubeProps, action: CubeActions) => {
        let cubeData: CubeData;
        switch (action.type) {
            case CubeActionType.RotateFace:
                cubeData = rotateCubeFace(
                    state.cubeData,
                    action.sideId,
                    action.rotationCount
                );
                break;
            case CubeActionType.RotateInternal:
                cubeData = rotateCubeInternalSlice(
                    state.cubeData,
                    action.axis,
                    action.offsetIndex,
                    action.offsetSize,
                    action.rotationCount
                );
                break;
            case CubeActionType.ResizeCube:
                cubeData = buildCubeOfSize(action.newSize);
                break;
            case CubeActionType.ResetCube:
            case CubeActionType.RotateCube:
                throw new Error("Not yet implemented");
            default:
                forceNever(action);
        }
        return { cubeData };
};