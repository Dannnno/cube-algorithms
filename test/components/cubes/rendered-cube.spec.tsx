import { page } from "@vitest/browser/context";
import React from "react";
import { describe, expect, it } from "vitest";
import "vitest-browser-react";
import { DeepReadonly } from "../../../src/common/generics";
import {
  CubeActionType,
  CubeActions,
  CubeRenderStyle,
  RenderedCube,
} from "../../../src/components/cubes";
import { CubeData, CubeSide } from "../../../src/model/cube";

function expectDispatchedAction(
  expected: CubeActions | undefined,
  counter: { count: number },
): React.Dispatch<CubeActions> {
  return (action: CubeActions) => {
    ++counter.count;
    if (!expected) {
      expect(true, "No action should have been dispatched").toBeFalsy();
    } else {
      expect(action).toStrictEqual(expected);
    }
  };
}

interface IRenderedCubeCellTestCase {
  readonly renderStyle: CubeRenderStyle;
  readonly size: string;
  readonly cube: DeepReadonly<CubeData>;
  readonly locatorName: string;
  readonly expectedAction?: CubeActions;
  readonly expectedSide: CubeSide;
  readonly expectedRow: number;
  readonly expectedCol: number;
}

describe.skip("FlatCube", async () => {
  const base2x2Cube: DeepReadonly<CubeData> = [
    Array.from({ length: 4 }, _ => 1),
    Array.from({ length: 4 }, _ => 2),
    Array.from({ length: 4 }, _ => 3),
    Array.from({ length: 4 }, _ => 4),
    Array.from({ length: 4 }, _ => 5),
    Array.from({ length: 4 }, _ => 6),
  ];
  const base3x3Cube: DeepReadonly<CubeData> = [
    Array.from({ length: 9 }, _ => 1),
    Array.from({ length: 9 }, _ => 2),
    Array.from({ length: 9 }, _ => 3),
    Array.from({ length: 9 }, _ => 4),
    Array.from({ length: 9 }, _ => 5),
    Array.from({ length: 9 }, _ => 6),
  ];
  const base4x4Cube: DeepReadonly<CubeData> = [
    Array.from({ length: 16 }, _ => 1),
    Array.from({ length: 16 }, _ => 2),
    Array.from({ length: 16 }, _ => 3),
    Array.from({ length: 16 }, _ => 4),
    Array.from({ length: 16 }, _ => 5),
    Array.from({ length: 16 }, _ => 6),
  ];

  const tests: IRenderedCubeCellTestCase[] = [];
  for (const renderStyle of Object.values(CubeRenderStyle)) {
    for (const sideId of [1 /*, 2, 3, 4, 5, 6*/] as const) {
      tests.push(
        // 2x2 layout:
        //
        //  +---+---+
        //  |CC | CW|
        //  +---+---+
        //  |   | F |
        //  +---+---+
        {
          renderStyle,
          size: "2x2",
          cube: base2x2Cube,
          locatorName: `Rotate Face ${sideId} counter-clockwise`,
          expectedSide: sideId,
          expectedRow: 0,
          expectedCol: 0,
          expectedAction: {
            type: CubeActionType.RotateFace,
            sideId,
            rotationCount: 3,
          },
        },
        {
          renderStyle,
          size: "2x2",
          cube: base2x2Cube,
          locatorName: `Rotate Face ${sideId} clockwise`,
          expectedSide: sideId,
          expectedRow: 0,
          expectedCol: 1,
          expectedAction: {
            type: CubeActionType.RotateFace,
            sideId,
            rotationCount: 1,
          },
        },
        {
          renderStyle,
          size: "2x2",
          cube: base2x2Cube,
          locatorName: "",
          expectedSide: sideId,
          expectedRow: 1,
          expectedCol: 0,
        },
        {
          renderStyle,
          size: "2x2",
          cube: base2x2Cube,
          locatorName: `Focus Face ${sideId}`,
          expectedSide: sideId,
          expectedRow: 1,
          expectedCol: 1,
          expectedAction: {
            type: CubeActionType.RotateCube,
            focusFace: sideId,
          },
        },
      );
    }
  }

  it.each(tests)("$size [$locatorName]", async testCase => {
    const {
      cube,
      locatorName,
      expectedAction,
      expectedCol,
      expectedRow,
      expectedSide,
      renderStyle,
    } = testCase;
    const counter = { count: 0 };
    const hook = expectDispatchedAction(expectedAction, counter);
    const screen = await page.render(
      <RenderedCube
        cubeData={cube}
        cubeDispatch={hook}
        renderStyle={renderStyle}
      />,
    );

    const buttonLocator = await screen.getByRole("button", {
      name: locatorName,
    });
    if (locatorName) {
      await expect
        .poll(() => screen.getByRole("button", { name: locatorName }), {
          interval: 10,
          timeout: 10000,
        })
        .toBeVisible();
      await expect.element(buttonLocator).toBeVisible();
      const parent = await buttonLocator.element().parentElement?.parentElement;
      await expect(parent).toBeDefined();
      await expect.element(parent!).toBeVisible();
      await expect
        .element(parent!)
        .toHaveAttribute("data-side-id", expectedSide);
      await expect
        .element(parent!)
        .toHaveAttribute("data-row-num", expectedRow);
      await expect
        .element(parent!)
        .toHaveAttribute("data-col-num", expectedCol);
      await expect
        .element(parent!)
        .toHaveAttribute("data-cur-value", expectedSide);
      await buttonLocator.click();
      expect(counter.count).toBe(1);
    } else {
      await expect.element(buttonLocator).toBeInvalid();
      await buttonLocator.click();
      expect(counter.count).toBe(0);
    }
  });
});
