import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Layout, Menu, Spin } from '@arco-design/web-react';
import {
  IconApps,
  IconSettings,
  IconLink,
  IconThunderbolt,
  IconCode,
  IconFile,
  IconMenu
} from '@arco-design/web-react/icon';
import { useLocation, useHistory } from 'react-router-dom';
import { updateQueryParams } from '@/utils/url';
import cls from 'classnames';
import Header from './components/Header';
import BehaviorActionDetail from '@/pages/ontologyScene/modules/behaviorActionDetail';

// 懒加载各个模块
const OntologySceneGraph = lazy(() => import('../graph'));
const OntologySceneObjectType = lazy(() => import('../objectType'));
const OntologySceneAttributes = lazy(() => import('../attributes'));
const OntologySceneLinks = lazy(() => import('../links'));
const OntologySceneBehaviorActions = lazy(() => import('../behaviorActions'));
const BehaviorActionDetailPage = lazy(() => import('../behaviorActionDetail'));
const OntologySceneFunctions = lazy(() => import('../functions'));
const OntologySceneBehaviorLog = lazy(() => import('../behaviorLog'));

const MenuItem = Menu.Item;
const MenuGroup = Menu.ItemGroup;

export default function OntologySceneDetail() {
  const location = useLocation();
  const history = useHistory();

  // 从URL参数中获取activeTab作为初始值
  const getInitialActiveTab = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('activeTab') || 'graph';
  };

  const [activeTab, setActiveTab] = useState(getInitialActiveTab);
  const [sceneTitle, setSceneTitle] = useState('新建本体场景');
  const [collapsed, setCollapsed] = useState(false);

  // 从URL参数中获取activeTab并设置选中状态（监听URL变化）
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const activeTabFromUrl = searchParams.get('activeTab');
    if (activeTabFromUrl) {
      setActiveTab(activeTabFromUrl);
    }
  }, [location.search]);

  const menuData = [
    {
      title: '实体与关系',
      key: 'entities',
      type: 'group',
      children: [
        {
          key: 'graph',
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
    setActiveTab(key);
    // 更新URL参数
    updateQueryParams(history, { activeTab: key });
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

  // 根据activeTab渲染对应的模块组件
  const renderContent = () => {
    const componentMap: Record<
      string,
      React.LazyExoticComponent<React.ComponentType<any>>
    > = {
      graph: OntologySceneGraph,
      objectType: OntologySceneObjectType,
      attributes: OntologySceneAttributes,
      links: OntologySceneLinks,
      behaviorActions: BehaviorActionDetailPage,
      functions: OntologySceneFunctions,
      behaviorLog: OntologySceneBehaviorLog
    };

    const Component = componentMap[activeTab] || OntologySceneGraph;

    return (
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center">
            <Spin />
          </div>
        }
      >
        <Component />
      </Suspense>
    );
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
              selectedKeys={[activeTab]}
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
        <Layout.Content className="bg-gray-50">
          {renderContent()}
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
