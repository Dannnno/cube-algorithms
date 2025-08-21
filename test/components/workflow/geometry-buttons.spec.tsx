import { expect, describe, it } from "vitest";
import { renderHook } from "vitest-browser-react";
import { page } from "@vitest/browser/context";
import { 
    FaceRotationDirection, FaceRotationButton 
} from "../../../src/components/workflow/geometry-buttons";
import { 
    usePuzzleCube 
} from "../../../src/components/cubes/usePuzzleCube";
import { checkCube } from "../../model/utility";

describe("FaceRotationButton", async () => {
    it("can be found by role", async () => {
        const { result, act } = await renderHook(() => usePuzzleCube(3));
        const [cube, dispatch] = result.current;
        const screen = await page.render(
            <FaceRotationButton 
                dispatch={dispatch}  
                rotationDirection={FaceRotationDirection.Clockwise}
                faceId={1}
            />
        );

        const locator = await page.getByRole("button");
        
        await expect.element(locator).toBeVisible(); 
    });
    it("can be found by title", async () => {
        const { result, act } = await renderHook(() => usePuzzleCube(3));
        const [cube, dispatch] = result.current;
        const screen = await page.render(
            <FaceRotationButton 
                dispatch={dispatch}  
                rotationDirection={FaceRotationDirection.Clockwise}
                faceId={1}
            />
        );

        const locator = await screen.getByTitle("Rotate Face");
        
        await expect.element(locator).toBeVisible(); 
    });
    it.skip("can be clicked", async () => {
        const { result, act } = await renderHook(() => usePuzzleCube(3));
        const [cube, dispatch] = result.current;
        const screen = await page.render(
            <FaceRotationButton 
                dispatch={dispatch}  
                rotationDirection={FaceRotationDirection.CounterClockwise}
                faceId={1}
            />
        );

        const locator = await screen.getByTitle("Rotate Face");
        await act(async () => await locator.click());
        checkCube(result.current[0], 
            [
                [
                    1, 1, 1, 
                    1, 1, 1, 
                    1, 1, 1
                ], 
                [
                    5, 2, 2, 
                    5, 2, 2, 
                    5, 2, 2
                ], 
                [
                    3, 3, 3, 
                    3, 3, 3, 
                    3, 3, 3
                ], 
                [
                    4, 4, 6, 
                    4, 4, 6, 
                    4, 4, 6
                ], 
                [
                    4, 5, 5, 
                    4, 5, 5, 
                    4, 5, 5
                ], 
                [
                    2, 6, 6, 
                    2, 6, 6, 
                    2, 6, 6
                ]
            ]
        );
    });
});
