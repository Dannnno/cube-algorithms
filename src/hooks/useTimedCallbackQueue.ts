import { useCallback, useEffect, useState } from "react";

/** How to control a queue that executes on a timer */
export interface IQueueController<T> {
  /**
   * Reset the queue and stop executing if it is currently running
   */
  resetQueue(): void;
  /**
   * Add to the end of the queue, and stop executing if it is currently running
   * @param params The entries to add to the end of the queue
   */
  addToQueue(...params: readonly T[]): void;
  /**
   * Remove all the current queue entries, and replace them with new ones. Stops executing if it is currently running
   * @param params The entries to replace the queue with
   */
  replaceQueue(...params: readonly T[]): void;
  /**
   * Start running the queue
   */
  startQueue(): void;
  /** The current queue index */
  queueIndex: number;
  /**
   * Change how long to wait between steps
   * @param delayMs The new delay between steps, in ms
   */
  changeDelay(delayMs: number): void;
  /** Pause executing automatically */
  pause(): void;
  /** Execute the next step, stepwise */
  stepwiseNext(): void;
  /** Execute the prior step, stepwise */
  stepwisePrior(): void;
}

/**
 * Create a reactive queue that can be executed on a timer
 * @param callback The action to execute on queue entries
 * @param delayMs How long to wait between executing the entires
 * @param onDeplete What to do when the queue finishes executing
 * @returns How to control the queue
 */
export function useTimedCallbackQueue<T>(
  callback: (param: T, ix: number) => void,
  delayMs: number,
  onDeplete?: () => void,
): IQueueController<T> {
  const [curDelay, setCurDelay] = useState(delayMs);
  const [timeoutId, setTimeoutId] = useState<number>(-1);
  const [queue, setQueue] = useState<readonly T[]>([]);
  const [start, setStart] = useState(false);
  const [queueIndex, setQueueIndex] = useState(-1);

  const resetQueue = useCallback(() => {
    setQueue([]);
    setStart(false);
  }, []);
  const addToQueue = useCallback((...values: readonly T[]) => {
    setQueue(curQueue => [...curQueue, ...values]);
    setStart(false);
  }, []);
  const replaceQueue = useCallback((...values: readonly T[]) => {
    setQueue(values);
    setStart(false);
  }, []);
  const startQueue = useCallback(() => setStart(true), []);

  const changeDelay = useCallback(
    (delayMs: number) => {
      if (timeoutId !== -1) {
        window.clearTimeout(timeoutId);
        setTimeoutId(-1);
      }
      setCurDelay(delayMs);
    },
    [curDelay, timeoutId],
  );
  const pause = useCallback(() => setStart(false), []);
  const stepwiseNext = useCallback(() => {
    if (timeoutId !== -1) {
      window.clearTimeout(timeoutId);
      setTimeoutId(-1);
    }
    setQueueIndex(curIndex => {
      if (curIndex >= queue.length) {
        return curIndex;
      }
      callback(queue[curIndex], curIndex);
      return curIndex + 1;
    });
  }, [timeoutId, queue]);
  const stepwisePrior = useCallback(() => {
    if (timeoutId !== -1) {
      window.clearTimeout(timeoutId);
      setTimeoutId(-1);
    }
    setQueueIndex(curIndex => {
      if (curIndex < 1) {
        return curIndex;
      }
      callback(queue[curIndex], curIndex);
      return curIndex - 1;
    });
  }, [timeoutId, queue]);

  useEffect(() => {
    if (!start || !queue.length) {
      return;
    }

    setTimeoutId(
      window.setTimeout(() => {
        setQueueIndex(curIndex => {
          if (curIndex >= queue.length) {
            setStart(false);
            setQueue([]);
            setQueueIndex(-1);
            return curIndex;
          }
          callback(queue[curIndex], curIndex);
          return curIndex + 1;
        });
      }, curDelay),
    );

    return () =>
      setTimeoutId(curId => {
        setStart(false);
        setQueue([]);
        setQueueIndex(-1);
        onDeplete?.();
        if (curId) {
          window.clearTimeout(curId);
        }
        return -1;
      });
  }, [queue, start, curDelay, callback]);

  return {
    resetQueue,
    addToQueue,
    replaceQueue,
    startQueue,
    queueIndex,
    changeDelay,
    pause,
    stepwiseNext,
    stepwisePrior,
  };
}
