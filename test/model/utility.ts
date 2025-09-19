import fc from "fast-check";
import { expect } from "vitest";
import {
  Counter,
  DeepReadonly,
  forceNever,
  isBoundedInteger,
} from "../../src/common";
import {
  CubeActionType,
  CubeActions,
  puzzleReducer,
} from "../../src/components/cubes";
import { interpretAlgorithm } from "../../src/model/algorithm";
import {
  CubeAxis,
  CubeData,
  CubeSide,
  CubeSideData,
  SliceDirection,
  assertIsValidCube,
  getCubeSize,
} from "../../src/model/cube";
import {
  RotationAmount,
  directionIsValidForFaceAndAxis,
  getPerpendicularFaces,
  refocusCube,
  rotateCube,
  rotateCubeDeepTurn,
  rotateCubeFace,
  rotateCubeFromFace,
  rotateCubeInternalSlice,
  rotateCubeSliceFromFace,
} from "../../src/model/geometry";

export function checkCube(
  actualCube: DeepReadonly<CubeData>,
  expectedCube: DeepReadonly<CubeData>,
): void {
  const actualSize = getCubeSize(actualCube);
  expect(actualSize, "Cube Size").toBe(getCubeSize(expectedCube));

  for (let sideId = 1; sideId <= 6; ++sideId) {
    checkCubeSide(
      actualSize,
      sideId as CubeSide,
      actualCube[sideId - 1],
      expectedCube[sideId - 1],
    );
  }
  expect(actualCube, `Full Cube`).toStrictEqual(expectedCube);
}

function checkCubeSide(
  size: number,
  side: CubeSide,
  actualSide: DeepReadonly<CubeSideData>,
  expectedSide: DeepReadonly<CubeSideData>,
): void {
  expect(actualSide.length, `${side}: Length should be correct`).toBe(
    expectedSide.length,
  );

  for (let row = 0; row < size; ++row) {
    for (let col = 0; col < size; ++col) {
      expect(actualSide[row * size + col], `(${side}, ${row}, ${col})`).toBe(
        expectedSide[row * size + col],
      );
    }
  }

  expect(actualSide, `Full Side ${side}`).toStrictEqual(expectedSide);
}

export function getTestCube(size: number, mutate: boolean = false): CubeData {
  const length = size * size;
  const cube = [
    Array.from({ length }, _ => 1),
    Array.from({ length }, _ => 2),
    Array.from({ length }, _ => 3),
    Array.from({ length }, _ => 4),
    Array.from({ length }, _ => 5),
    Array.from({ length }, _ => 6),
  ];

  if (!mutate) {
    return cube;
  }

  const rcf = (cubeData: DeepReadonly<CubeData>, sideId: CubeSide) =>
    rotateCubeFace(cubeData, sideId, 1);
  const rcs = (cube: DeepReadonly<CubeData>, axis: CubeAxis) =>
    rotateCubeInternalSlice(cube, axis, 1, size - 2, 1);

  return rcf(
    rcf(
      rcf(
        rcf(
          rcf(
            rcf(
              size > 2
                ? rcs(
                    rcs(rcs(cube, CubeAxis.Equatorial), CubeAxis.Middle),
                    CubeAxis.Standing,
                  )
                : cube,
              1,
            ),
            2,
          ),
          3,
        ),
        4,
      ),
      5,
    ),
    6,
  );
}

/**
 * A test case that can be used with it.each with a descriptive name
 */
export interface INamedTestCase {
  /** The name of the test */
  readonly name: string;
}

/**
 * Callback that can be used to get the display name of a test case
 */
export type GetTestCaseDisplayName<T> = (testCase: T) => string;

/**
 * Given a set of test cases, get their descriptive names
 * @param cases The name-less test cases
 * @param getter How to get test case names
 * @returns The test cases with names
 */
export function getAllTestCases<T>(
  cases: readonly T[],
  getter: GetTestCaseDisplayName<T>,
): (T & INamedTestCase)[] {
  return cases.map(testCase => ({
    ...testCase,
    name: getter(testCase),
  }));
}

/**
 * Get a descriptive name of the face/side
 * @param side The side to get the name of
 * @returns The name of the side
 */
