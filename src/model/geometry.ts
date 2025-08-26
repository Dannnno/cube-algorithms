import { DeepReadonly, forceNever } from "@/common";
import { 
    CubeSide, CubeCellValue, CubeSideData, CubeData, getCubeSize,
    assertIsValidCube, assertIsValidCubeCell, CubeAxis,
} from "./cube";

/**
 * Different amounts a cube can be rotated by
 */
export const enum RotationAmount {
    /** No rotation - keep it as-is */
    None = 0,
    /** Rotate once clockwise */
    Clockwise = 1,
    /** Rotate once counter-clockwise */
    CounterClockwise = 3,
    /** Rotate twice clockwise */
    Halfway = 2,
    /** Rotate twice counter-clockwise */
    HalfwayReverse = 2,
    /** Rotate three times clockwise */
    ThreeQuarter = 3,
    /** Rotate three times counter-clockwise */
    ThreeQuarterReverse = 1
}

/**
 * Get a value from the cube
 * @param cubeData The cube
 * @param side The side the cell is on
 * @param row The row the cell is in
 * @param col The column the cell is in
 * @returns The value at that cell
 */
export function at(
    cubeData: DeepReadonly<CubeData>,
    side: CubeSide, 
    row: number, 
    col: number
): CubeCellValue {
    assertIsValidCube(cubeData);
    assertIsValidCubeCell(side);
    return at_(cubeData, side, row, col);
}

/**
 * Get a value from the cube without checking for cube validity.
 * @param cubeData The cube
 * @param side The side the cell is on
 * @param row The row the cell is in
 * @param col The column the cell is in
 * @returns The value at that cell
 */
export function at_(
    cubeData: DeepReadonly<CubeData>,
    side: CubeSide,
    row: number, 
    col: number
): CubeCellValue {
    return _at(cubeData[side-1], getCubeSize(cubeData), row, col);
}

function _at(
    data: DeepReadonly<CubeSideData>, 
    size: number,
    row: number,
    col: number
): CubeCellValue {
    return data[_ix(size, row, col)];
}

function _ix(size: number, row: number, col: number): number {
    return row * size + col;
}

/**
 * Rotate a single cube face
 * @param cubeData The cube data
 * @param sideId Which face is being rotated clockwise
 * @param numTurns How many turns to rotate the cube face
 * @returns The modified cube data
 */
export function rotateCubeFace(
    cubeData: DeepReadonly<CubeData>, 
    sideId: CubeSide, 
    numTurns: number
): CubeData {
    const [newCube, cubeSize, numRotations] = _setupManipulation(
        cubeData, numTurns
    );

    const result = _rotateCubeFace(newCube, cubeSize, sideId, numRotations);
    assertIsValidCube(result, cubeSize);
    return result;
}

