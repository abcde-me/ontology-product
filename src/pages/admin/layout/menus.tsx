import React from 'react';
import { isWujie } from '@/utils/env';
import { IconHome } from '@arco-design/web-react/icon';
import {
  ONTOLOGY_PERMISSIONS,
  API_KEY_PERMISSIONS,
  TAG_PERMISSIONS,
  ORGANIZATION_PERMISSIONS,
  USER_PERMISSIONS,
  USER_GROUP_PERMISSIONS,
  ROLE_PERMISSIONS,
  PROJECT_PERMISSIONS
} from '@/config/permissions';
import OntologyLibrary from '@/assets/sider/ontology-library.svg';
import OrganMenu from '@/assets/sider/organmenu.svg';
import LabelMenu from '@/assets/label-menu.svg';
import MemberMenu from '@/assets/sider/membermenu.svg';
import BaseMenu from '@/assets/sider/basemenu.svg';

export type MenuModel = {
  title: string;
  icon?: any;
  path?: string;
  activePaths?: string[];
  key: string;
  children?: MenuModel[];
  className?: string;
  type?: string;
  external?: boolean;
  permission?: string; // 单个权限字段
  anyPermission?: string[]; // 任意一个权限即可（OR 逻辑）
  allPermission?: string[]; // 必须全部权限（AND 逻辑）
  queryParamMatcher?: (search: string) => boolean; // 用于匹配查询参数
};

export const filterMenusByPermissions = (
  menus: MenuModel[],
  userPermissions: string[] = []
): MenuModel[] => {
  return menus
    .filter((m) => (isWujie ? !m.external : true))
    .map((menu) => {
      // 如果是分组菜单，递归过滤子菜单
      if (menu.children && menu.children.length > 0) {
        const filteredChildren = filterMenusByPermissions(
          menu.children,
          userPermissions
        );

        // 如果过滤后没有子菜单，则不显示该分组
        if (filteredChildren.length === 0) {
          return null;
        }

        return {
          ...menu,
          children: filteredChildren
        };
      }

      // 如果菜单需要权限且用户没有该权限，则过滤掉
      // 优先级：allPermission > anyPermission > permission
      if (menu.allPermission) {
        // 必须全部权限
        if (
          !menu.allPermission.every((perm) => userPermissions.includes(perm))
        ) {
          return null;
        }
      } else if (menu.anyPermission) {
        // 任意一个权限即可
        if (
          !menu.anyPermission.some((perm) => userPermissions.includes(perm))
        ) {
          return null;
        }
      } else if (menu.permission) {
        // 单个权限
        if (!userPermissions.includes(menu.permission)) {
          return null;
        }
      }

      return menu;
    })
    .filter(Boolean) as MenuModel[]; // 移除 null 值
};

const iconClass = 'appforge-sider-icon flex-none text-[20px]';
const hasActiveMenu = (name: string, search: string) => {
  const params = new URLSearchParams(search);
  const url = params.get('mdp_operation_center') || params.get('url');
  return url?.includes(name) ?? false;
};

