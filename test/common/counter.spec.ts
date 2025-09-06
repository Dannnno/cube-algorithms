import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { Counter } from "../../src/common";

describe("Counter", () => {
  it("should have no elements after construction", () =>
    fc.assert(
      fc.property(varTypeCounterMember, val => {
        const counter = new Counter<typeof val>();
        expect(counter.has(val)).toBe(0);
      }),
    ));

  it("should have the elements it was constructed with", () =>
    fc.assert(
      fc.property(fc.array(varTypeCounterMember), list => {
        const counter = new Counter(list);
        for (const member of list) {
          expect(
            counter.has(member),
            Object(member).toString(),
          ).toBeGreaterThanOrEqual(1);
        }
      }),
    ));

  it("should have the elements that are added to it, and not ones that are removed from it", () =>
    fc.assert(
      fc.property(fc.array(varTypeCounterMember), list => {
        const counter = new Counter();
        for (const member of list) {
          expect(counter.has(member), `${Object(member)} before`).toBe(0);
          counter.inc(member);
          expect(counter.has(member), `${Object(member)} before`).toBe(1);
          counter.dec(member);
          expect(counter.has(member), `${Object(member)} before`).toBe(0);
        }
      }),
    ));

  it("should only have the element that is added to it", () =>
    fc.assert(
      fc.property(
        fc.tuple(fc.integer(), fc.integer()).filter(([l, r]) => l !== r),
        ([l, r]) => {
          const counter = new Counter();
          expect(counter.has(l), `l-before`).toBe(0);
          expect(counter.has(r), `r-before`).toBe(0);
          expect(counter.inc(l), `l-inc`).toBe(1);
          expect(counter.has(r), `r-after`).toBe(0);
        },
      ),
    ));

  it("should keep track of occurences", () =>
    fc.assert(
      fc.property(fc.nat({ max: 100 }), varTypeCounterMember, (cnt, val) => {
        const counter = new Counter();
        for (let ix = 0; ix < cnt; ++ix) {
          counter.inc(val);
        }
        expect(counter.has(val)).toBe(cnt);
      }),
    ));

  it("should keep track of occurences", () =>
    fc.assert(
      fc.property(
        fc
          .tuple(fc.nat({ max: 100 }), fc.nat({ max: 100 }))
          .filter(([l, r]) => l >= r),
        varTypeCounterMember,
        ([cntInc, cntDec], val) => {
          const counter = new Counter();
          for (let ix = 0; ix < cntInc; ++ix) {
            counter.inc(val);
          }
          for (let ix = 0; ix < cntDec; ++ix) {
            counter.dec(val);
          }
          expect(counter.has(val)).toBe(cntInc - cntDec);
        },
      ),
    ));

  it("should decrement to 0", () =>
    fc.assert(
      fc.property(fc.nat({ max: 100 }), varTypeCounterMember, (cnt, val) => {
        const counter = new Counter();
        for (let ix = 0; ix < cnt; ++ix) {
          counter.inc(val);
        }
        expect(counter.has(val)).toBe(cnt);
        counter.dec0(val);
        expect(counter.has(val)).toBe(0);
      }),
    ));

  it("should work regardless of how many commands there are", () =>
    fc.assert(
      fc.property(
        fc.commands([
          fc.constant(new IncCommand()),
          fc.constant(new DecCommand()),
          fc.constant(new Dec0Command()),
          fc.constant(new ClearCommand()),
        ]),
        cmds => {
          const s = () => ({
            model: { count: 0 },
            real: new Counter<number>(),
          });
          fc.modelRun(s, cmds);
        },
      ),
    ));

  it("has a whole map", () =>
    fc.assert(
      fc.property(fc.array(fc.integer()), intArr => {
        const counter = new Counter(intArr);
        const map = counter.countAll();
        for (const v of intArr) {
          expect(map.has(v)).toBeTruthy();
          expect(map.get(v)).toBe(counter.has(v));
        }
        for (const [key, value] of map) {
          expect(counter.has(key)).toBe(value);
        }
      }),
    ));

  it("can be compared to a different count", () =>
    fc.assert(
      fc.property(
        fc
          .tuple(fc.array(fc.integer()), fc.array(fc.integer()))
          .filter(([l, r]) => l.some(x => r.every(y => y !== x))), // require them to be different
        ([lArr, rArr]) => {
          const lCounter = new Counter(lArr);
          const rCounter = new Counter(rArr);
          expect(lCounter.compare(rCounter)).toBeFalsy();
          expect(rCounter.compare(lCounter)).toBeFalsy();
        },
      ),
    ));
  it("can be compared to an equivalent count", () =>
    fc.assert(
      fc.property(fc.array(fc.integer()), arr => {
        const lCounter = new Counter(arr);
        const rCounter = new Counter(Array.from(arr).sort());
        expect(lCounter.compare(rCounter)).toBeTruthy();
        expect(rCounter.compare(lCounter)).toBeTruthy();
      }),
    ));
});

const varTypeCounterMember = fc.oneof(
  fc.integer(),
  fc.array(fc.boolean()),
  fc
    .object()
    .filter(obj => !("toString" in obj) || typeof obj.toString === "function"),
);

type CounterModel = {
  count: number;
};

class IncCommand implements fc.Command<CounterModel, Counter<number>> {
  check(_m: Readonly<CounterModel>): boolean {
    return true;
  }
  run(m: CounterModel, r: Counter<number>): void {
    m.count += 1;
    expect(r.inc(1), `inc return`).toBe(m.count);
    expect(r.has(1), `has check`).toBe(m.count);
  }
  toString(): string {
    return `Counter.inc(1)`;
  }
}
class DecCommand implements fc.Command<CounterModel, Counter<number>> {
  check(_m: Readonly<CounterModel>): boolean {
    return true;
  }
  run(m: CounterModel, r: Counter<number>): void {
    m.count = m.count <= 0 ? 0 : m.count - 1;
    expect(r.dec(1), `dec return`).toBe(m.count);
    expect(r.has(1), `has check`).toBe(m.count);
  }
  toString(): string {
    return `Counter.dec(1)`;
  }
}
class Dec0Command implements fc.Command<CounterModel, Counter<number>> {
  check(_m: Readonly<CounterModel>): boolean {
    return true;
  }
  run(m: CounterModel, r: Counter<number>): void {
    m.count = 0;
    r.dec0(1);
    expect(r.has(1), `has check`).toBe(m.count);
  }
  toString(): string {
    return `Counter.dec0(1)`;
  }
}
class ClearCommand implements fc.Command<CounterModel, Counter<number>> {
  check(_m: Readonly<CounterModel>): boolean {
    return true;
  }
  run(m: CounterModel, r: Counter<number>): void {
    m.count = 0;
    r.clear();
    expect(r.has(1), `has check`).toBe(m.count);
  }
  toString(): string {
    return `Counter.clear()`;
  }
}
