import { useCallback, useEffect, useState } from "react";

/**
 * Options by which to adjust or cancel a timer
 */
export interface ICancelCallbackOptions {
  /** Delay the timer by N seconds (i.e. time remaining + N). Must be > 0 */
  readonly delayTimeBySeconds: number;
  /** Reset by N seconds (i.e. time remaining becomes N). Must be > 0*/
  readonly resetTimeInSeconds: number;
  /** Whether to cancel the timer */
  readonly cancel: boolean;
}

/**
 * Callback to cancel a timer
 */
export type CancelCallback = {
  /**
   * Callback to cancel a timer
   * @param options Cancel options. Leave undefined or don't pass any options to cancel fully
   */
  (options?: Partial<ICancelCallbackOptions>): void;
};

/**
 * Custom hook that can be used to delay something for a period of time
 * @param timeInSeconds How long to set the timer for, in seconds
 * @param executeInTime What to execute when the timer reaches zero
 * @returns A callback that can be used to cancel or otherwise modify the timer
 */
export function useTimer(
  timeInSeconds: number,
  executeInTime: () => void,
): CancelCallback {
  const [remainingTime, setRemainingTime] = useState(timeInSeconds);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | undefined>();

  // Ticks down the current timer
  useEffect(() => {
    const thisInterval = setInterval(
      () => setRemainingTime(remaining => remaining - 1),
      1000,
    );
    setIntervalId(thisInterval);

    return () => clearInterval(thisInterval);
  }, [setRemainingTime, setIntervalId]);

  // Clears the timer when we're done and fires the effect
  useEffect(() => {
    if (remainingTime <= 0) {
      if (intervalId) {
        clearInterval(intervalId);
      }
      executeInTime();
    }
  }, [remainingTime, intervalId]);

  // Allows the caller to adjust the timer
  return useCallback(
    (options?: Partial<ICancelCallbackOptions>): void => {
      const {
        delayTimeBySeconds,
        resetTimeInSeconds,
        cancel = true,
      } = options ?? {};

      if (delayTimeBySeconds && delayTimeBySeconds > 0) {
        setRemainingTime(remaining => remaining + delayTimeBySeconds);
      } else if (resetTimeInSeconds && resetTimeInSeconds > 0) {
        setRemainingTime(resetTimeInSeconds);
      } else if (cancel) {
        clearInterval(intervalId);
      }
    },
    [setRemainingTime, intervalId],
  );
}
export default useTimer;
