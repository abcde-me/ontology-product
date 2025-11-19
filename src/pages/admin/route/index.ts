import * as React from 'react';
import auth, { AuthParams } from '@/utils/authentication';
import { useEffect, useMemo, useState } from 'react';
import { Redirect } from 'react-router';
import {
  CONNECTION_PERMISSIONS,
  DATA_LOAD_PERMISSIONS,
  SQL_PERMISSIONS,
  PYSPARK_PERMISSIONS,
  WORKFLOW_LIST_PERMISSIONS,
  WORKFLOW_TASK_PERMISSIONS,
  DATA_CATALOG_PERMISSIONS,
  DATA_MANAGEMENT_PERMISSIONS,
  REQUIREMENT_PERMISSIONS,
  ANNOTATION_TASK_PERMISSIONS,
  ORGANIZATION_PERMISSIONS,
  USER_PERMISSIONS,
  USER_GROUP_PERMISSIONS,
  ROLE_PERMISSIONS,
  PROJECT_PERMISSIONS,
  API_KEY_PERMISSIONS
} from '@/config/permissions';

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

// om 运维、tenant 运营、portal 租户
export const routes: IRoute[] = [
  // 连接器
  {
    name: 'connection',
    key: '/tenant/compute/modaforge/connection',
    component: React.lazy(async () => import('../../connection')),
    permission: CONNECTION_PERMISSIONS.LIST,
    children: []
  },
  // 数据载入
  {
    name: 'dataLoad',
    key: '/tenant/compute/modaforge/dataLoad', //临时修改../../dataLoad/index
    component: React.lazy(async () => import('../../dataLoad')),
    permission: DATA_LOAD_PERMISSIONS.LIST,
    children: [
      {
        name: 'dataLoadList',
        key: '/tenant/compute/modaforge/dataLoad/list',
        component: React.lazy(async () => import('../../dataLoad/list/list')),
        permission: DATA_LOAD_PERMISSIONS.LIST
      },
      {
        // 创建数据载入任务
        name: 'createDataLoad',
        key: '/tenant/compute/modaforge/dataLoad/create',
        component: React.lazy(async () => import('../../dataLoad/create')),
        permission: DATA_LOAD_PERMISSIONS.LIST
      },
      {
        // 编辑数据载入任务
        name: 'editDataLoad',
        key: '/tenant/compute/modaforge/dataLoad/edit/:task_id',
        component: React.lazy(async () => import('../../dataLoad/edit')),
        permission: DATA_LOAD_PERMISSIONS.CAN_UPDATE
      },
      {
        name: 'dataLoadDetail',
        key: '/tenant/compute/modaforge/dataLoad/detail',
        component: React.lazy(
          async () => import('../../dataLoad/detail/dataLoad-detail')
        ),
        permission: DATA_LOAD_PERMISSIONS.CAN_GET
      },
      {
        name: 'accessLodaDetail',
        key: '/tenant/compute/modaforge/dataLoad/access',
        component: React.lazy(
          async () => import('../../dataLoad/access/access-detail')
        ),
        permission: 'aimdp-manager:data_loader:read:list'
      }
    ]
  },
  // SQL开发
  {
    name: 'sql',
    key: '/tenant/compute/modaforge/sql',
    component: React.lazy(async () => import('../../sql')),
    permission: SQL_PERMISSIONS.LIST,
    children: []
  },
  // 工作流
  {
    name: 'workflowList',
    key: '/tenant/compute/modaforge/workflowList',
    component: React.lazy(async () => import('../../workflowList')),
    permission: WORKFLOW_LIST_PERMISSIONS.LIST,
    children: []
  },
  // pyspark
  {
    name: 'pyspark',
    key: '/tenant/compute/modaforge/pyspark',
    component: React.lazy(async () => import('../../pyspark')),
    permission: PYSPARK_PERMISSIONS.LIST,
    children: []
  },
  // 创建工作流
  {
    name: 'workflowConfig',
    key: '/tenant/compute/modaforge/workflowConfig',
    component: React.lazy(async () => import('../../workflowConfig')),
    anyPermission: [
      WORKFLOW_LIST_PERMISSIONS.CAN_CREATE,
      WORKFLOW_LIST_PERMISSIONS.GET
    ],
    children: []
  },
  // RAG详情页面
  {
    name: 'ragDetail',
    key: '/tenant/compute/modaforge/ragDetail',
    component: React.lazy(async () => import('../../ragDetail')),
    children: []
  },
  // 文件数据对比测试页面
  {
    name: 'compareFileData',
    key: '/tenant/compute/modaforge/compareFileData',
    component: React.lazy(
      async () => import('../../ragDetail/test/CompareFileData')
    ),
    children: []
  },
  // 作业
  {
    name: 'workflowTask',
    key: '/tenant/compute/modaforge/workflowTask',
    component: React.lazy(async () => import('../../workflowTask')),
    permission: WORKFLOW_TASK_PERMISSIONS.LIST,
    children: [
      {
        name: 'taskDetail',
        key: '/tenant/compute/modaforge/workflowTaskDetail',
        component: React.lazy(async () => import('../../workflowTask/detail')),
        permission: WORKFLOW_TASK_PERMISSIONS.LIST
      }
    ]
  },
  //APIKey
  {
    name: 'apiKey',
    key: '/tenant/compute/modaforge/apiKey',
    component: React.lazy(async () => import('../../apiKey')),
    permission: 'aimdp-manager:apikey:read:list',
    children: []
  },
  // 组织管理
  {
    name: 'organization',
    key: '/tenant/compute/modaforge/organization',
    component: React.lazy(async () => import('../../organization')),
    permission: 'organizations:can_view',
    children: []
  },
  // 成员管理
  {
    name: 'member',
    key: '/tenant/compute/modaforge/member',
    component: React.lazy(async () => import('../../member')),
    permission: 'user:can_view',
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
    permission: DATA_CATALOG_PERMISSIONS.LIST,
    children: [
      {
        name: 'dataCatalogList',
        key: '/tenant/compute/modaforge/dataCatalog/list',
        component: React.lazy(async () => import('../../dataCatalog/list')),
        permission: DATA_MANAGEMENT_PERMISSIONS.LIST
      },
      {
        // 创建元数据目录
        name: 'createMetaData',
        key: '/tenant/compute/modaforge/dataCatalog/createMetaData',
        component: React.lazy(
          async () => import('../../dataCatalog/createMetaData')
        ),
        permission: DATA_MANAGEMENT_PERMISSIONS.LIST
      }
      // {
      //   name: 'dataAssetEdit',
      //   key: '/tenant/compute/modaforge/dataAsset/edit/:id',
      //   component: React.lazy(
      //     async () => import('../../dataAsset/modules/edit')
      //   ),
      //   permission: DATA_MANAGEMENT_PERMISSIONS.LIST
      // }
    ]
  },
  // 数据集详情 (需要在数据集管理之前匹配)
  {
    name: 'datasetDetail',
    key: '/tenant/compute/modaforge/datasetManagement/detail/:id',
    component: React.lazy(async () => {
      console.log('加载数据集详情页组件');
      return import('../../../components/detail/index');
    }),
    permission: DATA_MANAGEMENT_PERMISSIONS.CAN_SEARCH,
    children: []
  },
  // 数据集管理
  {
    name: 'datasetManagement',
    key: '/tenant/compute/modaforge/datasetManagement',
    component: React.lazy(async () => import('../../datasetManagement')),
    permission: DATA_MANAGEMENT_PERMISSIONS.LIST,
    children: []
  },
  // 数据资产
  {
    name: 'dataAsset',
    key: '/tenant/compute/modaforge/dataAsset',
    component: React.lazy(async () => import('../../dataAsset')),
    permission: DATA_MANAGEMENT_PERMISSIONS.LIST,
    children: [
      {
        name: 'dataAssetList',
        key: '/tenant/compute/modaforge/dataAsset/list',
        component: React.lazy(
          async () => import('../../dataAsset/modules/list')
        ),
        permission: DATA_MANAGEMENT_PERMISSIONS.LIST
      },
      {
        name: 'dataAssetCreate',
        key: '/tenant/compute/modaforge/dataAsset/create',
        component: React.lazy(
          async () => import('../../dataAsset/modules/create')
        ),
        permission: DATA_MANAGEMENT_PERMISSIONS.LIST
      },
      {
        name: 'dataAssetEdit',
        key: '/tenant/compute/modaforge/dataAsset/edit',
        component: React.lazy(
          async () => import('../../dataAsset/modules/edit')
        ),
        permission: DATA_MANAGEMENT_PERMISSIONS.LIST
      }
    ]
  },
  // 数据标注 - 需求管理
  {
    name: 'requirement',
    key: '/tenant/compute/modaforge/requirement',
    component: React.lazy(async () => import('../../requirement')),
    permission: REQUIREMENT_PERMISSIONS.LIST,
    children: [
      {
        name: 'requirementDetail',
        key: '/tenant/compute/modaforge/requirementDetail',
        component: React.lazy(async () => import('../../requirement/detail')),
        permission: REQUIREMENT_PERMISSIONS.GET
      }
    ]
  },
  // 数据标注 - 任务列表
  {
    name: 'taskList',
    key: '/tenant/compute/modaforge/taskList',
    component: React.lazy(async () => import('../../requirement/taskList')),
    permission: ANNOTATION_TASK_PERMISSIONS.LIST,
    children: []
  },
  // 标注工具页面
  {
    name: 'labelEditor',
    key: '/tenant/compute/modaforge/labelEditor',
    component: React.lazy(async () => import('../../labelEditor')),
    permission: ANNOTATION_TASK_PERMISSIONS.GET_ID_TASK,
    children: []
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
