import { assert, forceNever } from "@/common";
import { CubeActionType, CubeActions } from "@/components/cubes";
import {
  Grammar,
  MatchResult,
  Semantics as OhmSemantics,
  Node as ParseNode,
  grammar,
} from "ohm-js";
import { CubeAxis, CubeSide } from "./cube";
import { RotationAmount } from "./geometry";

/**
 * Get a PEG parser for the puzzle cube algorithm language
 * @returns The parser object for the puzzle-cube algorithm language
 */
export function getAlgorithmParser(): Grammar {
  return grammar(String.raw`
    Algorithm {
      expression = allMoves (space+ allMoves)* space*

      allMoves = move<multiLayer>
               | move<face>
               | move<slice>
               | move<wholeCube>

      move<type> = type antiClockwise -- singleRotationAC
                 | type "2"           -- doubleRotation
                 | type               -- singleRotationCW

      multiLayer = digit face "w"       -- deepDeepTurnJapanese
                 | digit face subscript -- deepInnerSlice
                 | digit face           -- innerSlice
                 | face subscript       -- deepTurnSub
                 | face "w"             -- deepTurnJapanese
                 | doubleFace           -- deepTurn

      face = "F" -- front
           | "U" -- up
           | "R" -- right
           | "B" -- back
           | "L" -- left
           | "D" -- down

      antiClockwise = "'"

      slice = "M" -- middle
            | "E" -- equatorial
            | "S" -- standing

      wholeCube = "X" -- cubeOnR
                | "Y" -- cubeOnU
                | "Z" -- cubeOnF

      doubleFace = "f" -- front
                 | "u" -- up
                 | "r" -- right
                 | "b" -- back
                 | "l" -- left
                 | "d" -- down                 

      subscript = "_" "2".."8"           -- latexSubscript
                | "\u{2082}".."\u{2088}" -- unicodeSubscript
    }
  `);
}

/**
 * A semantics object that can be used to get a type-safe operation
 */
export type Semantics<T> = {
  (match: MatchResult): { execute(): T };
} & OhmSemantics;

/**
 * Get an object that can translate a parse match into semantic meaning -
 * specifically to turn a cube algorithm into a series of discrete cube actions.
 * @param parser The PEG parser
 * @returns A semantic object that can translate a match into a list of cube actions
 */
export function getCubeActionSemantics(
  parser: Grammar,
): Semantics<CubeActions[]> {
  return parser.createSemantics().addOperation<any>("execute", {
    expression,
    move_singleRotationAC,
    move_doubleRotation,
    move_singleRotationCW,
    multiLayer_deepDeepTurnJapanese,
    multiLayer_deepInnerSlice,
    multiLayer_innerSlice,
    multiLayer_deepTurnSub,
    multiLayer_deepTurnJapanese,
    multiLayer_deepTurn,
    face_front: face_getSemanticAction(CubeSide.Front),
    face_up: face_getSemanticAction(CubeSide.Top),
    face_right: face_getSemanticAction(CubeSide.Right),
    face_back: face_getSemanticAction(CubeSide.Back),
    face_left: face_getSemanticAction(CubeSide.Left),
    face_down: face_getSemanticAction(CubeSide.Bottom),
    slice_middle: slice_getSemanticAction("Y", -1),
    slice_equatorial: slice_getSemanticAction("X", -1),
    slice_standing: slice_getSemanticAction("Z", 1),
    wholeCube_cubeOnR: wholeCube_getSemanticAction("Y", 1),
    wholeCube_cubeOnU: wholeCube_getSemanticAction("X", 1),
    wholeCube_cubeOnF: wholeCube_getSemanticAction("Z", 1),
    doubleFace_front: doubleFace_getSemanticAction(CubeSide.Front, "Z", -1, 1),
    doubleFace_up: doubleFace_getSemanticAction(CubeSide.Top, "X", 1, 1),
    doubleFace_right: doubleFace_getSemanticAction(CubeSide.Right, "Y", -1, 1),
    doubleFace_back: doubleFace_getSemanticAction(CubeSide.Back, "Z", 1, -1),
    doubleFace_left: doubleFace_getSemanticAction(CubeSide.Left, "Y", 1, -1),
    doubleFace_down: doubleFace_getSemanticAction(CubeSide.Bottom, "X", -1, -1),
    subscript_latexSubscript,
    subscript_unicodeSubscript,
  }) as Semantics<CubeActions[]>;
}

