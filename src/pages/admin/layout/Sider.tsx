import { useQueryParams } from '@/utils';
import { Layout, Menu } from '@arco-design/web-react';
import cn from 'classnames';
import React, { useEffect, useMemo, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import WujieReact from 'wujie-react';
import { getFlatRoutes, routes } from '../route';
import { menus, filterMenusByPermissions, type MenuModel } from './menus';
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
      // 检查是否是 operationCenter 路由
      if (path.includes('/tenant/compute/modaforge/operationCenter')) {
        try {
          // 销毁 wujie 应用的缓存，使用正确的 API
          WujieReact.destroyApp('operationcenter');
          console.log('Destroyed operationcenter wujie app');
        } catch (e) {
          console.warn('Failed to destroy wujie app:', e);
        }
        // 直接导航到 operationCenter 路由，不需要查找 route 配置
        history.push(path);
      } else {
        // 对于其他路由，查找对应的 route 配置
        const route = flattenRoutes.find((r) => r.key === path);
        if (route?.sub) {
          let tmp = path;
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
          // 点击菜单时，清除所有查询参数，确保导航到干净的状态
          history.push(path);
        }
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
