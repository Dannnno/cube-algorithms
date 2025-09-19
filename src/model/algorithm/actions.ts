import { assert, forceNever } from "@/common";
import {
  CubeActionType,
  CubeActions,
  ICubeRotateFaceDeepAction,
  ICubeRotateSliceAction,
} from "@/components/cubes";
import * as ohm from "ohm-js";
import { CubeAxis, CubeSide, SliceDirection } from "../cube";
import { RotationAmount } from "../geometry";
import {
  _FrameworkVisitorCallback,
  _Iter,
  _SemanticExecutor,
  _SemanticParseNode,
  _Terminal,
  _assertNodeIsStronglyTyped,
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
    deepTurnAny,
    deepTurnPrefix,
    deepTurnJapanese,
    deepTurnSub,
    deepTurnFace_front,
    deepTurnFace_up,
    deepTurnFace_right,
    deepTurnFace_back,
    deepTurnFace_left,
    deepTurnFace_down,
    face_front,
    face_up,
    face_right,
    face_back,
    face_left,
    face_down,
    slice_middle,
    slice_equatorial,
    slice_standing,
    wholeCube_cubeOnR,
    wholeCube_cubeOnU,
    wholeCube_cubeOnF,
    subscript_latex,
    subscript_unicode,
    prefix,
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
      return { ...node.execute(), rotationCount };
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
    case "deepTurnAny":
      _assertNodeIsStronglyTyped(node, "deepTurnAny");
      return { ...node.execute(), rotationCount };
    default:
      forceNever(node);
  }
}

const deepTurnAny: _FrameworkVisitorCallback<DeepTurnAnyNode> = (
  deepTurn:
    | DeepTurnPrefixNode
    | DeepTurnJapaneseNode
    | DeepTurnSubNode
    | DeepTurnFaceNode,
): PartialDeepTurn => {
  switch (deepTurn.ctorName) {
    case "deepTurnPrefix":
      _assertNodeIsStronglyTyped(deepTurn, "deepTurnPrefix");
      return deepTurn.execute();
    case "deepTurnJapanese":
      _assertNodeIsStronglyTyped(deepTurn, "deepTurnJapanese");
      return deepTurn.execute();
    case "deepTurnSub":
      _assertNodeIsStronglyTyped(deepTurn, "deepTurnSub");
      return deepTurn.execute();
    case "deepTurnFace":
      _assertNodeIsStronglyTyped(deepTurn, "deepTurnFace");
      return deepTurn.execute();
    default:
      forceNever(deepTurn);
  }
};
const deepTurnPrefix: _FrameworkVisitorCallback<DeepTurnPrefixNode> = (
  prefix: PrefixNode,
  face: DeepTurnJapaneseNode,
): PartialDeepTurn => ({ ...face.execute(), depth: prefix.execute() });
const deepTurnJapanese: _FrameworkVisitorCallback<DeepTurnJapaneseNode> = (
  face: FaceNode,
  _w: _Terminal,
): PartialDeepTurn => getDeepTurn(face.execute(), 2);

const deepTurnSub: _FrameworkVisitorCallback<DeepTurnSubNode> = (
  face: FaceNode,
  sub: SubscriptNode,
): PartialDeepTurn => {
  _assertNodeIsStronglyTyped(face, "face");
  _assertNodeIsStronglyTyped(sub, "subscript");
  return getDeepTurn(face.execute(), sub.execute());
};
const deepTurnFace_front: _FrameworkVisitorCallback<DeepTurnFaceNode> = (
  _face: _Terminal,
): PartialDeepTurn => getDeepTurn(CubeSide.Front, 2);
const deepTurnFace_up: _FrameworkVisitorCallback<DeepTurnFaceNode> = (
  _face: _Terminal,
): PartialDeepTurn => getDeepTurn(CubeSide.Top, 2);
const deepTurnFace_right: _FrameworkVisitorCallback<DeepTurnFaceNode> = (
  _face: _Terminal,
): PartialDeepTurn => getDeepTurn(CubeSide.Right, 2);
const deepTurnFace_back: _FrameworkVisitorCallback<DeepTurnFaceNode> = (
  _face: _Terminal,
): PartialDeepTurn => getDeepTurn(CubeSide.Back, 2);
const deepTurnFace_left: _FrameworkVisitorCallback<DeepTurnFaceNode> = (
  _face: _Terminal,
): PartialDeepTurn => getDeepTurn(CubeSide.Left, 2);
const deepTurnFace_down: _FrameworkVisitorCallback<DeepTurnFaceNode> = (
  _face: _Terminal,
): PartialDeepTurn => getDeepTurn(CubeSide.Bottom, 2);