// Everything below this point is a bit clunky. The goal is for a type-safe-ish
// approach to semantic actions. It is highly encouraged to review the Ohm.js docs
// https://ohmjs.org/docs/api-reference#semantic-actions and
// https://ohmjs.org/docs/api-reference#parse-nodes to make sure you understand
// what is happening here. Generally, the way the Ohm semantic actions API works
// is that every node has a dictionary of arbitrary attributes and operations
// that are added by calling `semantics.addAttribute` and `semantics.addOperation`
// respectively. It relies on you knowing and understanding the grammar well
// enough to do everything correctly, as well as just knowing what calling
// node.<<some operation>>() will do and return. To make things a bit easier
// on myself for future troubleshooting I added some semi-type safe guarantees
// (mainly on what `execute()` will return) as well as some assertions that
// given parameters will match what we expect them to. The list of actions
// above, and the corresponding functions below, _should_ align with the grammar
// definition itself. If it doesn't, that should be updated as well.

function expression(
  firstMove: ParseNode,
  _optSpaces: ParseNode,
  restMoves: ParseNode,
  _trailSpaces: ParseNode,
): CubeActions[] {
  const actions = [
    firstMove.execute() as CubeActions | CubeActions[],
    ...(restMoves.children.map(child => child.execute()) as (
      | CubeActions
      | CubeActions[]
    )[]),
  ];
  const ret: CubeActions[] = [];
  for (const act of actions) {
    if (Array.isArray(act)) {
      ret.push(...act);
    } else {
      ret.push(act);
    }
  }
  return ret;
}

const move_singleRotationAC: ExecuteCallback<MoveNode> = (
  type: ParseNode,
  _ind: ParseNode,
) => {
  switch (type.ctorName) {
    case "multiLayer":
      asSafeParseNode(type, "multiLayer");
      return move_semanticAction_multiLayer(
        type,
        RotationAmount.CounterClockwise,
      );
    case "face":
      asSafeParseNode(type, "face");
      return move_semanticAction_face(type, RotationAmount.CounterClockwise);
    case "slice":
      asSafeParseNode(type, "slice");
      return move_semanticAction_slice(type, RotationAmount.CounterClockwise);
    case "wholeCube":
      asSafeParseNode(type, "wholeCube");
      return move_semanticAction_wholeCube(
        type,
        RotationAmount.CounterClockwise,
      );
  }
  assert(false);
};

const move_doubleRotation: ExecuteCallback<MoveNode> = (
  type: ParseNode,
  _2: ParseNode,
) => {
  switch (type.ctorName) {
    case "multiLayer":
      asSafeParseNode(type, "multiLayer");
      return move_semanticAction_multiLayer(type, RotationAmount.Halfway);
    case "face":
      asSafeParseNode(type, "face");
      return move_semanticAction_face(type, RotationAmount.Halfway);
    case "slice":
      asSafeParseNode(type, "slice");
      return move_semanticAction_slice(type, RotationAmount.Halfway);
    case "wholeCube":
      asSafeParseNode(type, "wholeCube");
      return move_semanticAction_wholeCube(type, RotationAmount.Halfway);
  }
  assert(false);
};

const move_singleRotationCW: ExecuteCallback<MoveNode> = (type: ParseNode) => {
  switch (type.ctorName) {
    case "multiLayer":
      asSafeParseNode(type, "multiLayer");
      return move_semanticAction_multiLayer(type, RotationAmount.Clockwise);
    case "face":
      asSafeParseNode(type, "face");
      return move_semanticAction_face(type, RotationAmount.Clockwise);
    case "slice":
      asSafeParseNode(type, "slice");
      return move_semanticAction_slice(type, RotationAmount.Clockwise);
    case "wholeCube":
      asSafeParseNode(type, "wholeCube");
      return move_semanticAction_wholeCube(type, RotationAmount.Clockwise);
  }
  assert(false);
};

function move_semanticAction_multiLayer(
  multiLayer: MultiLayerNode,
  rotationCount: RotationAmount,
): CubeActions | CubeActions[] {
  const multiLayerAction = multiLayer.execute();
  if (Array.isArray(multiLayerAction)) {
    const [face, slice] = multiLayerAction;
    return [
      { ...face, rotationCount },
      move_semanticAction_fixSlice(slice, rotationCount),
    ];
  } else {
    return move_semanticAction_fixSlice(multiLayerAction, rotationCount);
  }
}

function move_semanticAction_face(
  face: FaceNode,
  rotationCount: RotationAmount,
): CubeActions {
  const faceAction = face.execute();
  return { ...faceAction, rotationCount };
}

