import '@data-cell/location-selector/style'
import CodeDecorator from '../_util/CodeDecorator'
import codes from './code'
/*! Start !*/
import React, { useState } from 'react'
import { LocationSelector, EditStatus } from '@gantd'

const WrapperValue = defaultValue => Component => props => {
  const [value, setValue] = useState(defaultValue)
  const factory = React.createFactory(Component)
  return factory({ value, setValue })
}

const onSave = (id, value, cb) => {
  console.log(id, value);
  cb()
}

const WrapperEdit = Component => props => {
  const [edit, setEdit] = useState(EditStatus.CANCEL)
  return React.createElement(Component, { edit, setEdit })
}
/*! Split !*/
const Demo1 = WrapperValue(["CHN", "510000", "510100"])(({ value, setValue }) => <LocationSelector value={value} onChange={setValue} onSave={onSave} />)
/*! Split !*/
const Demo2 = WrapperEdit(({ edit, setEdit }) => {
  return (
    <>
      {
        LocationSelector.getLocationName(["CHN", "120000", "120102"]).join('、')
      }
    </>
  )
})
/*! End !*/
const config = {
  inline: true,
  codes,
  useage: `
    <b>🌏 全球省市区三级联动</b></br>
    全球地区信息快速选择
  `,
  children: [
    {
      title: '基本使用',
      describe: '以数组形式传递编码',
      cmp: Demo1
    },
    {
      title: '根据代码获取地址的名称',
      describe: '调用静态方法LocationSelector.getLocationName，根据代码获取地址的名称',
      cmp: Demo2
    },
  ]
}


export default () => <CodeDecorator config={config} />