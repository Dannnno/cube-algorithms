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
  rotateCube,
  rotateCubeFace,
  rotateCubeFromFace,
  rotateCubeInternalSlice,
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
   * Rotate an internal slice without referencing a face
   */
  RotateFacelessSlice,
  /**
   * Reset the cube to it's default shape and layout
   */
  ResetCube,
  /**
   * Rotate the cube so a new face is the "front" face (i.e. face #2)
   */
  FocusCube,
  /**
   * Resize the cube. Also resets shape and layout
   */
  ResizeCube,
  /**
   * Rotate the cube in a particular direction
   */
  RotateCube,
  /**
   * Rotate the cube in a particular direction, while facing one way
   */
  RotateCubeFromFace,
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

interface ICubeRotateFacelessSliceAction
  extends IActionBase<CubeActionType.RotateFacelessSlice> {
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

interface ICubeResizeAction extends IActionBase<CubeActionType.ResizeCube> {
  /** How large to make the new cube */
  readonly newSize: number;
}

interface ICubeFocusFaceAction extends IActionBase<CubeActionType.FocusCube> {
  /** The face to re-focus on */
  readonly focusFace: CubeSide;
}

interface IRotateCubeAction extends IActionBase<CubeActionType.RotateCube> {
  /** The axis to rotate along */
  readonly axis: CubeAxis;
  /** How many clockwise rotations to do */
  readonly rotationCount: number;
}

interface IRotateCubeFromFaceAction
  extends IActionBase<CubeActionType.RotateCubeFromFace> {
  /** The face that is being rotated with respect to */
  readonly faceRef: CubeSide;
  /** How many rotations to do */
  readonly rotationCount: number;
  /** Which direction to rotate in */
  readonly direction: SliceDirection;
}

/**
 * The types of actions that can be dispatched to modify a puzzle cube
 */
export type CubeActions =
  | ICubeRotateFaceAction
  | ICubeRotateSliceAction
  | ICubeRotateFacelessSliceAction
  | CubeResetCubeAction
  | ICubeFocusFaceAction
  | ICubeResizeAction
  | IRotateCubeAction
  | IRotateCubeFromFaceAction;

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
  switch (action.type) {
    case CubeActionType.RotateFace:
      return rotateCubeFace(state, action.sideId, action.rotationCount);
    case CubeActionType.RotateSlice:
      return rotateCubeSliceFromFace(
        state,
        action.refSide,
        action.axis,
        action.offsetIndex,
        action.offsetSize,
        action.direction,
        action.rotationCount,
      );
    case CubeActionType.RotateFacelessSlice:
      return rotateCubeInternalSlice(
        state,
        action.axis,
        action.offsetIndex,
        action.offsetSize,
        action.rotationCount,
      );
    case CubeActionType.ResizeCube:
      return buildCubeOfSize(action.newSize);
    case CubeActionType.ResetCube:
      return buildCubeOfSize(getCubeSize(state));
    case CubeActionType.FocusCube:
      return refocusCube(state, action.focusFace);
    case CubeActionType.RotateCube:
      return rotateCube(state, action.axis, action.rotationCount);
    case CubeActionType.RotateCubeFromFace:
      return rotateCubeFromFace(
        state,
        action.faceRef,
        action.direction,
        action.rotationCount,
      );
    default:
      forceNever(action);
  }
};

/**
 * Can be used to get a deep dependency on object changes
 * @param cube The cube to hash
 * @returns A 'hash' of the cube
 */
export function usePuzzleCubeHash(cube: DeepReadonly<CubeData>): string {
  return useMemo(() => cube.map(side => side.join(",")).join("|"), [cube]);
}
