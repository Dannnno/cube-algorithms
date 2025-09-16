import { CubeActions, CubeActionType } from "@/components/cubes";
import * as ohm from "ohm-js";
import { CubeSide } from "../cube";
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
  face: FaceNode,
  _acInd: _Terminal,
): CubeActions => {
  _assertNodeIsStronglyTyped(face, "face");
  return {
    type: CubeActionType.RotateFace,
    sideId: face.execute(),
    rotationCount: RotationAmount.CounterClockwise,
  };
};
const move_doubleRotation: _FrameworkVisitorCallback<MoveNode> = (
  face: FaceNode,
  _dblInd: _Terminal,
): CubeActions => {
  _assertNodeIsStronglyTyped(face, "face");
  return {
    type: CubeActionType.RotateFace,
    sideId: face.execute(),
    rotationCount: RotationAmount.Halfway,
  };
};
const move_singleRotationCW: _FrameworkVisitorCallback<MoveNode> = (
  face: FaceNode,
): CubeActions => {
  _assertNodeIsStronglyTyped(face, "face");
  return {
    type: CubeActionType.RotateFace,
    sideId: face.execute(),
    rotationCount: RotationAmount.Clockwise,
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
  [FaceNode, _Terminal] | [FaceNode]
>;
type FaceNode = _SemanticParseNode<"face", "execute", CubeSide, [_Terminal]>;
