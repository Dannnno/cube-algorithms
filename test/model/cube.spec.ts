import { expect, describe, it } from "vitest";

import { 
    assertIsValidCube, assertIsValidCubeCell, 
    forEachCellOnSide, 
    forEachSide
} from "../../src/model/cube";
import { LoopStatus } from "../../src/common/iterables";

describe("assertIsValidCubeCell", () => {
    it("Catches non-integers", () => 
        expect(() => assertIsValidCubeCell(1.1)).toThrowError(
            'Assertion of "false" failed'
        )
    );
    it("Catches negative numbers", () => 
        expect(() => assertIsValidCubeCell(-1)).toThrowError(
            'Assertion of "false" failed'
        )
    );
    it("Catches too-large numbers", () => 
        expect(() => assertIsValidCubeCell(7)).toThrowError(
            'Assertion of "false" failed'
        )
    );
    it("allows cube cells", () => 
        assertIsValidCubeCell(1)
    );
});

describe("assertIsValidCube", () => {
    it("handles valid cubes", () => assertIsValidCube(
        [
            [1, 1, 1, 1], 
            [2, 2, 2, 2], 
            [3, 3, 3, 3], 
            [4, 4, 4, 4], 
            [5, 5, 5, 5], 
            [6, 6, 6, 6]
        ],
        2
    ));
    it("catches bad sizes", () => 
        expect(() => assertIsValidCube(
            [
                [1, 1, 1, 1], 
                [2, 2, 2, 2], 
                [3, 3, 3, 3], 
                [4, 4, 4, 4], 
                [5, 5, 5, 5], 
                [6, 6, 6, 6]
            ],
            -1
        )).toThrowError(
            'Assertion of "false" failed'
        )
    );
    it("catches inconsistent sizes", () => 
        expect(() => assertIsValidCube(
            [
                [1, 1, 1, 1], 
                [2, 2, 2, 2], 
                [3, 3, 3, 3], 
                [4, 4, 4, 4], 
                [5, 5, 5, 5], 
                [6, 6, 6, 6]
            ],
            3
        )).toThrowError(
            'Assertion of "false" failed'
        )
    );
    it("catches extra sides", () => 
        expect(() => assertIsValidCube(
            [
                [1, 1, 1, 1], 
                [2, 2, 2, 2], 
                [3, 3, 3, 3], 
                [4, 4, 4, 4], 
                [5, 5, 5, 5], 
                [6, 6, 6, 6],
                [7, 7, 7, 7]
            ],
            2
        )).toThrowError(
            'Assertion of "false" failed'
        )
    );
    it("catches missing sides", () => 
        expect(() => assertIsValidCube(
            [
                [1, 1, 1, 1], 
                [2, 2, 2, 2], 
                [3, 3, 3, 3], 
                [4, 4, 4, 4], 
                [5, 5, 5, 5]
            ],
            2
        )).toThrowError(
            'Assertion of "false" failed'
        )
    );
    it("catches short sides", () => 
        expect(() => assertIsValidCube(
            [
                [1, 1, 1, 1], 
                [2, 2, 2, 2], 
                [3, 3, 3, 3], 
                [4, 4, 4, 4], 
                [5, 5, 5, 5], 
                [6, 6, 6]
            ],
            2
        )).toThrowError(
            'Assertion of "false" failed'
        )
    );
    it("catches long sides", () => 
        expect(() => assertIsValidCube(
            [
                [1, 1, 1, 1], 
                [2, 2, 2, 2], 
                [3, 3, 3, 3], 
                [4, 4, 4, 4], 
                [5, 5, 5, 5], 
                [6, 6, 6, 6, 6]
            ],
            2
        )).toThrowError(
            'Assertion of "false" failed'
        )
    );
    it("catches bad values", () => 
        expect(() => assertIsValidCube(
            [
                [1, 1, 1, 1], 
                [2, 2, 2, 2], 
                [3, 3, 3, 3], 
                [4, 4, 4, 4], 
                [5, 5, 5, 5], 
                [6, 6, 6, 0]
            ],
            2
        )).toThrowError(
            'Assertion of "false" failed'
        )
    );
    it("catches bad value counts", () => 
        expect(() => assertIsValidCube(
            [
                [1, 1, 1, 1], 
                [2, 2, 2, 2], 
                [3, 3, 3, 3], 
                [4, 4, 4, 4], 
                [5, 5, 5, 5], 
                [6, 6, 6, 5]
            ],
            2
        )).toThrowError(
            'Assertion of "false" failed'
        )
    );
    it("handles valid cubes w/o size param", () => assertIsValidCube(
        [
            [1, 1, 1, 1], 
            [2, 2, 2, 2], 
            [3, 3, 3, 3], 
            [4, 4, 4, 4], 
            [5, 5, 5, 5], 
            [6, 6, 6, 6]
        ]
    ));
    it("catches extra sides w/o size param", () => 
        expect(() => assertIsValidCube(
            [
                [1, 1, 1, 1], 
                [2, 2, 2, 2], 
                [3, 3, 3, 3], 
                [4, 4, 4, 4], 
                [5, 5, 5, 5], 
                [6, 6, 6, 6],
                [7, 7, 7, 7]
            ]
        )).toThrowError(
            'Assertion of "false" failed'
        )
    );
    it("catches missing sides w/o size param", () => 
        expect(() => assertIsValidCube(
            [
                [1, 1, 1, 1], 
                [2, 2, 2, 2], 
                [3, 3, 3, 3], 
                [4, 4, 4, 4], 
                [5, 5, 5, 5]
            ]
        )).toThrowError(
            'Assertion of "false" failed'
        )
    );
    it("catches short sides w/o size param", () => 
        expect(() => assertIsValidCube(
            [
                [1, 1, 1, 1], 
                [2, 2, 2, 2], 
                [3, 3, 3, 3], 
                [4, 4, 4, 4], 
                [5, 5, 5, 5], 
                [6, 6, 6]
            ]
        )).toThrowError(
            'Assertion of "false" failed'
        )
    );
    it("catches long sides w/o size param", () => 
        expect(() => assertIsValidCube(
            [
                [1, 1, 1, 1], 
                [2, 2, 2, 2], 
                [3, 3, 3, 3], 
                [4, 4, 4, 4], 
                [5, 5, 5, 5], 
                [6, 6, 6, 6, 6]
            ]
        )).toThrowError(
            'Assertion of "false" failed'
        )
    );
    it("catches bad values w/o size param", () => 
        expect(() => assertIsValidCube(
            [
                [1, 1, 1, 1], 
                [2, 2, 2, 2], 
                [3, 3, 3, 3], 
                [4, 4, 4, 4], 
                [5, 5, 5, 5], 
                [6, 6, 6, 0]
            ]
        )).toThrowError(
            'Assertion of "false" failed'
        )
    );
    it("catches bad value counts w/o size param", () => 
        expect(() => assertIsValidCube(
            [
                [1, 1, 1, 1], 
                [2, 2, 2, 2], 
                [3, 3, 3, 3], 
                [4, 4, 4, 4], 
                [5, 5, 5, 5], 
                [6, 6, 6, 5]
            ]
        )).toThrowError(
            'Assertion of "false" failed'
        )
    );
});

