import React, { useState, Suspense, lazy } from 'react';
import { Layout, Menu, Spin, Dropdown, Button } from '@arco-design/web-react';
import {
  IconApps,
  IconSettings,
  IconLink,
  IconThunderbolt,
  IconCode,
  IconFile,
  IconPlus,
  IconDown
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
import MenuIcon from '../../assets/menu.svg';
import styles from './index.module.scss';

// 懒加载各个模块
const OntologySceneGraph = lazy(() => import('../graph'));
const OntologySceneObjectType = lazy(() => import('../objectType'));
const OntologySceneAttributes = lazy(() => import('../attributes'));
const OntologySceneLinks = lazy(() => import('../links'));
const OntologySceneBehaviorActions = lazy(() => import('../behaviorActions'));
const OntologySceneBehaviorActionDetail = lazy(
  () => import('../behaviorActionDetail')
);
const OSFunctionDetail = lazy(() => import('../functionDetail'));
const OntologySceneFunctions = lazy(() => import('../functions'));
const OntologySceneBehaviorLog = lazy(() => import('../behaviorLog'));

const MenuItem = Menu.Item;
const MenuGroup = Menu.ItemGroup;

export default function OntologySceneDetail() {
  const history = useHistory();
  const location = useLocation();
  const { id: OSId, moduleType = ONTOLOGY_SCENE_MENU_ITEM_KEYS.GRAPH } =
    useParams<{
      id: string;
      moduleType: string;
    }>();
  // const match = useRouteMatch();

  const [sceneTitle, setSceneTitle] = useState('新建本体场景');

  const menuData = [
    {
      title: '实体与关系',
      key: ONTOLOGY_SCENE_MENU_GROUP_KEYS.ENTITIES,
      type: 'group',
      children: [
        {
          key: ONTOLOGY_SCENE_MENU_ITEM_KEYS.GRAPH,
          title: '本体图谱',
          icon: <MenuIcon fontSize={20} />
        },
        {
          key: ONTOLOGY_SCENE_MENU_ITEM_KEYS.OBJECT_TYPE,
          title: '对象类型',
          icon: <MenuIcon fontSize={20} />
        },
        {
          key: ONTOLOGY_SCENE_MENU_ITEM_KEYS.ATTRIBUTES,
          title: '属性',
          icon: <MenuIcon fontSize={20} />
        },
        {
          key: ONTOLOGY_SCENE_MENU_ITEM_KEYS.LINKS,
          title: '链接',
          icon: <MenuIcon fontSize={20} />
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
          icon: <MenuIcon fontSize={20} />
        },
        {
          key: ONTOLOGY_SCENE_MENU_ITEM_KEYS.FUNCTIONS,
          title: '函数',
          icon: <MenuIcon fontSize={20} />
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
          title: '执行记录',
          icon: <MenuIcon fontSize={20} />
        }
      ]
    }
  ];
  const basePath = `/tenant/compute/modaforge/ontologyScene/detail/${OSId}`;

  const handleMenuSelect = (key: string) => {
    // 导航到对应的子路由
    history.push(`${basePath}/${key}`);
  };

  const handleTitleEdit = (title: string) => {
    setSceneTitle(title);
  };

  const handlePublish = () => {
    // TODO: 实现发布逻辑
    console.log('发布更新');
  };

  const handleCreate = (type: string) => {
    // 根据类型导航到对应的创建页面
    const createPaths: Record<string, string> = {
      [ONTOLOGY_SCENE_MENU_ITEM_KEYS.OBJECT_TYPE]: `${basePath}/${type}/create`,
      [ONTOLOGY_SCENE_MENU_ITEM_KEYS.LINKS]: `${basePath}/${type}/create`,
      [ONTOLOGY_SCENE_MENU_ITEM_KEYS.BEHAVIOR_ACTIONS]: `${basePath}/${type}/create/_NEW_`,
      [ONTOLOGY_SCENE_MENU_ITEM_KEYS.FUNCTIONS]: `${basePath}/${type}/create`
    };
    const path = createPaths[type];
    if (path) {
      history.push(path);
    }
  };

  const createMenuItems = [
    {
      key: ONTOLOGY_SCENE_MENU_ITEM_KEYS.OBJECT_TYPE,
      title: '对象类型',
      description: '解释文案',
      icon: <IconSettings fontSize={20} />
    },
    {
      key: ONTOLOGY_SCENE_MENU_ITEM_KEYS.LINKS,
      title: '链接',
      description: '解释文案',
      icon: <IconLink fontSize={20} />
    },
    {
      key: ONTOLOGY_SCENE_MENU_ITEM_KEYS.BEHAVIOR_ACTIONS,
      title: '行为',
      description: '解释文案',
      icon: <IconThunderbolt fontSize={20} />
    },
    {
      key: ONTOLOGY_SCENE_MENU_ITEM_KEYS.FUNCTIONS,
      title: '函数',
      description: '解释文案',
      icon: <IconCode fontSize={20} />
    }
  ];

  const renderCreateDropdown = () => {
    return (
      <Menu className={styles['ontology-scene-detail-create-dropdown']}>
        {createMenuItems.map((item) => (
          <MenuItem key={item.key} onClick={() => handleCreate(item.key)}>
            <div className="flex items-center gap-[8px]">
              <div className="h-[36px] w-[36px] bg-[#DCDCDC]"></div>
              <div className="flex flex-col">
                <span className="text-[14px] font-[600] leading-[22px] text-[var(--color-text-1)]">
                  {item.title}
                </span>
                <span className="mt-[4px] text-[12px] leading-[18px] text-[var(--color-text-4)]">
                  {item.description}
                </span>
              </div>
            </div>
          </MenuItem>
        ))}
      </Menu>
    );
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
        sceneId={Number(OSId)}
      />
      <Layout className="flex flex-row overflow-hidden">
        <div className="flex min-w-[200px] flex-shrink-0 flex-col border-r border-[var(--color-border-2)] bg-white">
          <div className="px-[12px] pt-[24px]">
            <Dropdown
              droplist={renderCreateDropdown()}
              trigger="click"
              position="bl"
            >
              <Button
                type="primary"
                className="flex w-full items-center justify-center"
              >
                <IconPlus className="mr-[4px]" />
                创建
                <IconDown className="ml-[4px]" />
              </Button>
            </Dropdown>
          </div>
          <Menu
            selectedKeys={[moduleType]}
            className={cls(styles['ontology-scene-detail-menu'], 'flex-1')}
            // hasCollapseButton
          >
            {renderMenu()}
          </Menu>
        </div>

        <Layout.Content className="flex-1 overflow-auto bg-gray-50">
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center">
                <Spin />
              </div>
            }
          >
            <Switch>
              <Redirect
                exact
                from={basePath}
                to={`${basePath}/${ONTOLOGY_SCENE_MENU_ITEM_KEYS.GRAPH}`}
              />
              <Route
                path={`${basePath}/${ONTOLOGY_SCENE_MENU_ITEM_KEYS.GRAPH}`}
                component={OntologySceneGraph}
              />
              <Route
                path={`${basePath}/${ONTOLOGY_SCENE_MENU_ITEM_KEYS.OBJECT_TYPE}`}
                component={OntologySceneObjectType}
              />
              <Route
                path={`${basePath}/${ONTOLOGY_SCENE_MENU_ITEM_KEYS.ATTRIBUTES}`}
                component={OntologySceneAttributes}
              />
              <Route
                path={`${basePath}/${ONTOLOGY_SCENE_MENU_ITEM_KEYS.LINKS}`}
                component={OntologySceneLinks}
              />
              <Route
                path={`${basePath}/${ONTOLOGY_SCENE_MENU_ITEM_KEYS.BEHAVIOR_ACTIONS}`}
                component={OntologySceneBehaviorActions}
                exact
              />
              <Route
                path={`${basePath}/${ONTOLOGY_SCENE_MENU_ITEM_KEYS.BEHAVIOR_ACTIONS}/:pageMode/:actionId`}
                component={OntologySceneBehaviorActionDetail}
              />
              <Route
                path={`${basePath}/${ONTOLOGY_SCENE_MENU_ITEM_KEYS.FUNCTIONS}`}
                component={OntologySceneFunctions}
                exact
              />
              <Route
                path={`${basePath}/${ONTOLOGY_SCENE_MENU_ITEM_KEYS.FUNCTIONS}/:pageMode/:id`}
                component={OSFunctionDetail}
              />
              <Route
                path={`${basePath}/${ONTOLOGY_SCENE_MENU_ITEM_KEYS.BEHAVIOR_LOG}`}
                component={OntologySceneBehaviorLog}
              />
            </Switch>
          </Suspense>
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
