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

      allMoves = move<deepTurnAny>
               | move<face>
               | move<slice>
               | move<wholeCube>
               
      move<type> = type antiClockwise -- singleRotationAC
                 | type "2"           -- doubleRotation
                 | type               -- singleRotationCW

      deepTurnAny = deepTurnPrefix
                  | deepTurnJapanese
                  | deepTurnSub
                  | deepTurnFace

      deepTurnPrefix = prefix deepTurnJapanese

      deepTurnJapanese = face "w"

      deepTurnSub = face subscript

      deepTurnFace = "f" -- front
                   | "u" -- up
                   | "r" -- right
                   | "b" -- back
                   | "l" -- left
                   | "d" -- down

      face = "F" -- front
           | "U" -- up
           | "R" -- right
           | "B" -- back
           | "L" -- left
           | "D" -- down

      slice = "M" -- middle
            | "E" -- equatorial
            | "S" -- standing

      wholeCube = caseInsensitive<"X"> -- cubeOnR
                | caseInsensitive<"Y"> -- cubeOnU
                | caseInsensitive<"Z"> -- cubeOnF

      antiClockwise = "'"

      subscript = "_" "2".."5"           -- latex
                | "\u{2082}".."\u{2085}" -- unicode

      prefix = "3".."5"                
    }
  `);
}
