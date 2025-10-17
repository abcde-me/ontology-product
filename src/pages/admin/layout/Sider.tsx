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
import cn from 'classnames';
import React, { useEffect, useMemo, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { getFlatRoutes, routes } from '../route';
import { menus, filterMenusByPermissions, type MenuModel } from './menus';
import { usePermission } from '@/context/PermissionContext';
import './sider.scss';

const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;
const MenuGroup = Menu.ItemGroup;
const Sider = Layout.Sider;

const hideSidebarPaths = [
  '/tenant/compute/modaforge/workflowConfig',
  '/tenant/compute/modaforge/login',
  '/tenant/compute/modaforge/userinfo',
  '/tenant/compute/modaforge/labelEditor'
];
const collapseSidebarPaths = [];

function LayoutWithSider({ children }) {
  // 从权限Context获取权限数据
  const { permissions, isLoading, isInitialized } = usePermission();

  // 根据用户权限过滤菜单
  const filteredMenus = useMemo(() => {
    // 如果权限还在加载中，返回空菜单避免闪烁
    if (isLoading || !isInitialized) {
      return [];
    }
    console.log('使用新权限系统过滤菜单, permissions:', permissions);
    return filterMenusByPermissions(menus, permissions);
  }, [permissions, isLoading, isInitialized]);

  const [collapsed, setCollapsed] = useState(false);
  const [showMenus, setShowMenus] = useState(filteredMenus);

  const history = useHistory();
  const location = useLocation();
  const queryParams = useQueryParams();
  const params = useParams();
  const flattenRoutes = getFlatRoutes(routes);

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
    console.log('data', data);
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
    setShowMenus(filteredMenus);
  }, [filteredMenus]);

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
            {getMenu(showMenus)}
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
