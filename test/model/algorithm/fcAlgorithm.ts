import fc from "fast-check";

export const fcAlgCubeSize = fc.constantFrom(2, 3, 4, 5, 6, 7, 8, 9);

export const fcAlgCubeFace = fc
  .constantFrom("F", "L", "R", "B", "U", "D")
  .map(step => ({ step, minSize: 2 }));

export const fcAlgDeepTurnFace = fc
  .constantFrom("f", "l", "r", "b", "u", "d")
  .map(step => ({ step, minSize: 3 }));

export const fcAlgDeepTurnJapanese = fcAlgCubeFace.map(
  ({ step }) => ({ minSize: 3, step: `${step}w` }) as const,
);

const fcAlgSubscriptBase = fc.constantFrom(
  { sub: 2, minSize: 3 },
  { sub: 3, minSize: 4 },
  { sub: 4, minSize: 5 },
  { sub: 5, minSize: 6 },
);
export const fcAlgSubscriptLaTeX = fcAlgSubscriptBase.map(
  ({ sub, minSize }) => ({ sub: `_${sub}`, minSize }),
);
export const fcAlgSubscriptUnicode = fcAlgSubscriptBase.map(
  ({ sub, minSize }) => ({ sub: String.fromCodePoint(8320 + sub), minSize }), // \u2080 === 8320 in base10
);
export const fcAlgSubscript = fc.oneof(
  fcAlgSubscriptLaTeX,
  fcAlgSubscriptUnicode,
);

export const fcAlgDeepTurnBigCube = fc
  .tuple(fcAlgCubeFace, fcAlgSubscript)
  .map(([{ step }, { sub, minSize }]) => ({ step: `${step}${sub}`, minSize }));

export const fcAlgDeepTurnJapaneseBigCube = fc
  .tuple(
    fcAlgDeepTurnJapanese,
    fc.constantFrom(
      { sub: 3, minSize: 4 },
      { sub: 4, minSize: 5 },
      { sub: 5, minSize: 6 },
    ),
  )
  .map(([{ step }, { sub, minSize }]) => ({
    step: `${sub}${step}`,
    minSize,
  }));

export const fcAlgCubeSlice = fc
  .constantFrom("M", "E", "S")
  .map(step => ({ step, minSize: 3 }));

export const fcAlgWholeCube = fc
  .constantFrom("X", "Y", "Z", "x", "y", "z")
  .map(step => ({ step, minSize: 2 }));

export const fcAlgRotation = fc.constantFrom("", "2", "'");

export const fcAlgMove = fc
  .tuple(
    fc.oneof(
      fcAlgCubeFace,
      fcAlgCubeSlice,
      fcAlgWholeCube,
      fcAlgDeepTurnFace,
      fcAlgDeepTurnJapanese,
      fcAlgDeepTurnBigCube,
      fcAlgDeepTurnJapaneseBigCube,
    ),
    fcAlgRotation,
  )
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
