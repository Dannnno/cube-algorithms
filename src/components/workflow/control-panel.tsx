import { DeepReadonly } from "@/common";
import {
  IconButton,
  OptionList,
  OptionListRenderStyle,
} from "@/components/common";
import { CubeData, getCubeSize } from "@/model/cube";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  CubeActionType,
  CubeActions,
  CubeRenderStyle,
  usePuzzleCube,
  usePuzzleCubeHash,
} from "../cubes";
import { controlPanelSidebar } from "./control-panel.module.scss";
import { RotateCubeButtonContainer } from "./geometry-buttons";

interface IControlPanelProps {
  /** How to control the cube */
  readonly dispatch: React.Dispatch<CubeActions>;
  /** The cube being controlled */
  readonly puzzleCube: DeepReadonly<CubeData>;
  /** The length of one side of the cube */
  readonly cubeSize: number;
  /** Set the reactive cube size */
  readonly setCubeSize: React.Dispatch<React.SetStateAction<number>>;
  /** The style in which to render the cube */
  readonly renderStyle: CubeRenderStyle;
  /** Set the reactive rendering style */
  readonly setCubeRenderStyle: React.Dispatch<
    React.SetStateAction<CubeRenderStyle>
  >;
}

/**
 * Component that shows controls to display a cube
 */
export const ControlPanel: React.FC<IControlPanelProps> = props => {
  const {
    dispatch,
    puzzleCube,
    cubeSize,
    setCubeSize,
    renderStyle,
    setCubeRenderStyle,
  } = props;
  const [resizeEnabled, setResizeEnabled] = useState(false);
  const [resetEnabled, setResetEnabled] = useState(false);

  const [defaultCubeOfSize, resizeDispatch] = usePuzzleCube(cubeSize);
  const cubeHash = usePuzzleCubeHash(puzzleCube);
  const defaultCubeHash = usePuzzleCubeHash(defaultCubeOfSize);
  const cubeHasChanged = useMemo(
    () => cubeHash !== defaultCubeHash,
    [cubeHash, defaultCubeHash],
  );
  const calculatedSize = useMemo(() => {
    void cubeHash;
    return getCubeSize(puzzleCube);
  }, [puzzleCube, cubeHash]);
  useEffect(() => setResetEnabled(cubeHasChanged), [cubeHasChanged]);
  useEffect(
    () => setResizeEnabled(calculatedSize !== +cubeSize),
    [calculatedSize, cubeSize],
  );

  const onClickResetCube = useCallback(() => {
    if (resetEnabled && cubeHasChanged) {
      dispatch({
        type: CubeActionType.ResetCube,
      });
    }
  }, [dispatch, resetEnabled, cubeHasChanged]);

  const onClickResizeCube = useCallback(() => {
    if (resizeEnabled && cubeSize !== calculatedSize) {
      dispatch({
        type: CubeActionType.ResizeCube,
        newSize: cubeSize,
      });
      resizeDispatch({
        type: CubeActionType.ResizeCube,
        newSize: cubeSize,
      });
    }
  }, [cubeSize, dispatch, resizeEnabled, calculatedSize]);

  return (
    <div className={controlPanelSidebar}>
      <OptionList
        renderStyle={OptionListRenderStyle.Dropdown}
        label="&New Size"
        boundValue={cubeSize}
        setBoundValue={setCubeSize}
        options={Array.from({ length: 8 }, (_, ix) => ({
          label: `${ix + 2}`,
          value: ix + 2,
        }))}
        shortcut="Ctrl+Alt+N"
      />
      <IconButton
        label={`Resi&ze to ${cubeSize}x${cubeSize}x${cubeSize}`}
        iconKey="progression"
        alt={`Resize the cube to be ${cubeSize}x${cubeSize}x${cubeSize}`}
        onClick={onClickResizeCube}
        disabled={!resizeEnabled || calculatedSize === cubeSize}
        labelAsText
        shortcut="Ctrl+Alt+Z"
      />

      <IconButton
        label="&Reset Cube"
        alt="Reset the cube to its original state"
        onClick={onClickResetCube}
        disabled={!resetEnabled}
        iconKey="cycle"
        labelAsText
        shortcut="Ctrl+Alt+R"
      />

      <OptionList<CubeRenderStyle>
        renderStyle={OptionListRenderStyle.Buttons}
        label="&Pick a cube style"
        boundValue={renderStyle}
        setBoundValue={setCubeRenderStyle}
        shortcut="Ctrl+Alt+P"
        options={[
          {
            value: CubeRenderStyle.Flat,
            label: `Flat`,
            iconKey: "flat-platform",
          },
          {
            value: CubeRenderStyle.ThreeD,
            label: `3D`,
            iconKey: "cube",
          },
        ]}
      />
      <div>
        <label>Rotate Whole Cube: </label>
        <RotateCubeButtonContainer dispatch={dispatch} />
      </div>
    </div>
  );
};

export default ControlPanel;