function move_semanticAction_slice(
  slice: SliceNode,
  rotationCount: RotationAmount,
): CubeActions {
  const sliceAction = slice.execute();
  return move_semanticAction_fixSlice(sliceAction, rotationCount);
}

function move_semanticAction_fixSlice(
  partialSlice: {
    type: CubeActionType.RotateFacelessSlice;
    axis: CubeAxis;
    offsetIndex?: number;
    offsetSize?: number;
    sign?: 1 | -1;
  },
  rotationCount: RotationAmount,
): CubeActions {
  const {
    type,
    axis,
    offsetIndex = 1,
    offsetSize = 1,
    sign = 1,
  } = partialSlice;

  const safeOffset = offsetIndex < 0 ? offsetIndex - 1 : offsetIndex;
  return {
    type,
    axis,
    offsetIndex: safeOffset,
    offsetSize,
    rotationCount: rotationCount * sign,
  };
}

function move_semanticAction_wholeCube(
  cubeNode: WholeCubeNode,
  rotationCount: RotationAmount,
): CubeActions {
  const cubeAction = cubeNode.execute();
  const sign = cubeAction.sign ?? 1;
  return { ...cubeAction, rotationCount: rotationCount * sign };
}

const multiLayer_deepDeepTurnJapanese: ExecuteCallback<MultiLayerNode> = (
  digit: ParseNode,
  face: ParseNode,
  _w: ParseNode,
) => {
  asSafeParseNode(face, "face");
  const offsetSize = Number.parseInt(digit.sourceString);
  const faceAction = face.execute();
  return multiLayer_makeSlice(faceAction, 1, offsetSize);
};

const multiLayer_deepInnerSlice: ExecuteCallback<MultiLayerNode> = (
  digit: ParseNode,
  face: ParseNode,
  subscript: ParseNode,
) => {
  asSafeParseNode(face, "face");
  asSafeParseNode(subscript, "subscript");
  const offsetStart = Number.parseInt(digit.sourceString);
  const offsetSize = subscript.execute();
  const faceAction = face.execute();
  return multiLayer_makeSlice(faceAction, offsetStart, offsetSize);
};

const multiLayer_innerSlice: ExecuteCallback<MultiLayerNode> = (
  count: ParseNode,
  face: ParseNode,
) => {
  asSafeParseNode(face, "face");
  const offsetSize = Number.parseInt(count.sourceString);
  const faceAction = face.execute();
  return multiLayer_makeSlice(faceAction, 1, offsetSize);
};

const multiLayer_deepTurnSub: ExecuteCallback<MultiLayerNode> = (
  face: ParseNode,
  subscript: ParseNode,
) => {
  asSafeParseNode(face, "face");
  asSafeParseNode(subscript, "subscript");
  const offsetSize = subscript.execute();
  const faceAction = face.execute();
  return [faceAction, multiLayer_makeSlice(faceAction, 1, offsetSize)];
};

const multiLayer_deepTurnJapanese: ExecuteCallback<MultiLayerNode> = (
  face: ParseNode,
  _w: ParseNode,
) => {
  asSafeParseNode(face, "face");
  const faceAction = face.execute();
  return [faceAction, multiLayer_makeSlice(faceAction, 1, 1)];
};

function multiLayer_makeSlice(
  faceAction: ReturnType<ExecuteCallback<FaceNode>>,
  offsetStart: number | undefined,
  offsetSize: number,
): {
  type: CubeActionType.RotateFacelessSlice;
  axis: CubeAxis;
  sign?: 1 | -1;
  offsetIndex: number;
  offsetSize: number;
} {
  let axis: CubeAxis;
  let offsetIndex: 1 | -1;
  let sign: 1 | -1;
  switch (faceAction.sideId) {
    case CubeSide.Front:
      axis = "Z";
      offsetIndex = -1;
      sign = 1;
      break;
    case CubeSide.Top:
      axis = "X";
      offsetIndex = 1;
      sign = 1;
      break;
    case CubeSide.Right:
      axis = "Y";
      offsetIndex = -1;
      sign = 1;
      break;
    case CubeSide.Back:
      axis = "Z";
      offsetIndex = 1;
      sign = -1;
      break;
    case CubeSide.Left:
      axis = "Y";
      offsetIndex = 1;
      sign = -1;
      break;
    case CubeSide.Bottom:
      axis = "X";
      offsetIndex = -1;
      sign = -1;
      break;
    default:
      forceNever(faceAction.sideId);
  }
  return {
    type: CubeActionType.RotateFacelessSlice,
    axis,
    offsetIndex: offsetStart ? offsetStart * offsetIndex : offsetIndex,
    offsetSize,
    sign,
  };
}