function _rotateCubeFace(
    cubeData: CubeData, 
    cubeSize: number,
    sideId: CubeSide, 
    numTurns: RotationAmount,
    skipSlice: boolean = false
): CubeData {
    if (numTurns === 0) {
        return cubeData;
    }

    const _i = (r: number, c: number) => _ix(cubeSize, r, c);

    // https://stackoverflow.com/a/8664879/3076272
    /**
     * REMEMBER - in a cube whenever you modify one face, you're 
     * modifying the four adjacent faces as well. In our data model, the
     * faces look like this (3x3 cube):
     * 
     *         +-------+
     *         | 5 5 5 |
     *         | 5 5 5 |
     *         | 5 5 5 |
     * +-------+-------+-------+-------+
     * | 1 1 1 | 2 2 2 | 3 3 3 | 4 4 4 |
     * | 1 1 1 | 2 2 2 | 3 3 3 | 4 4 4 |
     * | 1 1 1 | 2 2 2 | 3 3 3 | 4 4 4 |
     * +-------+-------+-------+-------+
     *         | 6 6 6 |
     *         | 6 6 6 |
     *         | 6 6 6 |
     *         +-------+
     * 
     * That is to say we have the following adjacencies (Side, Row, Col):
     *  - (1, 0, 0) -> (5, 0, 0)
     *  - (1, 0, 0) -> (4, 0, 2)
     *  - (1, 0, 1) -> (5, 1, 0)
     *  - (1, 0, 2) -> (5, 2, 0)
     *  - (1, 0, 2) -> (2, 0, 0)
     * 
     *  - (1, 1, 0) -> (4, 1, 2)
     *  - (1, 1, 2) -> (2, 1, 0)
     * 
     *  - (1, 2, 0) -> (4, 2, 2)
     *  - (1, 2, 0) -> (6, 2, 0)
     *  - (1, 2, 1) -> (6, 1, 0)
     *  - (1, 2, 2) -> (2, 2, 0)
     *  - (1, 2, 2) -> (6, 0, 0)
     * 
     * This is _almost_ generalizable if it weren't for the pesky "top"
     * and "bottom" sides. For our purposes, we always consider index 0
     * in sides #5 and #6 to be relative to facing side #2 head-on.
     * 
     * Now, we could certainly try to hyper-optimize this to run as fast
     * as possible for any number of rotations. I like my sanity, 
     * however, so I've instead chosen the slower approach of 
     * looping based on how many turns it takes. Since we have a 
     * constant number of recursive calls (and cube sizes will never 
     * be more than 9) we can rest assured that this is asymptotically 
     * the same runtime as a faster (a.k.a. more complex) 
     * implementation. 
     * 
     * If, in practice, this tanks the app's performance (and I find it
     * in me to care), then this can be revisited.
     */

    // Start with the basic rotation of just the side we're on
    const side = cubeData[sideId - 1]; // 1-indexed
    const _v = (r: number, c: number) => _at(side, cubeSize, r, c);
    const layers = Math.floor(cubeSize / 2);
    for (let i = 0; i < numTurns; ++i) {
        for (let layer = 0; layer < layers; ++layer) {
            const first = layer;
            const last = cubeSize - first - 1;

            for (let ix = first; ix < last; ++ix) {
                const offset = ix - first;
                const top = _v(first, ix);
                const right = _v(ix, last);
                const bottom = _v(last, last - offset);
                const left = _v(last-offset, first);

                side[_i(first, ix)] = left;
                side[_i(ix, last)] = top;
                side[_i(last, last-offset)] = right;
                side[_i(last-offset, first)] = bottom;
            }
        }
    }
    assertIsValidCube(cubeData, cubeSize);

    if (!skipSlice) {
        // Now handle the affected sides as well.
        let axis: CubeAxis; // which axis it is
        const intersect1234 = "X";
        const intersect2546 = "Y";
        const intersect1536 = "Z";

        let edgeIndex: number; // how far in to slice
        const leftOfRefFace = 0;
        const topOfRefFace = 0;
        const rightOfRefFace = cubeSize - 1;
        const bottomOfRefFace = cubeSize - 1;

        let rotCount: number; // how many times to rotate it

        /**
         * This is a bit esoteric; see the comments in the called function
         * for details. For everything below our 'reference' face is the 
         * face with the lowest `sideId` that is affected by the turn.
         * 
         * The X-axis represents sides 1-2-3-4.
         * The Y-axis represents sides 2-5-4-6.
         * The Z-axis represents sides 1-5-3-6.
         * 
         * `edgeIndex` represents whether we need to affect the first 
         * row/col or the last row/col, depending on how the rotated face
         * is slicing things.
         * 
         * `rotCount` is calculated based on whether the rotation is 
         * clockwise (i.e. 1 turn) or counterclockwise (i.e. 3 turns). For
         * this our handling varies depending on which axis it is. 
         * 
         * For the Y/Z axes, imagine the reference face is facing towards
         * you, with face #5 above and face #6 below. If the rotation is
         * going 'up' (i.e. into the page) that is considered clockwise. If
         * the rotation is going 'down' (i.e. out of the page) that is
         * considered counter-clockwise.
         * 
         * For the X axis, imagine viewing the cube from above (side #5).
         * Just use the natural clockwise/counter clockwise
         */

        switch (sideId) {
            case CubeSide.Left: 
                // Reference face is #2
                axis = intersect2546;
                edgeIndex = leftOfRefFace;
                rotCount = RotationAmount.CounterClockwise;
                break;
            case CubeSide.Front:
                // Reference face is #1
                axis = intersect1536;
                edgeIndex = rightOfRefFace;
                rotCount = RotationAmount.Clockwise;
                break;
            case CubeSide.Right: 
                // Reference face is #2
                axis = intersect2546;
                edgeIndex = rightOfRefFace;
                rotCount = RotationAmount.Clockwise;
                break;
            case CubeSide.Back:
                // Reference face is #1
                axis = intersect1536;
                edgeIndex = leftOfRefFace;
                rotCount = RotationAmount.CounterClockwise;
                break;
            case CubeSide.Top:
                // Reference face is #1
                axis = intersect1234;
                edgeIndex = topOfRefFace;
                rotCount = RotationAmount.Clockwise;
                break;
            case CubeSide.Bottom:
                // Reference face is #1
                axis = intersect1234;
                edgeIndex = bottomOfRefFace;
                rotCount = RotationAmount.CounterClockwise;
                break;
            default:
                forceNever(sideId);
        }

        _rotateCubeInternalSlice(
            cubeData, cubeSize, axis, edgeIndex, 1, rotCount * numTurns
        );
        assertIsValidCube(cubeData, cubeSize);
    }
    return cubeData;
}