export function nameSide(side: CubeSide): string {
  switch (side) {
    case CubeSide.Front:
      return "front";
    case CubeSide.Back:
      return "back";
    case CubeSide.Left:
      return "left";
    case CubeSide.Right:
      return "right";
    case CubeSide.Top:
      return "top";
    case CubeSide.Bottom:
      return "bottom";
    default:
      forceNever(side);
  }
}

/**
 * Given an amount of rotation, rename it to be in degrees and human readable
 * @param rotation The amount of the rotation
 * @returns The descriptive name of the rotation amount
 */
export function nameRotationAmount(rotation: RotationAmount | number): string {
  switch (rotation) {
    case RotationAmount.None:
      return "0° ↻";
    case RotationAmount.Clockwise:
      return "90° ↻";
    case RotationAmount.CounterClockwise:
      return "270° ↻";
    case RotationAmount.Halfway:
      return "180° ↻";
    default:
      return `${90 * rotation}° ↻ (${(90 * rotation) % 360}° ↻)`;
  }
}

/**
 * Given a direction, return an equivalent string that describes it
 * @param direction The direction being sliced in
 * @returns The descriptive name of the direction
 */
export function nameDirection(direction: SliceDirection): string {
  switch (direction) {
    case SliceDirection.Up:
      return "↑";
    case SliceDirection.Down:
      return "↓";
    case SliceDirection.Left:
      return "←";
    case SliceDirection.Right:
      return "→";
    default:
      forceNever(direction);
  }
}

type PuzzleCubeModel = {
  cubeSize: number;
  commandList: CubeActionType[];
};

abstract class PuzzleCubeCommand<T extends CubeActionType>
  implements fc.Command<PuzzleCubeModel, CubeData>
{
  public action: T;
  protected constructor(actionType: T) {
    this.action = actionType;
  }

  public toString(): string {
    return this.action;
  }

  public check(_m: Readonly<PuzzleCubeModel>): boolean {
    return true;
  }

  public run(m: PuzzleCubeModel, r: CubeData): void {
    // Save off a copy so we know the APIs don't mutate the cube
    const deepCopy = r.map(side => Array.from(side));

    // The cube should be valid before we mutate it
    assertIsValidCube(r, m.cubeSize);

    const newCube = this.mutateCube(r);

    // The original array should be unchanged after mutation
    checkCube(r, deepCopy);

    // The cube should be valid after mutation
    assertIsValidCube(newCube, m.cubeSize);

    this.extraCheck(m, deepCopy, newCube);

    // Then make sure we're passing the mutated cube along
    for (let i = 0; i < 6; ++i) {
      r[i] = Array.from(newCube[i]);
    }

    m.commandList.push(this.action);
  }

  protected extraCheck(
    _model: DeepReadonly<PuzzleCubeModel>,
    _originalCube: DeepReadonly<CubeData>,
    _newCube: DeepReadonly<CubeData>,
  ): void {}

  protected abstract mutateCube(r: DeepReadonly<CubeData>): CubeData;

  protected sliceIsValid(
    model: Readonly<PuzzleCubeModel>,
    sliceStart: number,
    sliceSize: number,
  ): boolean {
    const size = model.cubeSize;
    // Don't allow slicing the faces
    if (sliceStart < 1 || sliceStart >= size - 1) {
      return false;
    }

    // Don't allow too many slices
    if (sliceSize < 1 || sliceStart + sliceSize > size - 1) {
      return false;
    }

    return true;
  }

  protected axisAndDirectionAreValidTogether(
    face: CubeSide,
    axis: CubeAxis,
    direction: SliceDirection,
  ): boolean {
    return directionIsValidForFaceAndAxis(face, axis, direction);
  }

  protected _checkSide(
    size: number,
    side: CubeSide,
    actual: DeepReadonly<CubeData>,
    expected: DeepReadonly<CubeData>,
  ): void {
    checkCubeSide(size, side, actual[side - 1], expected[side - 1]);
  }

  protected _checkSameValueDistribution(
    originalCube: DeepReadonly<CubeData>,
    newCube: DeepReadonly<CubeData>,
  ): void {
    // For some commands each side should still exist somewhere on the cube. It is
    // probably not on the side it used to be on, and the actual cells are probably
    // rotated from their original positions, but the distribution of values should
    // be the same

    const originalCounters = originalCube.map(
      cubeSide => new Counter(cubeSide),
    );
    const newCounters = newCube.map(cubeSide => new Counter(cubeSide));

    for (const oldCounter of originalCounters) {
      expect(newCounters.some(counter => counter.compare(oldCounter)));
    }
    for (const newCounter of newCounters) {
      expect(originalCounters.some(counter => counter.compare(newCounter)));
    }
  }
}

