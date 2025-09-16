import fc from "fast-check";

export const fcAlgCubeSize = fc.constantFrom(2, 3, 4, 5, 6, 7, 8, 9);
export const fcAlgCubeFace = fc
  .constantFrom("F", "L", "R", "B", "U", "D")
  .map(step => ({ step, minSize: 2 }));
export const fcAlgCubeSlice = fc
  .constantFrom("M", "E", "S")
  .map(step => ({ step, minSize: 3 }));
export const fcAlgWholeCube = fc
  .constantFrom("X", "Y", "Z")
  .map(step => ({ step, minSize: 2 }));
export const fcAlgRotation = fc.constantFrom("", "2", "'");
export const fcAlgMove = fc
  .tuple(fc.oneof(fcAlgCubeFace, fcAlgCubeSlice, fcAlgWholeCube), fcAlgRotation)
  .map(([{ step, minSize }, rotation]) => ({
    step: `${step}${rotation}`,
    minSize,
  }));
export const fcAlgSplitSpaces = fc
  .integer({ min: 1, max: 10 })
  .map(cnt => " ".repeat(cnt));
export const fcAlgTrailSpaces = fc.nat({ max: 10 }).map(cnt => " ".repeat(cnt));
export const fcAlgorithmSteps = fc.array(
  fc.tuple(fcAlgMove, fcAlgSplitSpaces),
  { minLength: 1 },
);
export const fcAlgorithmText = fc
  .tuple(fcAlgorithmSteps, fcAlgTrailSpaces)
  .map(([steps, trail]) => {
    const actualSteps: string[] = [];
    const minSizes: number[] = [];
    for (const [{ step, minSize }, space] of steps) {
      actualSteps.push(`${step}${space}`);
      minSizes.push(minSize);
    }
    return {
      algorithm: `${actualSteps.join("")}${trail}`,
      minSizes,
    };
  });