/**
 * Rotate internal slices of a cube, ignoring any affects on perpendicular faces
 * @param cube The cube being rotated
 * @param axis The axis of rotation
 * @param offsetStart Which slice to rotate
 * @param numSlices The number of slices to rotate
 * @param numRotations The number of times to rotate it
 * @returns The new cube data
 */
export function rotateCubeInternalSlice(
    cube: DeepReadonly<CubeData>, 
    axis: CubeAxis, 
    offsetStart: number, 
    numSlices: number,
    numRotations: number
): CubeData {
    const [newCube, cubeSize, numTurns] = _setupManipulation(
        cube, numRotations
    );

    const result = _rotateCubeInternalSlice(
        newCube, cubeSize, axis, offsetStart, numSlices, numTurns
    );
    assertIsValidCube(result, cubeSize);
    return result;
}

function _rotateCubeInternalSlice(
    cube: CubeData, 
    cubeSize: number,
    axis: CubeAxis, 
    offsetStart: number, 
    numSlices: number,
    numRotations: RotationAmount
): CubeData {
    let rotateHelper: typeof _rotateCubeInternalSliceX;
    switch (axis) {
        case 'X':
            rotateHelper = _rotateCubeInternalSliceX;
            break;
        case 'Y':
            rotateHelper = _rotateCubeInternalSliceY;
            break;
        case 'Z':
            rotateHelper = _rotateCubeInternalSliceZ;
            break;
        default:
            forceNever(axis);
    }

    return rotateHelper(
        cube, 
        cubeSize,
        offsetStart, 
        offsetStart + numSlices,
        numRotations
    );
}

function _rotateCubeInternalSliceX(
    cube: CubeData, 
    cubeSize: number,
    offsetStart: number, 
    offsetEnd: number,
    numRotations: RotationAmount
): CubeData {
    const _i = (r: number, c: number) => _ix(cubeSize, r, c);

    /**
     * We're assuming that this will never affect the faces of anything,
     * and if they are then we're being called from a context that
     * handles that for us.
     * 
     * Remember, in our data model, the faces look like this (3x3 cube):
     * 
     *         +-------+
     *         | 5 5 5 |
     *         | 5 5 5 |
     *         | 5 5 5 |
     * +-------+-------+-------+-------+
     * | 1 1 1 | 2 2 2 | 3 3 3 | 4 4 4 |
     * | 1 1 1 | 2 2 2 | 3 3 3 | 4 4 4 |
     * | 1 1 1 | 2 2 2 | 3 3 3 | 4 4 4 |
     * +-------+-------+-------+-------+
     *         | 6 6 6 |
     *         | 6 6 6 |
     *         | 6 6 6 |
     *         +-------+
     * 
     * X-axis always means rotating 1-2-3-4 in a way that doesn't affect
     * 5-6.
     * 
     * We always rotate in a clockwise direction as if we were looking
     * at the cube from above with #5 on the top.
     */
    const [side1, side2, side3, side4, _side5, _side6] = cube;
    for (let rowOff = offsetStart; rowOff < offsetEnd; ++rowOff) {
        for (let colOff = 0; colOff < cubeSize; ++colOff) {
            const ix = _i(rowOff, colOff);
            for (let r = 0; r < numRotations; ++r) {
                const tmp = side1[ix];
                side1[ix] = side2[ix];
                side2[ix] = side3[ix];
                side3[ix] = side4[ix];
                side4[ix] = tmp;
            }
        }
    }

    return cube;
}

