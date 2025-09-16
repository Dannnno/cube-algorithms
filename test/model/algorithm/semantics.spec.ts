import fc from "fast-check";
import * as ohm from "ohm-js";
import { assertType, describe, expect, expectTypeOf, it } from "vitest";
import {
  _FrameworkVisitorCallback,
  _Iter,
  _SemanticExecutor,
  _SemanticParseNode,
  _Terminal,
  _assertNodeIsStronglyTyped,
} from "../../../src/model/algorithm/semantics";
import { fcAlgCubeFace, fcAlgRotation, fcAlgSplitSpaces } from "./fcAlgorithm";

describe("Semantics", () => {
  const cubeParser = ohm.grammar(cubeGrammar);
  const cubeSemantics = getCubeExecuteSemantics(cubeParser);
  const match = cubeParser.match("F R' B2");
  const adapter = cubeSemantics(match);

  describe("type safety", () => {
    it("should strongly type the executor", () => {
      let callback = () => [
        { face: CubeFace.Front, rotation: Rotation.Clockwise } as CubeMove,
      ];
      expect("eval" in adapter).toBeTruthy();
      expectTypeOf(adapter.eval).toMatchTypeOf(callback);
      assertType<() => CubeMove[]>(adapter.eval);
    });
    it("should strongly type actions", () => {
      assertType<_FrameworkVisitorCallback<FaceNode>>(
        (_face: _Terminal): CubeFace => {
          return CubeFace.Front;
        },
      );

      assertType<_FrameworkVisitorCallback<StepsNode>>(
        // @ts-expect-error Types of property length are incompatible. Type `4` is not assignable to type `1`.
        (_face: _Terminal): CubeFace => {
          return CubeFace.Front;
        },
      );
    });
    it("should strongly type node callbacks", () => {
      const a: MoveNode = {
        eval: () => ({
          face: CubeFace.Front,
          rotation: Rotation.AntiClockwise,
        }),
      } as MoveNode;
      assertType<MoveNode["eval"]>(() => ({
        face: CubeFace.Front,
        rotation: Rotation.AntiClockwise,
      }));

      // @ts-expect-error Type `CubeMove` is not assignable to type `number`
      const b: number = a.eval();
    });
  });

  it("should work", () => {
    const result = cubeSemantics(cubeParser.match("F R' B2")).eval();
    expect(result[0]).toStrictEqual({
      face: CubeFace.Front,
      rotation: Rotation.Clockwise,
    });
    expect(result[1]).toStrictEqual({
      face: CubeFace.Right,
      rotation: Rotation.AntiClockwise,
    });
    expect(result[2]).toStrictEqual({
      face: CubeFace.Back,
      rotation: Rotation.HalfTurn,
    });
  });

  it("should pass PBT", () =>
    fc.assert(
      fc.property(
        fc.array(fc.tuple(fcAlgCubeFace, fcAlgRotation, fcAlgSplitSpaces), {
          minLength: 1,
        }),
        steps => {
          const toParse = steps
            .map(([face, rotation, spaces]) => `${face}${rotation}${spaces}`)
            .join("");

          const result = cubeParser.match(toParse);
          expect(result.succeeded()).toBeTruthy();
          const adapter = cubeSemantics(result);
          const moves = adapter.eval();
          expect(moves.length).toBe(steps.length);
          for (const move of moves) {
            expect("face" in move).toBeTruthy();
            expect("rotation" in move).toBeTruthy();
            const keys = Object.keys(move);
            for (const key of keys) {
              expect(key).toBeOneOf(["face", "rotation"]);
            }
          }
        },
      ),
    ));
});

const cubeGrammar = String.raw`
  Algorithm {
    steps = move (space+ move)* space*

    move = face "'" -- antiClockwise
         | face "2" -- doubleTurn
         | face     -- clockWise

    face = "F"    -- front
         | "R"    -- right
         | "L"    -- left
         | "B"    -- back
         | "U"    -- up
         | "D"    -- down
  }
`;

type CubeExecutor = _SemanticExecutor<{ eval: CubeMove[] }, {}>;

enum CubeFace {
  Front,
  Right,
  Left,
  Back,
  Top,
  Bottom,
}

enum Rotation {
  Clockwise,
  HalfTurn,
  AntiClockwise,
}

type CubeMove = {
  face: CubeFace;
  rotation: Rotation;
};
function getCubeExecuteSemantics(parser: ohm.Grammar): CubeExecutor {
  return parser.createSemantics().addOperation("eval", {
    steps,
    move_antiClockwise,
    move_doubleTurn,
    move_clockWise,
    face_front: getFaceAction(CubeFace.Front),
    face_right: getFaceAction(CubeFace.Right),
    face_left: getFaceAction(CubeFace.Left),
    face_back: getFaceAction(CubeFace.Back),
    face_up: getFaceAction(CubeFace.Top),
    face_down: getFaceAction(CubeFace.Bottom),
  } as any) as unknown as CubeExecutor;
}

const steps: _FrameworkVisitorCallback<StepsNode> = (
  firstMove: MoveNode,
  _spaces: _Iter<_Terminal>,
  restMoves: _Iter<MoveNode>,
  _trailSpaces: _Terminal,
) => {
  _assertNodeIsStronglyTyped(firstMove, "move");
  _assertNodeIsStronglyTyped(restMoves, "_iter");
  return [
    firstMove.eval(),
    ...restMoves.asIteration().children.map((child: ohm.Node | MoveNode) => {
      _assertNodeIsStronglyTyped<MoveNode>(child, "move");
      return child.eval();
    }),
  ];
};

const move_antiClockwise: _FrameworkVisitorCallback<MoveNode> = (
  face: FaceNode,
  _antiClockwiseInd: _Terminal,
) => {
  _assertNodeIsStronglyTyped(face, "face");
  return { face: face.eval(), rotation: Rotation.AntiClockwise };
};
const move_doubleTurn: _FrameworkVisitorCallback<MoveNode> = (
  face: FaceNode,
  _doubleTurnInd: _Terminal,
) => {
  _assertNodeIsStronglyTyped(face, "face");
  return { face: face.eval(), rotation: Rotation.HalfTurn };
};
const move_clockWise: _FrameworkVisitorCallback<MoveNode> = (
  face: FaceNode,
) => {
  _assertNodeIsStronglyTyped(face, "face");
  return { face: face.eval(), rotation: Rotation.Clockwise };
};

function getFaceAction(face: CubeFace): _FrameworkVisitorCallback<FaceNode> {
  return (_face: _Terminal) => face;
}

type StepsNode = _SemanticParseNode<
  "steps",
  "eval",
  CubeMove[],
  [MoveNode, _Iter<_Terminal>, _Iter<MoveNode>, _Terminal]
>;
type MoveNode = _SemanticParseNode<
  "move",
  "eval",
  CubeMove,
  [FaceNode, _Terminal] | [FaceNode]
>;
type FaceNode = _SemanticParseNode<"face", "eval", CubeFace, [_Terminal]>;
