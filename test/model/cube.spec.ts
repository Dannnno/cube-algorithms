import { describe, expect, it } from "vitest";

import fc from "fast-check";
import { LoopStatus } from "../../src/common/iterables";
import {
  assertIsValidCube,
  assertIsValidCubeCell,
  forEachCellOnSide,
  forEachSide,
  getCubeSize,
} from "../../src/model/cube";
import { fcCubeSides, fcCubeSizes } from "./utility";

describe("getCubeSize", () => {
  it("calculates the size of a 2x2", () =>
    expect(
      getCubeSize([
        [1, 1, 1, 1],
        [2, 2, 2, 2],
        [3, 3, 3, 3],
        [4, 4, 4, 4],
        [5, 5, 5, 5],
        [6, 6, 6, 6],
      ]),
    ).toBe(2));
  it("calculates the size of a 3x3", () =>
    expect(
      getCubeSize([
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [2, 2, 2, 2, 2, 2, 2, 2, 2],
        [3, 3, 3, 3, 3, 3, 3, 3, 3],
        [4, 4, 4, 4, 4, 4, 4, 4, 4],
        [5, 5, 5, 5, 5, 5, 5, 5, 5],
        [6, 6, 6, 6, 6, 6, 6, 6, 6],
      ]),
    ).toBe(3));

  it("should calculate the size of any cube", () =>
    fc.assert(
      fc.property(
        fc
          .tuple(
            fcCubeSizes,
            fc.array(fcCubeSides, { minLength: 4, maxLength: 81 }),
          )
          .filter(([size, side]) => {
            const sq = size ** 2;
            return side.length === sq;
          }),
        ([size, side]) => {
          const cube = [side, side, side, side, side, side];
          expect(getCubeSize(cube)).toBe(size);
        },
      ),
    ));
});

describe("assertIsValidCubeCell", () => {
  it("Catches non-integers", () =>
    expect(() => assertIsValidCubeCell(1.1)).toThrowError(
      'Assertion of "false" failed',
    ));
  it("Catches negative numbers", () =>
    expect(() => assertIsValidCubeCell(-1)).toThrowError(
      'Assertion of "false" failed',
    ));
  it("Catches too-large numbers", () =>
    expect(() => assertIsValidCubeCell(7)).toThrowError(
      'Assertion of "false" failed',
    ));
  it("allows cube cells", () => assertIsValidCubeCell(1));
  it("should catch anything that isn't a valid cube side", () =>
    fc.assert(
      fc.property(
        fc.oneof(
          fc.integer().filter(v => v > 6 || v < 1),
          fc.array(fc.integer()),
          fc.object(),
        ),
        val => {
          expect(() => assertIsValidCubeCell(val)).toThrowError(
            `Assertion of "false" failed`,
          );
        },
      ),
    ));
  it("should allow anything that is a valid cube side", () =>
    fc.assert(
      fc.property(fcCubeSides, val => void assertIsValidCubeCell(val)),
    ));
});

