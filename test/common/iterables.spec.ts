import { expect, describe, it, beforeEach } from "vitest";

import { forEach, LoopStatus, swapAt } from "../../src/common/iterables";

describe("forEach", () => {
    const array: readonly number[] = [1, 2, 3];
    it("Loops in the correct order", () => {
        forEach(
            array,
            (val, ix) => expect(val).toBe(array[ix])
        );
    });
    it("Doesn't stop if not prompted", () => {
        let sum = 0;
        expect(
            forEach(
                array,
                _ => sum = sum + 1
            )
        ).toBe(LoopStatus.KeepLooping);
        expect(sum).toBe(array.length);
    });
    it("Can stop early", () => {
        let sum = 0;
        expect(
            forEach(
                array,
                _ => {
                    sum = sum + 1;
                    return LoopStatus.StopLooping;
                }
            )
        ).toBe(LoopStatus.StopLooping);
        expect(sum).toBe(1);
    });
    it("Can continue", () => {
        let sum = 0;
        expect(
            forEach(
                array,
                _ => {
                    sum = sum + 1;
                    return LoopStatus.KeepLooping;
                }
            )
        ).toBe(LoopStatus.KeepLooping);
        expect(sum).toBe(array.length);
    });
});

describe("swapAt", () => {
    let left: number[] = [];
    let right: number[] = [];

    beforeEach(() => {
        left = [1, 2, 3, 4];
        right = [5, 6, 7];
    })

    it("Swaps at the same index", () => {
        swapAt(left, 0, right, 0);
        expect(left).toStrictEqual([5, 2, 3, 4]);
        expect(right).toStrictEqual([1, 6, 7]);
    });

    it("Swaps at different indices", () => {
        swapAt(left, 0, right, 1);
        expect(left).toStrictEqual([6, 2, 3, 4]);
        expect(right).toStrictEqual([5, 1, 7]);
    });

    it("Fails to compile mis-matched types", () => {
        //@ts-expect-error number and string mismatch
        swapAt([1, 2, 3], 0, ["1", "2", "3"], 1);
    });
});