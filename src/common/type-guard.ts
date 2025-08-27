/**
 * Type-guard assertion function
 * @param toAssert Value to be checked
 */
export function assert(toAssert: unknown): asserts toAssert {
    if (toAssert) {
        return;
    }
    throw new Error(`Assertion of "${toAssert}" failed`);
}

/**
 * Integer check that functions as a type guard as well.
 * @param val The value that might be an integer
 * @returns Whether it is an integer
 */
export function isInteger(val: unknown): val is number {
    return Number.isInteger(val);
}

/**
 * Positive integer check that functions as a type guard
 * @param val The value that might be a positive integer
 * @returns Whether it is a positive integer
 */
export function isPositiveInteger(val: unknown): val is number {
    return isInteger(val) && val >= 1;
}

/**
 * Bounded integer check that functions as a type guard
 * @param val The value that might be an in-bounds integer
 * @returns Whether it is an integer in-bounds
 */
export function isBoundedInteger(
    val: unknown, min: number, max: number
): val is number {
    return isInteger(val) && val >= min && val <= max;
}

/**
 * Flag code that shouldn't be reachable and force the compiler to check
 * exhaustiveness.
 * @param value A value that should never be valued
 */
export function forceNever(value: never): never {
    throw Error(`Reached impossible code with value "${value}"`);
}