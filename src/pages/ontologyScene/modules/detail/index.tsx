import React, { useState } from 'react';
import { Layout, Menu } from '@arco-design/web-react';
import {
  IconApps,
  IconSettings,
  IconLink,
  IconThunderbolt,
  IconCode,
  IconFile,
  IconMenu
} from '@arco-design/web-react/icon';
import cls from 'classnames';
import Header from './components/Header';

const MenuItem = Menu.Item;
const MenuGroup = Menu.ItemGroup;

export default function OntologySceneDetail() {
  const [selectedMenuKey, setSelectedMenuKey] = useState('ontologyGraph');
  const [sceneTitle, setSceneTitle] = useState('新建本体场景');
  const [collapsed, setCollapsed] = useState(false);

  const menuData = [
    {
      title: '实体与关系',
      key: 'entities',
      type: 'group',
      children: [
        {
          key: 'ontologyGraph',
          title: '本体图谱',
          icon: <IconApps />
        },
        {
          key: 'objectType',
          title: '对象类型',
          icon: <IconSettings />
        },
        {
          key: 'attributes',
          title: '属性',
          icon: <IconSettings />
        },
        {
          key: 'links',
          title: '链接',
          icon: <IconLink />
        }
      ]
    },
    {
      title: '逻辑与行为',
      key: 'logic',
      type: 'group',
      children: [
        {
          key: 'behaviorActions',
          title: '行为动作',
          icon: <IconThunderbolt />
        },
        {
          key: 'functions',
          title: '函数',
          icon: <IconCode />
        }
      ]
    },
    {
      title: '运行与调试',
      key: 'debug',
      type: 'group',
      children: [
        {
          key: 'behaviorLog',
          title: '行为日志',
          icon: <IconFile />
        }
      ]
    }
  ];

  const handleMenuSelect = (key: string) => {
    setSelectedMenuKey(key);
  };

  const handleTitleEdit = (title: string) => {
    setSceneTitle(title);
  };

  const handlePublish = () => {
    // TODO: 实现发布逻辑
    console.log('发布更新');
  };

  const renderMenu = () => {
    return menuData.map((group) => {
      if (group.type === 'group') {
        return (
          <MenuGroup key={group.key} title={group.title}>
            {group.children?.map((item) => (
              <MenuItem
                key={item.key}
                onClick={() => handleMenuSelect(item.key)}
              >
                <span className="mr-[8px]">{item.icon}</span>
                <span>{item.title}</span>
              </MenuItem>
            ))}
          </MenuGroup>
        );
      }
      return null;
    });
  };

  return (
    <Layout className="h-full">
      <Header
        title={sceneTitle}
        status="未发布"
        onTitleEdit={handleTitleEdit}
        onPublish={handlePublish}
      />
      <Layout>
        <Layout.Sider
          collapsed={collapsed}
          onCollapse={setCollapsed}
          className={cls(
            'relative border-r border-gray-200 bg-white',
            collapsed && '!w-[64px]'
          )}
          width={240}
          collapsible
          trigger={null}
        >
          <div className="flex h-full flex-col">
            <Menu
              selectedKeys={[selectedMenuKey]}
              className={cls('flex-1 border-none pb-[56px]')}
              style={{ backgroundColor: 'transparent' }}
            >
              {renderMenu()}
            </Menu>

            {/* 底部汉堡菜单 */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-[12px]">
              <div
                className="flex cursor-pointer items-center justify-center"
                onClick={() => setCollapsed(!collapsed)}
              >
                <IconMenu className="text-[20px] text-gray-600" />
              </div>
            </div>
          </div>
        </Layout.Sider>
        <Layout.Content className="bg-gray-50">Content</Layout.Content>
      </Layout>
    </Layout>
  );
}
