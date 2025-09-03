import { useCallback } from "react";

/**
 * Get a callback that can safely 'click' an element when the enter key
 * or spacebar is pressed.
 * @param callback What to do when clicked by keyboard
 * @returns The callback to attach to the keydown event
 */
export function useKeyboardClickable(
  callback: () => void,
): (event: React.KeyboardEvent) => void {
  return useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case "Enter":
        case " ":
        case "Spacebar":
          event.preventDefault();
          callback();
          return;
      }
    },
    [callback],
  );
}
