import { useId, useMemo } from "react";

/**
 * Get an ID that is at least a little human readable
 * @param suffix What to suffix the ID with
 * @returns A human readable ID
 */
export function usePrettyId(suffix: string): string {
  const id = useId();
  return useMemo(() => {
    const safeSuffix = suffix.replace(/[^a-zA-Z0-9_\-]/, "");
    return `${id}-${safeSuffix}`;
  }, [id, suffix]);
}
