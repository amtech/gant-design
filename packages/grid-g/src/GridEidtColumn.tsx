import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import { RowNode } from '@ag-grid-community/core';
import classnames from 'classnames';
import { EditStatus } from '@data-cell';
import { set, cloneDeep, get, isEmpty, debounce } from 'lodash';
import { isEqualObj } from './gridManager/utils';
import { stopPropagationForAgGrid } from './utils';
const defalutProps = {
  autoFocus: true,
  edit: EditStatus.EDIT,
};
export default WrapperComponent =>
  forwardRef(function GridEidtColumn(props: any, ref: any) {
    const {
      value,
      stopEditing,
      api,
      data,
      colDef: { field },
      props: fieldProps,
      changeFormatter,
      context: { size, editRowDataChanged, editingRowDataChange, watchEditChange },
      refName = 'wrapperRef',
      valuePropName = 'value',
      node,
    } = props;
    const [newValue, setNewValue] = useState(value);
    const divRef = useRef<HTMLDivElement>(null);
    const inputRef: any = useRef();
    const compoentProps = useMemo(() => {
      if (typeof fieldProps === 'function') return fieldProps(node.data, props);
      return fieldProps;
    }, [fieldProps, node.data, props]);
    const onChange = useCallback(
      val => {
        let chageVal = val;
        let { data } = node;
        data = cloneDeep(data);
        if (typeof changeFormatter === 'function') chageVal = changeFormatter(val, data);
        setNewValue(chageVal);
        if (!watchEditChange)
          editingRowDataChange(set(data, field, chageVal), field, chageVal, value);
      },
      [changeFormatter, editingRowDataChange, field, node, watchEditChange],
    );

    const onBlur = useCallback(
      (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        stopEditing();
      },
      [stopEditing],
    );

    useImperativeHandle(
      ref,
      () => {
        return {
          refresh() {
            return false;
          },
          getValue: () => {
            if (!watchEditChange) return get(node, `data.${field}`);
            if (isEqualObj(value, newValue)) return newValue;
            const newData = cloneDeep(get(node, `data`));
            set(newData, field, newValue);
            editRowDataChanged(newData, field, newValue, value, cloneDeep(data));
            return value;
          },
        };
      },
      [value, newValue, field, data, editRowDataChanged],
    );
    useEffect(() => {
      setTimeout(() => {
        inputRef.current && inputRef.current.focus();
      }, 10);
    }, []);
    const wrapperClick = useCallback((event: MouseEvent) => {
      stopPropagationForAgGrid(event);
    }, []);
    useEffect(() => {
      divRef.current?.addEventListener('click', wrapperClick);
      return () => {
        divRef.current?.removeEventListener('click', wrapperClick);
      };
    }, []);
    const wrapperProps = useMemo(() => {
      return {
        [refName]: inputRef,
        [valuePropName]: newValue,
      };
    }, [valuePropName, refName, newValue]);
    return (
      <div className={classnames('gant-grid-cell-editing')} ref={divRef}>
        <WrapperComponent
          wrapperRef={inputRef}
          {...compoentProps}
          {...defalutProps}
          {...wrapperProps}
          onChange={onChange}
          size={size}
          onBlur={onBlur}
        />
      </div>
    );
  });
