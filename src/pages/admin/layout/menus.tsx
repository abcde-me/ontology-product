import React from 'react';
import { isWujie } from '@/utils/env';
import Connection from '@/assets/sider/connection.svg';
import DataLoad from '@/assets/sider/data-load.svg';
import DataCatalog from '@/assets/sider/data-catalog.svg';
import DatasetManagement from '@/assets/sider/dataset-management.svg';
import DataMarket from '@/assets/sider/dataset-management.svg';
import WorkflowList from '@/assets/sider/workflow-list.svg';
import WorkflowTask from '@/assets/sider/workflow-task.svg';
import OrganMenu from '@/assets/sider/organmenu.svg';
import MemberMenu from '@/assets/sider/membermenu.svg';
import PasparkMenu from '@/assets/sider/pyspark.svg';
import SqlMenu from '@/assets/sider/sql.svg';
import AnnotationTask from '@/assets/sider/annotationTask.svg';
import RequirementManagement from '@/assets/sider/requirementManagement.svg';

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
  permission?: string; // 添加权限字段
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
      if (menu.permission && !userPermissions.includes(menu.permission)) {
        return null;
      }

      return menu;
    })
    .filter(Boolean) as MenuModel[]; // 移除 null 值
};

const iconClass = 'appforge-sider-icon flex-none text-[20px]';
export const menus: MenuModel[] = [
  {
    type: 'itemGroup',
    title: '数据连接',
    key: 'dataConnection',
    children: [
      {
        title: '连接器',
        icon: <Connection className={iconClass} />,
        key: 'connection',
        path: '/tenant/compute/modaforge/connection',
        permission: 'connectors:can_search'
      },
      {
        title: '数据载入',
        icon: <DataLoad className={iconClass} />,
        path: '/tenant/compute/modaforge/dataLoad',
        key: 'dataLoad',
        permission: 'dataloader:can_search'
      }
    ]
  },
  {
    type: 'itemGroup',
    title: '数据处理',
    key: 'DataDeal',
    children: [
      {
        title: '工作流',
        icon: <WorkflowList className={iconClass} />,
        key: 'workflowList',
        path: '/tenant/compute/modaforge/workflowList',
        permission: 'workflow:can_search'
      },
      {
        title: '作业',
        icon: <WorkflowTask className={iconClass} />,
        key: 'workflowTask',
        path: '/tenant/compute/modaforge/workflowTask',
        permission: 'workflowInstance:can_search'
      }
    ]
  },
  {
    type: 'itemGroup',
    title: '数据开发',
    key: 'DataDevelop',
    children: [
      {
        title: 'PySpark开发',
        icon: <PasparkMenu className={iconClass} />,
        key: 'pyspark',
        path: '/tenant/compute/modaforge/pyspark',
        permission: 'pyspark:can_search'
      },
      {
        title: 'SQL开发',
        icon: <SqlMenu className={iconClass} />,
        key: 'sql',
        path: '/tenant/compute/modaforge/sql',
        permission: 'sql_script:can_search'
      }
    ]
  },
  {
    type: 'itemGroup',
    title: '数据标注',
    key: 'labelMgmt',
    children: [
      {
        title: '需求管理',
        icon: <RequirementManagement className={iconClass} />,
        key: 'requirement',
        path: '/tenant/compute/modaforge/requirement'
      },
      {
        title: '标注任务',
        icon: <AnnotationTask className={iconClass} />,
        key: 'taskList',
        path: '/tenant/compute/modaforge/taskList'
      }
    ]
  },
  {
    type: 'itemGroup',
    title: '数据管理',
    key: 'DataManagement',
    children: [
      {
        title: '数据目录',
        icon: <DataCatalog className={iconClass} />,
        key: 'dataCatalog',
        path: '/tenant/compute/modaforge/dataCatalog',
        permission: 'directory:can_search_dirs'
      },
      {
        title: '数据集管理',
        icon: <DatasetManagement className={iconClass} />,
        key: 'datasetManagement',
        path: '/tenant/compute/modaforge/datasetManagement',
        permission: 'datasets:can_search'
      },
      {
        title: '数据集市',
        icon: <DataMarket className={iconClass} />,
        key: 'dataMarket',
        path: '/tenant/compute/modaforge/dataMarket'
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
        path: '/tenant/compute/modaforge/organization',
        permission: 'organizations:can_search'
      },
      {
        title: '用户管理',
        icon: <MemberMenu className={iconClass} />,
        path: '/tenant/compute/modaforge/member',
        key: 'userMgmt',
        permission: 'users:can_search'
      }
    ]
  }
];

/*
集成到AI平台不显示运营中心菜单
嵌入运营中心页面示例
path: '/tenant/compute/modaforge/operationCenter?url=' + encodeURIComponent('/operationcenter/tenant/compute/operationcenter/organization'),
path: '/tenant/compute/modaforge/operationCenter?url=' + encodeURIComponent('/operationcenter/tenant/compute/operationcenter/user'),
*/
