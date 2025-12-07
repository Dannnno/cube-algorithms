import { KeyboardShortcut } from "@/hooks";
import React from "react";
import { _forEachAcceleratedPiece } from "./accelerated-label-helpers";
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

export default AcceleratedLabel;