function getDeepTurn(sideId: CubeSide, depth: number): PartialDeepTurn {
  return {
    type: CubeActionType.RotateFaceDeepTurn,
    sideId: sideId,
    depth,
  };
}

const wholeCube_cubeOnR: _FrameworkVisitorCallback<WholeCubeNode> = (
  _axis: _Terminal,
): CubeAxis => CubeAxis.Middle;
const wholeCube_cubeOnU: _FrameworkVisitorCallback<WholeCubeNode> = (
  _axis: _Terminal,
): CubeAxis => CubeAxis.Equatorial;
const wholeCube_cubeOnF: _FrameworkVisitorCallback<WholeCubeNode> = (
  _axis: _Terminal,
): CubeAxis => CubeAxis.Standing;

const slice_middle: _FrameworkVisitorCallback<SliceNode> = (
  _slice: _Terminal,
): Omit<ICubeRotateSliceAction, "rotationCount"> => {
  return {
    type: CubeActionType.RotateSlice,
    axis: CubeAxis.Middle,
    direction: SliceDirection.Down,
    refSide: CubeSide.Front,
  };
};
const slice_equatorial: _FrameworkVisitorCallback<SliceNode> = (
  _slice: _Terminal,
): Omit<ICubeRotateSliceAction, "rotationCount"> => {
  return {
    type: CubeActionType.RotateSlice,
    axis: CubeAxis.Equatorial,
    direction: SliceDirection.Right,
    refSide: CubeSide.Left,
  };
};
const slice_standing: _FrameworkVisitorCallback<SliceNode> = (
  _slice: _Terminal,
): Omit<ICubeRotateSliceAction, "rotationCount"> => {
  return {
    type: CubeActionType.RotateSlice,
    axis: CubeAxis.Standing,
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

const subscript_latex: _FrameworkVisitorCallback<SubscriptNode> = (
  _: _Terminal,
  digit: _Terminal,
): number => Number.parseInt(digit.sourceString);
const subscript_unicode: _FrameworkVisitorCallback<SubscriptNode> = (
  subscript: _Terminal,
): number => {
  switch (subscript.sourceString) {
    case "\u2082":
      return 2;
    case "\u2083":
      return 3;
    case "\u2084":
      return 4;
    case "\u2085":
      return 5;
    default:
      assert(false);
  }
};

const prefix: _FrameworkVisitorCallback<PrefixNode> = (
  digit: _Terminal,
): number => Number.parseInt(digit.sourceString);

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

type SomeMoveNode = SliceNode | FaceNode | WholeCubeNode | DeepTurnAnyNode;

type DeepTurnAnyNode = _SemanticParseNode<
  "deepTurnAny",
  "execute",
  PartialDeepTurn,
  | [DeepTurnPrefixNode]
  | [DeepTurnJapaneseNode]
  | [DeepTurnSubNode]
  | [DeepTurnFaceNode]
>;
type DeepTurnPrefixNode = _SemanticParseNode<
  "deepTurnPrefix",
  "execute",
  PartialDeepTurn,
  [PrefixNode, DeepTurnJapaneseNode]
>;
type DeepTurnJapaneseNode = _SemanticParseNode<
  "deepTurnJapanese",
  "execute",
  PartialDeepTurn,
  [FaceNode, _Terminal]
>;
type DeepTurnSubNode = _SemanticParseNode<
  "deepTurnSub",
  "execute",
  PartialDeepTurn,
  [FaceNode, SubscriptNode]
>;
type DeepTurnFaceNode = _SemanticParseNode<
  "deepTurnFace",
  "execute",
  PartialDeepTurn,
  [_Terminal]
>;

type FaceNode = _SemanticParseNode<"face", "execute", CubeSide, [_Terminal]>;

type SliceNode = _SemanticParseNode<
  "slice",
  "execute",
  PartialSlice,
  [_Terminal]
>;

type WholeCubeNode = _SemanticParseNode<
  "wholeCube",
  "execute",
  CubeAxis,
  [_Terminal]
>;

type SubscriptNode = _SemanticParseNode<
  "subscript",
  "execute",
  number,
  [_Terminal] | [_Terminal, _Terminal]
>;

type PrefixNode = _SemanticParseNode<"prefix", "execute", number, [_Terminal]>;

type PartialSlice = RotationLessAction<ICubeRotateSliceAction>;
type PartialDeepTurn = RotationLessAction<ICubeRotateFaceDeepAction>;

type RotationLessAction<T> = Omit<T, "rotationCount">;
