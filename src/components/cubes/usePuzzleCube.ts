import { DeepReadonly, forceNever } from "@/common";
import {
  CubeAxis,
  CubeData,
  CubeSide,
  SliceDirection,
  getCubeSize,
} from "@model/cube";
import {
  refocusCube,
  rotateCubeFace,
  rotateCubeSliceFromFace,
} from "@model/geometry";
import React, { useMemo, useReducer } from "react";

/**
 * Actions that can be taken on a cube
 */
export const enum CubeActionType {
  /**
   * Rotate a face
   */
  RotateFace,
  /**
   * Rotate an internal slice
   */
  RotateSlice,
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

interface ICubeRotateFaceAction extends IActionBase<CubeActionType.RotateFace> {
  /** The face that will be rotated */
  readonly sideId: CubeSide;
  /** How many times to rotate that face clockwise */
  readonly rotationCount: number;
}

interface ICubeRotateSliceAction
  extends IActionBase<CubeActionType.RotateSlice> {
  /** Which axis to rotate the internal slices on */
  readonly axis: CubeAxis;
  /** How far into the cube to slice it */
  readonly offsetIndex: number;
  /** How many rows to slice at a time */
  readonly offsetSize: number;
  /** How many clockwise rotations to do */
  readonly rotationCount: number;
  /** The direction to rotate in */
  readonly direction: SliceDirection;
  /** The side we're looking at while slicing */
  readonly refSide: CubeSide;
}

type CubeResetCubeAction = IActionBase<CubeActionType.ResetCube>;

interface ICubeResizeAction extends IActionBase<CubeActionType.ResizeCube> {
  /** How large to make the new cube */
  readonly newSize: number;
}

interface ICubeRotateCubeAction extends IActionBase<CubeActionType.RotateCube> {
  /** The face to re-focus on */
  readonly focusFace: CubeSide;
}

/**
 * The types of actions that can be dispatched to modify a puzzle cube
 */
export type CubeActions =
  | ICubeRotateFaceAction
  | ICubeRotateSliceAction
  | CubeResetCubeAction
  | ICubeRotateCubeAction
  | ICubeResizeAction;

/**
 * Custom hook to use a custom puzzle cube
 * @param initialSize The initial size of the cube
 * @returns React reducer to manage the cube
 */
export function usePuzzleCube(
  initialSize: number = 3,
): [DeepReadonly<CubeData>, React.Dispatch<CubeActions>] {
  return useReducer(puzzleReducer, initialSize, buildCubeOfSize);
}

function buildCubeOfSize(size: number): CubeData {
  return [
    Array.from({ length: size * size }, _ => 1),
    Array.from({ length: size * size }, _ => 2),
    Array.from({ length: size * size }, _ => 3),
    Array.from({ length: size * size }, _ => 4),
    Array.from({ length: size * size }, _ => 5),
    Array.from({ length: size * size }, _ => 6),
  ];
}

const puzzleReducer: React.Reducer<DeepReadonly<CubeData>, CubeActions> = (
  state: DeepReadonly<CubeData>,
  action: CubeActions,
) => {
  let cubeData: CubeData;
  switch (action.type) {
    case CubeActionType.RotateFace:
      cubeData = rotateCubeFace(state, action.sideId, action.rotationCount);
      break;
    case CubeActionType.RotateSlice:
      cubeData = rotateCubeSliceFromFace(
        state,
        action.refSide,
        action.axis,
        action.offsetIndex,
        action.offsetSize,
        action.direction,
        action.rotationCount,
      );
      break;
    case CubeActionType.ResizeCube:
      cubeData = buildCubeOfSize(action.newSize);
      break;
    case CubeActionType.ResetCube:
      cubeData = buildCubeOfSize(getCubeSize(state));
      break;
    case CubeActionType.RotateCube:
      cubeData = refocusCube(state, action.focusFace);
      break;
    default:
      forceNever(action);
  }
  return cubeData;
};

/**
 * Can be used to get a deep dependency on object changes
 * @param cube The cube to hash
 * @returns A 'hash' of the cube
 */
export function usePuzzleCubeHash(cube: DeepReadonly<CubeData>): string {
  return useMemo(() => cube.map(side => side.join(",")).join("|"), [cube]);
}
