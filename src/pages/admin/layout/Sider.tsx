import SpaceIcon1 from '@/assets/space-icon1.svg';
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
  '/tenant/compute/modaforge/appConfig': () =>
    import('@/pages/appCreate/header'),
  '/tenant/compute/modaforge/appCreate': () =>
    import('@/pages/appCreate/header'),
  '/tenant/compute/modaforge/appChat': () => import('@/pages/appChat/header'),
  '/tenant/compute/modaforge/workflowPublic': () =>
    import('@/pages/workflowPublic/customHeader')
};

const menus: MenuModel[] = [
  {
    type: 'itemGroup',
    title: '数据连接',
    key: 'dataConnection',
    children: [
      {
        title: '连接器',
        icon: (
          <IconApps className="modaforge-sider-icon mr-[12px] flex-none text-[22px]" />
        ),
        key: 'connection',
        path: '/tenant/compute/modaforge/connection'
      },
      {
        title: '数据载入',
        icon: (
          <IconApps className="modaforge-sider-icon mr-[12px] flex-none text-[22px]" />
        ),
        path: '/tenant/compute/modaforge/dataLoad',
        key: 'dataLoad'
      }
    ]
  },
  {
    type: 'itemGroup',
    title: '数据处理',
    key: 'DataDeal',
    children: [
      {
        title: '工作流',
        icon: (
          <IconApps className="modaforge-sider-icon mr-[12px] flex-none text-[22px]" />
        ),
        key: 'workflowList',
        path: '/tenant/compute/modaforge/workflowList'
      },
      {
        title: '作业',
        icon: (
          <IconApps className="modaforge-sider-icon mr-[12px] flex-none text-[22px]" />
        ),
        key: 'workflowTask',
        path: '/tenant/compute/modaforge/workflowTask'
      }
    ]
  },
  {
    type: 'itemGroup',
    title: '数据管理',
    key: 'DataManagement',
    children: [
      {
        title: '数据目录',
        icon: (
          <IconApps className="modaforge-sider-icon mr-[12px] flex-none text-[22px]" />
        ),
        key: 'dataCatalog',
        path: '/tenant/compute/modaforge/dataCatalog'
      },
      {
        title: '数据集管理',
        icon: (
          <IconApps className="modaforge-sider-icon mr-[12px] flex-none text-[22px]" />
        ),
        key: 'datasetManagement',
        path: '/tenant/compute/modaforge/datasetManagement'
      }
    ]
  },
  {
    type: 'itemGroup',
    title: '平台管理',
    key: 'mgmtGroup',
    children: [
      {
        title: '组织管理',
        icon: (
          <IconApps className="modaforge-sider-icon mr-[12px] flex-none text-[22px]" />
        ),
        key: 'orgMgmt',
        path: '/tenant/compute/modaforge/organization'
      },
      {
        title: '用户管理',
        icon: (
          <IconApps className="modaforge-sider-icon mr-[12px] flex-none text-[22px]" />
        ),
        path: '/tenant/compute/modaforge/member',
        key: 'userMgmt'
      },
      {
        title: 'API-KEY',
        icon: (
          <IconApps className="modaforge-sider-icon mr-[12px] flex-none text-[22px]" />
        ),
        path: '/tenant/compute/modaforge/apiKey',
        key: 'apiKey'
      }
    ]
  }
];

const knowledgeDetailMenus: MenuModel[] = [
  {
    title: '文档列表',
    path: '/tenant/compute/modaforge/knowledgeDetail',
    key: 'knowledgeDetail',
    className: 'ml-[30px]',
    activePaths: [
      '/tenant/compute/modaforge/knowledgeDetail',
      '/tenant/compute/modaforge/addDocument',
      '/tenant/compute/modaforge/documentDetail'
    ]
  },
  {
    title: '命中测试',
    path: '/tenant/compute/modaforge/knowledgeTest',
    key: 'knowledgeTest',
    className: 'ml-[30px]'
  }
];

const hideSidebarPaths = [
  '/tenant/compute/modaforge/configurationpage',
  '/tenant/compute/modaforge/appChat',
  '/tenant/compute/modaforge/workflowConfig',
  '/tenant/compute/modaforge/workflowPublic',
  '/tenant/compute/modaforge/agentCreate',
  '/tenant/compute/modaforge/agentPage',
  '/tenant/compute/modaforge/login',
  '/tenant/compute/modaforge/userinfo'
];
const collapseSidebarPaths = [
  '/tenant/compute/modaforge/appCreate',
  '/tenant/compute/modaforge/appConfig'
];
const knowledgeDetailSidebarPaths = [
  '/tenant/compute/modaforge/knowledgeDetail',
  '/tenant/compute/modaforge/addDocument',
  '/tenant/compute/modaforge/knowledgeTest',
  '/tenant/compute/modaforge/documentDetail'
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
            onClick={() => clickMenu(item?.path ?? '')}
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
    const findMatch = (menus: MenuModel[]): string[] | null => {
      for (const menu of menus) {
        if (menu.children?.length && menu.children?.length > 0) {
          const key = findMatch(menu.children);
          if (key) return [...key, menu.key];
        } else {
          const activePaths = menu.activePaths || [menu.path];
          const path = activePaths.find((path) =>
            location.pathname.startsWith(path ?? '')
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
                <IconMenuUnfold className="modaforge-icon-clickable" />
              ) : (
                <IconMenuFold className="modaforge-icon-clickable" />
              )
            }
            breakpoint="xl"
            className={cn(
              'modaforge-sider bg-transparent shadow-none',
              collapsed ? 'mr-[24px] !w-[44px] bg-white' : ''
            )}
          >
            {/* <div className="mb-[18px] mt-[26px] pl-[20px] text-[16px] font-[600] leading-[24px] text-[var(--color-text-1)]">
              {collapsed ? '' : '多模态治理平台'}
            </div> */}
            {knowledgeDetailSidebar &&
              (collapsed ? (
                <div
                  className="border-b-[var(--color-border-2))] ml-[8px] mr-[12px] flex cursor-pointer items-center border-b py-[11px]"
                  onClick={() =>
                    history.push('/tenant/compute/modaforge/knowledgeBase')
                  }
                >
                  <IconLeftCircle className="text-[22px] text-[var(--color-text-4)]" />
                </div>
              ) : (
                <div
                  className="border-b-[var(--color-border-2))] ml-[8px] mr-[12px] flex cursor-pointer items-center border-b py-[11px]"
                  onClick={() =>
                    history.push('/tenant/compute/modaforge/knowledgeBase')
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
