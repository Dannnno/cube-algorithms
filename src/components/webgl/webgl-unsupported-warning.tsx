import React from "react";
/**
 * What level of un-supportedness WebGL is
 */
export enum WebGlUnsupportedLevel {
  /** Unknown */
  UnknownSupport,
  /** Known to be supported */
  KnownSupported,
  /** Known not to be supported (or we timed out while waiting) */
  KnownNotSupported,
}

interface IWebGlUnsupportedWarningProps {
  /** What level of un-supportedness WebGL has for the current browser */
  readonly level: WebGlUnsupportedLevel;
}

/**
 * Component that renders a warning about whether WebGL is supported by
 * the browser
 */
export const WebGlUnsupportedWarning: React.FC<
  IWebGlUnsupportedWarningProps
> = props => {
  const { level } = props;
  switch (level) {
    case WebGlUnsupportedLevel.UnknownSupport:
      return <p>Loading WebGL rendering engine</p>;
    case WebGlUnsupportedLevel.KnownSupported:
      return null;
    case WebGlUnsupportedLevel.KnownNotSupported:
      return (
        <p>
          Loading WebGL rendering engine...
          <br />
          <i>This is taking a while - your browser may not support WebGL</i>
        </p>
      );
  }
};

export default WebGlUnsupportedWarning;
