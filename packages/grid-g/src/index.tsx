import React, { useState, useCallback, useRef, useMemo } from 'react';
import { AgGridReact, AgGridReactProps } from 'ag-grid-react';
import { ColDef, ColGroupDef, GridApi, GridOptions, ColumnApi, GridReadyEvent } from "ag-grid-community";
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
// import "ag-grid-enterprise"

import Header from '@header';
import { PartRequired, ProtoExtends } from "@util/type"
import { mapColumns } from './utils'

const defaultProps = {
    resizable: true,
    editable: false,
    filter: true,
    // 禁止调整列顺序
    lockPosition: true,
    // 直接在列头下面显示过滤器
    floatingFilter: false,
    // 分页
    pagination: true,
}

export enum Filter {
    Number = "agNumberColumnFilter",
    Text = 'agTextColumnFilter',
    Date = "agDateColumnFilter"
}

export type EditActions = (manage: object, keys: Array<string>) => React.ReactElement

export type OnReady = (api: GridApi) => void

// export type Columns = ColDef
export type Columns<T extends {} = {}> = {
    title: React.ReactNode,
    dataIndex: string,
    render?: (record: T) => React.ReactNode,
    children?: Columns<T>[],
    width?: React.ReactText,
    checkboxSelection?: boolean,
    sortable?: boolean,
    filter?: Filter,
    hide?: boolean
}

interface Props<T> {
    headerProps: {
        extra?: React.ReactNode,
        [key: string]: any
    },
    editActions: EditActions,
    columns: Columns<T>[],
    dataSource: T[],
    onReady: OnReady
}

type CustomProps<T> = ProtoExtends<typeof defaultProps, Props<T>>

export type GridProps<T> = CustomProps<T>

// export type GridProps<T> = ProtoExtends<AgGridReactProps, CustomProps<T>>


export type GridPropsPartial<T> = PartRequired<GridProps<T>, "columns" | "dataSource">


const Grid = function Grid<T>(props: GridPropsPartial<T>) {

    const { headerProps, editActions, onReady, columns: columnDefs, editable } = props

    const apiRef = useRef<GridApi>()

    const columnsRef = useRef<ColumnApi>()

    const onGridReady = useCallback(
        (params: GridReadyEvent) => {
            apiRef.current = params.api
            columnsRef.current = params.columnApi
            onReady && onReady(params.api)
            params.api.sizeColumnsToFit()
        },
        [onReady],
    )

    const columns = useMemo<ColDef[] | ColGroupDef[]>(() => mapColumns<T>(columnDefs, editable), [columnDefs, editable])

    const gridOptions = useMemo<GridOptions>(() => {
        const {
            dataSource: rowData,
            resizable,
            filter,
            lockPosition,
            floatingFilter,
            pagination,
        } = props
        return {
            rowData,
            columnDefs: columns,
            onGridReady,
            floatingFilter,
            pagination,
            paginationAutoPageSize: true,
            onRowEditingStopped: (e) => {
                console.log(e.data)
            },
            defaultColDef: {
                resizable,
                filter: floatingFilter ? false : filter,
                lockPosition
            }
        }
    }, [props, onGridReady, columns])

    const [autoGroupColumnDef, setautoGroupColumnDef] = useState({
        headerName: "Model",
        field: 'model',
        cellRenderer: "agGroupCellRenderer",
        cellRendererParams: {
            checkbox: true,
        }
    })

    const actions = useMemo(() => {
        if (editActions) {
            return editActions({}, [])
        }
        return undefined
    }, [editActions])

    const mergedHeaderProps = useMemo(() => {
        if (headerProps) {
            const props = headerProps || {}
            if (!props.extra) {
                props.extra = actions
            } else {
                props.extra = (
                    <>
                        {actions}
                        {headerProps.extra}
                    </>
                )
            }
            return props
        }
        return undefined
    }, [actions, headerProps])

    const header = useMemo(() => {
        if (mergedHeaderProps) {
            return (
                <Header {...mergedHeaderProps} />
            )
        }
        return undefined
    }, [mergedHeaderProps])

    return (
        <div className="ag-theme-balham" style={{ width: 600, height: 320 }}>
            {header}
            <AgGridReact
                gridOptions={gridOptions}
            // rowSelection="multiple"
            // animateRows
            // onGridReady={param => ref.current = param.api}
            // autoGroupColumnDef={autoGroupColumnDef}
            // groupSelectsChildren
            // componentWrappingElement="span"
            //  // 行拖拽
            // rowDragManaged
            // suppressRowDrag
            // defaultColDef={{
            //     sortable: true,
            //     filter: true,
            //     // headerComponentFramework: "div",
            //     headerComponentParams: {
            //         name: '123'
            //     }
            // }}
            />
        </div>
    )
}

Grid.defaultProps = defaultProps

export default Grid