class RotateFaceCommand extends PuzzleCubeCommand<CubeActionType.RotateFace> {
  public side: CubeSide;
  public rotationCount: number;

  public constructor(side: CubeSide, rotationCount: number) {
    super(CubeActionType.RotateFace);
    this.side = side;
    this.rotationCount = rotationCount;
  }

  protected override mutateCube(r: CubeData) {
    return rotateCubeFace(r, this.side, this.rotationCount);
  }

  protected override extraCheck(
    model: DeepReadonly<PuzzleCubeModel>,
    originalCube: DeepReadonly<CubeData>,
    newCube: DeepReadonly<CubeData>,
  ): void {
    // When you rotate a given face it should never touch the face on the opposite side
    const size = model.cubeSize;
    let opposite: CubeSide;
    switch (this.side) {
      case CubeSide.Front:
        opposite = CubeSide.Back;
        break;
      case CubeSide.Back:
        opposite = CubeSide.Front;
        break;
      case CubeSide.Left:
        opposite = CubeSide.Right;
        break;
      case CubeSide.Right:
        opposite = CubeSide.Left;
        break;
      case CubeSide.Top:
        opposite = CubeSide.Bottom;
        break;
      case CubeSide.Bottom:
        opposite = CubeSide.Top;
        break;
      default:
        forceNever(this.side);
    }
    this._checkSide(size, opposite, newCube, originalCube);
  }
}

class RotateFaceDeepCommand extends PuzzleCubeCommand<CubeActionType.RotateFaceDeepTurn> {
  public side: CubeSide;
  public rotationCount: number;
  public depth: number;

  public constructor(side: CubeSide, rotationCount: number, depth: number) {
    super(CubeActionType.RotateFaceDeepTurn);
    this.side = side;
    this.rotationCount = rotationCount;
    this.depth = depth;
  }

  public override check(m: Readonly<PuzzleCubeModel>): boolean {
    return m.cubeSize > 2 && isBoundedInteger(this.depth, 2, m.cubeSize - 2);
  }

  protected override mutateCube(r: CubeData) {
    return rotateCubeDeepTurn(r, this.side, this.depth, this.rotationCount);
  }

  protected override extraCheck(
    model: DeepReadonly<PuzzleCubeModel>,
    originalCube: DeepReadonly<CubeData>,
    newCube: DeepReadonly<CubeData>,
  ): void {
    // When you rotate a given face it should never touch the face on the opposite side
    const size = model.cubeSize;
    let opposite: CubeSide;
    switch (this.side) {
      case CubeSide.Front:
        opposite = CubeSide.Back;
        break;
      case CubeSide.Back:
        opposite = CubeSide.Front;
        break;
      case CubeSide.Left:
        opposite = CubeSide.Right;
        break;
      case CubeSide.Right:
        opposite = CubeSide.Left;
        break;
      case CubeSide.Top:
        opposite = CubeSide.Bottom;
        break;
      case CubeSide.Bottom:
        opposite = CubeSide.Top;
        break;
      default:
        forceNever(this.side);
    }
    this._checkSide(size, opposite, newCube, originalCube);
  }
}

class RotateSliceFromFaceCommand extends PuzzleCubeCommand<CubeActionType.RotateSlice> {
  public faceRef: CubeSide;
  public axis: CubeAxis;
  public offsetStart: number;
  public numSlices: number;
  public direction: SliceDirection;
  public numRotations: number;

  public constructor(
    faceRef: CubeSide,
    axis: CubeAxis,
    offsetStart: number,
    numSlices: number,
    direction: SliceDirection,
    numRotations: number,
  ) {
    super(CubeActionType.RotateSlice);
    this.faceRef = faceRef;
    this.axis = axis;
    this.offsetStart = offsetStart;
    this.numSlices = numSlices;
    this.direction = direction;
    this.numRotations = numRotations;
  }

