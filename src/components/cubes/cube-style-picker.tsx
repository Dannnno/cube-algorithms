import React, { useState, useCallback, useMemo } from 'react';
import { IReactCubeProps } from "./generic-cube";
import ThreeDimCube from './3d-cube';
import FlatCube from './flat-cube';
import { forceNever } from '@/common';

enum CubeStyle {
    Flat = "Flat",
    ThreeD = "3D"
}

const CubeStyleOptions = {
    [CubeStyle.Flat]: CubeStyle.Flat,
    [CubeStyle.ThreeD]: CubeStyle.ThreeD
} as const;

/**
 * Component that selects and renders a puzzle cube in the desired style
 */
export const CubePicker: React.FC<IReactCubeProps> = props => {
    const [cubeStyle, setCubeStyle] = useState(CubeStyle.Flat);

    const options = useMemo(() => 
        Object.keys(CubeStyleOptions).map(
            id => <option value={id} key={id}>{id}</option>
        ), 
        [cubeStyle]);

    const onOptionChange = useCallback(
        (event: React.ChangeEvent<HTMLSelectElement>) => 
            setCubeStyle(event.target.value as CubeStyle),
        [cubeStyle]);

    let renderedCube: React.ReactElement;

    switch (cubeStyle) {
        case CubeStyle.Flat:
            renderedCube = <FlatCube {...props} />;
            break;
        case CubeStyle.ThreeD:
            renderedCube = <ThreeDimCube {...props} />;
            break;
        default:
            renderedCube = <p>Select a rendering style above.</p>;
            forceNever(cubeStyle);
    }

    return (
        <>
            <label htmlFor="cube-style-select">
                Pick a cube style:&nbsp;
            </label>
            <select 
                name="cube-style" 
                id="cube-style-select" 
                required 
                onChange={onOptionChange}
                value={cubeStyle}
            >
                {options}
            </select>
            {renderedCube}
        </>
    );
}

export default CubePicker;
