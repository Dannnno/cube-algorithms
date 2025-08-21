/**
 * Represent whether some type of loop that executes a callback
 * should continue or not
 */
export const enum LoopStatus {
    /** The loop should stop */
    StopLooping,
    /** The loop should continue */
    KeepLooping
}

/**
 * Take an action on each element of an array. Like `Array.forEach`, but
 * it supports breaking early
 * @param arr The array to iterate over
 * @param callback The action to take
 * @returns Whether the loop broke early
 */
export function forEach<T>(
    arr: readonly T[], 
    callback: (value: T, ix: number) => LoopStatus | void
): LoopStatus {
    for (let ix = 0; ix < arr.length; ++ix) {
        if (callback(arr[ix], ix) == LoopStatus.StopLooping) {
            return LoopStatus.StopLooping;
        }
    }
    return LoopStatus.KeepLooping;
}

/**
 * Swap values at two indices in two arrays.
 * @param left The left array
 * @param leftIx The location in the left array to be swapped
 * @param right The right array
 * @param rightIx The location in the right array to be swapped
 */
export function swapAt<T>(
    left: T[],
    leftIx: number,
    right: T[],
    rightIx: number
): void {
    const tmp = left[leftIx];
    left[leftIx] = right[rightIx];
    right[rightIx] = tmp;
}