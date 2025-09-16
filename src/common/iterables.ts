import { assert } from "./type-guard";

/**
 * Represent whether some type of loop that executes a callback
 * should continue or not
 */
export const enum LoopStatus {
  /** The loop should stop */
  StopLooping,
  /** The loop should continue */
  KeepLooping,
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
  callback: (value: T, ix: number) => LoopStatus | void,
): LoopStatus {
  for (let ix = 0; ix < arr.length; ++ix) {
    if (callback(arr[ix], ix) == LoopStatus.StopLooping) {
      return LoopStatus.StopLooping;
    }
  }
  return LoopStatus.KeepLooping;
}

/**
 * Iterate over two arrays pairwise. Requires that they have the same length
 * @param left The left array
 * @param right The right array
 * @param callback The action to take on the zipper
 * @returns Whether we stopped zipping early
 */
export function zip<TLeft, TRight>(
  left: readonly TLeft[],
  right: readonly TRight[],
  callback: (left: TLeft, right: TRight, ix: number) => LoopStatus | void,
): LoopStatus {
  assert(left.length === right.length);

  for (let ix = 0; ix < left.length; ++ix) {
    if (callback(left[ix], right[ix], ix) === LoopStatus.StopLooping) {
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
  rightIx: number,
): void {
  const tmp = left[leftIx];
  left[leftIx] = right[rightIx];
  right[rightIx] = tmp;
}

type SplitString<
  TString extends string = string,
  TDelim extends string = string,
> = TString extends TDelim
  ? []
  : TString extends `${TDelim}${infer U}`
    ? SplitString<U, TDelim>
    : TString extends `${infer U}${TDelim}${infer V}`
      ? [...SplitString<U, TDelim>, ...SplitString<V, TDelim>]
      : TString extends `${infer U}${TDelim}`
        ? [...SplitString<U, TDelim>]
        : [TString];

/**
 * Split a string in a way that preserves type safety (if the string
 * and delimiter types can be statically known)
 * @param value The string to be split
 * @param delim The delimiter of the string
 * @returns A type-safe variant of the string
 */
export function typeSafeSplit<
  TString extends string = string,
  TDelim extends string = string,
>(value: TString, delim: TDelim): SplitString<TString, TDelim> {
  return value.split(delim) as SplitString<TString, TDelim>;
}

/**
 * Get the cross product of two arrays
 * @param left The left-side of the cross product
 * @param right The right-side of the cross product
 * @returns The cross product
 */
export function cross<TLeft, TRight>(
  left: readonly TLeft[],
  right: readonly TRight[],
): [TLeft, TRight][] {
  const results: [TLeft, TRight][] = [];
  icross(left, right, (l, r) => results.push([l, r]));
  return results;
}

/**
 * Get the cross product of two arrays
 * @param left The left-side of the cross product
 * @param right The right-side of the cross product
 * @param callback What to do with each combination
 * @returns Whether we evaluated all combinations or not
 */
export function icross<TLeft, TRight>(
  left: readonly TLeft[],
  right: readonly TRight[],
  callback: (l: TLeft, r: TRight) => LoopStatus | void,
): LoopStatus {
  for (const l of left) {
    for (const r of right) {
      if (callback(l, r) === LoopStatus.StopLooping) {
        return LoopStatus.StopLooping;
      }
    }
  }

  return LoopStatus.KeepLooping;
}