function _rotateCubeInternalSliceY(
    cube: CubeData, 
    cubeSize: number,
    offsetStart: number, 
    offsetEnd: number,
    numRotations: RotationAmount
): CubeData {
    const _i = (r: number, c: number) => _ix(cubeSize, r, c);

    /**
     * We're assuming that this will never affect the faces of anything,
     * and if they are then we're being called from a context that
     * handles that for us.
     * 
     * Remember, in our data model, the faces look like this (3x3 cube):
     * 
     *         +-------+
     *         | 5 5 5 |
     *         | 5 5 5 |
     *         | 5 5 5 |
     * +-------+-------+-------+-------+
     * | 1 1 1 | 2 2 2 | 3 3 3 | 4 4 4 |
     * | 1 1 1 | 2 2 2 | 3 3 3 | 4 4 4 |
     * | 1 1 1 | 2 2 2 | 3 3 3 | 4 4 4 |
     * +-------+-------+-------+-------+
     *         | 6 6 6 |
     *         | 6 6 6 |
     *         | 6 6 6 |
     *         +-------+
     * 
     * Y-axis always means rotating 2-5-4-6 in a way that doesn't affect
     * 1-3.
     * 
     * We always rotate in a clockwise direction as if we were looking
     * at the cube while facing #3 with #5 on the top.
     */
    const [_side1, side2, _side3, side4, side5, side6] = cube;
    for (let colOff = offsetStart; colOff < offsetEnd; ++colOff) {
        for (let rowOff = 0; rowOff < cubeSize; ++rowOff) {
            const side2Ix = _i(rowOff, colOff);
            const side5Ix = side2Ix;
            const side6Ix = side2Ix;
            const side4Ix = _i(cubeSize-rowOff-1, cubeSize-colOff-1);
            for (let r = 0; r < numRotations; ++r) {
                const tmp = side2[side2Ix];
                side2[side2Ix] = side6[side6Ix];
                side6[side6Ix] = side4[side4Ix];
                side4[side4Ix] = side5[side5Ix];
                side5[side5Ix] = tmp;
            }
        }
    }

    return cube;
}

function _rotateCubeInternalSliceZ(
    cube: CubeData, 
    cubeSize: number,
    offsetStart: number, 
    offsetEnd: number,
    numRotations: RotationAmount
): CubeData {
    const _i = (r: number, c: number) => _ix(cubeSize, r, c);

    /**
     * We're assuming that this will never affect the faces of anything,
     * and if they are then we're being called from a context that
     * handles that for us.
     * 
     * Remember, in our data model, the faces look like this (3x3 cube):
     * 
     *         +-------+
     *         | 5 5 5 |
     *         | 5 5 5 |
     *         | 5 5 5 |
     * +-------+-------+-------+-------+
     * | 1 1 1 | 2 2 2 | 3 3 3 | 4 4 4 |
     * | 1 1 1 | 2 2 2 | 3 3 3 | 4 4 4 |
     * | 1 1 1 | 2 2 2 | 3 3 3 | 4 4 4 |
     * +-------+-------+-------+-------+
     *         | 6 6 6 |
     *         | 6 6 6 |
     *         | 6 6 6 |
     *         +-------+
     * 
     * Z-axis always means rotating 1-5-3-6 in a way that doesn't affect
     * 2-4.
     * 
     * We always rotate in a clockwise direction as if we were looking
     * at the cube while facing #2 with #5 on the top.
     */
    const [side1, _side2, side3, _side4, side5, side6] = cube;
    for (let colOff = offsetStart; colOff < offsetEnd; ++colOff) {
        for (let rowOff = 0; rowOff < cubeSize; ++rowOff) {
            const side1Ix = _i(rowOff, colOff);
            const side3Ix = _i(cubeSize-rowOff-1, cubeSize-colOff-1);
            const side5Ix = _i(colOff, cubeSize-rowOff-1);
            const side6Ix = _i(cubeSize-colOff-1, rowOff);
            for (let r = 0; r < numRotations; ++r) {
                const tmp = side1[side1Ix];
                side1[side1Ix] = side6[side6Ix];
                side6[side6Ix] = side3[side3Ix];
                side3[side3Ix] = side5[side5Ix];
                side5[side5Ix] = tmp;
            }
        }
    }

    return cube;
}

/**
 * Refocus and rotate the cube such that a new face is in focus (i.e. is
 * side #2)
 * @param cube The cube to be refocused
 * @param focusSideId The face that should be focused on
 * @returns The new cube layout data
 */
