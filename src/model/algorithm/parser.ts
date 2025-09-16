import * as ohm from "ohm-js";

/**
 * Get a parser for the puzzle cube algorithm language
 * @returns A PEG parser that can parse puzzle cube algorithm language
 * @see https://ruwix.com/the-rubiks-cube/notation/advanced/
 */
export function _getAlgorithmParser(): ohm.Grammar {
  return ohm.grammar(String.raw`
    Algorithm {
      expression = allMoves (space+ allMoves)* space*

      allMoves = move<face>
               | move<slice>
               
      move<type> = type antiClockwise -- singleRotationAC
                 | type "2"           -- doubleRotation
                 | type               -- singleRotationCW

      face = "F" -- front
           | "U" -- up
           | "R" -- right
           | "B" -- back
           | "L" -- left
           | "D" -- down

      slice = "M" -- middle
            | "E" -- equatorial
            | "S" -- standing

      antiClockwise = "'"
    }
  `);
}
