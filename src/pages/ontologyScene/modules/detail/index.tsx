import React, { useState, Suspense, lazy } from 'react';
import { Layout, Menu } from '@arco-design/web-react';
import {
  IconApps,
  IconSettings,
  IconLink,
  IconThunderbolt,
  IconCode,
  IconFile
} from '@arco-design/web-react/icon';
import {
  useHistory,
  useParams,
  useRouteMatch,
  useLocation
} from 'react-router-dom';
import { Switch, Route, Redirect } from 'react-router';
import cls from 'classnames';
import Header from './components/Header';
import {
  ONTOLOGY_SCENE_MENU_GROUP_KEYS,
  ONTOLOGY_SCENE_MENU_ITEM_KEYS
} from '@/common/constants';
import styles from './index.module.scss';

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
  const history = useHistory();
  const location = useLocation();
  const params = useParams<{ id: string }>();
  const match = useRouteMatch();

  const [sceneTitle, setSceneTitle] = useState('新建本体场景');

  // 从当前路径中提取子路由名称，用于菜单选中状态
  const activeTab = React.useMemo(() => {
    const pathname = location.pathname;
    const routeMatch = pathname.match(
      /\/tenant\/compute\/modaforge\/ontologyScene\/detail\/[^/]+\/([^/]+)$/
    );
    return routeMatch ? routeMatch[1] : ONTOLOGY_SCENE_MENU_ITEM_KEYS.GRAPH;
  }, [location.pathname]);

  const menuData = [
    {
      title: '实体与关系',
      key: ONTOLOGY_SCENE_MENU_GROUP_KEYS.ENTITIES,
      type: 'group',
      children: [
        {
          key: ONTOLOGY_SCENE_MENU_ITEM_KEYS.GRAPH,
          title: '本体图谱',
          icon: <IconApps fontSize={20} />
        },
        {
          key: ONTOLOGY_SCENE_MENU_ITEM_KEYS.OBJECT_TYPE,
          title: '对象类型',
          icon: <IconSettings fontSize={20} />
        },
        {
          key: ONTOLOGY_SCENE_MENU_ITEM_KEYS.ATTRIBUTES,
          title: '属性',
          icon: <IconSettings fontSize={20} />
        },
        {
          key: ONTOLOGY_SCENE_MENU_ITEM_KEYS.LINKS,
          title: '链接',
          icon: <IconLink fontSize={20} />
        }
      ]
    },
    {
      title: '逻辑与行为',
      key: ONTOLOGY_SCENE_MENU_GROUP_KEYS.LOGIC,
      type: 'group',
      children: [
        {
          key: ONTOLOGY_SCENE_MENU_ITEM_KEYS.BEHAVIOR_ACTIONS,
          title: '行为动作',
          icon: <IconThunderbolt fontSize={20} />
        },
        {
          key: ONTOLOGY_SCENE_MENU_ITEM_KEYS.FUNCTIONS,
          title: '函数',
          icon: <IconCode fontSize={20} />
        }
      ]
    },
    {
      title: '运行与调试',
      key: ONTOLOGY_SCENE_MENU_GROUP_KEYS.DEBUG,
      type: 'group',
      children: [
        {
          key: ONTOLOGY_SCENE_MENU_ITEM_KEYS.BEHAVIOR_LOG,
          title: '行为日志',
          icon: <IconFile fontSize={20} />
        }
      ]
    }
  ];

  const handleMenuSelect = (key: string) => {
    // 导航到对应的子路由
    const basePath = `${match.url}`;
    history.push(`${basePath}/${key}`);
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
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center">
                <div>加载中...</div>
              </div>
            }
          >
            <Switch>
              <Redirect
                exact
                from={match.path}
                to={`${match.url}/${ONTOLOGY_SCENE_MENU_ITEM_KEYS.GRAPH}`}
              />
              <Route
                path={`${match.path}/${ONTOLOGY_SCENE_MENU_ITEM_KEYS.GRAPH}`}
                component={OntologySceneGraph}
              />
              <Route
                path={`${match.path}/${ONTOLOGY_SCENE_MENU_ITEM_KEYS.OBJECT_TYPE}`}
                component={OntologySceneObjectType}
              />
              <Route
                path={`${match.path}/${ONTOLOGY_SCENE_MENU_ITEM_KEYS.ATTRIBUTES}`}
                component={OntologySceneAttributes}
              />
              <Route
                path={`${match.path}/${ONTOLOGY_SCENE_MENU_ITEM_KEYS.LINKS}`}
                component={OntologySceneLinks}
              />
              <Route
                path={`${match.path}/${ONTOLOGY_SCENE_MENU_ITEM_KEYS.BEHAVIOR_ACTIONS}`}
                component={OntologySceneBehaviorActions}
              />
              <Route
                path={`${match.path}/${ONTOLOGY_SCENE_MENU_ITEM_KEYS.FUNCTIONS}`}
                component={OntologySceneFunctions}
              />
              <Route
                path={`${match.path}/${ONTOLOGY_SCENE_MENU_ITEM_KEYS.BEHAVIOR_LOG}`}
                component={OntologySceneBehaviorLog}
              />
            </Switch>
          </Suspense>
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
