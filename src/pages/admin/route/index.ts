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
  // app列表
  {
    name: 'appList',
    key: '/tenant/compute/appforge/appList',
    component: React.lazy(async () => import('../../appList')),
    children: []
  },
  // app配置
  {
    name: 'appConfig',
    key: '/tenant/compute/appforge/appConfig',
    component: React.lazy(async () => import('../../appCreate')),
    children: []
  },
  {
    name: 'appCreate',
    key: '/tenant/compute/appforge/appCreate',
    component: React.lazy(async () => import('../../appCreate')),
    children: []
  },
  //应用商店
  {
    name: 'appStore',
    key: '/tenant/compute/appforge/appStore',
    component: React.lazy(async () => import('../../appStore')),
    children: []
  },
  //应用商店V2
  {
    name: 'appStoreTwo',
    key: '/tenant/compute/appforge/appStoreTwo',
    component: React.lazy(async () => import('../../appStoreV2')),
    children: []
  },
  //应用正式聊天的界面
  {
    name: 'appChat',
    key: '/tenant/compute/appforge/appChat',
    component: React.lazy(async () => import('../../appChat'))
  },
  // 知识库
  {
    name: 'knowledgeBase',
    key: '/tenant/compute/appforge/knowledgeBase',
    component: React.lazy(
      async () => import('../../knowledgeBase/knowledgeList')
    ),
    children: []
  },
  {
    name: 'knowledgeDetail',
    key: '/tenant/compute/appforge/knowledgeDetail',
    component: React.lazy(
      async () => import('../../knowledgeBase/knowledgeDetail')
    ),
    children: [],
    sub: true
  },
  {
    name: 'addDocument',
    key: '/tenant/compute/appforge/addDocument',
    component: React.lazy(
      async () => import('../../knowledgeBase/addDocument')
    ),
    children: []
  },
  {
    name: 'knowledgeCreate',
    key: '/tenant/compute/appforge/knowledgeCreate',
    component: React.lazy(
      async () => import('../../knowledgeBase/knowledgeCreate')
    ),
    children: []
  },
  {
    name: 'knowledgeConfig',
    key: '/tenant/compute/appforge/knowledgeConfig',
    component: React.lazy(
      async () => import('../../knowledgeBase/knowledgeConfig/index')
    ),
    children: []
  },
  {
    name: 'knowledgeTest',
    key: '/tenant/compute/appforge/knowledgeTest',
    component: React.lazy(
      async () => import('../../knowledgeBase/knowledgeTest')
    ),
    children: [],
    sub: true
  },
  {
    name: 'documentDetail',
    key: '/tenant/compute/appforge/documentDetail',
    component: React.lazy(
      async () => import('../../knowledgeBase/documentDetail')
    ),
    children: [],
    sub: true
  },

  //主页
  {
    name: 'home',
    key: '/tenant/compute/appforge/home',
    component: React.lazy(async () => import('../../home/index')),
    children: []
  },
  //——————————————————————————
  //知识库v2
  {
    name: 'knowledgeBaseV2',
    key: '/tenant/compute/appforge/knowledgeBaseV2',
    component: React.lazy(async () => import('../../knowledgeBaseV2/index')),
    children: []
  },
  //创建知识库v2
  {
    name: 'createKnowledge',
    key: '/tenant/compute/appforge/createKnowledge',
    component: React.lazy(
      async () => import('../../knowledgeBaseV2/createKnowledge/index')
    ),
    children: []
  },
  //知识库v2 配置页面
  {
    name: 'configurationpage',
    key: '/tenant/compute/appforge/configurationpage',

    component: React.lazy(
      async () => import('../../knowledgeBaseV2/configurationpage/index')
    )
  },
  //智能体v2
  {
    name: 'agentV2',
    key: '/tenant/compute/appforge/agentV2',
    component: React.lazy(async () => import('../../agentV2/index')),
    children: []
  },
  //智能体v2 智能体配置
  {
    name: 'agentCreate',
    key: '/tenant/compute/appforge/agentCreate',
    component: React.lazy(async () => import('../../agentTwo/agentCreate')),
    children: []
  },
  //智能体v2 智能体应用
  {
    name: 'agentPage',
    key: '/tenant/compute/appforge/agentPage',
    component: React.lazy(async () => import('../../agentPage/index')),
    children: []
  },
  //APIKey
  {
    name: 'apiKey',
    key: '/tenant/compute/appforge/apiKey',
    component: React.lazy(async () => import('../../apiKey/index')),
    children: []
  },
  // 组织管理
  {
    name: 'organization',
    key: '/tenant/compute/appforge/organization',
    component: React.lazy(async () => import('../../organization/index')),
    children: []
  },
  // 成员管理
  {
    name: 'member',
    key: '/tenant/compute/appforge/member',
    component: React.lazy(async () => import('../../member/index')),
    children: []
  },
  // 登陆页面
  {
    name: 'login',
    key: '/tenant/compute/appforge/login',
    component: React.lazy(async () => import('../../login/index')),
    children: []
  },
  // 用户信息页面
  {
    name: 'userinfo',
    key: '/tenant/compute/appforge/userinfo',
    component: React.lazy(async () => import('../../userinfo/index')),
    children: []
  },
  //——————————————————————————
  //工具列表
  {
    name: 'toolList',
    key: '/tenant/compute/appforge/toolList',
    component: React.lazy(async () => import('../../toolList/index')),
    children: []
  },
  //创建工具
  {
    name: 'toolCreate',
    key: '/tenant/compute/appforge/toolCreate',
    component: React.lazy(async () => import('../../toolCreateSchema/index')),
    children: []
  },
  //工具详情
  {
    name: 'toolDetail',
    key: '/tenant/compute/appforge/toolDetail',
    component: React.lazy(async () => import('../../toolDetail/index')),
    children: []
  },
  //工具商店
  {
    name: 'plugins', // 插件广场
    key: '/tenant/compute/appforge/plugins',
    component: React.lazy(async () => import('../../plugins/list/index')),
    children: []
  },
  {
    name: 'pluginDetail', // 插件广场
    key: '/tenant/compute/appforge/plugin/detail',
    component: React.lazy(async () => import('../../plugins/detail/index')),
    children: []
  },
  {
    name: 'toolStore',
    key: '/tenant/compute/appforge/toolStore',
    component: React.lazy(async () => import('../../toolList/store')),
    children: []
  },
  {
    name: 'pluginDetail',
    key: '/tenant/compute/appforge/toolStoreDetail',
    component: React.lazy(async () => import('../../pluginInfo/index')),
    children: []
  },
  {
    name: 'dataConnection',
    key: '/tenant/compute/appforge/dataConnection',
    component: React.lazy(async () => import('../../dataConnection/index')),
    children: []
  },
  {
    name: 'dataSource',
    key: '/tenant/compute/appforge/dataSource',
    component: React.lazy(async () => import('../../dataSource/index')),
    children: []
  },
  {
    name: 'textDetailPage',
    key: '/tenant/compute/appforge/textDetailPage',
    component: React.lazy(
      async () => import('../../dataConnection/textDetailPage')
    ),
    children: []
  },
  {
    name: 'spaceMgmt',
    key: '/tenant/compute/appforge/spaceMgmt',
    component: React.lazy(async () => import('../../systemMgmt/spaceMgmt')),
    children: []
  },
  {
    name: 'spaceDetail',
    key: '/tenant/compute/appforge/spaceDetail',
    component: React.lazy(async () => import('../../systemMgmt/spaceDetail')),
    children: []
  },
  {
    name: 'prompt',
    key: '/tenant/compute/appforge/prompt',
    component: React.lazy(async () => import('../../prompt/index')),
    children: []
  },
  {
    name: 'workflowList',
    key: '/tenant/compute/appforge/workflowList',
    component: React.lazy(async () => import('../../workflowList/index')),
    children: []
  },
  {
    name: 'workflowConfig',
    key: '/tenant/compute/appforge/workflowConfig',
    component: React.lazy(async () => import('../../workflowConfig/main')),
    children: []
  },
  {
    name: 'workflowPublic',
    key: '/tenant/compute/appforge/workflowPublic',
    component: React.lazy(async () => import('../../workflowPublic/main')),
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
