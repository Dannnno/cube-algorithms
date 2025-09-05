import fc from "fast-check";
import { expect } from "vitest";
import { Counter, DeepReadonly, forceNever } from "../../src/common";
import { CubeActionType } from "../../src/components/cubes";
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
  refocusCube,
  rotateCube,
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

export function getTestCube(
  size: number,
  mutate: boolean = false,
): DeepReadonly<CubeData> {
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
          rcf(rcf(size > 2 ? rcs(rcs(rcs(cube, "X"), "Y"), "Z") : cube, 1), 2),
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
    // Don't allow a direction + face + axis combination that doesn't make sense
    switch (face) {
      case CubeSide.Front:
      case CubeSide.Back:
        switch (axis) {
          case "X":
            return this._isHorizontal(direction);
          case "Y":
            return this._isVertical(direction);
          case "Z":
            return false;
        }
      case CubeSide.Left:
      case CubeSide.Right:
        switch (axis) {
          case "X":
            return this._isHorizontal(direction);
          case "Y":
            return false;
          case "Z":
            return this._isVertical(direction);
        }
      case CubeSide.Top:
      case CubeSide.Bottom:
        switch (axis) {
          case "X":
            return false;
          case "Y":
            return this._isVertical(direction);
          case "Z":
            return this._isHorizontal(direction);
        }
    }
  }

  protected _isHorizontal(direction: SliceDirection): boolean {
    return (
      direction === SliceDirection.Left || direction === SliceDirection.Right
    );
  }

  protected _isVertical(direction: SliceDirection): boolean {
    return !this._isHorizontal(direction);
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
    let perpendicular: [CubeSide, CubeSide];
    switch (this.axis) {
      case "X":
        perpendicular = [CubeSide.Top, CubeSide.Bottom];
        break;
      case "Y":
        perpendicular = [CubeSide.Left, CubeSide.Right];
        break;
      case "Z":
        perpendicular = [CubeSide.Front, CubeSide.Back];
        break;
      default:
        forceNever(this.axis);
    }

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
export const fcCubeAxes = fc.constantFrom("X", "Y", "Z");
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
  fcRotateSliceFromFaceCommand,
  fcFocusCubeFaceCommand,
  fcRotateWholeCubeCommand,
  fcRotateWholeCubeFromFaceCommand,
];
