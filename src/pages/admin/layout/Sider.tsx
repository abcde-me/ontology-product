import { Layout, Menu } from '@arco-design/web-react';
import cn from 'classnames';
import React, { useEffect, useMemo, useState, useRef, memo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { menus, type MenuModel } from './menus';
import './sider.scss';
import { usePermission } from '@/hooks/usePermission';
import { useUserInfo, useUserInfoStore } from '@/store/userInfoStore';
import { SiderMenu } from '@ceai-front/arco-material';
import SidebarProjectSelect from '@/components/SidebarProjectSelect';
import { isSameArray } from '@/utils/array';
import { setLocalStorage } from '@/utils/storage';
import { ProjectIdKey } from '@/utils/const';
import { isInFrame, isWujie, isEmbeddedBySingleApp } from '@/utils/env';

const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;
const MenuGroup = Menu.ItemGroup;
const Sider = Layout.Sider;

const hideSidebarPaths = [
  '/tenant/compute/onto/workflowConfig',
  '/tenant/compute/onto/login',
  '/tenant/compute/onto/userinfo',
  '/tenant/compute/onto/labelEditor',
  '/tenant/compute/onto/ragDetail',
  '/tenant/compute/onto/ontologyScene/detail'
];

export const LayoutWithSider = memo(function LayoutWithSider({ children }) {
  const { createPermissionFilter } = usePermission();

  const [locSearch, setLocSearch] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [showMenus, setShowMenus] = useState(menus);
  const { userMenus } = useUserInfoStore();

  const history = useHistory();
  const location = useLocation();

  // 从全局 store 获取用户信息
  const userInfo = useUserInfo();
  const { id: userId } = userInfo || {};
  const { setUserActions, projectId, setProjectId } = useUserInfoStore();
  const FullStorageKey = useMemo(() => `${ProjectIdKey}${userId}`, [userId]);

  // 用于防抖的 ref
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastClickPathRef = useRef<string | null>(null);

  // 如果是在iframe中，并且不是wujie，则隐藏侧边栏，临时以iframe的形式嵌入数据平台
  // 或者在wujie中被单产品集成时，也隐藏侧边栏
  const isEmbedded = isEmbeddedBySingleApp();
  const sidebarHidden =
    hideSidebarPaths.some(
      (path) => path === location.pathname || location.pathname.includes(path)
    ) ||
    isEmbedded ||
    (isInFrame && !isWujie); // 被单产品集成时隐藏侧边栏

  const actives = useMemo(() => {
    const search = locSearch || location.search;
    const matchState: {
      best: { keys: string[]; pathLength: number } | null;
    } = { best: null };

    const walkMenus = (items: MenuModel[], parentKeys: string[] = []) => {
      for (const menu of items) {
        if (menu.children?.length) {
          walkMenus(menu.children, [...parentKeys, menu.key]);
          continue;
        }

        const activePaths = (menu.activePaths || [menu.path]).filter(
          Boolean
        ) as string[];

        for (const path of activePaths) {
          if (!location.pathname.startsWith(path)) {
            continue;
          }

          if (menu.queryParamMatcher && !menu.queryParamMatcher(search)) {
            continue;
          }

          if (!matchState.best || path.length > matchState.best.pathLength) {
            matchState.best = {
              keys: [menu.key, ...parentKeys],
              pathLength: path.length
            };
          }
        }
      }
    };

    walkMenus(showMenus);
    return matchState.best?.keys ?? null;
  }, [location.pathname, location.search, showMenus, locSearch]);

  useEffect(() => {
    const handler = () => {
      const isNoto = (top ?? window).location.pathname.includes('/onto');
      isNoto && setLocSearch(window.location.search);
    };
    window.addEventListener('locationchange', handler);
    return () => window.removeEventListener('locationchange', handler);
  }, []);

  const [openKeys, setopenKeys] = useState(actives || []);

  const handleCollapsed = () => {
    setCollapsed((collapsed) => !collapsed);
  };

  const clickMenu = React.useCallback(
    (path: string) => {
      // 防抖处理：如果在 300ms 内点击相同的路径，则忽略
      if (lastClickPathRef.current === path && clickTimeoutRef.current) {
        return;
      }

      // 清除之前的超时
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }

      lastClickPathRef.current = path;
      console.log('clickMenu', path);
      history.push(path);

      // 设置超时，300ms 后重置防抖状态
      clickTimeoutRef.current = setTimeout(() => {
        lastClickPathRef.current = null;
        clickTimeoutRef.current = null;
      }, 300);
    },
    [history]
  );

  const getMenu = (data: typeof menus) => {
    return data.map((item) => {
      if (!item.children || item.children.length === 0)
        return (
          <MenuItem
            key={item.key}
            onClick={() => clickMenu(item?.path ?? '')}
            className="layout-menu-item flex items-center"
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

  useEffect(() => {
    setShowMenus(userMenus);
  }, [userMenus]);

  useEffect(() => {
    setopenKeys((keys) => {
      return [...new Set(keys.concat(actives || []))];
    });
  }, [actives]);

  // 清理超时
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  const changeProject = (value: string[]) => {
    if (!userId || !userId.length) return;
    if (isSameArray(value, projectId)) return;

    setLocalStorage(FullStorageKey, value);
    // 重置权限状态，这样下次初始化时会重新加载权限
    setUserActions({ isAdmin: false, actions: null });
    setProjectId(value);
  };

  return (
    <Layout className="layout-menu-container flex h-full flex-auto  flex-row overflow-auto">
      {sidebarHidden ? null : (
        // <Sider
        //   collapsed={collapsed}
        //   onCollapse={handleCollapsed}
        //   className={cn(
        //     'noto-sider bg-transparent shadow-none',
        //     collapsed ? 'mr-[24px] !w-[44px] bg-white' : ''
        //   )}
        // >
        //   <ProjectSelect
        //     style={{ width: 178, margin: 8 }}
        //     treeData={projects}
        //     value={projectId}
        //     showAddButton={false}
        //     onChange={(v) => {
        //       console.log('🚀 ~ BasicDemo ~ v:', v);
        //       v ? changeProject(v) : setProjectId([]);
        //     }}
        //   />
        //   <Menu
        //     className={'ai-menu'}
        //     selectedKeys={actives || []}
        //     openKeys={openKeys || []}
        //     onClickSubMenu={(key, openKeys) => {
        //       console.log(key, openKeys, 'keyyyyyyyyyy');
        //       setopenKeys(openKeys);
        //     }}
        //   >
        //     {getMenu(createPermissionFilter(showMenus))}
        //   </Menu>
        // </Sider>

        <SiderMenu
          className={cn('h-full')}
          isFixedMenuTopExtra
          menus={createPermissionFilter(showMenus)}
          selectedKeys={actives || []}
          collapsed={collapsed}
          onCollapse={setCollapsed}
          onMenuClick={(menu) => {
            // 添加页面跳转逻辑
            if (menu.path) {
              clickMenu(menu.path);
            }
          }}
          menuTopExtra={
            <SidebarProjectSelect
              value={projectId}
              collapsed={collapsed}
              onChange={(v) => {
                v ? changeProject(v) : setProjectId([]);
              }}
            />
          }
        />
      )}
      {children}
    </Layout>
  );
});

export function withSider(Content) {
  return function () {
    return (
      <LayoutWithSider>
        <Content />
      </LayoutWithSider>
    );
  };
}
