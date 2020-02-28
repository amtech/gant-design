import React, { useState } from 'react'
import Header from '@packages/header-g/src'
import CodeDecorator from '../_util/CodeDecorator'
import reactElementToJSXString from 'react-element-to-jsx-string';
import code from './code'

function codeFun(props) {
  return (<div></div>)
}
 
const config = {
  codes: code.map(V => V),
  inline: true,
  useage: `
    🤡 项目中经常会用到的一些公共方法
    `,
  children: [
    {
      title: 'hex2hsl | 将十六进制颜色值转变为HSL颜色值',
      describe: '',
      cmp: codeFun,
    },
    {
      title: 'guid | 生成uuid',
      describe: '',
      cmp: codeFun,
    },
    {
      title: 'getType | 判断类型',
      describe: '',
      cmp: codeFun,
    },
    {
      title: 'deepCopy4JSON | JSON深拷贝',
      describe: '',
      cmp: codeFun,
    },
    {
      title: 'JSONisEqual | JSON数据相等',
      describe: '',
      cmp: codeFun,
    },
    {
      title: 'IEVersion | 判断ie版本',
      describe: '',
      cmp: codeFun,
    },
    {
      title: 'isIE | 判断是否为ie浏览器',
      describe: '',
      cmp: codeFun,
    },
    {
      title: 'getCookie | 获取cookie',
      describe: '',
      cmp: codeFun,
    },
    {
      title: 'delCookie | 删除cookie',
      describe: '',
      cmp: codeFun,
    },
    {
      title: 'setCookie | 设置cookie',
      describe: '',
      cmp: codeFun,
    },
    {
      title: 'throttle | 节流函数',
      describe: '',
      cmp: codeFun,
    },
    {
      title: 'getKey | 获取一个随机Key',
      describe: '',
      cmp: codeFun,
    },
    {
      title: 'generateUuid | 生成uuid',
      describe: '',
      cmp: codeFun,
    },
    {
      title: 'randomString | 生成随机字符串',
      describe: '',
      cmp: codeFun,
    },
    {
      title: 'isParamsEmpty | 判断参数是不是空的',
      describe: '',
      cmp: codeFun,
    },
    {
      title: 'spanCalculate | 根据width换算栅格占位格数',
      describe: ' ',
      cmp: codeFun,
    },
    {
      title: 'resolveLocationQuery | 解析路由的查询参数query',
      describe: '',
      cmp: codeFun,
    },
    {
      title: 'findDomParentNode | 向上递归冒泡找节点',
      describe: '',
      cmp: codeFun,
    },
    {
      title: 'getPerformanceTiming | 前端性能分析',
      describe: '',
      cmp: codeFun,
    },

  ]
};
export default () => <CodeDecorator config={config} />
