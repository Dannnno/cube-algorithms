import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { forEach, LoopStatus, swapAt, zip } from "../../src/common/iterables";

describe("forEach", () => {
  it("should iterate over an array in order, without stopping", () =>
    fc.assert(
      fc.property(arrayBuilder, data => {
        let timesCalled = 0;
        let lastIndex = -1;
        expect(
          forEach(data, (val, ix) => {
            expect(data[ix], `array[${ix}]`).toStrictEqual(val);
            expect(ix, `${ix}`).toBe(lastIndex + 1);
            ++timesCalled;
            lastIndex = ix;
          }),
        ).toBe(LoopStatus.KeepLooping);
        expect(timesCalled, "count").toBe(data.length);
      }),
      {
        examples: [[[1, 2, 3]]],
      },
    ));
  it("should be able to stop early", () =>
    fc.assert(
      fc.property(optionBuilder, ({ data, stopAt, ret }) => {
        const { actualStopIndex, expectedIterationCount, expectedReturnValue } =
          getSafeEarlyStopProps(data, stopAt, ret);

        let timesCalled = 0;
        let lastIndex = -1;
        expect(
          forEach(data, (val, ix) => {
            expect(data[ix], `array[${ix}]`).toStrictEqual(val);
            expect(ix, `${ix}`).toBe(lastIndex + 1);
            ++timesCalled;
            lastIndex = ix;
            if (ix === actualStopIndex) {
              return ret;
            }
          }),
        ).toBe(expectedReturnValue);
        expect(timesCalled, "count").toBe(expectedIterationCount);
      }),
      {
        examples: [
          [{ data: [1, 2, 3], stopAt: 0, ret: LoopStatus.StopLooping }],
          [{ data: [1, 2, 3], stopAt: 0, ret: LoopStatus.KeepLooping }],
        ],
      },
    ));
});

describe("swapAt", () => {
  it("should swap values at arbitrary indices", () =>
    fc.assert(
      fc.property(
        arrayBuilder,
        arrayBuilder,
        fc.nat(),
        fc.nat(),
        (left, right, leftIx, rightIx) => {
          const safeLeftIx = leftIx % left.length;
          const safeRightIx = rightIx % right.length;

          const curLeftLength = left.length;
          const curRightLength = right.length;

          const lCopy = Array.from(left);
          const rCopy = Array.from(right);

          const curLeft = left[safeLeftIx];
          const curRight = right[safeRightIx];

          swapAt(left, safeLeftIx, right, safeRightIx);

          expect(left[safeLeftIx], `left[${safeLeftIx}]`).toStrictEqual(
            curRight,
          );
          expect(right[safeRightIx], `right[${safeRightIx}]`).toStrictEqual(
            curLeft,
          );

          expect(left.length, `left.length`).toBe(curLeftLength);
          expect(right.length, `right.length`).toBe(curRightLength);

          for (let ix = 0; ix < curLeftLength; ++ix) {
            if (ix === safeLeftIx) {
              continue;
            }
            expect(left[ix], `(orig) left[${ix}]`).toStrictEqual(lCopy[ix]);
          }

          for (let ix = 0; ix < curRightLength; ++ix) {
            if (ix === safeRightIx) {
              continue;
            }
            expect(right[ix], `(orig) right[${ix}]`).toStrictEqual(rCopy[ix]);
          }
        },
      ),
      {
        examples: [
          [[1, 2, 3, 4], [5, 6, 7], 0, 0], // same index
          [[1, 2, 3, 4], [5, 6, 7], 0, 1], // different index
          [[1, 2, 3], [4, 5, 6, 7], 0, 0], // same index
          [[1, 2, 3], [4, 5, 6, 7], 0, 1], // different index
          [[1, 2, 3, 4], [5, 6, 7, 8], 0, 0], // same index
          [[1, 2, 3, 4], [5, 6, 7, 8], 0, 1], // different index
        ],
      },
    ));
});

describe("zip", () => {
  it("should fail if the two arrays are different lengths", () =>
    fc.assert(
      fc.property(
        fc
          .tuple(arrayBuilder, arrayBuilder)
          .filter(([left, right]) => left.length !== right.length),
        ([left, right]) =>
          void expect(() => zip(left, right, _ => {})).toThrowError(
            'Assertion of "false" failed',
          ),
      ),
      {
        examples: [
          [
            [
              [1, 2, 3],
              [4, 5],
            ],
          ],
          [
            [
              [1, 2],
              [3, 4, 5],
            ],
          ],
        ],
      },
    ));

  it("should merge two arrays of the same length", () =>
    fc.assert(
      fc.property(arrayBuilder, arr => {
        const left = arr;
        const right = Array.from(arr).reverse();

        let lastIndex = -1;
        let timesCalled = 0;
        expect(
          zip(left, right, (l, r, ix) => {
            ++timesCalled;
            expect(l, `left[${ix}]`).toStrictEqual(left[ix]);
            expect(r, `right[${ix}]`).toStrictEqual(right[ix]);
            expect(ix, `${ix}`).toBe(lastIndex + 1);
            lastIndex = ix;
          }),
        ).toBe(LoopStatus.KeepLooping);
        expect(timesCalled).toBe(left.length);
      }),
      {
        examples: [
          [
            [1, 2],
            [3, 4],
          ],
        ],
      },
    ));
  it("should be able to exit early", () =>
    fc.assert(
      fc.property(optionBuilder, ({ data, ret, stopAt }) => {
        const left = data;
        const right = Array.from(data).reverse();

        const { actualStopIndex, expectedIterationCount, expectedReturnValue } =
          getSafeEarlyStopProps(data, stopAt, ret);

        let lastIndex = -1;
        let timesCalled = 0;
        expect(
          zip(left, right, (l, r, ix) => {
            ++timesCalled;
            expect(l, `left[${ix}]`).toStrictEqual(left[ix]);
            expect(r, `right[${ix}]`).toStrictEqual(right[ix]);
            expect(ix, `${ix}`).toBe(lastIndex + 1);
            lastIndex = ix;
            if (ix === actualStopIndex) {
              return ret;
            }
          }),
        ).toBe(expectedReturnValue);
        expect(timesCalled).toBe(expectedIterationCount);
      }),
      {
        examples: [
          [{ data: [1, 2, 3], ret: LoopStatus.KeepLooping, stopAt: 0 }],
          [{ data: [1, 2, 3], ret: LoopStatus.StopLooping, stopAt: 0 }],
        ],
      },
    ));
});

const arrayBuilder = fc.array(
  fc.option(
    fc.oneof(fc.integer(), fc.string(), fc.boolean(), fc.date(), fc.bigInt()),
  ),
);
const optionBuilder = fc.record(
  {
    data: arrayBuilder,
    stopAt: fc.nat(),
    ret: fc.constantFrom(LoopStatus.StopLooping, LoopStatus.KeepLooping),
  },
  { requiredKeys: ["data"] },
);

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
