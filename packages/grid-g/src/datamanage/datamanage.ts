import { ColumnApi, GridApi, RowNode, RowNodeTransaction, ColDef } from 'ag-grid-community';
import { List, fromJS, Map } from 'immutable'
import { EventEmitter } from 'events'
import { cloneDeep, get } from 'lodash'


import History from './history'
import ListProxy from './listproxy'
import DataProxy from './dataproxy'
import { findChildren, removeDeepItem, getPureRecord, getPureList, getIndexPath } from './utils'
import { Record, DataActions, RemoveCallBack, Move } from '../interface'
import { isnumber, isbool, isDeleted, trackEditValueChange } from '../utils'

interface RemoveOptions {
    removeChildren: boolean,
    showLine: boolean
}

const _add = Map<string, any>()
const _modify = Map<string, any>()
const _removed = Map<string, any>()

class DataManage<T extends Record = any> extends EventEmitter {


    // private _state: List<T>
    private _originList: T[]
    private history: History<T>
    _add = _add
    _modify = _modify
    _removed = _removed
    private _dataSource: T[]
    removeShowLine: boolean

    cellEvents: EventEmitter = new EventEmitter()

    gridApi: GridApi
    columnApi: ColumnApi

    // 获取nodeid
    getRowNodeId: (d: any) => string
    // 获取group key path
    getServerSideGroupKey: (d: any) => string
    childrenName: string = 'children'



    constructor() {
        super();
        this.history = new History()
        this.history.on("manager:update", this.update.bind(this))
        this.history.on("manager:diff", this.pushDiff.bind(this))
    }


    /**是否有变更 */
    get isChanged() {
        return this.history.isChanged
    }

    get state() {
        return this.history.currentState
    }

    // 用于渲染的包含__origin的数据,
    get renderList(): T[] {
        return this.state.toJS()
    }

    // 是否可以前进
    public get canRedo() {
        return this.history.canRedo
    }

    // 是否可以撤销
    public get canUndo() {
        return this.history.canUndo
    }

    /**
     * 获取原始纯净数据、不会包含新增的数据
     */
    get purelist() {
        return getPureList(this.renderList)
    }

    // 撤销
    undo() {
        this.history.undo()
        this.updateDiff()
    }

    // 前进
    redo() {
        this.history.redo()
        this.updateDiff()
    }

    // 初始化
    reset() {
        const state = fromJS(this._originList)
        /**清空diff数据 */
        this._add = _add
        this._modify = _modify
        this._removed = _removed

        this.history.init(state)
    }

    /**进入编辑，初始化状态 */
    edit() {

    }

    /**取消编辑 */
    cancel() {
        const firstList = this.history.first
        this.history.init(firstList)
    }

    /**保存, 清空历史栈 */
    save() {
        const lastList = this.history.last
        const list = getPureList(this.renderList, true)
        const diff = this.diff
        this.history.init(lastList)

        return {
            list,
            diff
        }
    }

    // 编辑时更新history并且触发组件更新
    private update() {
        // 触发组件更新，将最新的列表返回
        this.emit("update", this.renderList)
    }

    init(dataSource: T[]) {
        // 添加__origin属性
        const list = cloneDeep(dataSource)
        // 重置的时候使用的原始数据
        this._originList = list
        this.reset()
    }

