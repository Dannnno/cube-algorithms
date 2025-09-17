import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { cross } from "../../../src/common";
import { _getAlgorithmParser } from "../../../src/model/algorithm/parser";
import { flattenAlgorithmParts } from "../utility";
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

    it.each(cross(faces, rotations).map(flattenAlgorithmParts))(
      "Should parse $0",
      step => {
        const parser = _getAlgorithmParser();
        const match = parser.match(step);
        expect(match.succeeded(), step).toBeTruthy();
      },
    );
  });

  describe("Slice Rotations (Exhaustive)", () => {
    const slices = ["M", "E", "S"];
    const rotations = ["", "2", "'"];

    it.each(cross(slices, rotations).map(flattenAlgorithmParts))(
      "Should parse $0",
      step => {
        const parser = _getAlgorithmParser();
        const match = parser.match(step);
        expect(match.succeeded(), step).toBeTruthy();
      },
    );
  });

  describe("Cube Rotations (Exhaustive)", () => {
    const axes = ["X", "Y", "Z", "x", "y", "z"];
    const rotations = ["", "2", "'"];

    it.each(cross(axes, rotations).map(flattenAlgorithmParts))(
      "Should parse $0",
      step => {
        const parser = _getAlgorithmParser();
        const match = parser.match(step);
        expect(match.succeeded(), step).toBeTruthy();
      },
    );
  });

  describe("Deep Turns (Exhaustive)", () => {
    describe("3x3 Deep Turns", () => {
      const faces = ["f", "l", "r", "b", "u", "d"];
      const rotations = ["", "2", "'"];

      it.each(cross(faces, rotations).map(flattenAlgorithmParts))(
        "Should parse $0",
        step => {
          const parser = _getAlgorithmParser();
          const match = parser.match(step);
          expect(match.succeeded(), step).toBeTruthy();
        },
      );
    });

    describe("3x3 Deep Turns Japanese Notation", () => {
      const faces = ["Fw", "Uw", "Rw", "Bw", "Lw", "Dw"];
      const rotations = ["", "2", "'"];

      it.each(cross(faces, rotations).map(flattenAlgorithmParts))(
        "Should parse $0",
        step => {
          const parser = _getAlgorithmParser();
          const match = parser.match(step);
          expect(match.succeeded(), step).toBeTruthy();
        },
      );
    });

    describe("4x4 Deep Turns LaTeX Subscripts", () => {
      const faces = ["F", "U", "R", "B", "L", "D"];
      const subscripts = [`_2`, `_3`, `_4`, `_5`];
      const rotations = ["", "2", "'"];

      it.each(
        cross(cross(faces, subscripts), rotations).map(flattenAlgorithmParts),
      )("Should parse $0", step => {
        const parser = _getAlgorithmParser();
        const match = parser.match(step);
        expect(match.succeeded(), step).toBeTruthy();
      });
    });

    describe("4x4 Deep Turns Unicode Subscripts", () => {
      const faces = ["F", "U", "R", "B", "L", "D"];
      const subscripts = ["\u2082", "\u2083", "\u2084", "\u2085"];
      const rotations = ["", "2", "'"];

      it.each(
        cross(cross(faces, subscripts), rotations).map(flattenAlgorithmParts),
      )("Should parse $0", step => {
        const parser = _getAlgorithmParser();
        const match = parser.match(step);
        expect(match.succeeded(), step).toBeTruthy();
      });
    });

    describe("5x5 Deep Turns Prefixed", () => {
      const faces = ["Fw", "Uw", "Rw", "Bw", "Lw", "Dw"];
      const prefix = [`3`, `4`, `5`];
      const rotations = ["", "2", "'"];

      it.each(
        cross(cross(prefix, faces), rotations).map(flattenAlgorithmParts),
      )("Should parse $0", step => {
        const parser = _getAlgorithmParser();
        const match = parser.match(step);
        expect(match.succeeded(), step).toBeTruthy();
      });
    });
  });
});
