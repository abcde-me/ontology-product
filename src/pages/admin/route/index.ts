import * as React from 'react';
import auth, { AuthParams } from '@/utils/authentication';
import { useEffect, useMemo, useState } from 'react';

export type IRoute = AuthParams & {
  name: string;
  key: string;
  // 当前页是否展示面包屑
  breadcrumb?: boolean;
  children?: IRoute[];
  // 当前路由是否渲染菜单项，为 true 的话不会在菜单中显示，但可通过路由地址访问。
  ignore?: boolean;
  component?: React.FC<any>;
  level?: number;
  sub?: boolean;
};

// om 运维、tenant 运营、portal 租户
export const routes: IRoute[] = [
  //主页
  {
    name: 'home',
    key: '/tenant/compute/modaforge/home',
    component: React.lazy(async () => import('../../home/index')),
    children: []
  },
  // 连接器
  {
    name: 'connection',
    key: '/tenant/compute/modaforge/connection',
    component: React.lazy(async () => import('../../connection/index')),
    children: []
  },
  // 数据载入
  {
    name: 'dataLoad',
    key: '/tenant/compute/modaforge/dataLoad',
    component: React.lazy(async () => import('../../dataLoad/index')),
    children: []
  },
  //APIKey
  {
    name: 'apiKey',
    key: '/tenant/compute/modaforge/apiKey',
    component: React.lazy(async () => import('../../apiKey/index')),
    children: []
  },
  // 组织管理
  {
    name: 'organization',
    key: '/tenant/compute/modaforge/organization',
    component: React.lazy(async () => import('../../organization/index')),
    children: []
  },
  // 成员管理
  {
    name: 'member',
    key: '/tenant/compute/modaforge/member',
    component: React.lazy(async () => import('../../member/index')),
    children: []
  },
  // 登陆页面
  {
    name: 'login',
    key: '/tenant/compute/modaforge/login',
    component: React.lazy(async () => import('../../login/index')),
    children: []
  },
  // 用户信息页面
  {
    name: 'userinfo',
    key: '/tenant/compute/modaforge/userinfo',
    component: React.lazy(async () => import('../../userinfo/index')),
    children: []
  }
];

// 获取平铺的路由数组
export const getFlatRoutes = (routesArr: IRoute[]): IRoute[] => {
  return routesArr.reduce((flatArr, cur) => {
    flatArr.push({ ...cur, children: [] });
    if (cur.children && cur.children.length) {
      const child = cur.children;
      child.map((item) => {
        return (item['parentKey'] = cur.key);
      });
      const res = getFlatRoutes(child);
      flatArr.push(...res);
    }
    return flatArr;
  }, []);
};

export const getName = (path: string, routes) => {
  return routes.find((item) => {
    const itemPath = `/${item.key}`;
    if (path === itemPath) {
      return item.name;
    } else if (item.children) {
      return getName(path, item.children);
    }
  });
};

export const generatePermission = (role: string) => {
  const actions = role === 'admin' ? ['*'] : ['read'];
  const result = {};
  routes.forEach((item) => {
    if (item.children) {
      item.children.forEach((child) => {
        result[child.name] = actions;
      });
    }
  });
  return result;
};

const useRoute = (userPermission): [IRoute[], string] => {
  const filterRoute = (routes: IRoute[], arr = []): IRoute[] => {
    if (!routes.length) {
      return [];
    }
    for (const route of routes) {
      const { requiredPermissions, oneOfPerm } = route;
      let visible = true;
      if (requiredPermissions) {
        visible = auth({ requiredPermissions, oneOfPerm }, userPermission);
      }

      if (!visible) {
        continue;
      }
      if (route.children && route.children.length) {
        const newRoute = { ...route, children: [] };
        filterRoute(route.children, newRoute.children);
        if (newRoute.children.length) {
          arr.push(newRoute);
        }
      } else {
        arr.push({ ...route });
      }
    }

    return arr;
  };

  const [permissionRoute, setPermissionRoute] = useState(routes);

  useEffect(() => {
    const newRoutes = filterRoute(routes);
    setPermissionRoute(newRoutes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(userPermission)]);

  const defaultRoute = useMemo(() => {
    const first = permissionRoute[0];
    if (first) {
      const firstRoute = first?.children?.[0]?.key || first.key;
      return firstRoute;
    }
    return '';
  }, [permissionRoute]);

  return [permissionRoute, defaultRoute];
};

export default useRoute;
