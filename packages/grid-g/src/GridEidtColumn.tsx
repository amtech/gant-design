import React, { forwardRef, useImperativeHandle, useState, useRef, useCallback, useMemo, useEffect } from 'react'
import classnames from 'classnames';
import { EditStatus } from '@data-cell'
import { trackEditValueChange, } from './utils'
const defalutProps = {
	autoFocus: true,
	edit: EditStatus.EDIT,
}
export default (WrapperComponent) => forwardRef(function GridEidtColumn(props: any, ref: any) {
	const { value, stopEditing, api, data, colDef: { field }, props: fieldProps, changeFormatter, rowkey, rowIndex, context: { size } } = props;
	const [cacheValue, setCacheValue] = useState(value);
	const inputRef: any = useRef()
	const onChange = useCallback((val) => {
		let chageVal = val
		if (typeof changeFormatter === 'function') chageVal = changeFormatter(val, data)
		setCacheValue(chageVal)
	}, [changeFormatter])
	const onBlur = useCallback(() => {
		stopEditing()
	}, [stopEditing])
	const rowId = useMemo(() => {
		if (!rowkey) return rowIndex;
		return rowkey(data)
	}, [rowIndex, rowkey, data])
	const compoentProps = useMemo(() => {
		if (typeof fieldProps === 'function') return fieldProps(data);
		return fieldProps
	}, [fieldProps, data])
	useImperativeHandle(ref, () => {
		return {
			getValue: () => {
				if (value === cacheValue) return cacheValue;
				let newRowData: any = trackEditValueChange(data, field, cacheValue, value)
				const rowNode = api.getRowNode(rowId);
				rowNode.setData(newRowData);
				return cacheValue
			}
		};
	}, [cacheValue, data, value, field, cacheValue, rowId]);
	useEffect(() => {
		setTimeout(() => {
			inputRef.current && inputRef.current.focus()
		}, 10);
	}, []);
	return (
		<div className={classnames('gant-grid-cell-editing')}>
			<WrapperComponent wrapperRef={inputRef} {...compoentProps} value={cacheValue} {...defalutProps} onChange={onChange} size={size} onBlur={onBlur} />
		</div>
	)
})
