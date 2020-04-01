
import { ColGroupDef, ColDef, IsColumnFuncParams, IsColumnFunc } from 'ag-grid-community'
import { get, isNumber } from 'lodash'
import { Columns, RowSelection, ColumnEdiatble } from './index'
import { Size } from './interface'
import EditorCol from './GridEidtColumn'
import RenderCol from './GirdRenderColumn'

type Col = ColGroupDef | ColDef

function itemisgroup(item, children): item is ColGroupDef {
    return !!children
}

function ColEditableFn(fn: ColumnEdiatble<any>): IsColumnFunc {
    return ({ data }) => fn(data)
}

export const mapColumns = <T>(columns: Columns<T>[], editable: boolean, rowSelection: RowSelection, size: Size, getRowNodeId: any): Col[] => {

    const cheboxIndex = get(rowSelection, "checkboxIndex")

    function getColumnDefs(columns: Columns<T>[]) {
        return columns.map(({ title: headerName, dataIndex: field, children, render, editConfig, fixed, ...item }, index) => {
            const ColEditable = typeof editConfig !== 'undefined'

            const colDef = {
                ...item,
                headerName,
                field,
                cellRendererParams: {
                    size,
                    render,
                    rowkey: getRowNodeId
                },
                cellRendererFramework: RenderCol
            } as Col


            if (!itemisgroup(colDef, children)) {
                colDef.checkboxSelection = typeof cheboxIndex === "number" && cheboxIndex === index

                // 当前列允许编辑
                if (ColEditable) {
                    colDef.cellEditorParams = {
                        size,
                        props: editConfig.props,
                        changeFormatter: editConfig.changeFormatter,
                        rowkey: getRowNodeId
                    }
                    colDef.cellEditorFramework = EditorCol(editConfig.component)
                    colDef.editable = editable ? ColEditableFn(editConfig.editable) : false
                }
                if (fixed) colDef.pinned = fixed
            }
            else if (itemisgroup(colDef, children)) {
                if (children && children.length) {
                    colDef.children = getColumnDefs(children)
                }
            }
            return colDef
        })
    }

    return getColumnDefs(columns)
}


// 去除掉boolean类型
export type NonBool<T> = T extends boolean ? never : T


// boolean类型
export function isbool(t: any): t is boolean {
    return typeof t === 'boolean'
}
// number
export function isnumber(t: any): t is number {
    return typeof t === 'number'
}
// string
export function isstring(t: any): t is string {
    return typeof t === 'string'
}