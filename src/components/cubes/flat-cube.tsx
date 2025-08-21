import React, { } from 'react';
import styles, { flatCube, cubeSide, cubeValue } from './flat-cube.module.scss';
import { 
	CubeCellValue, CubeSide, CubeSideData, forEachCellOnSide, forEachSide 
} from '@model/cube';
import { 
	IPrettyPuzzleCubeProps, PuzzleCubeCellStyleMap 
} from './generic-cube';
import { DeepReadonly } from '@/common';
import { getCubeSize } from '@/model/geometry';

const DEFAULT_STYLE_MAP: PuzzleCubeCellStyleMap = {
	[CubeSide.Left]: { color: "red" },
	[CubeSide.Front]: { color: "cyan" },
	[CubeSide.Right]: { color: "orange" },
	[CubeSide.Back]: { color: "green" },
	[CubeSide.Top]: { color: "white" },
	[CubeSide.Bottom]: { color: "yellow" },
};

function asCssVars(
	...pairs: readonly (readonly [string, string | number])[]
): React.CSSProperties {
	return Object.fromEntries(pairs) as React.CSSProperties;
}

function sideSizeAsCssVars(size: number): React.CSSProperties {
	return asCssVars(["--side-size", size]);
}

/**
 * Component that renders a flattened 3-dimensional puzzle cube.
 */
export const FlatCube: React.FC<IPrettyPuzzleCubeProps> = props => {
	const { cubeData, styleMap = DEFAULT_STYLE_MAP } = props;
	const size = getCubeSize(cubeData);
	const style = sideSizeAsCssVars(size);

    const sides: React.ReactElement[] = [];
    forEachSide(cubeData, (sideId, data) => 
		sides.push(
            <FlatCubeSide 
                key={sideId} 
                sideId={sideId}
                size={size}
                side={data} 
                styleMap={styleMap} 
            />
        )
	);

	return (
		<div className={flatCube} style={style}>
			{...sides}
		</div>
	);
};

interface IFlatCubeSideProps {
    readonly size: number;
    readonly sideId: CubeSide;
	readonly side: DeepReadonly<CubeSideData>;
	readonly styleMap: PuzzleCubeCellStyleMap;
}

const FlatCubeSide: React.FC<IFlatCubeSideProps> = props => {
	const { side, styleMap, sideId, size } = props;
	const style = sideSizeAsCssVars(size);

	const values: React.ReactElement[] = [];
	forEachCellOnSide(side, size, (row, col, value) => {
		values.push(
			<FlatCubeValue 
				size={size} 
				sideId={sideId} 
				styleMap={styleMap} 
				value={value} 
				rowNum={row} 
				colNum={col} 
			/>
		);
	});

	return (
		<p data-side-id={sideId} className={cubeSide} style={style}>
			{...values}
		</p>
	);
};

interface IFlatCubeValueProps {
	readonly size: number;
	readonly sideId: CubeSide;
	readonly value: CubeCellValue;
	readonly rowNum: number;
	readonly colNum: number;
	readonly styleMap: PuzzleCubeCellStyleMap;
}

const FlatCubeValue: React.FC<IFlatCubeValueProps> = props => {
	const { sideId, styleMap, value, rowNum, colNum } = props;
	const { color } = styleMap[value] ?? DEFAULT_STYLE_MAP[value];
	const style = asCssVars(["--block-color", color]);

	return (
		<span 
			data-side-id={sideId}
			data-row-num={rowNum}
			data-col-num={colNum}
			className={cubeValue} 
			style={style}
		/>
	);
};

export default FlatCube;