describe("assertIsValidCube", () => {
  it("handles valid cubes", () =>
    assertIsValidCube(
      [
        [1, 1, 1, 1],
        [2, 2, 2, 2],
        [3, 3, 3, 3],
        [4, 4, 4, 4],
        [5, 5, 5, 5],
        [6, 6, 6, 6],
      ],
      2,
    ));
  it("catches bad sizes", () =>
    expect(() =>
      assertIsValidCube(
        [
          [1, 1, 1, 1],
          [2, 2, 2, 2],
          [3, 3, 3, 3],
          [4, 4, 4, 4],
          [5, 5, 5, 5],
          [6, 6, 6, 6],
        ],
        -1,
      ),
    ).toThrowError('Assertion of "false" failed'));
  it("catches inconsistent sizes", () =>
    expect(() =>
      assertIsValidCube(
        [
          [1, 1, 1, 1],
          [2, 2, 2, 2],
          [3, 3, 3, 3],
          [4, 4, 4, 4],
          [5, 5, 5, 5],
          [6, 6, 6, 6],
        ],
        3,
      ),
    ).toThrowError('Assertion of "false" failed'));
  it("catches extra sides", () =>
    expect(() =>
      assertIsValidCube(
        [
          [1, 1, 1, 1],
          [2, 2, 2, 2],
          [3, 3, 3, 3],
          [4, 4, 4, 4],
          [5, 5, 5, 5],
          [6, 6, 6, 6],
          [7, 7, 7, 7],
        ],
        2,
      ),
    ).toThrowError('Assertion of "false" failed'));
  it("catches missing sides", () =>
    expect(() =>
      assertIsValidCube(
        [
          [1, 1, 1, 1],
          [2, 2, 2, 2],
          [3, 3, 3, 3],
          [4, 4, 4, 4],
          [5, 5, 5, 5],
        ],
        2,
      ),
    ).toThrowError('Assertion of "false" failed'));
  it("catches short sides", () =>
    expect(() =>
      assertIsValidCube(
        [
          [1, 1, 1, 1],
          [2, 2, 2, 2],
          [3, 3, 3, 3],
          [4, 4, 4, 4],
          [5, 5, 5, 5],
          [6, 6, 6],
        ],
        2,
      ),
    ).toThrowError('Assertion of "false" failed'));
  it("catches long sides", () =>
    expect(() =>
      assertIsValidCube(
        [
          [1, 1, 1, 1],
          [2, 2, 2, 2],
          [3, 3, 3, 3],
          [4, 4, 4, 4],
          [5, 5, 5, 5],
          [6, 6, 6, 6, 6],
        ],
        2,
      ),
    ).toThrowError('Assertion of "false" failed'));
  it("catches bad values", () =>
    expect(() =>
      assertIsValidCube(
        [
          [1, 1, 1, 1],
          [2, 2, 2, 2],
          [3, 3, 3, 3],
          [4, 4, 4, 4],
          [5, 5, 5, 5],
          [6, 6, 6, 0],
        ],
        2,
      ),
    ).toThrowError('Assertion of "false" failed'));
  it("catches bad value counts", () =>
    expect(() =>
      assertIsValidCube(
        [
          [1, 1, 1, 1],
          [2, 2, 2, 2],
          [3, 3, 3, 3],
          [4, 4, 4, 4],
          [5, 5, 5, 5],
          [6, 6, 6, 5],
        ],
        2,
      ),
    ).toThrowError('Assertion of "false" failed'));
  it("handles valid cubes w/o size param", () =>
    assertIsValidCube([
      [1, 1, 1, 1],
      [2, 2, 2, 2],
      [3, 3, 3, 3],
      [4, 4, 4, 4],
      [5, 5, 5, 5],
      [6, 6, 6, 6],
    ]));
  it("catches extra sides w/o size param", () =>
    expect(() =>
      assertIsValidCube([
        [1, 1, 1, 1],
        [2, 2, 2, 2],
        [3, 3, 3, 3],
        [4, 4, 4, 4],
        [5, 5, 5, 5],
        [6, 6, 6, 6],
        [7, 7, 7, 7],
      ]),
    ).toThrowError('Assertion of "false" failed'));
  it("catches missing sides w/o size param", () =>
    expect(() =>
      assertIsValidCube([
        [1, 1, 1, 1],
        [2, 2, 2, 2],
        [3, 3, 3, 3],
        [4, 4, 4, 4],
        [5, 5, 5, 5],
      ]),
    ).toThrowError('Assertion of "false" failed'));
  it("catches short sides w/o size param", () =>
    expect(() =>
      assertIsValidCube([
        [1, 1, 1, 1],
        [2, 2, 2, 2],
        [3, 3, 3, 3],
        [4, 4, 4, 4],
        [5, 5, 5, 5],
        [6, 6, 6],
      ]),
    ).toThrowError('Assertion of "false" failed'));
  it("catches long sides w/o size param", () =>
    expect(() =>
      assertIsValidCube([
        [1, 1, 1, 1],
        [2, 2, 2, 2],
        [3, 3, 3, 3],
        [4, 4, 4, 4],
        [5, 5, 5, 5],
        [6, 6, 6, 6, 6],
      ]),
    ).toThrowError('Assertion of "false" failed'));
  it("catches bad values w/o size param", () =>
    expect(() =>
      assertIsValidCube([
        [1, 1, 1, 1],
        [2, 2, 2, 2],
        [3, 3, 3, 3],
        [4, 4, 4, 4],
        [5, 5, 5, 5],
        [6, 6, 6, 0],
      ]),
    ).toThrowError('Assertion of "false" failed'));
  it("catches bad value counts w/o size param", () =>
    expect(() =>
      assertIsValidCube([
        [1, 1, 1, 1],
        [2, 2, 2, 2],
        [3, 3, 3, 3],
        [4, 4, 4, 4],
        [5, 5, 5, 5],
        [6, 6, 6, 5],
      ]),
    ).toThrowError('Assertion of "false" failed'));
});

describe("forEachSide", () => {
  const cube = [
    [1, 1, 1, 1],
    [2, 2, 2, 2],
    [3, 3, 3, 3],
    [4, 4, 4, 4],
    [5, 5, 5, 5],
    [6, 6, 6, 6],
  ];
  it("visits each side", () => {
    let count = 0;
    expect(
      forEachSide(cube, (sideId, value) => {
        expect(cube[sideId - 1]).toStrictEqual(value);
        count += 1;
      }),
    ).toBe(LoopStatus.KeepLooping);
    expect(count).toBe(6);
  });
  it("can break early", () => {
    let count = 0;
    expect(
      forEachSide(cube, (sideId, value) => {
        expect(cube[sideId - 1]).toStrictEqual(value);
        count += 1;
        return LoopStatus.StopLooping;
      }),
    ).toBe(LoopStatus.StopLooping);
    expect(count).toBe(1);
  });
  it("can continue", () => {
    let count = 0;
    expect(
      forEachSide(cube, (sideId, value) => {
        expect(cube[sideId - 1]).toStrictEqual(value);
        count += 1;
        return LoopStatus.KeepLooping;
      }),
    ).toBe(LoopStatus.KeepLooping);
    expect(count).toBe(6);
  });
});

