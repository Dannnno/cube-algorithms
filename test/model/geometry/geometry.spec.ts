import { describe, expect, it } from "vitest";
import { at } from "../../../src/model/geometry";

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
});
