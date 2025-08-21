import React, { useMemo } from 'react';
import styles, { 
	flatCube, cubeSide, cubeValue, actionButton 
} from './flat-cube.module.scss';
import { 
	CubeAxis, CubeCellValue, CubeSide, CubeSideData, forEachCellOnSide, 
	forEachSide 
} from '@model/cube';
import { 
	IPrettyPuzzleCubeProps, PuzzleCubeCellStyleMap 
} from './generic-cube';
import { getCubeSize } from '@model/geometry';
import { DeepReadonly, forceNever } from '@/common';
import {
	SliceDirection, SliceRotationButton, FaceRotationDirection, FaceRotationButton, 
	FocusFaceButton
} from '../workflow/';
import { CubeActions } from './usePuzzleCube';

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
	const { cubeData, styleMap = DEFAULT_STYLE_MAP, cubeDispatch } = props;
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
				cubeDispatch={cubeDispatch}
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
	readonly cubeDispatch: React.Dispatch<CubeActions>;
}

const FlatCubeSide: React.FC<IFlatCubeSideProps> = props => {
	const { side, styleMap, sideId, size, cubeDispatch } = props;
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
				cubeDispatch={cubeDispatch}
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
	readonly cubeDispatch: React.Dispatch<CubeActions>;
}

function useSlotButton(
	sideId: CubeSide, 
	size: number,
	row: number, 
	col: number, 
	dispatch: React.Dispatch<CubeActions>
): React.ReactElement | null {
	return useMemo(() => {
		const half = Math.floor(size / 2);
		/**
		 * Odd Parity:
		 * +------------+------------+-------------+
		 * |            |            |             |
		 * | Face-Left  |  Slice Up  |  Face-Right |
		 * |            |            |             |
		 * +------------+------------+-------------+
		 * |            |            |             |
		 * | Slice Left |    Focus   | Slice Right |
		 * |            |            |             |
		 * +------------+------------+-------------+
		 * |            |            |             |
		 * |            | Slice Down |             |
		 * |            |            |             |
		 * +------------+------------+-------------+
		 * 
		 * Even Parity will be the same, but choose the top-left option
		 * available. A 2x2x2 cube loses the slices and puts focus in the
		 * bottom right.
		 */

		// Focus
		if (row === half && col === half) {
			return (
				<FocusFaceButton 
					cubeDispatch={dispatch} 
					sideId={sideId} 
				/>
			);
		}

		// Vertical Slice
		if (   (row === 0 || row === size - 1) 
			&& (col !== 0 && col !== size - 1)
		) {
			const direction = row === 0 
				? SliceDirection.Up : SliceDirection.Down;
			let axis: CubeAxis;
			switch (sideId) {
				case CubeSide.Left:
				case CubeSide.Right:
					axis = "Z"; 
					break;
				case CubeSide.Front:
				case CubeSide.Back:
				case CubeSide.Top:
				case CubeSide.Bottom:
					axis = "Y"; 
					break; 
				default:
					forceNever(sideId);
			}
			return (
				<SliceRotationButton
					dispatch={dispatch}
					rotationDirection={direction}
					axis={axis}
					sliceStart={col}
					sideReference={sideId}
					size={size}
				/>
			);
		}
		
		// Horizontal Slice
		if (   (row !== 0 && row !== size - 1) 
			&& (col === 0 || col === size - 1)
		) {
			const direction: SliceDirection = col === 0 
				? SliceDirection.Left : SliceDirection.Right;
			let axis: CubeAxis;
			switch (sideId) {
				case CubeSide.Left: 
				case CubeSide.Front:
				case CubeSide.Right:
				case CubeSide.Back:
					axis = "X"; 
					break;
				case CubeSide.Top:
				case CubeSide.Bottom:
					axis = "Z"; 
					break; 
				default:
					forceNever(sideId);
			}
			return (
				<SliceRotationButton
					dispatch={dispatch}
					rotationDirection={direction}
					axis={axis}
					sliceStart={row}
					sideReference={sideId}
					size={size}
				/>
			);
		}

		// Rotate Face
		if (row === 0 && (col === 0 || col === size - 1)) {
			const direction = col === 0 
				? FaceRotationDirection.CounterClockwise 
				: FaceRotationDirection.Clockwise;
			return (
				<FaceRotationButton 
					dispatch={dispatch}
					faceId={sideId}
					rotationDirection={direction}
				/>
			);
		}
		return null;
	}, [sideId, size, row, col, dispatch]);
}

const FlatCubeValue: React.FC<IFlatCubeValueProps> = props => {
	const { 
		size, sideId, styleMap, value, rowNum, colNum, cubeDispatch 
	} = props;
	const { color } = styleMap[value] ?? DEFAULT_STYLE_MAP[value];
	const style = asCssVars(["--block-color", color]);
	
	const button = useSlotButton(sideId, size, rowNum, colNum, cubeDispatch);
	return (
		<span 
			data-side-id={sideId}
			data-row-num={rowNum}
			data-col-num={colNum}
			className={cubeValue} 
			style={style}
		>
			<span className={actionButton}>
				{button}
			</span>
		</span>
	);
};

export default FlatCube;