  public override check(m: Readonly<PuzzleCubeModel>): boolean {
    return (
      m.cubeSize > 2
      && this.sliceIsValid(m, this.offsetStart, this.numSlices)
      && this.axisAndDirectionAreValidTogether(
        this.faceRef,
        this.axis,
        this.direction,
      )
    );
  }

  protected override mutateCube(r: CubeData) {
    return rotateCubeSliceFromFace(
      r,
      this.faceRef,
      this.axis,
      this.offsetStart,
      this.numSlices,
      this.direction,
      this.numRotations,
    );
  }

  protected override extraCheck(
    model: DeepReadonly<PuzzleCubeModel>,
    originalCube: DeepReadonly<CubeData>,
    newCube: DeepReadonly<CubeData>,
  ): void {
    // When you rotate a given slice it should never touch the perpendicular faces
    const size = model.cubeSize;
    const perpendicular = getPerpendicularFaces(this.axis);

    for (const side of perpendicular) {
      this._checkSide(size, side, newCube, originalCube);
    }
  }
}

class FocusCubeFaceCommand extends PuzzleCubeCommand<CubeActionType.FocusCube> {
  readonly focusFace: CubeSide;
  public constructor(focusFace: CubeSide) {
    super(CubeActionType.FocusCube);
    this.focusFace = focusFace;
  }

  protected override mutateCube(r: CubeData) {
    return refocusCube(r, this.focusFace);
  }

  protected override extraCheck(
    _model: DeepReadonly<PuzzleCubeModel>,
    originalCube: DeepReadonly<CubeData>,
    newCube: DeepReadonly<CubeData>,
  ): void {
    return this._checkSameValueDistribution(originalCube, newCube);
  }
}

class RotateWholeCubeCommand extends PuzzleCubeCommand<CubeActionType.RotateCube> {
  readonly axis: CubeAxis;
  readonly rotationCount: number;
  public constructor(axis: CubeAxis, rotationCount: number) {
    super(CubeActionType.RotateCube);
    this.axis = axis;
    this.rotationCount = rotationCount;
  }

  protected override mutateCube(r: CubeData) {
    return rotateCube(r, this.axis, this.rotationCount);
  }

  protected override extraCheck(
    _model: DeepReadonly<PuzzleCubeModel>,
    originalCube: DeepReadonly<CubeData>,
    newCube: DeepReadonly<CubeData>,
  ): void {
    return this._checkSameValueDistribution(originalCube, newCube);
  }
}

class RotateWholeCubeFromFaceCommand extends PuzzleCubeCommand<CubeActionType.RotateCubeFromFace> {
  readonly faceRef: CubeSide;
  readonly rotationCount: number;
  readonly direction: SliceDirection;

  public constructor(
    faceRef: CubeSide,
    rotationCount: number,
    direction: SliceDirection,
  ) {
    super(CubeActionType.RotateCubeFromFace);

    this.faceRef = faceRef;
    this.rotationCount = rotationCount;
    this.direction = direction;
  }

  protected override mutateCube(r: DeepReadonly<CubeData>) {
    return rotateCubeFromFace(
      r,
      this.faceRef,
      this.direction,
      this.rotationCount,
    );
  }

  protected override extraCheck(
    _model: DeepReadonly<PuzzleCubeModel>,
    originalCube: DeepReadonly<CubeData>,
    newCube: DeepReadonly<CubeData>,
  ): void {
    return this._checkSameValueDistribution(originalCube, newCube);
  }
}

