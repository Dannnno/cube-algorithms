import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { cross } from "../../../src/common";
import { _getAlgorithmParser } from "../../../src/model/algorithm/parser";
import { fcAlgorithmText } from "./fcAlgorithm";

describe("_getAlgorithmParser", () => {
  it("should be able to parse valid generated expressions", () =>
    fc.assert(
      fc.property(fcAlgorithmText, ({ algorithm }) => {
        const parser = _getAlgorithmParser();
        const match = parser.match(algorithm);
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

  describe("Slice Rotations (Exhaustive)", () => {
    const slices = ["M", "E", "S"];
    const rotations = ["", "2", "'"];

    it.each(cross(slices, rotations))("Should parse $0 $1", (slice, rot) => {
      const step = `${slice}${rot}`;
      const parser = _getAlgorithmParser();
      const match = parser.match(step);
      expect(match.succeeded(), step).toBeTruthy();
    });
  });

  describe("Cube Rotations (Exhaustive)", () => {
    const axes = ["X", "Y", "Z"];
    const rotations = ["", "2", "'"];

    it.each(cross(axes, rotations))("Should parse $0 $1", (axis, rot) => {
      const step = `${axis}${rot}`;
      const parser = _getAlgorithmParser();
      const match = parser.match(step);
      expect(match.succeeded(), step).toBeTruthy();
    });
  });
});