    /**
     * 
     * @param item 添加的数据
     * @param index 添加的位置
     */
    create(item: T | T[], index?: number): void;
    /**
     * 
     * @param item 添加的数据
     * @param node 添加的相对节点
     * @param index 添加的位置
     * @param isChild 是否是作为子节点插入
     */
    create(item: T | T[], node: RowNode, index?: number, isChild?: boolean): void
    create(item: T | T[], node: RowNode, isChild?: boolean, index?: number): void
    create(item: T | T[], node: RowNode | number = 0, index: number | boolean = 0, isChild?: number | boolean) {
        const isArray = Array.isArray(item)
        const itemNodes = isArray ? item : [item]
        const immuNodes = itemNodes.map(item => fromJS({ ...item, _rowType: DataActions.add }))
        let newState = null
        if (isnumber(node)) {
            const index = node
            // newState = this.state.insert(index, itemNode)
            newState = this.state.splice(index, 0, ...immuNodes)
        } else {
            const indexPath = getIndexPath(node).flatMap(index => [index, this.childrenName])
            let addIndex: number, append: boolean
            if (isnumber(index)) {
                addIndex = index
                if (isbool(isChild)) append = isChild
                else append = true // undefined
            } else {
                append = index
                if (isnumber(isChild)) addIndex = isChild
                else addIndex = 0 // undefined
            }
            const paths = append ? indexPath : indexPath.slice(0, -2)
            // newState = this.state.updateIn(paths, children => children ? children.insert(addIndex, itemNode) : List([]).push(itemNode))
            newState = this.state.updateIn(paths, children => children ? children.splice(addIndex, 0, ...immuNodes) : List([]).concat(immuNodes))
        }

        itemNodes.forEach(item => {
            const id = this.getRowNodeId(item)
            this._add = this._add.set(id, item)
        })

        if (newState !== this.state) this.history.push(newState)
    }

    remove(cb: RemoveCallBack, options: RemoveOptions): Promise<Array<RowNode>> {
        const { showLine = this.removeShowLine, removeChildren = true } = options || {}

        const selectedNodes = this.gridApi.getSelectedNodes()
        const selected = selectedNodes.map(node => node.data)
        return new Promise((res, rej) => {
            let allowDelete: boolean | Promise<boolean> = true
            if (cb) allowDelete = cb(selected)
            res(allowDelete)
        }).then(allowDelete => {
            if (allowDelete) {
                if (selectedNodes.length) {
                    const children = selectedNodes.flatMap(node => findChildren(node))
                    if (removeChildren) {
                        const deleteRows = [...selectedNodes, ...children]
                        return deleteRows
                    } else {
                        if (children.length) {
                            throw new Error("某个节点的子节点未选中")
                        }
                        return selectedNodes
                    }
                }
            }
            return Promise.reject()
        }).then((deleteRows) => {
            let rows = deleteRows
            if (showLine) {
                // 在showLine模式下可能出现的问题,过滤掉之前删除过的数据
                rows = deleteRows.filter(row => !isDeleted(row.data))
            }
            if (!rows.length) return []
            const keyPathsArray = rows.map(node => {
                const { data, id } = node
                /**处理diff数据 */
                if (data._rowType === DataActions.add) {
                    // 添加的节点
                    if (this._add.has(id)) this._add = this._add.delete(id)
                } else {
                    if (data._rowType === DataActions.modify && this._modify.has(id)) {
                        // 移除修改的节点
                        this._modify = this._modify.delete(id)
                    }
                    this._removed = this._removed.set(id, getPureRecord({ ...data, ...data._rowData }))
                }

                const paths = getIndexPath(node)
                return {
                    id: node.id,
                    paths
                }
            })

            /**处理state */
            const newState = keyPathsArray.reduce((state, { id, paths }) => {
                return this.removeInner(state, paths, id, showLine)
            }, this.state)
            // 添加history数据
            this.history.push(newState)
            return deleteRows
        })

    }

    /**
     * 根据showLine来执行对对应的操作
     * @param state 当前state
     * @param keyPath 节点的keypath
     * @param id 节点id
     * @param showLine 是否显示删除线
     */
    private removeInner<T>(state: List<T>, keyPath: (string | number)[], id: string, showLine: boolean = this.removeShowLine): List<T> {
        const _this = this
        const fullPath = this.getFlatKey(keyPath)
        const parentPath = fullPath.slice(0, -1);
        const item = state.getIn(fullPath)
        const rowType = item.get("_rowType")
        if (!showLine || rowType === DataActions.add) {
            return state.updateIn(parentPath, (parentState) => parentState.filter(item => _this.getRowNodeId(item.toJS()) !== id))
        } else {
            return state.updateIn(fullPath, item => {
                // return item.set('isDeleted', true)
                return item.merge({
                    isDeleted: true,
                    _rowType: DataActions.remove
                })
            })
        }
    }