describe("forEachCellOnSide", () => {
  const side = [1, 2, 3, 4];
  const toVisit = [
    [0, 0, 1],
    [0, 1, 2],
    [1, 0, 3],
    [1, 1, 4],
  ];

  it("visits in the right order", () => {
    let count = 0;
    let ix = 0;
    expect(
      forEachCellOnSide(side, 2, (r, c, v) => {
        count += 1;
        const [expRow, expCol, expVal] = toVisit[ix++];
        expect(r).toBe(expRow);
        expect(c).toBe(expCol);
        expect(v).toBe(expVal);
      }),
    ).toBe(LoopStatus.KeepLooping);
    expect(count).toBe(4);
  });

  it("can break early", () => {
    let count = 0;
    let ix = 0;
    expect(
      forEachCellOnSide(side, 2, (r, c, v) => {
        count += 1;
        const [expRow, expCol, expVal] = toVisit[ix++];
        expect(r).toBe(expRow);
        expect(c).toBe(expCol);
        expect(v).toBe(expVal);
        return LoopStatus.StopLooping;
      }),
    ).toBe(LoopStatus.StopLooping);
    expect(count).toBe(1);
  });

  it("can continue", () => {
    let count = 0;
    let ix = 0;
    expect(
      forEachCellOnSide(side, 2, (r, c, v) => {
        count += 1;
        const [expRow, expCol, expVal] = toVisit[ix++];
        expect(r).toBe(expRow);
        expect(c).toBe(expCol);
        expect(v).toBe(expVal);
        return LoopStatus.KeepLooping;
      }),
    ).toBe(LoopStatus.KeepLooping);
    expect(count).toBe(4);
  });

  it("should visit everything, in order", () =>
    fc.assert(
      fc.property(
        fc
          .tuple(
            fcCubeSizes,
            fc.array(fcCubeSides, { minLength: 4, maxLength: 81 }),
          )
          .filter(([size, side]) => side.length === size ** 2),
        ([size, side]) => {
          let timesCalled = 0;
          let nextRow = 0;
          let nextCol = 0;
          expect(
            forEachCellOnSide(side, size, (r, c, v) => {
              ++timesCalled;
              expect(r, "row").toBe(nextRow);
              expect(c, "col").toBe(nextCol);
              expect(v, "value").toBe(side[r * size + c]);
              nextCol = (c + 1) % size;
              nextRow = nextCol === 0 ? nextRow + 1 : nextRow;
            }),
            "return value",
          ).toBe(LoopStatus.KeepLooping);
          expect(timesCalled, "timesCalled").toBe(size ** 2);
        },
      ),
    ));

  it("should be able to exit early", () =>
    fc.assert(
      fc.property(
        fc
          .tuple(
            fcCubeSizes,
            fc.nat(),
            fc.array(fcCubeSides, { minLength: 4, maxLength: 81 }),
            fc.option(
              fc.constantFrom(LoopStatus.StopLooping, LoopStatus.KeepLooping),
            ),
          )
          .filter(
            ([size, stopAt, side, _ret]) =>
              stopAt <= side.length && side.length === size ** 2,
          ),
        ([size, stopAt, side, ret]) => {
          const {
            actualStopIndex,
            expectedIterationCount,
            expectedReturnValue,
          } = getSafeEarlyStopProps(side, stopAt, ret);

          let timesCalled = 0;
          let nextRow = 0;
          let nextCol = 0;
          expect(
            forEachCellOnSide(side, size, (r, c, v) => {
              const ix = r * size + c;
              ++timesCalled;
              expect(r, "row").toBe(nextRow);
              expect(c, "col").toBe(nextCol);
              expect(v, "value").toBe(side[ix]);
              nextCol = (c + 1) % size;
              nextRow = nextCol === 0 ? nextRow + 1 : nextRow;
              if (ix === actualStopIndex) {
                return ret;
              }
            }),
            "return value",
          ).toBe(expectedReturnValue);
          expect(timesCalled, "timesCalled").toBe(expectedIterationCount);
        },
      ),
    ));
});

function getSafeEarlyStopProps(
  data: readonly unknown[],
  stopAt: number | undefined | null,
  returnValue: LoopStatus | undefined | null,
): {
  actualStopIndex: number;
  expectedToStop: boolean;
  expectedIterationCount: number;
  expectedReturnValue: number;
} {
  const actualStopIndex =
    stopAt === undefined || stopAt === null
      ? data.length
      : stopAt % data.length;
  const expectedToStop =
    data.length > 0
    && returnValue === LoopStatus.StopLooping
    && actualStopIndex < data.length;
  const expectedIterationCount = expectedToStop
    ? actualStopIndex + 1
    : data.length;
  const expectedReturnValue = expectedToStop
    ? LoopStatus.StopLooping
    : LoopStatus.KeepLooping;
  return {
    actualStopIndex,
    expectedToStop,
    expectedIterationCount,
    expectedReturnValue,
  };
}
