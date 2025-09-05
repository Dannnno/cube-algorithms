/**
 * Counter class that keeps track of how many times a given object has been seen.
 * Uses the same criteria as ECMAScript Map objects for identifying whether an
 * object is the same as another object.
 * @see https://tc39.es/ecma262/multipage/keyed-collections.html#sec-map-objects
 */
export class Counter<T> {
  private _objects: Map<T, number>;

  /**
   * Construct a new counter
   * @param values Values to count on construction
   */
  public constructor(values?: Iterable<T>) {
    this._objects = new Map<T, number>();
    for (const value of values ?? []) {
      this.inc(value);
    }
  }

  /**
   * Increment the count of an object
   * @param obj The object to increment the count of in the collection
   * @returns The current count of times this object has been seen
   */
  public inc(obj: T): number {
    const curValue = 1 + (this._objects.get(obj) ?? 0);
    this._objects.set(obj, curValue);
    return curValue;
  }

  /**
   * Decrement the count of an object. May remove it from the collection if it
   * has no remaining sightings
   * @param obj The object to decrement the count of in the collection
   * @returns The current count of times this object has been seen
   */
  public dec(obj: T): number {
    const curValue = -1 + (this._objects.get(obj) ?? 0);
    if (curValue <= 0) {
      this._objects.delete(obj);
    } else {
      this._objects.set(obj, curValue);
    }
    return curValue < 0 ? 0 : curValue;
  }

  /**
   * Remove an object from the count entirely
   * @param obj The object to be removed
   */
  public dec0(obj: T): void {
    this._objects.delete(obj);
  }

  /**
   * Reset the collection and removing all counts
   */
  public clear(): void {
    this._objects.clear();
  }

  /**
   * Get the current number of sightings of the object, if any
   * @param obj The object to get the current count of
   * @returns The count of sightings (0 if never seen)
   */
  public has(obj: T): number {
    return this._objects.get(obj) ?? 0;
  }

  /**
   * Get the count for each object
   * @returns Mapping from objects to their sightings
   */
  public countAll(): Map<T, number> {
    return new Map(this._objects);
  }

  /**
   * Check whether two counters have the same counts
   * @param other The other counter
   * @returns Whether both counters have the exact same counts
   */
  public compare(other: Counter<T>): boolean {
    for (const [key, value] of this._objects) {
      if (other.has(key) !== value) {
        return false;
      }
    }
    for (const [key, value] of other._objects) {
      if (this.has(key) !== value) {
        return false;
      }
    }

    return true;
  }
}
