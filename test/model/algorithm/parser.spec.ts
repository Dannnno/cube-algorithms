import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { cross } from "../../../src/common";
import { _getAlgorithmParser } from "../../../src/model/algorithm/parser";
import { fcAlgorithmText } from "./fcAlgorithm";

describe("_getAlgorithmParser", () => {
  it("should be able to parse valid generated expressions", () =>
    fc.assert(
      fc.property(fcAlgorithmText, alg => {
        const parser = _getAlgorithmParser();
        const match = parser.match(alg);
        expect(match.succeeded()).toBeTruthy();
      }),
    ));

  describe("Face Rotations (Exhaustive)", () => {
    const faces = ["F", "U", "R", "B", "L", "D"];
    const rotations = ["", "2", "'"];

    it.each(cross(faces, rotations))("Should parse $0 $1", (face, rot) => {
      const step = `${face}${rot}`;
      const parser = _getAlgorithmParser();
      const match = parser.match(step);
      expect(match.succeeded(), step).toBeTruthy();
    });
  });
});
