import React, { Component } from 'react'
import { widthBasic, WithEditInProps } from '../with-edit'
import renderText, { GetText } from './renderText';
import { Group } from '../input'
interface DataCellProps extends WithEditInProps<any> {
	children?: (props: ChildAgs) => React.ReactNode | Element | null;
	renderText?: GetText<any>,
	popupClassName?: string
	[propsname: string]: any
}
interface ChildAgs {
	onChange: (val: any) => void,
	onEnter: Function,
	value: any
}
@widthBasic()
export default class DataCell extends Component<DataCellProps> {
	componentDidMount() {
		const { popupClassName, setPopupClassName } = this.props;
		setPopupClassName(popupClassName)
	}
	render() {
		const {
			computedEdit,
			renderText: propsRenderText,
			addonBefore,
			addonAfter,
			children,
			onChange,
			onEnter,
			value,
		} = this.props;
		const child = typeof children == 'function' ? children : (props: ChildAgs) => children
		return <>
			{
				!computedEdit ? renderText(propsRenderText)({ ...this.props }) : <Group gant>
					{addonBefore ? <span className="ant-input-group-addon">{addonBefore}</span> : null}
					{child({ onChange, value, onEnter })}
					{addonAfter ? <span className="ant-input-group-addon">{addonAfter}</span> : null}
				</Group>
			}
		</>
	}
}