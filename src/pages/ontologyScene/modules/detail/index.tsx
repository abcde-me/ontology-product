import React, { useState, useEffect, Suspense, lazy } from 'react';
import {
  Layout,
  Menu,
  Spin,
  Dropdown,
  Button,
  Message,
  Popover
} from '@arco-design/web-react';
import {
  IconApps,
  IconSettings,
  IconLink,
  IconThunderbolt,
  IconCode,
  IconFile,
  IconPlus,
  IconDown,
  IconUp,
  IconMenuFold,
  IconMenuUnfold
} from '@arco-design/web-react/icon';
import {
  useHistory,
  useParams,
  useRouteMatch,
  useLocation,
  Switch,
  Route,
  Redirect
} from 'react-router-dom';
import cls from 'classnames';
import Header from './components/Header';
import {
  ONTOLOGY_SCENE_MENU_GROUP_KEYS,
  ONTOLOGY_SCENE_MENU_ITEM_KEYS
} from '@/common/constants';
import { getOntologyModelDetail } from '@/api/ontologySceneLibrary/ontologyScene';
import { OntologScene } from '@/types/ontologySceneApi';
import { isOntologyApiSuccess, getApiErrorMessage } from '@/utils/apiResponse';
import { useUserInfoStore } from '@/store/userInfoStore';
import { isDevBypassEnabled } from '@/utils/devFallback';
import {
  buildDevOntologyModelDetailStub,
  cacheOntologySceneDetailSnapshot,
  getCachedOntologySceneDetailSnapshot
} from '@/utils/devOntologyStore';
import MenuIcon from '../../assets/menu.svg';
import styles from './index.module.scss';
import CreateObjectIcon from '../../assets/create-object.svg';
import CreateLinkIcon from '../../assets/create-link.svg';
import CreateBehaviorIcon from '../../assets/create-behavior.svg';
import CreateFunctionIcon from '../../assets/create-function.svg';
import MenuObjectIcon from '../../assets/menu-object.svg';
import MenuGraphIcon from '../../assets/menu-graph.svg';
import MenuLinkIcon from '../../assets/menu-link.svg';
import MenuAttributeIcon from '../../assets/menu-attribute.svg';
import MenuBehaviorIcon from '../../assets/menu-behavior.svg';
import MenuFunctionIcon from '../../assets/menu-function.svg';
import MenuBehaviorLogIcon from '../../assets/menu-log.svg';
import { PermissionWrapper } from '@/components/PermissionGuard';
import { ONTOLOGY_PERMISSIONS } from '@/config/permissions';
import { EllipsisPopover } from '@/pages/ontologyScene/components';

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
  const match = useRouteMatch({
    path: '/tenant/compute/onto/ontologyScene/detail/:id',
    exact: false
  });
  const { id: OSId, moduleType = '' } = useParams<{
    id: string;
    moduleType: string;
  }>();

  const [sceneTitle, setSceneTitle] = useState('新建本体场景');
  const [sceneDetail, setSceneDetail] = useState<OntologScene | null>(null);
  const [loading, setLoading] = useState(false);
  // 控制侧边栏横向收起/展开状态
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 页面进入时请求场景详情
  useEffect(() => {
    const fetchSceneDetail = async () => {
      const sceneId = Number(OSId);
      if (!OSId || !Number.isFinite(sceneId) || sceneId <= 0) {
        Message.error('场景 ID 无效');
        return;
      }

      setLoading(true);
      try {
        await useUserInfoStore.getState().ensureProjectReady();

        const response = await getOntologyModelDetail({
          id: sceneId
        });

        if (isOntologyApiSuccess(response) && response.data) {
          const sceneData = response.data;
          cacheOntologySceneDetailSnapshot(sceneData);
          setSceneDetail(sceneData);
          if (sceneData.name) {
            setSceneTitle(sceneData.name);
          }
          return;
        }

        if (isDevBypassEnabled()) {
          const cached = getCachedOntologySceneDetailSnapshot(sceneId);
          if (cached) {
            setSceneDetail(cached);
            if (cached.name) {
              setSceneTitle(cached.name);
            }
            return;
          }

          const stub = buildDevOntologyModelDetailStub(sceneId);
          if (stub.data) {
            setSceneDetail(stub.data);
            setSceneTitle(stub.data.name || `本体场景-${sceneId}`);
            return;
          }
        }

        Message.error(response.message || '获取场景详情失败');
      } catch (error) {
        if (isDevBypassEnabled()) {
          const cached = getCachedOntologySceneDetailSnapshot(sceneId);
          if (cached) {
            setSceneDetail(cached);
            if (cached.name) {
              setSceneTitle(cached.name);
            }
            return;
          }

          const stub = buildDevOntologyModelDetailStub(sceneId);
          if (stub.data) {
            setSceneDetail(stub.data);
            setSceneTitle(stub.data.name || `本体场景-${sceneId}`);
            return;
          }
        }

        Message.error(getApiErrorMessage(error, '获取场景详情失败'));
        console.error('获取场景详情失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSceneDetail();
  }, [OSId]);

  const menuData = [
    {
      title: '实体与关系',
      key: ONTOLOGY_SCENE_MENU_GROUP_KEYS.ENTITIES,
      type: 'group',
      children: [
        {
          key: ONTOLOGY_SCENE_MENU_ITEM_KEYS.GRAPH,
          title: '本体图谱',
          icon: <MenuGraphIcon fontSize={20} />
        },
        {
          key: ONTOLOGY_SCENE_MENU_ITEM_KEYS.OBJECT_TYPE,
          title: '对象类型',
          icon: <MenuObjectIcon fontSize={20} />
        },
        {
          key: ONTOLOGY_SCENE_MENU_ITEM_KEYS.ATTRIBUTES,
          title: '属性',
          icon: <MenuAttributeIcon fontSize={20} />
        },
        {
          key: ONTOLOGY_SCENE_MENU_ITEM_KEYS.LINKS,
          title: '链接',
          icon: <MenuLinkIcon fontSize={20} />
        }
      ]
    },
    {
      title: '逻辑与行为',
      key: ONTOLOGY_SCENE_MENU_GROUP_KEYS.LOGIC,
      type: 'group',
      children: [
        {
          key: ONTOLOGY_SCENE_MENU_ITEM_KEYS.FUNCTIONS,
          title: '函数',
          icon: <MenuFunctionIcon fontSize={20} />
        },
        {
          key: ONTOLOGY_SCENE_MENU_ITEM_KEYS.BEHAVIOR_ACTIONS,
          title: '行为',
          icon: <MenuBehaviorIcon fontSize={20} />
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
          icon: <MenuBehaviorLogIcon fontSize={20} />
        }
      ]
    }
  ];

  const basePath =
    match?.path ?? '/tenant/compute/onto/ontologyScene/detail/:id';
  const baseUrl =
    match?.url ?? `/tenant/compute/onto/ontologyScene/detail/${OSId || ''}`;

  const activeTab = React.useMemo(() => {
    const pathname = location.pathname;
    // 匹配第一个子路由段（菜单项 key），而不是最后一个
    // 例如：/tenant/compute/onto/ontologyScene/detail/123/behaviorActions/create/_NEW_
    // 应该匹配到 behaviorActions，而不是 _NEW_
    const routeMatch = pathname.match(
      /\/tenant\/compute\/onto\/ontologyScene\/detail\/[^/]+\/([^/]+)/
    );
    const matchedKey = routeMatch ? routeMatch[1] : '';
    // 验证匹配到的 key 是否是有效的菜单项 key
    const validKeys = Object.values(ONTOLOGY_SCENE_MENU_ITEM_KEYS);
    if (validKeys.includes(matchedKey as any)) {
      return matchedKey;
    }
    // 如果没有匹配到有效的 key，使用 moduleType 参数（如果存在）
    if (moduleType && validKeys.includes(moduleType as any)) {
      return moduleType;
    }
    // 默认返回 GRAPH
    return ONTOLOGY_SCENE_MENU_ITEM_KEYS.GRAPH;
  }, [location.pathname, moduleType]);

  const handleMenuSelect = (key: string) => {
    // 导航到对应的子路由
    history.push(`${baseUrl}/${key}`);
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
      [ONTOLOGY_SCENE_MENU_ITEM_KEYS.OBJECT_TYPE]: `${baseUrl}/${type}/create`,
      [ONTOLOGY_SCENE_MENU_ITEM_KEYS.LINKS]: `${baseUrl}/${type}/create`,
      [ONTOLOGY_SCENE_MENU_ITEM_KEYS.BEHAVIOR_ACTIONS]: `${baseUrl}/${type}/create/_NEW_`,
      [ONTOLOGY_SCENE_MENU_ITEM_KEYS.FUNCTIONS]: `${baseUrl}/${type}/create/_NEW_`
    };
    const path = createPaths[type];
    if (path) {
      history.push(path);
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  const createMenuItems = [
    {
      key: ONTOLOGY_SCENE_MENU_ITEM_KEYS.OBJECT_TYPE,
      title: '对象类型',
      description: '核心数据模型的原子单位,描述系统中可独立存在的实体',
      icon: <CreateObjectIcon fontSize={40} />
    },
    {
      key: ONTOLOGY_SCENE_MENU_ITEM_KEYS.LINKS,
      title: '链接',
      description: '描述不同实体对象之间的语义联系与数据拓扑结构',
      icon: <CreateLinkIcon fontSize={40} />
    },
    {
      key: ONTOLOGY_SCENE_MENU_ITEM_KEYS.FUNCTIONS,
      title: '函数',
      description: '用于定义计算属性和行为逻辑的底层代码实现',
      icon: <CreateFunctionIcon fontSize={40} />
    },
    {
      key: ONTOLOGY_SCENE_MENU_ITEM_KEYS.BEHAVIOR_ACTIONS,
      title: '行为',
      description: '行为定义可在对象上执行的操作，封装业务逻辑与状态流转',
      icon: <CreateBehaviorIcon fontSize={40} />
    }
  ];

  const renderCreateDropdown = () => {
    return (
      <Menu className={styles['ontology-scene-detail-create-dropdown']}>
        {createMenuItems.map((item) => (
          <MenuItem key={item.key} onClick={() => handleCreate(item.key)}>
            <div className="flex items-center gap-[8px]">
              <div className="flex items-center justify-center">
                {item.icon}
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="text-[14px] font-[600] leading-[22px] text-[var(--color-text-1)]">
                  {item.title}
                </span>
                <EllipsisPopover
                  value={item.description}
                  className="min-w-0 text-[12px] leading-[18px] text-[var(--color-text-4)]"
                />
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
          <MenuGroup
            key={group.key}
            title={
              !sidebarCollapsed ? (
                <span className="text-[12px] leading-[38px] text-[var(--color-text-4)]">
                  {group.title}
                </span>
              ) : null
            }
          >
            {group.children?.map((item) => {
              const menuItemContent = (
                <MenuItem
                  key={item.key}
                  onClick={() => handleMenuSelect(item.key)}
                >
                  <span className={cls(sidebarCollapsed ? '' : 'mr-[8px]')}>
                    {item.icon}
                  </span>
                  {!sidebarCollapsed && <span>{item.title}</span>}
                </MenuItem>
              );

              if (sidebarCollapsed) {
                return (
                  <Popover key={item.key} content={item.title} position="right">
                    {menuItemContent}
                  </Popover>
                );
              }

              return menuItemContent;
            })}
          </MenuGroup>
        );
      }
      return null;
    });
  };

  return (
    <div className="flex min-h-[100vh] w-full flex-col bg-white">
      <Layout
        className={cls(
          'flex h-full min-h-0 flex-1 flex-col',
          styles['ontology-scene-detail']
        )}
      >
        <Header
          title={sceneTitle}
          status="未发布"
          onTitleEdit={handleTitleEdit}
          onPublish={handlePublish}
          sceneId={Number(OSId)}
          sceneDetail={sceneDetail}
          onSceneUpdate={(updatedScene) => {
            if (updatedScene) {
              setSceneDetail(updatedScene);
              if (updatedScene.name) {
                setSceneTitle(updatedScene.name);
              }
              cacheOntologySceneDetailSnapshot(updatedScene);
              return;
            }

            if (OSId) {
              getOntologyModelDetail({ id: Number(OSId) })
                .then((response) => {
                  if (isOntologyApiSuccess(response) && response.data) {
                    setSceneDetail(response.data);
                    if (response.data.name) {
                      setSceneTitle(response.data.name);
                    }
                  }
                })
                .catch((error) => {
                  console.error('更新场景详情失败:', error);
                });
            }
          }}
        />
        <Layout
          className="relative flex min-h-0 flex-1 flex-row overflow-hidden"
          id={'ontologySceneContent'}
        >
          <div
            className={cls(
              'flex flex-shrink-0 flex-col border-r border-[var(--color-border-2)] bg-white transition-all duration-200',
              styles['ontology-scene-detail-sidebar'],
              sidebarCollapsed &&
                styles['ontology-scene-detail-sidebar-collapsed']
            )}
          >
            <div
              className={cls(
                'pt-[24px]',
                sidebarCollapsed ? 'px-[8px]' : 'px-[12px]'
              )}
            >
              <PermissionWrapper permission={ONTOLOGY_PERMISSIONS.CREATE}>
                <Dropdown
                  droplist={renderCreateDropdown()}
                  trigger="click"
                  position="bl"
                >
                  <Button
                    className={cls(
                      '!flex w-full items-center justify-center',
                      styles['ontology-scene-detail-create-button']
                    )}
                    type={'outline'}
                  >
                    <IconPlus
                      className={cls(sidebarCollapsed ? '' : 'mr-[4px]')}
                    />
                    {!sidebarCollapsed && '创建'}
                  </Button>
                </Dropdown>
              </PermissionWrapper>
            </div>
            <Menu
              selectedKeys={[activeTab]}
              className={cls(styles['ontology-scene-detail-menu'], 'flex-1')}
            >
              {renderMenu()}
            </Menu>
            <div className="p-[8px]">
              <Button
                type="text"
                className="w-full"
                onClick={toggleSidebar}
                icon={
                  sidebarCollapsed ? (
                    <IconMenuUnfold className="text-[20px] text-[var(--color-text-2)]" />
                  ) : (
                    <IconMenuFold className="text-[20px] text-[var(--color-text-2)]" />
                  )
                }
              />
            </div>
          </div>

          <Layout.Content className="relative z-0 flex min-h-0 flex-1 flex-col overflow-hidden">
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
                  to={`${baseUrl}/${ONTOLOGY_SCENE_MENU_ITEM_KEYS.GRAPH}`}
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
                  path={`${basePath}/${ONTOLOGY_SCENE_MENU_ITEM_KEYS.FUNCTIONS}/:pageMode/:functionId`}
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
    </div>
  );
}