export const menus: MenuModel[] = [
  {
    type: 'itemGroup',
    title: '首页',
    key: 'homeGroup',
    children: [
      {
        title: '首页',
        icon: <IconHome className={iconClass} />,
        key: 'home',
        path: '/tenant/compute/noto/home'
      }
    ]
  },
  {
    type: 'itemGroup',
    title: '本体管理',
    key: 'OntologyManagement',
    children: [
      {
        title: '本体场景库',
        icon: <OntologyLibrary className={iconClass} />,
        key: 'OntologySceneLibrary',
        path: '/tenant/compute/noto/ontologyScene',
        permission: ONTOLOGY_PERMISSIONS.LIST
      }
    ]
  },
  {
    type: 'itemGroup',
    title: '平台资源',
    key: 'platformResource',
    children: [
      {
        title: 'API Key管理',
        icon: <OrganMenu className={iconClass} />,
        key: 'apiKeyMgmt',
        path:
          '/tenant/compute/noto/operationCenter?url=' +
          encodeURIComponent(
            '/operationcenter/tenant/compute/operationcenter/apikey'
          ),
        activePaths: ['/tenant/compute/noto/operationCenter'],
        queryParamMatcher: hasActiveMenu.bind(null, 'apikey'),
        permission: API_KEY_PERMISSIONS.MENU
      },
      {
        key: 'tag',
        title: '标签管理',
        icon: <LabelMenu className={iconClass} />,
        path:
          '/tenant/compute/noto/operationCenter?url=' +
          encodeURIComponent(
            '/operationcenter/tenant/compute/operationcenter/tag'
          ),
        activePaths: ['/tenant/compute/noto/operationCenter'],
        queryParamMatcher: hasActiveMenu.bind(null, 'tag'),
        permission: TAG_PERMISSIONS.LIST
      }
    ]
  },
  {
    type: 'itemGroup',
    title: '平台管理',
    key: 'mgmtGroup',
    external: true,
    children: [
      {
        title: '组织管理',
        icon: <OrganMenu className={iconClass} />,
        key: 'orgMgmt',
        path:
          '/tenant/compute/noto/operationCenter?url=' +
          encodeURIComponent(
            '/operationcenter/tenant/compute/operationcenter/organization'
          ),
        activePaths: ['/tenant/compute/noto/operationCenter'],
        queryParamMatcher: hasActiveMenu.bind(null, 'organization'),
        permission: ORGANIZATION_PERMISSIONS.MENU
      },
      {
        title: '用户管理',
        icon: <MemberMenu className={iconClass} />,
        path:
          '/tenant/compute/noto/operationCenter?url=' +
          encodeURIComponent(
            '/operationcenter/tenant/compute/operationcenter/user'
          ),
        key: 'userMgmt',
        activePaths: ['/tenant/compute/noto/operationCenter'],
        queryParamMatcher: (search: string) => {
          const url = new URLSearchParams(search).get('mdp_operation_center');
          return (
            (url?.includes('/user') && !url?.includes('user-group')) ?? false
          );
        },
        permission: USER_PERMISSIONS.MENU
      },
      {
        title: '用户组管理',
        icon: <MemberMenu className={iconClass} />,
        path:
          '/tenant/compute/noto/operationCenter?url=' +
          encodeURIComponent(
            '/operationcenter/tenant/compute/operationcenter/user-group'
          ),
        key: 'userGroupMgmt',
        activePaths: ['/tenant/compute/noto/operationCenter'],
        queryParamMatcher: hasActiveMenu.bind(null, 'user-group'),
        permission: USER_GROUP_PERMISSIONS.MENU
      },
      {
        title: '角色管理',
        icon: <BaseMenu className={iconClass} />,
        path:
          '/tenant/compute/noto/operationCenter?url=' +
          encodeURIComponent(
            '/operationcenter/tenant/compute/operationcenter/role'
          ),
        key: 'roleMgmt',
        activePaths: ['/tenant/compute/noto/operationCenter'],
        queryParamMatcher: hasActiveMenu.bind(null, 'role'),
        permission: ROLE_PERMISSIONS.MENU
      }
    ]
  },
  {
    type: 'itemGroup',
    title: '工作空间',
    key: 'workspaceGroup',
    external: true,
    children: [
      {
        title: '项目管理',
        icon: <OrganMenu className={iconClass} />,
        key: 'projectMgmt',
        path:
          '/tenant/compute/noto/operationCenter?url=' +
          encodeURIComponent(
            '/operationcenter/tenant/compute/operationcenter/project'
          ),
        activePaths: ['/tenant/compute/noto/operationCenter'],
        queryParamMatcher: hasActiveMenu.bind(null, 'project'),
        permission: PROJECT_PERMISSIONS.MENU
      }
    ]
  }
];
