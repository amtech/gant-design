import '@packages/submenu-g/src/style'
import CodeDecorator from '../_util/CodeDecorator'
import code from './code.js'
import _ from 'lodash'
/*! Start !*/
import React, { useState, useRef } from 'react'
import { Avatar, Icon } from 'antd'
import { Submenu } from '@gantd';
/*! Split !*/
function BasicUse() {
  const menuData = [
    {
      title: '个人设置',
      icon: <Icon type='idcard' />,
      path: 'personal',
      count: 10
    },
    {
      title: '语言偏好',
      icon: <Icon type='global' />,
      path: 'preferences',
      count: 10
    },
    {
      title: '修改密码',
      icon: <Icon type='lock' />,
      path: 'editpwd',
      count: 10
    },
    {
      title: '关注领域',
      icon: <Icon type='alert' />,
      path: 'focus',
      count: 10
    },
    {
      title: '历史消息',
      icon: <Icon type='history' />,
      path: 'historymsg',
      count: 10
    },
    {
      title: '账号绑定',
      icon: <Icon type='user' />,
      path: 'accountbind',
      count: 10
    }
  ].map(item => ({ ...item, key: item.path }));

  const [selectedKey, setSelectedKey] = useState(menuData[0].path)
  const menuBoxRef = useRef(null);
  const onSelectedChange = (key, record, item) => setSelectedKey(key);
  const onSwitchChange = (mode) => {
    // console.log('当前状态', mode)
  }
  const activeMenu = _.find(menuData, i => i.path === selectedKey)
  return (
    <Submenu
      menuData={menuData}
      selectedKey={selectedKey}
      width={180}
      setMenuBoxRef={ref => { menuBoxRef.current = ref }}
      showFlipOverFooter
      onCollapseChange={(collapsed) => {
        console.log(collapsed)
        console.log(menuBoxRef)
      }}
      onSelectedChange={onSelectedChange}
      onSwitchChange={onSwitchChange}
      extra={
        <div style={{ padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div>
            <Avatar size={64} src={'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1560143638308&di=bd43a25e740c8010cd803bffb6191a74&imgtype=0&src=http%3A%2F%2Fimg3.duitang.com%2Fuploads%2Fitem%2F201605%2F07%2F20160507191419_J2m8R.thumb.700_0.jpeg'} />
            <div style={{ textAlign: 'center' }}>777777</div>
          </div>
        </div>
      }
    >
      <div style={{ padding: '20px', height: 400 }}>
        {activeMenu['title']}
      </div>
    </Submenu>
  )
}
/*! Split !*/
function TopLayout() {
  const menuData = [
    {
      title: '个人设置',
      icon: <Icon type='idcard' />,
      path: 'personal',
      count: 10
    },
    {
      title: '语言偏好',
      icon: <Icon type='global' />,
      path: 'preferences',
      count: 10
    },
    {
      title: '修改密码',
      icon: <Icon type='lock' />,
      path: 'editpwd',
      count: 10
    },
    {
      title: '关注领域',
      icon: <Icon type='alert' />,
      path: 'focus',
      count: 10
    },
    {
      title: '历史消息',
      icon: <Icon type='history' />,
      path: 'historymsg',
      count: 10
    },
    {
      title: '账号绑定',
      icon: <Icon type='user' />,
      path: 'accountbind',
      count: 10
    }
  ].map(item => ({ ...item, key: item.path }));

  const [selectedKey, setSelectedKey] = useState(menuData[0].path);

  const onSelectedChange = (key, record, item) => setSelectedKey(key);
  const activeMenu = _.find(menuData, i => i.path === selectedKey)
  return (
    <Submenu
      menuData={menuData}
      selectedKey={selectedKey}
      mode='horizontal'
      showMenuMagnet
      fixedTopHeight={0}
      onSelectedChange={onSelectedChange}
    >
      <div style={{ padding: '20px', height: 400 }}>
        {activeMenu['title']}
      </div>
    </Submenu>
  )
}
/*! Split !*/
function ExtraUse() {
  const menuData = [
    {
      title: '个人设置',
      icon: <Icon type='idcard' />,
      path: 'personal',
      count: 10
    },
    {
      title: '语言偏好',
      icon: <Icon type='global' />,
      path: 'preferences',
      count: 10
    },
    {
      title: '修改密码',
      icon: <Icon type='lock' />,
      path: 'editpwd',
      count: 10
    },
    {
      title: '关注领域',
      icon: <Icon type='alert' />,
      path: 'focus',
      count: 10
    },
    {
      title: '历史消息',
      icon: <Icon type='history' />,
      path: 'historymsg',
      count: 10
    },
    {
      title: '账号绑定',
      icon: <Icon type='user' />,
      path: 'accountbind',
      count: 10
    }
  ].map(item => ({ ...item, key: item.path }));

  const [selectedKey, setSelectedKey] = useState(menuData[0].path);

  const onSelectedChange = (key, record, item) => setSelectedKey(key);
  const activeMenu = _.find(menuData, i => i.path === selectedKey)
  return (
    <Submenu
      menuData={menuData}
      selectedKey={selectedKey}
      collapsed={true}
      onSelectedChange={onSelectedChange}
    >
      <div style={{ padding: '20px' }}>
        {activeMenu['title']}
      </div>
    </Submenu>
  )
}

/*! End !*/

const config = {
  codes: code,
  useage: `
  <b>🚪 侧边收缩菜单</b></br>
  在详情页面中，一个对象的描述可能是多个片段的</br>
  <b>📚 可快速切换菜单展示为页签效果</b></br>
  在横向空间很局限时，用户可以把菜单快速切换为顶部页签效果</br>
  <b>⛏ 磁吸效果</b></br>
  当菜单滚动超出屏幕时，可以开启磁吸效果</br>
  <b>💈 菜单页脚快速切换</b></br>
  可以快速切换上下菜单</br>
  `,
  // inline: true,
  children: [
    {
      title: '基本用法',
      describe: '最简单的用法，默认为左右布局，可切换上下布局,可翻页的页脚功能',
      cmp: BasicUse
    },
    {
      title: '默认上下布局',
      describe: '默认上下布局,磁吸功能',
      cmp: TopLayout
    },
    {
      title: '不显示额外区域，默认收起',
      describe: '不显示额外区域，默认收起',
      cmp: ExtraUse
    }
  ]
};

export default () => <CodeDecorator config={config} />