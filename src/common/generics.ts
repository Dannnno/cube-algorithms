/**
 * Generic type that forces an object to be readonly from top-to-bottom
 * @template T The type of object being forced
 */
export type DeepReadonly<T> = T extends [infer U]
  ? readonly [DeepReadonly<U>]
  : T extends [infer U, ...infer V]
    ? readonly [DeepReadonly<U>, ...DeepReadonly<V>]
    : T extends (infer U)[]
      ? readonly DeepReadonly<U>[]
      : T extends object
        ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
        : T;

// https://stackoverflow.com/a/52490977/3076272
/**
 * Type that enforces a tuple of a certain length
 * @template T the tuple member
 * @template N how many there are
 */
export type Tuple<T, N extends number> = N extends N
  ? number extends N
    ? T[]
    : _TupleOf<T, N, []>
  : never;
type _TupleOf<T, N extends number, R extends unknown[]> = R["length"] extends N
  ? R
  : _TupleOf<T, N, [T, ...R]>;

/**
 * A type that might be defined
 * @template T the maybe-defined type
 */
export type Maybe<T> = T | null | undefined;
