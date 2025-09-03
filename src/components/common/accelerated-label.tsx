import { KeyboardShortcut } from "@/hooks";
import React from "react";
import { accLabel, u } from "./accelerated-label.module.scss";

interface IAcceleratedLabelProps {
  /** The label that has an accelerator in it */
  readonly label: string;
}

/** Component that renders a label with text accelerators appropriately underlined */
export const AcceleratedLabel: React.FC<IAcceleratedLabelProps> = props => {
  const label = props.label;
  if (!label.includes("&")) {
    return <span className={accLabel}>{label}</span>;
  }
  const shortcuts: KeyboardShortcut[] = [];
  const underlines: React.ReactNode[] = [];
  _forEachAcceleratedPiece(label, (shortcut, piece) => {
    if (!shortcut) {
      underlines.push(<span className={accLabel}>{piece}</span>);
    } else {
      shortcuts.push(shortcut);
      underlines.push(
        <span className={`${accLabel} ${u}`}>{piece[0]}</span>,
        <span className={accLabel}>{piece.slice(1)}</span>,
      );
    }
  });
  if (!shortcuts.length) {
    return <span className={accLabel}>{label}</span>;
  }

  return <span className={accLabel}>{...underlines}</span>;
};

/**
 * Given a title and a label that may have accelerated pieces in it, get a new title
 * @param title The current title
 * @param label The label that has maybe-accelerated pieces to it
 * @returns A new title string that includes instructions
 */
export function ariaAcceleratedLabel(title: string, label: string): string {
  let titlePieces: string[] = [];
  _forEachAcceleratedPiece(label, shortcut =>
    shortcut ? titlePieces.push(shortcut) : undefined,
  );
  if (titlePieces.length && title) {
    return `${title} (${titlePieces.join(", ")})`;
  } else if (titlePieces.length) {
    return `${titlePieces.join(", ")}`;
  } else {
    return title;
  }
}

function _forEachAcceleratedPiece(
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
      || (!anyFound && label[0] !== "&")
    ) {
      anyFound = true;
      callback(undefined, piece);
    } else {
      anyFound = true;
      callback(`Ctrl+Alt+${l.toUpperCase()}` as KeyboardShortcut, piece);
    }
  }
}

export default AcceleratedLabel;