export const fcCubeSizes = fc.integer({ min: 2, max: 9 });
export const fcCubeSides = fc.constantFrom(
  CubeSide.Front,
  CubeSide.Back,
  CubeSide.Left,
  CubeSide.Right,
  CubeSide.Bottom,
  CubeSide.Top,
);
export const fcCubeAxes = fc.constantFrom(
  CubeAxis.Equatorial,
  CubeAxis.Middle,
  CubeAxis.Standing,
);
export const fcCubeDirections = fc.constantFrom(
  SliceDirection.Down,
  SliceDirection.Up,
  SliceDirection.Right,
  SliceDirection.Left,
);
export const fcSliceStarts = fc.nat().filter(v => v > 0);
export const fcSliceSizes = fc.nat().filter(v => v > 0);
export const fcRotationCounts = fc.integer();
export const fcCube = (gen: fc.GeneratorValue): DeepReadonly<CubeData> => {
  const cubeSize = gen(fc.integer, { min: 2, max: 9 });
  const sq = cubeSize ** 2;
  const cubeValues = [
    ...Array.from({ length: sq }, _ => CubeSide.Left),
    ...Array.from({ length: sq }, _ => CubeSide.Front),
    ...Array.from({ length: sq }, _ => CubeSide.Right),
    ...Array.from({ length: sq }, _ => CubeSide.Back),
    ...Array.from({ length: sq }, _ => CubeSide.Top),
    ...Array.from({ length: sq }, _ => CubeSide.Bottom),
  ];
  const shuffled = gen(
    fc.shuffledSubarray(cubeValues, { minLength: cubeValues.length }).filter,
    _ => true,
  );
  const shuffledCube = [
    shuffled.slice(0 * sq, 1 * sq),
    shuffled.slice(1 * sq, 2 * sq),
    shuffled.slice(2 * sq, 3 * sq),
    shuffled.slice(3 * sq, 4 * sq),
    shuffled.slice(4 * sq, 5 * sq),
    shuffled.slice(5 * sq, 6 * sq),
  ];
  return shuffledCube;
};

export const fcRotateFaceCommand = fc
  .tuple(fcCubeSides, fcRotationCounts)
  .map(([side, cnt]) => new RotateFaceCommand(side, cnt));
export const fcRotateFaceDeepCommand = fc
  .tuple(fcCubeSides, fcRotationCounts, fcSliceSizes)
  .map(([side, cnt, depth]) => new RotateFaceDeepCommand(side, depth, cnt));
export const fcRotateSliceFromFaceCommand = fc
  .tuple(
    fcCubeSides,
    fcCubeAxes,
    fcSliceStarts,
    fcSliceSizes,
    fcCubeDirections,
    fcRotationCounts,
  )
  .map(
    ([faceRef, axis, offsetStart, numSlices, direction, numRotations]) =>
      new RotateSliceFromFaceCommand(
        faceRef,
        axis,
        offsetStart,
        numSlices,
        direction,
        numRotations,
      ),
  );
export const fcFocusCubeFaceCommand = fcCubeSides.map(
  side => new FocusCubeFaceCommand(side),
);
export const fcRotateWholeCubeCommand = fc
  .tuple(fcCubeAxes, fcRotationCounts)
  .map(
    ([axis, rotationCount]) => new RotateWholeCubeCommand(axis, rotationCount),
  );
export const fcRotateWholeCubeFromFaceCommand = fc
  .tuple(fcCubeSides, fcRotationCounts, fcCubeDirections)
  .map(
    ([side, rotationCounts, direction]) =>
      new RotateWholeCubeFromFaceCommand(side, rotationCounts, direction),
  );
export const CubeCommands = [
  fcRotateFaceCommand,
  fcRotateFaceDeepCommand,
  fcRotateSliceFromFaceCommand,
  fcFocusCubeFaceCommand,
  fcRotateWholeCubeCommand,
  fcRotateWholeCubeFromFaceCommand,
];

/**
 * Check that two sequences of actions are equivalent
 * @param cubeSize The size of cube being worked with
 * @param commands The commands to randomize initial cube state
 * @param actualActions The actual actions to perform (may require parsing)
 * @param expectedActions The actions we expect to be performed
 * @param check Callback if we need to do anything extra on the cubes
 */
export function fcCompareActionWithActual(
  cubeSize: number,
  commands: Iterable<fc.Command<PuzzleCubeModel, CubeData>>,
  actualActions: string | readonly CubeActions[],
  expectedActions: readonly CubeActions[],
  check?: (
    actualCube: DeepReadonly<CubeData>,
    expectedCube: DeepReadonly<CubeData>,
  ) => void,
): void {
  const baseCube = getTestCube(cubeSize);
  const s = () => ({
    model: { cubeSize, commandList: [] },
    real: baseCube,
  });
  fc.modelRun(s, commands);

  const actualToRun: CubeActions[] = [];
  if (typeof actualActions === "string") {
    const { isValid, invalidSteps, steps } = interpretAlgorithm(
      actualActions,
      cubeSize,
    );
    expect(isValid).toBeTruthy();
    expect(invalidSteps).toStrictEqual([]);
    actualToRun.push(...steps);
  } else {
    actualToRun.push(...actualActions);
  }
  checkAllActionInvariants(actualToRun);
  checkAllActionInvariants(expectedActions);

  const actualCube = runActionsOnCube(
    Array.from(baseCube, (v: CubeSideData) => Array.from(v)),
    actualToRun,
  );
  const expectedCube = runActionsOnCube(
    Array.from(baseCube, (v: CubeSideData) => Array.from(v)),
    expectedActions,
  );

  checkCube(actualCube, expectedCube);
  check?.(actualCube, expectedCube);
}

