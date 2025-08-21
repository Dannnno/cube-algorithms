import { expect, describe, it } from "vitest";

import { 
    at, getCubeSize 
} from "../../src/model/geometry";


describe("getCubeSize", () => {
    it("calculates the size of a 2x2", () => 
        expect(getCubeSize(
            [
                [1, 1, 1, 1], 
                [2, 2, 2, 2], 
                [3, 3, 3, 3], 
                [4, 4, 4, 4], 
                [5, 5, 5, 5], 
                [6, 6, 6, 6]
            ]
        )).toBe(2)
    );
    it("calculates the size of a 3x3", () => 
        expect(getCubeSize(
            [
                [1, 1, 1, 1, 1, 1, 1, 1, 1], 
                [2, 2, 2, 2, 2, 2, 2, 2, 2], 
                [3, 3, 3, 3, 3, 3, 3, 3, 3], 
                [4, 4, 4, 4, 4, 4, 4, 4, 4], 
                [5, 5, 5, 5, 5, 5, 5, 5, 5], 
                [6, 6, 6, 6, 6, 6, 6, 6, 6]
            ]
        )).toBe(3)
    );
});

describe("at", () => {
    it("gets the value", () => 
        expect(
            at(
                [
                    [1, 2, 3, 4], 
                    [5, 6, 1, 2], 
                    [3, 4, 5, 6], 
                    [1, 2, 3, 4], 
                    [5, 6, 1, 2], 
                    [3, 4, 5, 6], 
                ],
                2, 1, 1
            )
        ).toBe(2)
    );
});
