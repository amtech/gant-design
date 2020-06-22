import { AgGridReactProps } from 'ag-grid-react';
import {
  GridApi as AgGridApi,
  GridReadyEvent,
  ValueFormatterParams,
  ColDef,
  IServerSideGetRowsParams,
  ColumnApi as AgColumnApi,
  RowNode,
} from 'ag-grid-community';
import { defaultProps, defaultRowSelection } from './index';
import { Rules, RuleType, RuleItem } from 'async-validator';
import { PaginationProps } from 'antd/lib/pagination';
import GridManager from './gridManager';
// 编辑框大小
export enum Size {
  small = 'small',
  default = 'default',
}

// 过滤器
export enum Filter {
  Number = 'agNumberColumnFilter',
  Text = 'agTextColumnFilter',
  Date = 'agDateColumnFilter',
}

// 数据修改行为
export enum DataActions {
  add = 'add',
  remove = 'remove',
  modify = 'modify',
  removeTag = 'remove_tag',
}

export enum Fixed {
  left = 'left',
  right = 'right',
}

export enum Move {
  up = 'up',
  down = 'down',
}

export type ProtoExtends<T, U> = U &
  {
    [K in Exclude<keyof T, keyof U>]?: NonNullable<T[K]>;
  };

export type PartRequired<T, U extends keyof T> = Required<Pick<T, U>> & Partial<Omit<T, U>>;

/**删除数据时的回调方法，可以返回boolean、array或者是一个能够提供boolean、array类型返回值的promise */
export type RemoveCallBack = (selected: any[]) => Promise<boolean> | boolean;

export type OnReady = (api: GridReadyEvent, gridManager: GridManager) => void;

export type GridApi = AgGridApi;

export type ColumnApi = AgColumnApi;

export type RowSelection = {
  /**是否多选 */
  type?: 'single' | 'multiple';
  /**checkbox所在索引 */
  checkboxIndex?: number;
  onSelect?: (keys: string[], rows: any[]) => void;
  selectedKeys?: string[];
  showDefalutCheckbox?: boolean;
  defaultSelectionCol?: ColDef;
  rowMultiSelectWithClick?: boolean;
  rowDeselection?: boolean;
};

type EditComponentProps = {
  // onChange: (value: any) => void
};

export type EditConfig<T> = {
  component: React.ComponentClass<EditComponentProps> | React.FunctionComponent<EditComponentProps>;
  /**是否开启编辑，当全局editable为true时生效 */
  editable?: ColumnEdiatble<T>;
  props?: (record: T, rowIndex: number) => Object;
  changeFormatter?: (v: any, record: any) => any;
  onCellChange?: (value: any, record: T, records: T[]) => void;
  refName?: string;
  valuePropName?: string;
  rules?: RuleItem | RuleItem[];
  signable: ColumnEdiatble<T>;
};
export interface CreateConfig {
  id: string; // id对应字段名称
  path: string;
  toPath: (parentPath: string[], data?: any) => any;
  defaultParentPath?: string[] | number[];
}
export type ColumnEdiatble<T> = boolean | ((record: T) => boolean);

export type RowKey<T> = (data: T) => string;

// Column Api
export interface Columns<T extends {} = {}> extends ColDef {
  /**标题 */
  title?: React.ReactNode;
  /**索引的字段名 */
  fieldName: string;
  /**单元格渲染函数 */
  render?: (text: string, record: any, rowIndex: number) => React.ReactNode;
  /**子节点 */
  children?: Columns<T>[];
  /**当前列宽度,如果没有，将以defaultColumnWidth显示 */
  /**是否显示选择器 */
  checkboxSelection?: boolean;
  /**当前列是否支持排序 */
  sortable?: boolean;
  /**当前列的过滤形式 */
  filter?: Filter;
  /**是否隐藏 */
  hide?: boolean;
  /**编辑时配置 */
  editConfig?: EditConfig<T>;
  /**固定列 */
  fixed?: Fixed | undefined;
  valueFormatter?: (params: ValueFormatterParams) => string;
  rowGroupIndex?: number;
  type?: string | string[];
  [props: string]: any;
  /** Group ID */
  groupId?: string;
  /** Open by Default */
  openByDefault?: boolean;
  /** If true, group cannot be broken up by column moving, child columns will always appear side by side, however you can rearrange child columns within the group */
  marryChildren?: boolean;
  /** The custom header group component to be used for rendering the component header. If none specified the default ag-Grid is used**/
  headerGroupComponent?: string;
  /** The custom header group component to be used for rendering the component header in the hosting framework (ie: React/Angular). If none specified the default ag-Grid is used**/
  headerGroupComponentFramework?: any;
  /** The custom header group component to be used for rendering the component header. If none specified the default ag-Grid is used**/
  headerGroupComponentParams?: any;
}

export type Pagination = Omit<
  ProtoExtends<
    PaginationProps,
    {
      beginIndex?: number;
      onChange?: (beginIndex: number, pageSize?: number, current?: number) => void;
    }
  >,
  'onShowSizeChange'
>;

// Grid Api
export interface Props<T extends any> {
  columns: Columns<T>[];
  dataSource: T[];
  removeShowLine: boolean;
  filter?: boolean;
  resizable: boolean;
  sortable: boolean;
  onReady: OnReady;
  rowSelection: RowSelection | true;
  rowkey: RowKey<T> | string;
  editable: boolean;
  width?: string | number;
  height?: string | number;
  treeData?: boolean;
  pagination: Pagination;
  loading: boolean;
  className: string;
  isServerSideGroup: (data: any) => boolean;
  treeDataChildrenName: string;
  locale: object;
  serverGroupExpend: (param: IServerSideGetRowsParams, cd: (row: any[]) => void) => void;
  serialNumber?: boolean | ColDef;
  isCompute?: boolean;
  onCellEditChange: (record: any, fieldName: string, newValue: any, oldValue: any) => any;
  onCellEditingChange: (record: any, fieldName: string, newValue: any, oldValue: any) => any;
  openEditSign: boolean;
  createConfig?: CreateConfig;
  hideCut?: boolean;
  onRowsCut?: (rows: RowNode[]) => boolean;
  onRowsPaste?: (rows: RowNode[], targetRow?: RowNode) => boolean;
  onRowsPasteEnd?: (data: any) => void;
}

export type CustomProps<T> = ProtoExtends<typeof defaultProps, Props<T>>;

// export type GridProps<T> = CustomProps<T>

export type GridProps<T> = ProtoExtends<AgGridReactProps, CustomProps<T>>;

export type GridPropsPartial<T> = PartRequired<GridProps<T>, 'columns' | 'dataSource' | 'rowkey'>;
