import { Layout, Menu } from '@arco-design/web-react';
import cn from 'classnames';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { menus, type MenuModel } from './menus';
import './sider.scss';
import { usePermission } from '@/hooks/usePermission';
import { useUserInfoStore } from '@/store/userInfoStore';

const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;
const MenuGroup = Menu.ItemGroup;
const Sider = Layout.Sider;

const hideSidebarPaths = [
  '/tenant/compute/modaforge/workflowConfig',
  '/tenant/compute/modaforge/login',
  '/tenant/compute/modaforge/userinfo',
  '/tenant/compute/modaforge/labelEditor',
  '/tenant/compute/modaforge/ragDetail'
];
const collapseSidebarPaths = [];

function LayoutWithSider({ children }) {
  const { createPermissionFilter } = usePermission();

  const [collapsed, setCollapsed] = useState(false);
  const [showMenus, setShowMenus] = useState(menus);
  const { userMenus } = useUserInfoStore();

  const history = useHistory();
  const location = useLocation();

  // 用于防抖的 ref
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastClickPathRef = useRef<string | null>(null);

  const sidebarHidden = hideSidebarPaths.some(
    (path) => path === location.pathname
  );

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
          if (path) {
            // 如果有查询参数匹配器，使用它来进一步判断
            if (menu.queryParamMatcher) {
              if (menu.queryParamMatcher(location.search)) {
                return [menu.key];
              }
              continue;
            } else {
              return [menu.key];
            }
          }
        }
      }
      return null;
    };
    return findMatch(showMenus);
  }, [location.pathname, location.search, showMenus]);

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

      // 直接导航，不需要销毁 wujie 应用
      // operationCenter 页面会通过 useLocation 监听 URL 变化并自动重新加载
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

  useEffect(() => {
    setShowMenus(userMenus);
  }, [userMenus]);

  useEffect(() => {
    setopenKeys((keys) => {
      return [...new Set(keys.concat(actives || []))];
    });
  }, [actives]);

  useEffect(() => {
    const collapse = !!collapseSidebarPaths.find((item) =>
      location.pathname.includes(item)
    );
    setCollapsed(collapse);
  }, [location.pathname]);

  // 清理超时
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Layout className="h-full flex-auto overflow-auto">
      {sidebarHidden ? null : (
        <Sider
          collapsed={collapsed}
          onCollapse={handleCollapsed}
          className={cn(
            'modaforge-sider bg-transparent shadow-none',
            collapsed ? 'mr-[24px] !w-[44px] bg-white' : ''
          )}
        >
          <Menu
            className={'ai-menu'}
            selectedKeys={actives || []}
            openKeys={openKeys || []}
            onClickSubMenu={(key, openKeys) => {
              setopenKeys(openKeys);
            }}
          >
            {getMenu(createPermissionFilter(showMenus))}
          </Menu>
        </Sider>
      )}
      {children}
    </Layout>
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