/**
 * Run a series of actions on a cube
 * @param cube The starting cube state
 * @param actions The actions to apply to the cube
 * @returns The modified cube state
 */
export function runActionsOnCube(
  cube: CubeData,
  actions: readonly CubeActions[],
): CubeData {
  for (const action of actions) {
    cube = puzzleReducer(cube, action);
  }
  return cube;
}

export function checkAllActionInvariants(
  actions: readonly CubeActions[],
): void {
  actions.forEach(checkActionInvariants);
}

export function checkActionInvariants(action: CubeActions): void {
  switch (action.type) {
    case CubeActionType.RotateFace:
      expectSideId(action.sideId, `RotateFace`);
      break;
    case CubeActionType.RotateFaceDeepTurn:
      expectSideId(action.sideId, `RotateFace`);
      expectOffsets(1, action.depth, `RotateFaceDeepTurn`);
      break;
    case CubeActionType.RotateSlice:
      expectAxis(action.axis, `RotateSlice`);
      expectSideId(action.refSide, `RotateSlice`);
      expectOffsets(
        action.offsetIndex,
        action.offsetSize,
        `RotateSlice`,
        undefined,
      );
      break;
    case CubeActionType.ResetCube:
      break;
    case CubeActionType.FocusCube:
      expectSideId(action.focusFace, `FocusCube`);
      break;
    case CubeActionType.ResizeCube:
      break;
    case CubeActionType.RotateCube:
      expectAxis(action.axis, `RotateCube`);
      break;
    case CubeActionType.RotateCubeFromFace:
      expectSideId(action.faceRef, `RotateCubeFromFace`);
      expectDirection(action.direction, `RotateCubeFromFace`);
      break;
    default:
      forceNever(action);
  }
}

export function expectSideId(sideId: CubeSide, label: string): void {
  expect(sideId, `${label}.sideId`).toBeOneOf([
    CubeSide.Front,
    CubeSide.Top,
    CubeSide.Right,
    CubeSide.Back,
    CubeSide.Left,
    CubeSide.Bottom,
  ]);
}

export function expectAxis(axis: CubeAxis, label: string): void {
  expect(axis, `${label}.axis`).toBeOneOf([
    CubeAxis.Equatorial,
    CubeAxis.Middle,
    CubeAxis.Standing,
  ]);
}

export function expectDirection(
  direction: SliceDirection,
  label: string,
): void {
  expect(direction, `${label}.direction`).toBeOneOf([
    SliceDirection.Up,
    SliceDirection.Down,
    SliceDirection.Left,
    SliceDirection.Right,
  ]);
}

export function expectOffsets(
  start: number | undefined,
  size: number | undefined,
  label: string,
  cubeSize?: number,
): void {
  if (start === undefined) {
    expect(size, `${label}.offsetSize`).toBeUndefined();
  } else {
    expect(start, `${label}.offsetStart`).toBeGreaterThanOrEqual(1);
    if (cubeSize) {
      expect(start, `${label}.offsetStart`).toBeLessThanOrEqual(cubeSize - 2);
    } else {
      expect(start, `${label}.offsetStart`).toBeLessThanOrEqual(8);
    }

    if (size !== undefined) {
      expect(size, `${label}.offsetSize`).toBeGreaterThanOrEqual(1);
      if (cubeSize) {
        expect(size, `${label}.offsetSize`).toBeLessThanOrEqual(cubeSize - 2);
      } else {
        expect(size, `${label}.offsetSize`).toBeLessThanOrEqual(7);
      }
    }
  }
}

export function flattenAlgorithmParts(
  parts: readonly (string | readonly string[])[],
): string {
  const flatParts: string[] = [];
  for (const part of parts) {
    if (Array.isArray(part)) {
      flatParts.push(...part);
    } else {
      flatParts.push(part as string);
    }
  }
  return flatParts.join("");
}
