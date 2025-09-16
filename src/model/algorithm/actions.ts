import { forceNever } from "@/common";
import {
  CubeActions,
  CubeActionType,
  ICubeRotateSliceAction,
} from "@/components/cubes";
import * as ohm from "ohm-js";
import { CubeAxis, CubeSide, SliceDirection } from "../cube";
import { RotationAmount } from "../geometry";
import {
  _assertNodeIsStronglyTyped,
  _FrameworkVisitorCallback,
  _Iter,
  _SemanticExecutor,
  _SemanticParseNode,
  _Terminal,
} from "./semantics";

/**
 * Object that can be used to interpret an algorithm as steps
 */
export type _CubeSemantics = _SemanticExecutor<
  { execute: CubeActions[] },
  Record<string, never>
>;

/**
 * Get a semantics object to support parsing an algorithm into discrete steps
 * @param parser The parser object
 * @returns Object that can be used to interpret an algorithm as steps
 */
export function _getActionSemantics(parser: ohm.Grammar): _CubeSemantics {
  return parser.createSemantics().addOperation("execute", {
    expression,
    move_singleRotationAC,
    move_doubleRotation,
    move_singleRotationCW,
    wholeCube_cubeOnR,
    wholeCube_cubeOnU,
    wholeCube_cubeOnF,
    slice_middle,
    slice_equatorial,
    slice_standing,
    face_front,
    face_up,
    face_right,
    face_back,
    face_left,
    face_down,
  } as unknown as ohm.ActionDict<unknown>) as unknown as _CubeSemantics;
}

const expression: _FrameworkVisitorCallback<ExpressionNode> = (
  firstMove: AllMovesNode,
  _spaces: _Iter<_Terminal>,
  restMoves: _Iter<AllMovesNode>,
  _trailSpaces: _Iter<_Terminal>,
): CubeActions[] => {
  return [
    firstMove.execute(),
    ...restMoves.asIteration().children.map(child => {
      _assertNodeIsStronglyTyped<AllMovesNode>(child, "allMoves");
      return child.execute();
    }),
  ];
};

const move_singleRotationAC: _FrameworkVisitorCallback<MoveNode> = (
  node: SomeMoveNode,
  _acInd: _Terminal,
): CubeActions => doMove(node, RotationAmount.CounterClockwise);
const move_doubleRotation: _FrameworkVisitorCallback<MoveNode> = (
  node: SomeMoveNode,
  _dblInd: _Terminal,
): CubeActions => doMove(node, RotationAmount.Halfway);
const move_singleRotationCW: _FrameworkVisitorCallback<MoveNode> = (
  node: SomeMoveNode,
): CubeActions => doMove(node, RotationAmount.Clockwise);
function doMove(
  node: SomeMoveNode,
  rotationCount: RotationAmount,
): CubeActions {
  switch (node.ctorName) {
    case "slice":
      _assertNodeIsStronglyTyped(node, "slice");
      return {
        ...node.execute(),
        rotationCount,
      };
    case "face":
      _assertNodeIsStronglyTyped(node, "face");
      return {
        type: CubeActionType.RotateFace,
        sideId: node.execute(),
        rotationCount,
      };
    case "wholeCube":
      _assertNodeIsStronglyTyped(node, "wholeCube");
      return {
        type: CubeActionType.RotateCube,
        axis: node.execute(),
        rotationCount,
      };
    default:
      forceNever(node);
  }
}

const wholeCube_cubeOnR: _FrameworkVisitorCallback<WholeCubeNode> = (
  _axis: _Terminal,
): CubeAxis => "Y";
const wholeCube_cubeOnU: _FrameworkVisitorCallback<WholeCubeNode> = (
  _axis: _Terminal,
): CubeAxis => "X";
const wholeCube_cubeOnF: _FrameworkVisitorCallback<WholeCubeNode> = (
  _axis: _Terminal,
): CubeAxis => "Z";

const slice_middle: _FrameworkVisitorCallback<SliceNode> = (
  _slice: _Terminal,
): Omit<ICubeRotateSliceAction, "rotationCount"> => {
  return {
    type: CubeActionType.RotateSlice,
    axis: "Y",
    direction: SliceDirection.Down,
    refSide: CubeSide.Front,
  };
};
const slice_equatorial: _FrameworkVisitorCallback<SliceNode> = (
  _slice: _Terminal,
): Omit<ICubeRotateSliceAction, "rotationCount"> => {
  return {
    type: CubeActionType.RotateSlice,
    axis: "X",
    direction: SliceDirection.Right,
    refSide: CubeSide.Left,
  };
};
const slice_standing: _FrameworkVisitorCallback<SliceNode> = (
  _slice: _Terminal,
): Omit<ICubeRotateSliceAction, "rotationCount"> => {
  return {
    type: CubeActionType.RotateSlice,
    axis: "Z",
    direction: SliceDirection.Up,
    refSide: CubeSide.Left,
  };
};

const face_front: _FrameworkVisitorCallback<FaceNode> = (
  _face: _Terminal,
): CubeSide => CubeSide.Front;
const face_up: _FrameworkVisitorCallback<FaceNode> = (
  _face: _Terminal,
): CubeSide => CubeSide.Top;
const face_right: _FrameworkVisitorCallback<FaceNode> = (
  _face: _Terminal,
): CubeSide => CubeSide.Right;
const face_back: _FrameworkVisitorCallback<FaceNode> = (
  _face: _Terminal,
): CubeSide => CubeSide.Back;
const face_left: _FrameworkVisitorCallback<FaceNode> = (
  _face: _Terminal,
): CubeSide => CubeSide.Left;
const face_down: _FrameworkVisitorCallback<FaceNode> = (
  _face: _Terminal,
): CubeSide => CubeSide.Bottom;

type ExpressionNode = _SemanticParseNode<
  "expression",
  "execute",
  CubeActions[],
  [AllMovesNode, _Iter<_Terminal>, _Iter<AllMovesNode>, _Iter<_Terminal>]
>;

type AllMovesNode = _SemanticParseNode<
  "allMoves",
  "execute",
  CubeActions,
  [MoveNode]
>;

type MoveNode = _SemanticParseNode<
  "move",
  "execute",
  CubeActions,
  [SomeMoveNode, _Terminal] | [SomeMoveNode]
>;

type SomeMoveNode = SliceNode | FaceNode | WholeCubeNode;

type WholeCubeNode = _SemanticParseNode<
  "wholeCube",
  "execute",
  CubeAxis,
  [_Terminal]
>;

type SliceNode = _SemanticParseNode<
  "slice",
  "execute",
  Omit<ICubeRotateSliceAction, "rotationCount">,
  [_Terminal]
>;

type FaceNode = _SemanticParseNode<"face", "execute", CubeSide, [_Terminal]>;
