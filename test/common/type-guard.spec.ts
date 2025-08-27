import { expect, describe, it, expectTypeOf } from "vitest";

import { 
    assert, forceNever, isBoundedInteger, isInteger, isPositiveInteger 
} from "../../src/common/type-guard";

describe("assert", () => {
    it("doesn't throw when the assertion is true", () => {
        assert(true);
    });
    it("throws when assertion is false", () => {
        expect(() => assert(false)).toThrowError(
            'Assertion of "false" failed'
        );
    });
});

describe("isInteger", () => {
    it("Gets positive integers right", () => 
        expect(isInteger(1)).toBeTruthy()
    );
    it("Gets negative integers right", () => 
        expect(isInteger(-1)).toBeTruthy()
    );
    it("Gets zero right", () => 
        expect(isInteger(0)).toBeTruthy()
    );
    it("Gets floats right", () => 
        expect(isInteger(1.1)).toBeFalsy()
    );
});

describe("isPositiveInteger", () => {
    it("Gets positive integers right", () => 
        expect(isPositiveInteger(1)).toBeTruthy()
    );
    it("Gets negative integers right", () => 
        expect(isPositiveInteger(-1)).toBeFalsy()
    );
    it("Gets zero right", () => 
        expect(isPositiveInteger(0)).toBeFalsy()
    );
    it("Gets floats right", () => 
        expect(isPositiveInteger(1.1)).toBeFalsy()
    );
});

describe("isBoundedInteger", () => {
    it("Gets positive integers right", () => 
        expect(isBoundedInteger(1, 0, 2)).toBeTruthy()
    );
    it("Gets negative integers right", () => 
        expect(isBoundedInteger(-1, -2, 0)).toBeTruthy()
    );
    it("Gets zero right", () => 
        expect(isBoundedInteger(0, -1, 1)).toBeTruthy()
    );
    it("Gets floats right", () => 
        expect(isBoundedInteger(1.1, 0, 2)).toBeFalsy()
    );
    it("Gets integers equal to min right", () => 
        expect(isBoundedInteger(1, 1, 2)).toBeTruthy()
    );
    it("Gets integers equal to max right", () => 
        expect(isBoundedInteger(2, 1, 2)).toBeTruthy()
    );
    it("Gets integers too low right", () => 
        expect(isBoundedInteger(0, 1, 2)).toBeFalsy()
    );
    it("Gets integers too high right", () => 
        expect(isBoundedInteger(3, 1, 2)).toBeFalsy()
    );
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
                    'Reached impossible code with value "3"'
                );
        }
    });
});