import { forceNever } from "@/common";
import { KeyboardShortcut, useKeyboardShortcut, usePrettyId } from "@/hooks";
import { useKeyboardClickable } from "@/hooks/useKeyboardClickable";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";
import AcceleratedLabel, { ariaAcceleratedLabel } from "./accelerated-label";
import {
  buttonList,
  icon,
  optionButton,
  optionList,
} from "./option-list.module.scss";

/** Ways that an optionlist can be styled */
export enum OptionListRenderStyle {
  /** As a dropdown */
  Dropdown,
  /** As a series of buttons */
  Buttons,
}

interface IOptionListProps<T extends string | number> {
  /** The style in which to render the option list */
  readonly renderStyle: OptionListRenderStyle;
  /** How to label the option list */
  readonly label: string;
  /** The value to bind to the option list */
  readonly boundValue: T | undefined;
  /** How to set the value bound to the option list */
  readonly setBoundValue: React.Dispatch<React.SetStateAction<T>>;
  /** The actual options to select */
  readonly options: readonly Omit<IOption<T>, "setValue">[];
  /** The keyboard shortcut that should focus the option list, if any */
  readonly shortcut?: KeyboardShortcut;
}

const OptionListRenderContext = createContext(OptionListRenderStyle.Dropdown);
const OptionListSelectedValueContext = createContext<
  string | number | undefined
>(undefined);

/** Component that renders a list of options */
export function OptionList<T extends string | number>(
  props: IOptionListProps<T>,
): React.ReactNode {
  const { renderStyle, label, boundValue, setBoundValue, options, shortcut } =
    props;
  const onOptionChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) =>
      setBoundValue(event.target.value as T),
    [setBoundValue],
  );

  const children = options.map(opt => (
    <Option {...opt} setValue={setBoundValue} key={opt.value} />
  ));

  const divRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const focus = useCallback(() => {
    const ref =
      renderStyle === OptionListRenderStyle.Buttons ? divRef : selectRef;
    if (!ref.current) {
      return;
    }
    ref.current.focus();
  }, [renderStyle]);
  useKeyboardShortcut(shortcut, focus);
  const ariaTitle = ariaAcceleratedLabel("", label);

  return (
    <OptionListRenderContext.Provider value={renderStyle}>
      <OptionListSelectedValueContext.Provider value={boundValue}>
        <label htmlFor={label} title={ariaTitle} aria-label={ariaTitle}>
          <AcceleratedLabel label={label} />
          :&nbsp;
        </label>
        {renderStyle === OptionListRenderStyle.Buttons && (
          <div
            ref={divRef}
            className={`${optionList} ${buttonList}`}
            tabIndex={0}
            title={ariaTitle}
            aria-label={ariaTitle}
          >
            {children}
          </div>
        )}
        {renderStyle === OptionListRenderStyle.Dropdown && (
          <select
            ref={selectRef}
            required
            onChange={onOptionChange}
            value={boundValue}
            name={label}
            className={optionList}
            title={ariaTitle}
            aria-label={ariaTitle}
            tabIndex={0}
          >
            {children}
          </select>
        )}
      </OptionListSelectedValueContext.Provider>
    </OptionListRenderContext.Provider>
  );
}

interface IOption<T extends string | number> {
  /** The label to display for the option */
  readonly label: string;
  /** The value of the option */
  readonly value: T;
  /** Callback to set the overall bound value to this value */
  readonly setValue: React.Dispatch<React.SetStateAction<T>>;
  /** Icon to display for the option, if any */
  readonly iconKey?: string;
  /** Whether the option should be treated as disabled */
  readonly disabled?: boolean;
  /** The keyboard shortcut to use to jump to this option (buttons only), if any */
  readonly shortcut?: KeyboardShortcut;
}

function Option<T extends string | number>(props: IOption<T>): React.ReactNode {
  const { label, value, iconKey, disabled = false, setValue, shortcut } = props;
  const renderStyle = useContext(OptionListRenderContext);
  const boundValue = useContext(OptionListSelectedValueContext);
  const isMatch = useMemo(() => boundValue === value, [boundValue, value]);
  const id = usePrettyId(label);
  const onSelect = useCallback(() => setValue(value), []);
  const onKeyDown = useKeyboardClickable(onSelect);
  useKeyboardShortcut(shortcut, onSelect);
  const ariaTitle = ariaAcceleratedLabel("", label);

  switch (renderStyle) {
    case OptionListRenderStyle.Dropdown:
      return (
        <option value={value} disabled={disabled}>
          {label}
        </option>
      );
    case OptionListRenderStyle.Buttons:
      return (
        <div
          className={optionButton}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onClick={onSelect}
          role="button"
          title={ariaTitle}
          aria-label={ariaTitle}
        >
          <label htmlFor={id}>
            {iconKey && (
              <span
                className={icon}
                style={{ backgroundImage: `url("/src/assets/${iconKey}.svg")` }}
              ></span>
            )}
            <AcceleratedLabel label={label} />
          </label>
          <input
            type="checkbox"
            name={label}
            id={id}
            value={value}
            checked={isMatch}
            onChange={onSelect}
            disabled={disabled}
          ></input>
        </div>
      );
    default:
      forceNever(renderStyle);
  }
}
