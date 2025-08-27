import { assertType, describe, expectTypeOf, it } from "vitest";

import { DeepReadonly, Tuple } from "../../src/common/generics";

describe("DeepReadonly", () => {
  it("DeepReadonly<primitive>", () => {
    const value: DeepReadonly<number> = 1;
    expectTypeOf(value).toMatchTypeOf<number>();

    assertType<DeepReadonly<number>>(1);
    // @ts-expect-error value is not a number
    assertType<DeepReadonly<number>>("");
  });

  it("DeepReadonly<array>", () => {
    const value: DeepReadonly<number[]> = [1];
    expectTypeOf(value).toMatchTypeOf<readonly number[]>();

    // @ts-expect-error value is not a number
    assertType<DeepReadonly<number[]>>([""]);
  });

  it("DeepReadonly<object>", () => {
    const value: DeepReadonly<{ key: number }> = { key: 1 };
    expectTypeOf(value).toMatchTypeOf<{ readonly key: number }>();

    // @ts-expect-error value is not a number
    assertType<DeepReadonly<{ key: number }>>({ key: "" });
  });

  it("DeepReadonly<Tuple>", () => {
    const value: DeepReadonly<[number, number]> = [1, 2];
    expectTypeOf(value).toMatchTypeOf<readonly number[]>();
    expectTypeOf(value).toMatchTypeOf<readonly [number, number]>();
  });

  it("DeepReadonly<nested>", () => {
    const value: DeepReadonly<{
      key: number;
      arr: number[];
      obj: { otherKey: string };
    }> = { key: 1, arr: [2], obj: { otherKey: "" } };
    expectTypeOf(value).toMatchTypeOf<{
      readonly key: number;
      readonly arr: readonly number[];
      readonly obj: { readonly otherKey: string };
    }>();

    assertType<
      DeepReadonly<{ key: number; arr: number[]; obj: { otherKey: string } }>
    >({
      // @ts-expect-error value is not a number
      key: "",
      arr: [2],
      obj: {
        otherKey: "",
      },
    });
    assertType<
      DeepReadonly<{ key: number; arr: number[]; obj: { otherKey: string } }>
    >({
      key: 1,
      // @ts-expect-error value is not a number
      arr: [""],
      obj: {
        otherKey: "",
      },
    });
    assertType<
      DeepReadonly<{ key: number; arr: number[]; obj: { otherKey: string } }>
    >({
      key: 1,
      arr: [2],
      obj: {
        // @ts-expect-error value is not a string
        otherKey: 1,
      },
    });
  });
});

describe("Tuple<T, N>", () => {
  it("handle tuples of size one", () => {
    const value: Tuple<number, 1> = [1];
    expectTypeOf(value).toMatchTypeOf<[number]>();
  });

  it("catches mis-typeing", () =>
    // @ts-expect-error value is not a number
    assertType<Tuple<number, 1>>([""]));

  it("catches mis-sizing", () => {
    // @ts-expect-error value is the wrong size
    assertType<Tuple<number, 1>>([]);

    // @ts-expect-error value is the wrong size
    assertType<Tuple<number, 1>>([1, 2]);

    const arr: number[] = [1, 2, 3];
    // @ts-expect-error value is the wrong size
    assertType<Tuple<number, 3>>(arr);
  });

  it("isn't tricked by other array an tuple types", () => {
    const arr2: number[] = [1, 2, 3] as const;
    // @ts-expect-error value is the wrong size
    assertType<Tuple<number, 3>>(arr2);

    const arr3: readonly [number, number, number] = [1, 2, 3];
    // @ts-expect-error Tuple doesn't require readonly
    assertType<Tuple<number, 3>>(arr3);
  });
});
