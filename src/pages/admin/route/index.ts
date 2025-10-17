import * as React from 'react';
import auth, { AuthParams } from '@/utils/authentication';
import { useEffect, useMemo, useState } from 'react';
import { ROUTE_PERMISSIONS } from '@/config/newPermissions';

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
  // 新权限字段
  permission?: string | null;
};

// om 运维、tenant 运营、portal 租户
export const routes: IRoute[] = [
  // 连接器
  {
    name: 'connection',
    key: '/tenant/compute/modaforge/connection',
    component: React.lazy(async () => import('../../connection')),
    permission: ROUTE_PERMISSIONS.connection,
    children: []
  },
  // 数据载入
  {
    name: 'dataLoad',
    key: '/tenant/compute/modaforge/dataLoad', //临时修改../../dataLoad/index
    component: React.lazy(async () => import('../../dataLoad')),
    permission: ROUTE_PERMISSIONS.dataLoad,
    children: [
      {
        name: 'dataLoadList',
        key: '/tenant/compute/modaforge/dataLoad/list',
        component: React.lazy(async () => import('../../dataLoad/list/list')),
        permission: ROUTE_PERMISSIONS.dataLoadList
      },
      {
        name: 'dataLoadDetail',
        key: '/tenant/compute/modaforge/dataLoad/detail',
        component: React.lazy(
          async () => import('../../dataLoad/detail/dataLoad-detail')
        ),
        permission: ROUTE_PERMISSIONS.dataLoadDetail
      },
      {
        name: 'accessLodaDetail',
        key: '/tenant/compute/modaforge/dataLoad/access',
        component: React.lazy(
          async () => import('../../dataLoad/access/access-detail')
        ),
        permission: ROUTE_PERMISSIONS.accessLodaDetail
      }
    ]
  },
  // SQL开发
  {
    name: 'sql',
    key: '/tenant/compute/modaforge/sql',
    component: React.lazy(async () => import('../../sql')),
    permission: ROUTE_PERMISSIONS.sql,
    children: []
  },
  // 工作流
  {
    name: 'workflowList',
    key: '/tenant/compute/modaforge/workflowList',
    component: React.lazy(async () => import('../../workflowList')),
    permission: ROUTE_PERMISSIONS.workflowList,
    children: []
  },
  // Pyspark
  {
    name: 'pyspark',
    key: '/tenant/compute/modaforge/pyspark',
    component: React.lazy(async () => import('../../pyspark')),
    permission: ROUTE_PERMISSIONS.pyspark,
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
  // 数据标注 - 需求管理
  {
    name: 'requirement',
    key: '/tenant/compute/modaforge/requirement',
    component: React.lazy(async () => import('../../requirement')),
    permission: ROUTE_PERMISSIONS.requirement,
    children: [
      {
        name: 'requirementDetail',
        key: '/tenant/compute/modaforge/requirementDetail',
        component: React.lazy(async () => import('../../requirement/detail')),
        permission: ROUTE_PERMISSIONS.requirementDetail
      }
    ]
  },
  // 数据标注 - 任务列表
  {
    name: 'taskList',
    key: '/tenant/compute/modaforge/taskList',
    component: React.lazy(async () => import('../../requirement/taskList')),
    permission: ROUTE_PERMISSIONS.taskList,
    children: []
  },
  // 标注工具页面
  {
    name: 'labelEditor',
    key: '/tenant/compute/modaforge/labelEditor',
    component: React.lazy(async () => import('../../labelEditor')),
    children: []
  },
  // 运营中心页面
  {
    name: 'operationCenter',
    key: '/tenant/compute/modaforge/operationCenter',
    component: React.lazy(async () => import('../../operationCenter')),
    children: []
  }
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

// 新的权限路由Hook，基于新权限系统
export const usePermissionRoute = (
  userPermissions: string[]
): [IRoute[], string] => {
  const filterRoute = (routes: IRoute[], arr: IRoute[] = []): IRoute[] => {
    if (!routes.length) {
      return [];
    }

    for (const route of routes) {
      const { permission } = route;
      let visible = true;

      // 检查新权限系统
      if (permission) {
        visible = userPermissions.includes(permission);
      }

      // 如果没有权限要求，则默认可见（如登录页等）
      if (permission === null || permission === undefined) {
        visible = true;
      }

      if (!visible) {
        continue;
      }

      if (route.children && route.children.length) {
        const newRoute = { ...route, children: [] };
        filterRoute(route.children, newRoute.children);
        // 如果有子路由或者父路由本身可见，则添加
        if (newRoute.children.length || !permission) {
          arr.push(newRoute);
        }
      } else {
        arr.push({ ...route });
      }
    }

    return arr;
  };

  const [permissionRoute, setPermissionRoute] = useState<IRoute[]>(routes);

  useEffect(() => {
    const newRoutes = filterRoute(routes);
    setPermissionRoute(newRoutes);
  }, [userPermissions]);

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

// 保留原有的useRoute以兼容旧代码
const useRoute = (userPermission: any): [IRoute[], string] => {
  const filterRoute = (routes: IRoute[], arr: any[] = []): IRoute[] => {
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