const multiLayer_deepTurn: ExecuteCallback<MultiLayerNode> = (
  doubleFace: ParseNode,
) => {
  asSafeParseNode(doubleFace, "doubleFace");
  return doubleFace.execute();
};

function face_getSemanticAction(sideId: CubeSide): ExecuteCallback<FaceNode> {
  return _face => {
    return { type: CubeActionType.RotateFace, sideId };
  };
}

function slice_getSemanticAction(
  axis: CubeAxis,
  sign: 1 | -1,
): ExecuteCallback<SliceNode> {
  return _axis => {
    return { type: CubeActionType.RotateFacelessSlice, axis, sign };
  };
}

function wholeCube_getSemanticAction(
  axis: CubeAxis,
  sign: 1 | -1,
): ExecuteCallback<WholeCubeNode> {
  return (_axis: ParseNode) => {
    return { axis, sign, type: CubeActionType.RotateCube };
  };
}

function doubleFace_getSemanticAction(
  sideId: CubeSide,
  axis: CubeAxis,
  offsetIndex: 1 | -1,
  sign: 1 | -1,
): ExecuteCallback<DoubleFaceNode> {
  return (_face: ParseNode): ReturnType<DoubleFaceNode["execute"]> => [
    { type: CubeActionType.RotateFace, sideId },
    {
      type: CubeActionType.RotateFacelessSlice,
      axis,
      offsetIndex,
      offsetSize: 1,
      sign,
    },
  ];
}

const subscript_latexSubscript: ExecuteCallback<SubscriptNode> = (
  _: ParseNode,
  digit: ParseNode,
): number => {
  return Number.parseInt(digit.sourceString);
};

const subscript_unicodeSubscript: ExecuteCallback<SubscriptNode> = (
  subscript: ParseNode,
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
    case "\u2086":
      return 6;
    case "\u2087":
      return 7;
    case "\u2088":
      return 8;
  }
  assert(false);
};

function asSafeParseNode<TConstructorName extends string>(
  node: ParseNode,
  ctorName: TConstructorName | TConstructorName[],
): asserts node is SafelyTypedParseNode<TConstructorName> {
  if (Array.isArray(ctorName)) {
    assert(ctorName.some(name => node.ctorName === name));
  } else {
    assert(ctorName === node.ctorName);
  }
}

type SafelyTypedParseNode<TConstructorName extends string> =
  TConstructorName extends "subscript"
    ? SubscriptNode
    : TConstructorName extends "doubleFace"
      ? DoubleFaceNode
      : TConstructorName extends "wholeCube"
        ? WholeCubeNode
        : TConstructorName extends "slice"
          ? SliceNode
          : TConstructorName extends "face"
            ? FaceNode
            : TConstructorName extends "multiLayer"
              ? MultiLayerNode
              : TConstructorName extends "move"
                ? MoveNode
                : ParseNode;

type StrongParseNode<
  TConstructorName extends string,
  TReturnType,
> = ParseNode & {
  ctorName: TConstructorName;
  execute: () => TReturnType;
};

type MoveNode = StrongParseNode<"move", CubeActions | CubeActions[]>;

type MultiLayerNode = StrongParseNode<
  "multiLayer",
  | ReturnType<DoubleFaceNode["execute"]>
  | {
      type: CubeActionType.RotateFacelessSlice;
      axis: CubeAxis;
      sign?: 1 | -1;
      offsetIndex: number;
      offsetSize: number;
    }
>;

type FaceNode = StrongParseNode<
  "face",
  { type: CubeActionType.RotateFace; sideId: CubeSide }
>;

type SliceNode = StrongParseNode<
  "slice",
  { type: CubeActionType.RotateFacelessSlice; axis: CubeAxis; sign?: 1 | -1 }
>;

type WholeCubeNode = StrongParseNode<
  "wholeCube",
  {
    type: CubeActionType.RotateCube;
    axis: CubeAxis;
    sign?: 1 | -1;
  }
>;

type DoubleFaceNode = StrongParseNode<
  "doubleFace",
  [
    { type: CubeActionType.RotateFace; sideId: CubeSide },
    {
      type: CubeActionType.RotateFacelessSlice;
      axis: CubeAxis;
      offsetIndex: number;
      offsetSize: number;
      sign?: 1 | -1;
    },
  ]
>;

type SubscriptNode = StrongParseNode<"subscript", number>;

type ExecuteCallback<T extends StrongParseNode<string, unknown>> = (
  ...args: ParseNode[]
) => ReturnType<T["execute"]>;
