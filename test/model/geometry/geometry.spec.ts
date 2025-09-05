import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { CubeSide, getCubeSize } from "../../../src/model/cube";
import { at } from "../../../src/model/geometry";
import { fcCube } from "../utility";

describe("at", () => {
  it("gets the value", () =>
    expect(
      at(
        [
          [1, 2, 3, 4],
          [5, 6, 1, 2],
          [3, 4, 5, 6],
          [1, 2, 3, 4],
          [5, 6, 1, 2],
          [3, 4, 5, 6],
        ],
        2,
        1,
        1,
      ),
    ).toBe(2));

  it.skip("should retrieve a valid cube value", () =>
    fc.assert(
      fc.property(fc.gen(), gen => {
        const fakeCube = Function.bind(this, fcCube)(gen);
        const side: CubeSide = gen(
          fc.constantFrom,
          CubeSide.Front,
          CubeSide.Back,
          CubeSide.Left,
          CubeSide.Right,
          CubeSide.Bottom,
          CubeSide.Top,
        );
        const size = getCubeSize(fakeCube);
        const row = gen(fc.nat, { max: size - 1 });
        const col = gen(fc.nat, { max: size - 1 });
        expect(at(fakeCube, side, row, col)).toBeOneOf([
          CubeSide.Front,
          CubeSide.Back,
          CubeSide.Left,
          CubeSide.Right,
          CubeSide.Bottom,
          CubeSide.Top,
        ]);
      }),
    ));
});
