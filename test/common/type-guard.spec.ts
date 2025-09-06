import fc from "fast-check";
import { describe, expect, expectTypeOf, it } from "vitest";

import {
  assert,
  forceNever,
  isBoundedInteger,
  isInteger,
  isPositiveInteger,
} from "../../src/common/type-guard";

describe("assert", () => {
  it("doesn't throw when the assertion is true", () => {
    assert(true);
  });

  it("throws when assertion is false", () => {
    expect(() => assert(false)).toThrowError('Assertion of "false" failed');
  });

  it("should not throw when the assertion is true", () =>
    fc.assert(
      fc.property(truthy, val => {
        assert(val);
      }),
    ));
  it("should throw when the assertion is false", () =>
    fc.assert(
      fc.property(
        fc.falsy(),
        val =>
          void expect(() => assert(val)).toThrowError(
            `Assertion of "${val}" failed`,
          ),
      ),
    ));
  it("should throw a specific message when the assertion is false", () =>
    fc.assert(
      fc.property(fc.falsy(), fc.string({ minLength: 1 }), (val, msg) => {
        expect(() => assert(val, msg)).toThrowError(
          `Assertion of "${msg}" [${val}] failed`,
        );
      }),
    ));
});

describe("isInteger", () => {
  it("Gets positive integers right", () => expect(isInteger(1)).toBeTruthy());
  it("Gets negative integers right", () => expect(isInteger(-1)).toBeTruthy());
  it("Gets zero right", () => expect(isInteger(0)).toBeTruthy());
  it("Gets floats right", () => expect(isInteger(1.1)).toBeFalsy());

  it("should correctly identify integers", () =>
    fc.assert(
      fc.property(
        fc.oneof(
          fc.integer(),
          fc.float().filter(float => Number.isInteger(float)),
          fc.double().filter(double => Number.isInteger(double)),
          fc.maxSafeInteger(),
          fc.nat(),
          fc.maxSafeNat(),
        ),
        val => void expect(isInteger(val)).toBeTruthy(),
      ),
    ));
  it("should correctly identify non-integers", () =>
    fc.assert(
      fc.property(
        fc.oneof(
          fc.float({ noInteger: true }),
          fc.double({ noInteger: true }),
          fc.string(),
          fc.boolean(),
          fc.date(),
          fc.object(),
          fc.array(fc.integer()),
        ),
        val => void expect(isInteger(val)).toBeFalsy(),
      ),
    ));
});

describe("isPositiveInteger", () => {
  it("Gets positive integers right", () =>
    expect(isPositiveInteger(1)).toBeTruthy());
  it("Gets negative integers right", () =>
    expect(isPositiveInteger(-1)).toBeFalsy());
  it("Gets zero right", () => expect(isPositiveInteger(0)).toBeFalsy());
  it("Gets floats right", () => expect(isPositiveInteger(1.1)).toBeFalsy());

  it("should correctly identify positive integers", () =>
    fc.assert(
      fc.property(
        fc
          .oneof(
            fc.integer(),
            fc.float().filter(float => Number.isInteger(float)),
            fc.double().filter(double => Number.isInteger(double)),
            fc.maxSafeInteger(),
            fc.nat(),
            fc.maxSafeNat(),
          )
          .filter(i => i > 0),
        val => void expect(isPositiveInteger(val)).toBeTruthy(),
      ),
    ));
  it("should correctly identify negative integers and zero", () =>
    fc.assert(
      fc.property(
        fc.oneof(
          fc.integer().filter(i => i < 1),
          fc.nat().map(n => -n),
        ),
        val => void expect(isPositiveInteger(val)).toBeFalsy(),
      ),
    ));
  it("should correctly identify non-integers", () =>
    fc.assert(
      fc.property(
        fc.oneof(
          fc.float({ noInteger: true }),
          fc.double({ noInteger: true }),
          fc.string(),
          fc.boolean(),
          fc.date(),
          fc.object(),
          fc.array(fc.integer()),
        ),
        val => void expect(isPositiveInteger(val)).toBeFalsy(),
      ),
    ));
});

describe("isBoundedInteger", () => {
  it("Gets positive integers right", () =>
    expect(isBoundedInteger(1, 0, 2)).toBeTruthy());
  it("Gets negative integers right", () =>
    expect(isBoundedInteger(-1, -2, 0)).toBeTruthy());
  it("Gets zero right", () => expect(isBoundedInteger(0, -1, 1)).toBeTruthy());
  it("Gets floats right", () =>
    expect(isBoundedInteger(1.1, 0, 2)).toBeFalsy());
  it("Gets integers equal to min right", () =>
    expect(isBoundedInteger(1, 1, 2)).toBeTruthy());
  it("Gets integers equal to max right", () =>
    expect(isBoundedInteger(2, 1, 2)).toBeTruthy());
  it("Gets integers too low right", () =>
    expect(isBoundedInteger(0, 1, 2)).toBeFalsy());
  it("Gets integers too high right", () =>
    expect(isBoundedInteger(3, 1, 2)).toBeFalsy());

  it("should correctly identify integers", () =>
    fc.assert(
      fc.property(
        fc
          .oneof(
            fc.integer(),
            fc.float().filter(float => Number.isInteger(float)),
            fc.double().filter(double => Number.isInteger(double)),
            fc.maxSafeInteger(),
            fc.nat(),
            fc.maxSafeNat(),
          )
          .filter(i => i > 0),
        fc.integer(),
        fc.integer(),
        (val, min, max) =>
          void expect(
            isBoundedInteger(val, min < max ? min : max, min < max ? max : min),
          ).toBe(
            min < max //
              ? val >= min && val <= max
              : val >= max && val <= min,
          ),
      ),
    ));
  it("should correctly identify non-integers", () =>
    fc.assert(
      fc.property(
        fc.oneof(
          fc.float({ noInteger: true }),
          fc.double({ noInteger: true }),
          fc.string(),
          fc.boolean(),
          fc.date(),
          fc.object(),
          fc.array(fc.integer()),
        ),
        fc.integer(),
        fc.integer(),
        (val, min, max) =>
          void expect(
            isBoundedInteger(val, min < max ? min : max, min < max ? max : min),
          ).toBeFalsy(),
      ),
    ));
});

describe("forceNever", () => {
  let a: 1 | 2 | 3;
  a = ((): 1 | 2 | 3 => 3)();
  it("Forces exhausitivity", () => {
    switch (a) {
      case 1:
        expect(true).toBeFalsy();
        break;
      case 2:
        expect(true).toBeFalsy();
        break;
      case 3:
        expect(true).toBeTruthy();
        break;
      default:
        expectTypeOf(forceNever(a)).toMatchTypeOf<never>();
    }
  });
  it("Catches non-exhausitivity", () => {
    switch (a) {
      case 1:
        expect(true).toBeFalsy();
        break;
      case 2:
        expect(true).toBeFalsy();
        break;
      case 3:
        expect(true).toBeTruthy();
      default:
        //@ts-expect-error Missing break above, so not exhaustive
        expect(() => forceNever(a)).toThrowError(
          'Reached impossible code with value "3"',
        );
    }
  });
});

const truthy = fc
  .oneof(
    fc.integer(),
    fc.string(),
    fc.boolean(),
    fc.float(),
    fc.double(),
    fc.maxSafeInteger(),
    fc.maxSafeNat(),
  )
  .filter(v => !!v);
