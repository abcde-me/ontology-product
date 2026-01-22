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
import { MENU_GROUP_KEYS, MENU_ITEM_KEYS } from '../../common/constants';
import styles from './index.module.scss';
import DataApi from '@/assets/sider/data-api.svg';

// 懒加载各个模块
const OntologySceneGraph = lazy(() => import('../graph'));
const OntologySceneObjectType = lazy(() => import('../objectType'));
const OntologySceneAttributes = lazy(() => import('../attributes'));
const OntologySceneLinks = lazy(() => import('../links'));
const OntologySceneBehaviorActions = lazy(() => import('../behaviorActions'));
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
    return searchParams.get('activeTab') || MENU_ITEM_KEYS.GRAPH;
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
      key: MENU_GROUP_KEYS.ENTITIES,
      type: 'group',
      children: [
        {
          key: MENU_ITEM_KEYS.GRAPH,
          title: '本体图谱',
          icon: <IconApps fontSize={20} />
        },
        {
          key: MENU_ITEM_KEYS.OBJECT_TYPE,
          title: '对象类型',
          icon: <IconSettings fontSize={20} />
        },
        {
          key: MENU_ITEM_KEYS.ATTRIBUTES,
          title: '属性',
          icon: <IconSettings fontSize={20} />
        },
        {
          key: MENU_ITEM_KEYS.LINKS,
          title: '链接',
          icon: <IconLink fontSize={20} />
        }
      ]
    },
    {
      title: '逻辑与行为',
      key: MENU_GROUP_KEYS.LOGIC,
      type: 'group',
      children: [
        {
          key: MENU_ITEM_KEYS.BEHAVIOR_ACTIONS,
          title: '行为动作',
          icon: <IconThunderbolt fontSize={20} />
        },
        {
          key: MENU_ITEM_KEYS.FUNCTIONS,
          title: '函数',
          icon: <IconCode fontSize={20} />
        }
      ]
    },
    {
      title: '运行与调试',
      key: MENU_GROUP_KEYS.DEBUG,
      type: 'group',
      children: [
        {
          key: MENU_ITEM_KEYS.BEHAVIOR_LOG,
          title: '行为日志',
          icon: <IconFile fontSize={20} />
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
      [MENU_ITEM_KEYS.GRAPH]: OntologySceneGraph,
      [MENU_ITEM_KEYS.OBJECT_TYPE]: OntologySceneObjectType,
      [MENU_ITEM_KEYS.ATTRIBUTES]: OntologySceneAttributes,
      [MENU_ITEM_KEYS.LINKS]: OntologySceneLinks,
      [MENU_ITEM_KEYS.BEHAVIOR_ACTIONS]: OntologySceneBehaviorActions,
      [MENU_ITEM_KEYS.FUNCTIONS]: OntologySceneFunctions,
      [MENU_ITEM_KEYS.BEHAVIOR_LOG]: OntologySceneBehaviorLog
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
    <Layout className={cls('h-full', styles['ontology-scene-detail'])}>
      <Header
        title={sceneTitle}
        status="未发布"
        onTitleEdit={handleTitleEdit}
        onPublish={handlePublish}
      />
      <Layout className="flex flex-row">
        <Menu
          selectedKeys={[activeTab]}
          className={cls(
            styles['ontology-scene-detail-menu'],
            'max-w-[200px] border-r border-[var(--color-border-2)] bg-white'
          )}
          hasCollapseButton
        >
          {renderMenu()}
        </Menu>

        <Layout.Content className="bg-gray-50">
          {renderContent()}
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
