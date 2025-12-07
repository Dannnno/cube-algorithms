import { KeyboardShortcut } from "@/hooks";

/**
 * Given a title and a label that may have accelerated pieces in it, get a new title
 * @param title The current title
 * @param label The label that has maybe-accelerated pieces to it
 * @returns A new title string that includes instructions
 */
export function ariaAcceleratedLabel(title: string, label: string): string {
  const titlePieces: string[] = [];
  _forEachAcceleratedPiece(label, shortcut =>
    shortcut ? titlePieces.push(shortcut) : undefined,
  );
  if (titlePieces.length && title) {
    return `${title} (${titlePieces.join(", ")})`;
  } else if (titlePieces.length) {
    return titlePieces.join(", ");
  } else {
    return title;
  }
}

export function _forEachAcceleratedPiece(
  label: string,
  callback: (acc: KeyboardShortcut | undefined, pc: string) => void,
): void {
  const pieces = label.split("&");
  let anyFound = false;
  for (const piece of pieces) {
    const l = piece[0];
    if (!l) {
      continue;
    }
    // It isn't a letter
    if (
      l.toUpperCase() === l.toLowerCase()
      || (!anyFound && !label.startsWith("&"))
    ) {
      anyFound = true;
      callback(undefined, piece);
    } else {
      anyFound = true;
      callback(`Ctrl+Alt+${l.toUpperCase()}` as KeyboardShortcut, piece);
    }
  }
}
