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
}

/**
 * Create a reactive queue that can be executed on a timer
 * @param callback The action to execute on queue entries
 * @param delayMs How long to wait between executing the entires
 * @param onDeplete What to do when the queue finishes executing
 * @returns How to control the queue
 */
export function useTimedCallbackQueue<T>(
  callback: (param: T) => void,
  delayMs: number,
  onDeplete?: () => void,
): IQueueController<T> {
  const [_intervalId, setIntervalId] = useState<NodeJS.Timeout | undefined>();
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

  useEffect(() => {
    if (!start || !queue.length) {
      return;
    }

    let index = 0;
    setIntervalId(
      setInterval(() => {
        if (index >= queue.length) {
          setStart(false);
          setQueue([]);
          setQueueIndex(-1);
          return;
        }
        setQueueIndex(index);
        const next = queue[index];
        ++index;
        callback(next);
      }, delayMs),
    );

    return () =>
      setIntervalId(curId => {
        setStart(false);
        setQueue([]);
        setQueueIndex(-1);
        onDeplete?.();
        if (curId) {
          clearInterval(curId);
        }
        return undefined;
      });
  }, [queue, start]);

  return { resetQueue, addToQueue, replaceQueue, startQueue, queueIndex };
}
