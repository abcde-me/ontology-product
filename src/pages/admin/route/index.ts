import * as React from 'react';
import auth, { AuthParams } from '@/utils/authentication';
import { useEffect, useMemo, useState } from 'react';
import { Redirect } from 'react-router';

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
  // 主页
  {
    name: 'home',
    key: '/tenant/compute/modaforge/home',
    component: React.lazy(async () => import('../../home')),
    children: []
  },
  // 连接器
  {
    name: 'connection',
    key: '/tenant/compute/modaforge/connection',
    component: React.lazy(async () => import('../../connection')),
    children: []
  },
  // 数据载入
  {
    name: 'dataLoad',
    key: '/tenant/compute/modaforge/dataLoad', //临时修改../../dataLoad/index
    component: React.lazy(async () => import('../../dataLoad')),
    children: [
      {
        name: 'dataLoadList',
        key: '/tenant/compute/modaforge/dataLoad/list',
        component: React.lazy(async () => import('../../dataLoad/list/list'))
      },
      {
        name: 'dataLoadDetail',
        key: '/tenant/compute/modaforge/dataLoad/detail',
        component: React.lazy(
          async () => import('../../dataLoad/detail/dataLoad-detail')
        )
      },
      {
        name: 'accessLodaDetail',
        key: '/tenant/compute/modaforge/dataLoad/access',
        component: React.lazy(
          async () => import('../../dataLoad/access/access-detail')
        )
      }
    ]
  },
  // 工作流
  {
    name: 'workflowList',
    key: '/tenant/compute/modaforge/workflowList',
    component: React.lazy(async () => import('../../workflowList')),
    children: []
  },
  // 创建工作流
  {
    name: 'workflowConfig',
    key: '/tenant/compute/modaforge/workflowConfig',
    component: React.lazy(async () => import('../../workflowConfig')),
    children: []
  },
  // 作业
  {
    name: 'workflowTask',
    key: '/tenant/compute/modaforge/workflowTask',
    component: React.lazy(async () => import('../../workflowTask')),
    children: [
      {
        name: 'taskDetail',
        key: '/tenant/compute/modaforge/workflowTaskDetail',
        component: React.lazy(async () => import('../../workflowTask/detail'))
      }
    ]
  },
  //APIKey
  {
    name: 'apiKey',
    key: '/tenant/compute/modaforge/apiKey',
    component: React.lazy(async () => import('../../apiKey')),
    children: []
  },
  // 组织管理
  {
    name: 'organization',
    key: '/tenant/compute/modaforge/organization',
    component: React.lazy(async () => import('../../organization')),
    children: []
  },
  // 成员管理
  {
    name: 'member',
    key: '/tenant/compute/modaforge/member',
    component: React.lazy(async () => import('../../member')),
    children: []
  },
  // 登陆页面
  {
    name: 'login',
    key: '/tenant/compute/modaforge/login',
    component: React.lazy(async () => import('../../login')),
    children: []
  },
  // 用户信息页面
  {
    name: 'userinfo',
    key: '/tenant/compute/modaforge/userinfo',
    component: React.lazy(async () => import('../../userinfo')),
    children: []
  },
  // 数据目录
  {
    name: 'dataCatalog',
    key: '/tenant/compute/modaforge/dataCatalog',
    component: React.lazy(async () => import('../../dataCatalog')),
    children: []
  },
  // 数据集详情 (需要在数据集管理之前匹配)
  {
    name: 'datasetDetail',
    key: '/tenant/compute/modaforge/datasetManagement/detail/:id',
    component: React.lazy(async () => {
      console.log('加载数据集详情页组件');
      return import('../../../components/detail/index');
    }),
    children: []
  },
  // 数据集管理
  {
    name: 'datasetManagement',
    key: '/tenant/compute/modaforge/datasetManagement',
    component: React.lazy(async () => import('../../datasetManagement')),
    children: []
  },
  // 数据标注
  {
    name: 'requirement',
    key: '/tenant/compute/modaforge/requirement',
    component: React.lazy(async () => import('../../requirement')),
    children: [
      {
        name: 'requirementDetail',
        key: '/tenant/compute/modaforge/requirementDetail',
        component: React.lazy(async () => import('../../requirement/detail'))
      }
    ]
  },
];

// 获取平铺的路由数组
export const getFlatRoutes = (routesArr: IRoute[]): IRoute[] => {
  return routesArr.reduce((flatArr, cur) => {
    // TODO: ts错误
    // @ts-expect-error
    flatArr.push({ ...cur, children: [] });
    if (cur.children && cur.children.length) {
      const child = cur.children;
      child.map((item) => {
        return (item['parentKey'] = cur.key);
      });
      const res = getFlatRoutes(child);
      // TODO: ts错误
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
          // TODO: ts错误
          // @ts-expect-error
          arr.push(newRoute);
        }
      } else {
        // TODO: ts错误
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
    if (first) {
      const firstRoute = first?.children?.[0]?.key || first.key;
      return firstRoute;
    }
    return '';
  }, [permissionRoute]);

  return [permissionRoute, defaultRoute];
};

export default useRoute;
