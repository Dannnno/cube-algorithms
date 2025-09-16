import fc from "fast-check";

export const fcAlgCubeSize = fc.constantFrom(2, 3, 4, 5, 6, 7, 8, 9);
export const fcAlgCubeFace = fc.constantFrom("F", "L", "R", "B", "U", "D");
export const fcAlgRotation = fc.constantFrom("", "2", "'");
export const fcAlgMove = fc
  .tuple(fcAlgCubeFace, fcAlgRotation)
  .map(([face, rotation]) => `${face}${rotation}`);
export const fcAlgSplitSpaces = fc
  .integer({ min: 1, max: 10 })
  .map(cnt => " ".repeat(cnt));
export const fcAlgTrailSpaces = fc.nat({ max: 10 }).map(cnt => " ".repeat(cnt));
export const fcAlgorithmSteps = fc.array(
  fc.tuple(fc.oneof(fcAlgMove), fcAlgSplitSpaces),
  { minLength: 1 },
);
export const fcAlgorithmText = fc
  .tuple(fcAlgorithmSteps, fcAlgTrailSpaces)
  .map(
    ([steps, trail]) =>
      `${steps.map(([step, space]) => `${step}${space}`).join("")}${trail}`,
  );
