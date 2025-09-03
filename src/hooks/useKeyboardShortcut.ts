import { assert, typeSafeSplit } from "@/common";
import { useCallback, useEffect, useMemo, useState } from "react";

// prettier-ignore
export type Letters = "A"  | "B"  | "C"  | "D"  | "E"  | "F"  | "G"  | "H" 
             | "I"  | "J"  | "K"  | "L"  | "M"  | "N"  | "O"  | "P"  
             | "Q"  | "R"  | "S"  | "T"  | "U"  | "V"  | "W"  | "X"  
             | "Y"  | "Z";
export type Numbers = `${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`;
export type AlphaKey = Uppercase<Letters>;
export type ArrowKey = "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown";
export type KeyPress = AlphaKey | ArrowKey | Numbers;
/** A keyboard shortcut key combination */
export type KeyboardShortcut =
  | `Ctrl+Alt+${KeyPress}`
  | `Ctrl+Alt+${KeyPress}+${KeyPress}`
  | `Ctrl+Alt+${KeyPress}+${KeyPress}+${KeyPress}`;

/**
 * Register a keyboard shortcut
 * @param shortcut The keyboard shortcut to use
 * @param callback What to do when that shortcut is pressed
 */
export function useKeyboardShortcut(
  shortcut: KeyboardShortcut | undefined,
  callback: (target: HTMLElement) => void,
): void {
  const [hasCtrl, hasAlt, hasShift, letter1, letter2, letter3] = useMemo(() => {
    if (!shortcut) {
      return [false, false, false, "A", undefined];
    }
    const pieces = typeSafeSplit(shortcut, "+");
    let hasCtrl = false;
    let hasAlt = false;
    let hasShift = false;
    let letter1: KeyPress | undefined;
    let letter2: KeyPress | undefined;
    let letter3: KeyPress | undefined;
    for (const pc of pieces) {
      switch (pc) {
        case "Ctrl":
          assert(!hasCtrl);
          hasCtrl = true;
          break;
        case "Alt":
          assert(!hasAlt);
          hasAlt = true;
          break;
        default:
          assert(!letter3);
          if (letter2) {
            letter3 = pc;
          } else if (letter1) {
            letter2 = pc;
          } else {
            letter1 = pc;
          }
          break;
      }
    }
    assert(letter1);

    return [hasCtrl, hasAlt, hasShift, letter1, letter2, letter3];
  }, [shortcut]);
  const [letter1WasPressed, setLetter1WasPressed] = useState(false);
  const [letter2WasPressed, setLetter2WasPressed] = useState(false);
  const [letter3WasPressed, setLetter3WasPressed] = useState(false);
  const [target, setTarget] = useState<HTMLElement | null>(null);

  const wasKeyPressed = useCallback(
    (event: KeyboardEvent) => {
      if (
        shortcut
        && (!hasCtrl || event.ctrlKey)
        && (!hasAlt || event.altKey)
        && (!hasShift || event.shiftKey)
      ) {
        const keyLetter = event.key.toLowerCase();
        for (const [opt, flags, setter] of [
          [
            letter3,
            letter1WasPressed && letter2WasPressed,
            setLetter3WasPressed,
          ],
          [letter2, letter1WasPressed, setLetter2WasPressed],
          [letter1, true, setLetter1WasPressed],
        ] as const) {
          if (keyLetter !== opt?.toLowerCase()) {
            continue;
          }
          if (!flags) {
            continue;
          }
          setter(true);
          setTarget(event.target as HTMLElement);
          event.stopPropagation();
          return;
        }
        setLetter1WasPressed(false);
        setLetter2WasPressed(false);
        setLetter3WasPressed(false);
        setTarget(null);
        return;
      }
    },
    [
      hasCtrl,
      hasAlt,
      hasShift,
      letter1,
      letter2,
      letter3,
      letter1WasPressed,
      letter2WasPressed,
      shortcut,
    ],
  );

  useEffect(() => {
    if (
      target
      && !!letter1 === !!letter1WasPressed
      && !!letter2 === !!letter2WasPressed
      && !!letter3 === !!letter3WasPressed
    ) {
      callback(target);
      setLetter1WasPressed(false);
      setLetter2WasPressed(false);
      setLetter3WasPressed(false);
      setTarget(null);
    }
  }, [
    target,
    letter1,
    letter1WasPressed,
    letter2,
    letter2WasPressed,
    letter3,
    letter3WasPressed,
  ]);

  useEffect(() => {
    if (shortcut) {
      document.addEventListener("keydown", wasKeyPressed, false);
      return () => document.removeEventListener("keydown", wasKeyPressed);
    }
  }, [wasKeyPressed, shortcut]);
}
