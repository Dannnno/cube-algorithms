import {
  KeyboardShortcut,
  useKeyboardShortcut,
} from "@hooks/useKeyboardShortcut";
import { usePrettyId } from "@hooks/usePrettyId";
import React, { useCallback, useRef } from "react";
import AcceleratedLabel, { ariaAcceleratedLabel } from "./accelerated-label";
import {
  icon,
  iconButton,
  inlineLabel,
  textButton,
} from "./icon-button.module.scss";

interface IIconButtonProps extends IBaseButtonProps {
  /** The icon name. Must correspond to a file in /src/assets/* without the extension */
  readonly iconKey: string;
}

/** Component that renders a clickable button with an icon */
export const IconButton: React.FC<IIconButtonProps> = props => {
  return <BaseButton {...props} />;
};

/** Component that renders a clickable button */
export const Button: React.FC<Omit<IBaseButtonProps, "iconKey">> = props => {
  return <BaseButton {...props} />;
};
export default IconButton;

interface IBaseButtonProps {
  /** The label for the icon button */
  readonly label: string;
  /** The icon name. Must correspond to a file in /src/assets/* without the extension */
  readonly iconKey?: string;
  /** What to do on click */
  readonly onClick: (target: HTMLElement) => void;
  /** The alt-text to display */
  readonly alt?: string;
  /** Whether the button is disabled */
  readonly disabled?: boolean;
  /** Whether to display the label as the text in the button*/
  readonly labelAsText?: boolean;
  /** Additional CSS classes to apply to the button */
  readonly className?: string;
  /** A shortcut to use for the button, if any */
  readonly shortcut?: KeyboardShortcut;
}

const BaseButton: React.FC<IBaseButtonProps> = props => {
  const {
    label,
    labelAsText,
    onClick,
    alt = label,
    disabled = false,
    className,
    shortcut,
    iconKey,
  } = props;

  const iconStyle: React.CSSProperties | undefined = iconKey
    ? {
        backgroundImage: `url("/src/assets/${iconKey}.svg")`,
      }
    : undefined;
  // The button should only get this styling if we aren't inlining the label
  const buttonStyle = labelAsText ? undefined : iconStyle;

  const allClasses = [
    iconKey ? iconButton : textButton,
    className,
    labelAsText ? inlineLabel : "",
  ]
    .filter(v => v)
    .join(" ");

  const buttonRef = useRef<HTMLButtonElement>(null);
  const buttonHandler = useCallback(
    () => onClick(buttonRef.current!),
    [onClick],
  );
  useKeyboardShortcut(shortcut, buttonHandler);

  const id = usePrettyId(label);
  const ariaTitle = ariaAcceleratedLabel(alt, label);

  const labelJsx = <AcceleratedLabel label={label} />;
  const buttonChild = labelAsText ? (
    <>
      {iconKey && <span className={icon} style={iconStyle} />}
      {labelJsx}
    </>
  ) : null;

  return (
    <>
      {!labelAsText && (
        <label htmlFor={id} title={ariaTitle} aria-label={ariaTitle}>
          {labelJsx}
          :&nbsp;
        </label>
      )}
      <button
        id={id}
        name={label}
        className={allClasses}
        style={buttonStyle}
        ref={buttonRef}
        onClick={buttonHandler}
        title={ariaTitle}
        aria-label={ariaTitle}
        disabled={disabled}
      >
        {buttonChild}
      </button>
    </>
  );
};