export function refocusCube(
    cube: DeepReadonly<CubeData>, focusSideId: CubeSide
): CubeData {
    const [newCube, size, _] = _setupManipulation(cube, 0);
    /**
     * For our purposes, 'focus' means 'become face #2'
     *         +-------+
     *         | 5 5 5 |
     *         | 5 5 5 |
     *         | 5 5 5 |
     * +-------+-------+-------+-------+
     * | 1 1 1 | 2 2 2 | 3 3 3 | 4 4 4 |
     * | 1 1 1 | 2 2 2 | 3 3 3 | 4 4 4 |
     * | 1 1 1 | 2 2 2 | 3 3 3 | 4 4 4 |
     * +-------+-------+-------+-------+
     *         | 6 6 6 |
     *         | 6 6 6 |
     *         | 6 6 6 |
     *         +-------+
     */

    const [side1, side2, side3, side4, side5, side6] = newCube;
    const xAxisCycle = [side1, side2, side3, side4];
    
    const fixFace = (face: CubeSide, numRotations: number) => {
        numRotations = _normalizeRotations(numRotations);
        _rotateCubeFace(newCube, size, face, numRotations, true);
    };

    const numPopsDict = {
        [CubeSide.Left]: [1, RotationAmount.CounterClockwise, RotationAmount.Clockwise],
        [CubeSide.Front]: [0, 0, 0],
        [CubeSide.Right]: [3, RotationAmount.Clockwise, RotationAmount.CounterClockwise],
        [CubeSide.Back]: [2, RotationAmount.Halfway, RotationAmount.HalfwayReverse],
    }

    switch (focusSideId) {
        case CubeSide.Left:
        case CubeSide.Front:
        case CubeSide.Right:
        case CubeSide.Back: {
            const [numPops, topFixRotation, bottomFixRotation] = numPopsDict[focusSideId];
            let ix = 0;
            while (ix < numPops) {
                xAxisCycle.unshift(xAxisCycle.pop()!);
                ++ix;
            }
            for (ix = 0; ix < 4; ++ix) {
                newCube[ix] = xAxisCycle[ix];
            }
            // Then make sure the orientation of the top and bottom get corrected
            fixFace(CubeSide.Top, topFixRotation);
            fixFace(CubeSide.Bottom, bottomFixRotation);
            break;
        }
        case CubeSide.Top:
            // Place the faces in the right places
            newCube[CubeSide.Front-1] = side5; // Side2 (Front)
            newCube[CubeSide.Back-1] = side6; // Side4 (Back)
            newCube[CubeSide.Top-1] = side4; // Side5 (Top)
            newCube[CubeSide.Bottom-1] = side2; // Side6 (Bottom)

            // Then fix the orientation
            fixFace(CubeSide.Left, RotationAmount.Clockwise);
            fixFace(CubeSide.Right, RotationAmount.CounterClockwise);
            fixFace(CubeSide.Back, RotationAmount.Halfway);
            fixFace(CubeSide.Top, RotationAmount.Halfway);
            break;
        case CubeSide.Bottom:
            // Place the faces in the right places
            newCube[CubeSide.Front-1] = side6; // Side2 (Front)
            newCube[CubeSide.Back-1] = side5; // Side4 (Back)
            newCube[CubeSide.Top-1] = side2; // Side5 (Top)
            newCube[CubeSide.Bottom-1] = side4; // Side6 (Bottom)

            // Then fix the orientation
            fixFace(CubeSide.Left, RotationAmount.CounterClockwise);
            fixFace(CubeSide.Right, RotationAmount.Clockwise);
            fixFace(CubeSide.Back, RotationAmount.Halfway);
            fixFace(CubeSide.Bottom, RotationAmount.Halfway);
            break;
        default:
            forceNever(focusSideId);
    }
    return newCube;
}

function _setupManipulation(
    cube: DeepReadonly<CubeData>, numRotations: number
) : [CubeData, number, RotationAmount];
function _setupManipulation(
    cube: DeepReadonly<CubeData>, size: number, numRotations: number
) : [CubeData, number, RotationAmount];
function _setupManipulation(
    cube: DeepReadonly<CubeData>, sizeOrRotations: number, numRotations?: number
) : [CubeData, number, RotationAmount] {
    const size = numRotations === undefined ? getCubeSize(cube) : sizeOrRotations;
    const numTurns = numRotations ?? sizeOrRotations;
    assertIsValidCube(cube, size);
    return [_copyCube(cube), size, _normalizeRotations(numTurns)];
}

function _copyCube(cube: DeepReadonly<CubeData>): CubeData {
    return [
        Array.from(cube[0]),
        Array.from(cube[1]),            
        Array.from(cube[2]),
        Array.from(cube[3]),            
        Array.from(cube[4]),
        Array.from(cube[5])
    ];
}

function _normalizeRotations(rotCount: number): RotationAmount {
    rotCount %= 4;
    return rotCount < 0 ? rotCount + 4 : rotCount;
}