describe("forEachSide", () => {
    const cube = [
        [1, 1, 1, 1], 
        [2, 2, 2, 2], 
        [3, 3, 3, 3], 
        [4, 4, 4, 4], 
        [5, 5, 5, 5], 
        [6, 6, 6, 6]
    ];
    it("visits each side", () => {
        let count = 0;
        expect(forEachSide(cube, (sideId, value) => {
            expect(cube[sideId-1]).toStrictEqual(value);
            count += 1;
        })).toBe(LoopStatus.KeepLooping);
        expect(count).toBe(6);
    });
    it("can break early", () => {
        let count = 0;
        expect(forEachSide(cube, (sideId, value) => {
            expect(cube[sideId-1]).toStrictEqual(value);
            count += 1;
            return LoopStatus.StopLooping;
        })).toBe(LoopStatus.StopLooping);
        expect(count).toBe(1);
    });
    it("can continue", () => {
        let count = 0;
        expect(forEachSide(cube, (sideId, value) => {
            expect(cube[sideId-1]).toStrictEqual(value);
            count += 1;
            return LoopStatus.KeepLooping;
        })).toBe(LoopStatus.KeepLooping);
        expect(count).toBe(6);
    });
});

describe("forEachCellOnSide", () => {
    const side = [1, 2, 3, 4];
    const toVisit = [
        [0, 0, 1],
        [0, 1, 2],
        [1, 0, 3],
        [1, 1, 4]
    ];

    it("visits in the right order", () => {
        let count = 0;
        let ix = 0;
        expect(forEachCellOnSide(side, 2, (r, c, v) => {
            count += 1;
            const [expRow, expCol, expVal] = toVisit[ix++];
            expect(r).toBe(expRow);
            expect(c).toBe(expCol);
            expect(v).toBe(expVal);
        })).toBe(LoopStatus.KeepLooping);
        expect(count).toBe(4);
    });

    it("can break early", () => {
        let count = 0;
        let ix = 0;
        expect(forEachCellOnSide(side, 2, (r, c, v) => {
            count += 1;
            const [expRow, expCol, expVal] = toVisit[ix++];
            expect(r).toBe(expRow);
            expect(c).toBe(expCol);
            expect(v).toBe(expVal);
            return LoopStatus.StopLooping;
        })).toBe(LoopStatus.StopLooping);
        expect(count).toBe(1);
    });

    it("can continue", () => {
        let count = 0;
        let ix = 0;
        expect(forEachCellOnSide(side, 2, (r, c, v) => {
            count += 1;
            const [expRow, expCol, expVal] = toVisit[ix++];
            expect(r).toBe(expRow);
            expect(c).toBe(expCol);
            expect(v).toBe(expVal);
            return LoopStatus.KeepLooping;
        })).toBe(LoopStatus.KeepLooping);
        expect(count).toBe(4);
    });
});