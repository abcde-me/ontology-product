import * as React from 'react';
import auth, { AuthParams } from '@/utils/authentication';
import { useEffect, useMemo, useState } from 'react';
import { Redirect } from 'react-router';
import {
  ONTOLOGY_PERMISSIONS,
  ORGANIZATION_PERMISSIONS,
  USER_PERMISSIONS,
  ROLE_PERMISSIONS,
  USER_GROUP_PERMISSIONS,
  PROJECT_PERMISSIONS,
  API_KEY_PERMISSIONS
} from '@/config/permissions';
import { ONTOLOGY_SCENE_MENU_ITEM_KEYS } from '@/common/constants';

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
  exact?: boolean;
  // 路由权限标识
  permission?: string | string[];
  anyPermission?: string[]; // 任一权限
};

// 路由配置
export const routes: IRoute[] = [
  // 首页
  {
    name: 'home',
    key: '/tenant/compute/modaforge/home',
    component: React.lazy(async () => import('../../home')),
    children: []
  },
  // 本体场景库
  {
    name: 'ontologyScene',
    key: '/tenant/compute/modaforge/ontologyScene',
    component: React.lazy(async () => import('../../ontologyScene')),
    permission: ONTOLOGY_PERMISSIONS.LIST,
    children: [
      {
        name: 'ontologySceneList',
        key: '/tenant/compute/modaforge/ontologyScene/list',
        component: React.lazy(
          async () => import('../../ontologyScene/modules/list/index')
        ),
        permission: ONTOLOGY_PERMISSIONS.LIST
      },
      {
        name: 'ontologySceneDetail',
        key: '/tenant/compute/modaforge/ontologyScene/detail/:id',
        component: React.lazy(
          async () => import('../../ontologyScene/modules/detail/index')
        ),
        permission: ONTOLOGY_PERMISSIONS.LIST,
        exact: false, // 设置为 false，以便匹配子路由
        children: [
          // 本体图谱
          {
            name: 'ontologySceneGraph',
            key: `/tenant/compute/modaforge/ontologyScene/detail/:id/${ONTOLOGY_SCENE_MENU_ITEM_KEYS.GRAPH}`,
            component: React.lazy(
              async () => import('../../ontologyScene/modules/graph/index')
            ),
            permission: ONTOLOGY_PERMISSIONS.LIST
          },
          // 对象类型
          {
            name: 'ontologySceneObjectType',
            key: `/tenant/compute/modaforge/ontologyScene/detail/:id/${ONTOLOGY_SCENE_MENU_ITEM_KEYS.OBJECT_TYPE}`,
            component: React.lazy(
              async () => import('../../ontologyScene/modules/objectType/index')
            ),
            permission: ONTOLOGY_PERMISSIONS.LIST
          },
          // 属性
          {
            name: 'ontologySceneAttributes',
            key: `/tenant/compute/modaforge/ontologyScene/detail/:id/${ONTOLOGY_SCENE_MENU_ITEM_KEYS.ATTRIBUTES}`,
            component: React.lazy(
              async () => import('../../ontologyScene/modules/attributes/index')
            ),
            permission: ONTOLOGY_PERMISSIONS.LIST
          },
          // 链接
          {
            name: 'ontologySceneLinks',
            key: `/tenant/compute/modaforge/ontologyScene/detail/:id/${ONTOLOGY_SCENE_MENU_ITEM_KEYS.LINKS}`,
            component: React.lazy(
              async () => import('../../ontologyScene/modules/links/index')
            ),
            permission: ONTOLOGY_PERMISSIONS.LIST
          },
          // 行为动作
          {
            name: 'ontologySceneBehaviorActions',
            key: `/tenant/compute/modaforge/ontologyScene/detail/:id/${ONTOLOGY_SCENE_MENU_ITEM_KEYS.BEHAVIOR_ACTIONS}`,
            component: React.lazy(
              async () =>
                import('../../ontologyScene/modules/behaviorActions/index')
            ),
            permission: ONTOLOGY_PERMISSIONS.LIST
          },
          // 函数
          {
            name: 'ontologySceneFunctions',
            key: `/tenant/compute/modaforge/ontologyScene/detail/:id/${ONTOLOGY_SCENE_MENU_ITEM_KEYS.FUNCTIONS}`,
            component: React.lazy(
              async () => import('../../ontologyScene/modules/functions/index')
            ),
            permission: ONTOLOGY_PERMISSIONS.LIST
          },
          // 执行记录
          {
            name: 'ontologySceneBehaviorLog',
            key: `/tenant/compute/modaforge/ontologyScene/detail/:id/${ONTOLOGY_SCENE_MENU_ITEM_KEYS.BEHAVIOR_LOG}`,
            component: React.lazy(
              async () =>
                import('../../ontologyScene/modules/behaviorLog/index')
            ),
            permission: ONTOLOGY_PERMISSIONS.LIST
          }
        ]
      }
    ]
  },
  // 运营中心页面
  {
    name: 'operationCenter',
    key: '/tenant/compute/modaforge/operationCenter',
    component: React.lazy(async () => import('../../operationCenter')),
    // permission: 'organizations:can_view',
    children: [],
    anyPermission: [
      ORGANIZATION_PERMISSIONS.MENU,
      USER_PERMISSIONS.MENU,
      USER_GROUP_PERMISSIONS.MENU,
      ROLE_PERMISSIONS.MENU,
      PROJECT_PERMISSIONS.MENU,
      API_KEY_PERMISSIONS.MENU
    ]
  }
];

// 获取平铺的路由数组
export const getFlatRoutes = (routesArr: IRoute[]): IRoute[] => {
  return routesArr.reduce((flatArr, cur) => {
    // @ts-expect-error
    flatArr.push({ ...cur, children: [] });
    if (cur.children && cur.children.length) {
      const child = cur.children;
      child.map((item) => {
        return (item['parentKey'] = cur.key);
      });
      // 对于 ontologySceneDetail，其子路由由父组件内部处理，不添加到扁平化路由中
      if (cur.name === 'ontologySceneDetail') {
        // 不添加子路由到扁平化数组
        return flatArr;
      }
      const res = getFlatRoutes(child);
      // @ts-expect-error
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

/**
 * 根据路径获取路由的权限标识
 */
export const getRoutePermission = (
  path: string,
  routesArr: IRoute[] = routes
): string | string[] | undefined => {
  for (const route of routesArr) {
    // 精确匹配
    if (route.key === path) {
      return route.permission;
    }
    // 前缀匹配（用于处理带参数的路由）
    if (path.startsWith(route.key) && route.key !== '/') {
      return route.permission;
    }
    // 递归查找子路由
    if (route.children && route.children.length > 0) {
      const permission = getRoutePermission(path, route.children);
      if (permission) {
        return permission;
      }
    }
  }
  return undefined;
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
          // @ts-expect-error
          arr.push(newRoute);
        }
      } else {
        // @ts-expect-error
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
    return '';
  }, [permissionRoute]);

  return [permissionRoute, defaultRoute];
};

export default useRoute;