    // 修改
    modify(changed: any) {
        const { data, node: { id }, colDef: { field }, value } = changed
        const listProxy = new ListProxy(this)
        this.cellEvents.emit(field, value, data, listProxy.list)

        if (listProxy.isChanged) {
            this.updateWithListProxy(listProxy)
        } else {
            if (data._rowType === DataActions.add) {
                this._add = this._add.set(id, getPureRecord(data))
            }
            else {
                if (data._rowData) {
                    this._modify = this._modify.set(id, getPureRecord(data))
                } else {
                    this._modify = this._modify.delete(id)
                }
            }
            let keyPath = getIndexPath(changed.node)

            const paths = this.getFlatKey(keyPath)
            const newState = this.state.updateIn(paths, node => fromJS(data))
            this.history.push(newState)
        }
    }

    /**添加子级节点 */
    appendChild(groupKeys: (string | number)[], children: T[], isCompute: boolean) {
        this.history.appendChild(groupKeys, this.childrenName, fromJS(children), this.getServerSideGroupKey, isCompute)
    }


    /**遍历所有节点 */
    mapNodes(cb: (node: any) => void) {
        const proxy = new ListProxy(this)
        proxy.list.forEach(cb)
        this.updateWithListProxy(proxy)
    }

    updateWithListProxy(proxy: ListProxy) {
        if (proxy.isChanged) {
            let newList = fromJS(proxy.originList)
            if (proxy.modifyNodes.length) {
                // 保证与编辑输入框的行为一致
                newList = proxy.modifyNodes.reduce((state, { keyPath, node }) => {
                    const fullPath = this.getFlatKey(keyPath)
                    return state.setIn(fullPath, fromJS(node))
                }, newList)
            }
            if (proxy.removedNodes.length) {
                newList = proxy.removedNodes.reduce((state, { keyPath, id }) => this.removeInner(state, keyPath, id, this.removeShowLine), newList)
            }
            this.history.push(newList)
        }
    }

    /**遍历选中的节点 */
    /**
     * 
     * @param cb 对每个节点的回调
     * @param isSignal 是否只遍历第一个节点
     */
    mapSelectedNodes(cb: (node: any) => void, isSignal: boolean = false) {
        const selected = this.gridApi.getSelectedNodes()
        const selectedList = isSignal ? selected.slice(0, 1) : selected
        const ids = selectedList.map(node => node.id)
        this.mapNodesIds(ids, cb)
    }

    mapNodesIds(ids: any[], cb: (node: any) => void) {
        const keys = Array.isArray(ids) ? ids : [ids]
        if (!keys.length) return
        const actionList = keys.map(key => {
            const node = this.gridApi.getRowNode(key)
            const indexPath = getIndexPath(node)
            const dataProxy = new DataProxy(node.data, this)
            cb(dataProxy.proxy)
            return {
                ...dataProxy,
                indexPath
            }
        })
        const newState = actionList.reduce((state, { action, indexPath, id, newData }) => {
            if (action === DataActions.remove) return this.removeInner(state, indexPath, id)
            else if (action === DataActions.modify) {
                const fullPath = this.getFlatKey(indexPath)
                return state.updateIn(fullPath, record => {
                    return fromJS(newData)
                })
            }
            return state
        }, this.state)
        this.history.push(newState)
    }

    /**将当前diff推送到history,在每次history.push的时候会执行 */
    pushDiff() {
        this.history.handleDiff({
            add: this._add,
            modify: this._modify,
            remove: this._removed,
        })
    }

    /**撤销重做的时候执行 */
    updateDiff() {
        const diff = this.history.currentDiff
        this._add = diff.get("add")
        this._modify = diff.get("modify")
        this._removed = diff.get("remove")
    }

    get diff() {
        return {
            add: getPureList([...this._add.toArray()]),
            remove: getPureList([...this._removed.toArray()]),
            update: getPureList([...this._modify.toArray()])
        }
    }

    getFlatKey(indexPath: any[]) {
        return indexPath.flatMap((key, index) => index === 0 ? key : [this.childrenName, key])
    }

}

export default DataManage