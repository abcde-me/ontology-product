import AppstoreIcon from '@/assets/appstore.svg';
import ToolstoreIcon from '@/assets/toolstore.svg';
import WorkspaceIcon from '@/assets/workspace.svg';
import UserSpaceIcon from '@/assets/user-space.svg';
import SpaceIcon1 from '@/assets/space-icon1.svg';
import SpaceIcon2 from '@/assets/space-icon2.svg';
import IconApps from '@/assets/home.svg';
import { useQueryParams } from '@/utils';
import {
  Button,
  Layout,
  Popover,
  Menu,
  Input,
  Trigger
} from '@arco-design/web-react';
import {
  IconLeftCircle,
  IconMenuFold,
  IconMenuUnfold,
  IconPlus,
  IconDown,
  IconSettings
} from '@arco-design/web-react/icon';
import cn from 'classnames';
import React, { useEffect, useMemo, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { isSingleApp } from '@/utils/env';
import { CreateSpaceModal } from '@/pages/systemMgmt/createSpaceModal';
import { getFlatRoutes, routes } from '../route';
import './sider.css';

const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;
const MenuGroup = Menu.ItemGroup;
const Sider = Layout.Sider;

type MenuModel = {
  title: string;
  icon?: any;
  path?: string;
  activePaths?: string[];
  key: string;
  children?: MenuModel[];
  className?: string;
  type?: string;
};
const customHeader = {
  '/tenant/compute/appforge/appConfig': () =>
    import('@/pages/appCreate/header'),
  '/tenant/compute/appforge/appCreate': () =>
    import('@/pages/appCreate/header'),
  '/tenant/compute/appforge/appChat': () => import('@/pages/appChat/header'),
  // '/tenant/compute/appforge/workflowConfig': () =>
  //   import('@/pages/workflowConfig/customHeader'),
  '/tenant/compute/appforge/workflowPublic': () =>
    import('@/pages/workflowPublic/customHeader')
};
// const menus: MenuModel[] = [
//   {
//     title: '主页',
//     icon: (
//       <IconApps className="appforge-sider-icon mr-[12px] flex-none text-[22px]" />
//     ),
//     path: '/tenant/compute/appforge/home',
//     key: 'home'
//   },
//   //智能体v2
//   {
//     title: '智能体',
//     icon: (
//       <IconApps className="appforge-sider-icon mr-[12px] flex-none text-[22px]" />
//     ),
//     path: '/tenant/compute/appforge/agentTwo',
//     key: 'agentTwo'
//   },
//   //知识库v2
//   {
//     title: '知识库',
//     icon: (
//       <IconApps className="appforge-sider-icon mr-[12px] flex-none text-[22px]" />
//     ),
//     path: '/tenant/compute/appforge/knowledgeBaseTwo',
//     key: 'knowledgeBaseTwo'
//   },

//   //工作流v2
//   {
//     title: '工作流',
//     icon: (
//       <IconApps className="appforge-sider-icon mr-[12px] flex-none text-[22px]" />
//     ),
//     path: '/tenant/compute/appforge/workFolwTwo',
//     key: 'workFolwTwo'
//   },
//   {
//     title: '应用',
//     icon: (
//       // <WorkspaceIcon className="appforge-sider-icon mr-[12px] flex-none  text-[22px] " />
//       <AppstoreIcon className="appforge-sider-icon mr-[12px] flex-none  text-[22px]" />
//     ),
//     key: 'workspace',
//     children: [
//       {
//         title: '我的应用',
//         children: [],
//         icon: null,
//         path: '/tenant/compute/appforge/appList',
//         activePaths: [
//           '/tenant/compute/appforge/appList',
//           '/tenant/compute/appforge/appConfig',
//           '/tenant/compute/appforge/appCreate'
//         ],
//         key: 'myapp'
//       },
//       {
//         title: '应用广场',
//         icon: null,
//         key: 'appstore',
//         path: '/tenant/compute/appforge/appStore'
//       },
//       {
//         title: 'Prompt工程',
//         icon: null,
//         key: 'prompt',
//         path: '/tenant/compute/appforge/prompt'
//       },
//       {
//         title: '自定义插件',
//         children: [],
//         icon: null,
//         path: '/tenant/compute/appforge/toolList',
//         key: 'tools',
//         activePaths: [
//           '/tenant/compute/appforge/toolList',
//           '/tenant/compute/appforge/toolCreate',
//           '/tenant/compute/appforge/toolDetail'
//         ]
//       },
//       {
//         title: '工作流管理',
//         icon: null,
//         key: 'workflowList',
//         path: '/tenant/compute/appforge/workflowList',
//         activePaths: [
//           '/tenant/compute/appforge/workflowList',
//           '/tenant/compute/appforge/workflowConfig',
//           '/tenant/compute/appforge/workflowPublic'
//         ]
//       }
//     ]
//   },
//   {
//     title: '模型',
//     icon: (
//       <ToolstoreIcon className="appforge-sider-icon mr-[12px]  flex-none text-[22px]" />
//     ),
//     key: 'modelMenu',
//     path: '/tenant/compute/appforge/toolStore',
//     activePaths: [
//       '/tenant/compute/appforge/toolStore',
//       '/tenant/compute/appforge/toolStoreDetail'
//     ],
//     children: [
//       {
//         title: '模型xxx',
//         icon: null,
//         key: 'modelxxxx',
//         path: '/tenant/compute/appforge/appStore'
//       }
//     ]
//   },
//   {
//     title: '知识',
//     icon: (
//       <WorkspaceIcon className="appforge-sider-icon mr-[12px] flex-none  text-[22px] " />
//     ),
//     key: 'knowledgeMenu',
//     path: '/tenant/compute/appforge/toolStore',
//     activePaths: [
//       '/tenant/compute/appforge/toolStore',
//       '/tenant/compute/appforge/toolStoreDetail'
//     ],
//     children: [
//       {
//         title: '数据接入',
//         children: [],
//         icon: null,
//         path: '/tenant/compute/appforge/dataConnection',
//         activePaths: [
//           '/tenant/compute/appforge/dataSource',
//           '/tenant/compute/appforge/textDetailPage'
//         ],
//         key: 'dataConnection'
//       },
//       {
//         title: '数据集',
//         children: [],
//         icon: null,
//         path: '/tenant/compute/appforge/knowledgeBase',
//         activePaths: [],
//         key: 'dataset'
//       },
//       {
//         title: '知识库',
//         children: [],
//         icon: null,
//         path: '/tenant/compute/appforge/knowledgeBase',
//         activePaths: [
//           '/tenant/compute/appforge/knowledgeBase',
//           '/tenant/compute/appforge/knowledgeCreate',
//           '/tenant/compute/appforge/knowledgeConfig'
//           // '/tenant/compute/appforge/knowledgeDetail',
//           // '/tenant/compute/appforge/knowledgeTest',
//           // '/tenant/compute/appforge/addDocument'
//         ],
//         key: 'knowledgeBase'
//       }
//     ]
//   },
//   {
//     title: '评测',
//     icon: (
//       <ToolstoreIcon className="appforge-sider-icon mr-[12px]  flex-none text-[22px]" />
//     ),
//     key: 'estimateMenu',
//     path: '/tenant/compute/appforge/toolStore',
//     activePaths: [
//       '/tenant/compute/appforge/toolStore',
//       '/tenant/compute/appforge/toolStoreDetail'
//     ],
//     children: [
//       {
//         title: '评测xxx',
//         icon: null,
//         key: 'testxxxx',
//         path: '/tenant/compute/appforge/appStore'
//       }
//     ]
//   },
//   {
//     title: '系统管理',
//     icon: (
//       <IconSettings className="appforge-sider-icon mr-[12px]  flex-none text-[22px]" />
//     ),
//     key: 'systemMgmtMenu',
//     children: [
//       {
//         title: '空间管理',
//         icon: null,
//         key: 'spaceMgmt',
//         path: '/tenant/compute/appforge/spaceMgmt',
//         activePaths: ['/tenant/compute/appforge/spaceDetail']
//       },
//       {
//         title: '角色管理',
//         icon: null,
//         key: 'roleMgmt',
//         path: '/tenant/compute/appforge/appStore'
//       },
//       {
//         title: '权限管理',
//         icon: null,
//         key: 'permissoinMgmt',
//         path: '/tenant/compute/appforge/appStore'
//       }
//     ]
//   }
//   // {
//   //   title: '插件商店',
//   //   icon: (
//   //     <ToolstoreIcon className="appforge-sider-icon mr-[12px]  flex-none text-[22px]" />
//   //   ),
//   //   key: 'toolstore',
//   //   path: '/tenant/compute/appforge/toolStore',
//   //   activePaths: [
//   //     '/tenant/compute/appforge/toolStore',
//   //     '/tenant/compute/appforge/toolStoreDetail'
//   //   ]
//   // }
// ];

const menus: MenuModel[] = [
  {
    type: 'itemGroup',
    title: '项目开发',
    key: 'projectDevGroup',
    children: [
      {
        title: '应用广场',
        icon: (
          <IconApps className="appforge-sider-icon mr-[12px] flex-none text-[22px]" />
        ),
        key: 'appstore',
        path: '/tenant/compute/appforge/appStoreTwo'
      },
      {
        title: '智能体',
        icon: (
          <IconApps className="appforge-sider-icon mr-[12px] flex-none text-[22px]" />
        ),
        path: '/tenant/compute/appforge/agentV2',
        key: 'agentV2'
      }
    ]
  },
  {
    type: 'itemGroup',
    title: '资源管理',
    key: 'resMgmtGroup',
    children: [
       {
        title: '插件广场',
        icon: (
          <ToolstoreIcon className="appforge-sider-icon mr-[12px]  flex-none text-[22px]" />
        ),
        key: 'toolStore',
        path: '/tenant/compute/appforge/plugins',
        activePaths: [
          '/tenant/compute/appforge/plugins',
          '/tenant/compute/appforge/plugin/detail'
        ]
      },
      // {
      //   title: '插件广场',
      //   icon: (
      //     <ToolstoreIcon className="appforge-sider-icon mr-[12px]  flex-none text-[22px]" />
      //   ),
      //   key: 'toolStore',
      //   path: '/tenant/compute/appforge/toolStore',
      //   activePaths: [
      //     '/tenant/compute/appforge/toolStore',
      //     '/tenant/compute/appforge/toolStoreDetail'
      //   ]
      // },
      {
        title: '工作流',
        icon: (
          <IconApps className="appforge-sider-icon mr-[12px] flex-none text-[22px]" />
        ),
        path: '/tenant/compute/appforge/workflowList',
        key: 'workflowList'
      },
      {
        title: '知识库',
        icon: (
          <IconApps className="appforge-sider-icon mr-[12px] flex-none text-[22px]" />
        ),
        path: '/tenant/compute/appforge/knowledgeBaseV2',
        key: 'knowledgeBaseV2'
      }
    ]
  },
  {
    type: 'itemGroup',
    title: '平台管理',
    key: 'platformMgmtGroup',
    children: [
      {
        title: '组织管理',
        icon: (
          <IconApps className="appforge-sider-icon mr-[12px] flex-none text-[22px]" />
        ),
        key: 'orgMgmt',
        path: '/tenant/compute/appforge/organization'
      },
      {
        title: '用户管理',
        icon: (
          <IconApps className="appforge-sider-icon mr-[12px] flex-none text-[22px]" />
        ),
        path: '/tenant/compute/appforge/member',
        key: 'userMgmt'
      },
      {
        title: 'API-KEY',
        icon: (
          <IconApps className="appforge-sider-icon mr-[12px] flex-none text-[22px]" />
        ),
        path: '/tenant/compute/appforge/apiKey',
        key: 'apiKey'
      }
    ]
  }
];

const knowledgeDetailMenus: MenuModel[] = [
  {
    title: '文档列表',
    path: '/tenant/compute/appforge/knowledgeDetail',
    key: 'knowledgeDetail',
    className: 'ml-[30px]',
    activePaths: [
      '/tenant/compute/appforge/knowledgeDetail',
      '/tenant/compute/appforge/addDocument',
      '/tenant/compute/appforge/documentDetail'
    ]
  },
  {
    title: '命中测试',
    path: '/tenant/compute/appforge/knowledgeTest',
    key: 'knowledgeTest',
    className: 'ml-[30px]'
  }
];

const hideSidebarPaths = [
  '/tenant/compute/appforge/configurationpage',
  '/tenant/compute/appforge/appChat',
  '/tenant/compute/appforge/workflowConfig',
  '/tenant/compute/appforge/workflowPublic',
  '/tenant/compute/appforge/agentCreate',
  "/tenant/compute/appforge/agentPage",
  '/tenant/compute/appforge/login',
  '/tenant/compute/appforge/userinfo'
];
const collapseSidebarPaths = [
  '/tenant/compute/appforge/appCreate',
  '/tenant/compute/appforge/appConfig'
];
const knowledgeDetailSidebarPaths = [
  '/tenant/compute/appforge/knowledgeDetail',
  '/tenant/compute/appforge/addDocument',
  '/tenant/compute/appforge/knowledgeTest',
  '/tenant/compute/appforge/documentDetail'
];

function LayoutWithSider(props: { children }) {
  const { children } = props;
  const [collapsed, setCollapsed] = useState(false);
  const [showMenus, setShowMenus] = useState(menus);
  const [showCreateModel, setShowCreateModel] = useState(false);

  const handleCollapsed = () => {
    setCollapsed((collapsed) => !collapsed);
  };

  const history = useHistory();
  const queryParams = useQueryParams();
  const params = useParams();
  const flattenRoutes = getFlatRoutes(routes);

  // 点击菜单跳转

  const clickMenu = React.useCallback(
    (key: string) => {
      const route = flattenRoutes.find((r) => r.key === key);
      if (route?.sub) {
        let tmp = key;
        // 菜单跳转时保持param参数不变
        for (const param in params) {
          if (Object.prototype.hasOwnProperty.call(params, param)) {
            const val = params[param];
            const reg = new RegExp(`/:${param}/`, 'g');
            if (reg.test(tmp)) {
              tmp = tmp.replace(reg, `/${val}/`);
            }
          }
        }
        history.push(tmp + '?' + queryParams);
      } else {
        history.push(key);
      }
    },
    [flattenRoutes, history, params, queryParams]
  );

  const getMenu = (data: typeof menus) => {
    return data.map((item) => {
      if (!item.children || item.children.length === 0)
        return (
          <MenuItem
            key={item.key}
            onClick={() => clickMenu(item.path)}
            className="flex items-center"
          >
            {item.icon}
            <span className={item.className}>{item.title}</span>
          </MenuItem>
        );
      else {
        if (item.type === 'itemGroup') {
          return (
            <MenuGroup
              key={item.key}
              className="menu-group"
              title={<span className="flex items-center">{item.title}</span>}
            >
              {getMenu(item.children)}
            </MenuGroup>
          );
        } else {
          return (
            <SubMenu
              key={item.key}
              className="sub-menu"
              title={
                <span className="flex items-center">
                  {item.icon}
                  {item.title}
                </span>
              }
            >
              {getMenu(item.children)}
            </SubMenu>
          );
        }
      }
    });
  };

  const location = useLocation();

  const sidebarHidden = hideSidebarPaths.some(
    (path) => path === location.pathname
  );

  const knowledgeDetailSidebar = knowledgeDetailSidebarPaths.some(
    (path) => path === location.pathname
  );

  React.useEffect(() => {
    if (knowledgeDetailSidebar) {
      setShowMenus(knowledgeDetailMenus);
    } else {
      setShowMenus(menus);
    }
  }, [knowledgeDetailSidebar]);

  const actives = useMemo(() => {
    const findMatch = (menus: MenuModel[]): string[] => {
      for (const menu of menus) {
        if (menu.children?.length > 0) {
          const key = findMatch(menu.children);
          if (key) return [...key, menu.key];
        } else {
          const activePaths = menu.activePaths || [menu.path];
          const path = activePaths.find((path) =>
            location.pathname.startsWith(path)
          );
          if (path) return [menu.key];
        }
      }
      return null;
    };
    return findMatch(showMenus);
  }, [location.pathname, showMenus]);

  const [openKeys, setopenKeys] = useState(actives || []);
  useEffect(() => {
    setopenKeys((keys) => {
      return [...new Set(keys.concat(actives || []))];
    });
  }, [actives]);

  const CustomHeader = useMemo(() => {
    const key = Object.keys(customHeader).find((key) =>
      location.pathname.includes(key)
    );
    return key && React.lazy(customHeader[key]);
  }, [location.pathname]);

  useEffect(() => {
    const collapse = !!collapseSidebarPaths.find((item) =>
      location.pathname.includes(item)
    );
    setCollapsed(collapse);
  }, [location.pathname]);

  const renderUserSpaceMenu = () => {
    return (
      <div className="user-space-menu">
        <Input.Search
          className="mb-[8px]"
          placeholder="输入空间名称"
          onChange={(val) => console.log(val)}
        />
        <div className="recent-txt">最近使用</div>
        <div className="recent-spaces space-list">
          <div className="space-item">
            <span>
              <SpaceIcon1 className="space-icon" />
              <span className="space-title">XXX的团队</span>
            </span>
            <Popover position="top" content={<span>成员与设置</span>}>
              <IconSettings className="setting-icon" />
            </Popover>
          </div>
        </div>
        <div className="user-spaces space-list">
          <div className="space-item">
            <span>
              <SpaceIcon1 className="space-icon" />
              <span className="space-title">XXX的团队</span>
            </span>
            <IconSettings className="setting-icon" />
          </div>
          <div className="space-item">
            <span>
              <SpaceIcon1 className="space-icon" />
              <span className="space-title">XXX的团队</span>
            </span>
            <IconSettings className="setting-icon" />
          </div>
        </div>
        <div className="space-actions">
          <div className="space-btn" onClick={() => setShowCreateModel(true)}>
            <IconPlus />
            新增空间
          </div>
          <div className="space-btn">
            <IconSettings />
            空间管理
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-none">{CustomHeader && <CustomHeader />}</div>
      <Layout className="flex-auto overflow-auto">
        {sidebarHidden ? null : (
          <Sider
            collapsed={collapsed}
            onCollapse={handleCollapsed}
            collapsible
            trigger={
              collapsed ? (
                <IconMenuUnfold className="appforge-icon-clickable" />
              ) : (
                <IconMenuFold className="appforge-icon-clickable" />
              )
            }
            breakpoint="xl"
            className={cn(
              'appforge-sider bg-transparent shadow-none',
              collapsed ? 'mr-[24px] !w-[44px] bg-white' : ''
            )}
          >
            <div className="mb-[18px] mt-[26px] pl-[20px] text-[16px] font-[600] leading-[24px] text-[var(--color-text-1)]">
              {collapsed ? '' : '应用开发平台'}
            </div>
            {/* <div className={cn(collapsed ? 'px-[6px]' : 'px-[8px]')}>
              {!knowledgeDetailSidebar ? (
                collapsed ? (
                  // <Button
                  //   type="primary"
                  //   icon={<IconPlus />}
                  //   className="mb-[8px]"
                  //   onClick={() => {
                  //     history.push('/tenant/compute/appforge/appCreate');
                  //   }}
                  // />
                  <Trigger
                    popup={renderUserSpaceMenu}
                    trigger="hover"
                    position="bottom"
                    classNames="zoomInTop"
                  >
                    <UserSpaceIcon className="menu-icon mb-[8px] ml-[6px] size-[20px] cursor-pointer" />
                  </Trigger>
                ) : (
                  // <Button
                  //   long
                  //   type="primary"
                  //   className="mb-[8px]"
                  //   icon={<IconPlus />}
                  //   onClick={() => {
                  //     history.push('/tenant/compute/appforge/appCreate');
                  //   }}
                  // >
                  //   新建应用
                  // </Button>
                  <Trigger
                    popup={renderUserSpaceMenu}
                    trigger="hover"
                    position="bottom"
                    classNames="zoomInTop"
                  >
                    <div className="user-space">
                      <span>
                        <UserSpaceIcon className="menu-icon" />
                        <span className="menu-title">用户默认空间</span>
                      </span>
                      <IconDown
                        style={{ fontSize: '16px', color: '#334155' }}
                      />
                    </div>
                  </Trigger>
                )
              ) : null}
            </div> */}
            {knowledgeDetailSidebar &&
              (collapsed ? (
                <div
                  className="border-b-[var(--color-border-2))] ml-[8px] mr-[12px] flex cursor-pointer items-center border-b py-[11px]"
                  onClick={() =>
                    history.push('/tenant/compute/appforge/knowledgeBase')
                  }
                >
                  <IconLeftCircle className="text-[22px] text-[var(--color-text-4)]" />
                </div>
              ) : (
                <div
                  className="border-b-[var(--color-border-2))] ml-[8px] mr-[12px] flex cursor-pointer items-center border-b py-[11px]"
                  onClick={() =>
                    history.push('/tenant/compute/appforge/knowledgeBase')
                  }
                >
                  <IconLeftCircle className="ml-[12px] mr-[8px] text-[22px] text-[var(--color-text-4)]" />
                  <span className="text-[14px] text-[var(--color-text-2)]">
                    返回上级页面
                  </span>
                </div>
              ))}

            <Menu
              className={'ai-menu'}
              selectedKeys={actives || []}
              openKeys={openKeys || []}
              onClickSubMenu={(key, openKeys) => {
                setopenKeys(openKeys);
              }}
            >
              {getMenu(showMenus)}
            </Menu>
          </Sider>
        )}
        {children}
      </Layout>
      {showCreateModel && (
        <CreateSpaceModal
          visible={showCreateModel}
          setVisible={setShowCreateModel}
        />
      )}
    </div>
  );
}

export function withSider(Content) {
  return function () {
    return (
      <LayoutWithSider>
        <Content />
      </LayoutWithSider>
    );
  };
}
