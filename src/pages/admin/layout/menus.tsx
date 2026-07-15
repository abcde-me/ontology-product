import React from 'react';
import { isWujie } from '@/utils/env';
import {
  ONTOLOGY_PERMISSIONS,
  API_KEY_PERMISSIONS,
  TAG_PERMISSIONS,
  MODEL_MANAGEMENT_PERMISSIONS,
  AUTOMATION_PERMISSIONS,
  DATA_SOURCE_PERMISSIONS
} from '@/config/permissions';
import { SECONDARY_MENU_ITEMS } from '@/config/secondaryMenuItems';
import { RESEARCH_THEME_ITEMS } from '@/config/researchThemeItems';
import OntologyLibrary from '@/assets/sider/ontology-library.svg';
import AIOntoWorkbench from '@/assets/sider/ai-onto-workbench.svg';
import OrganMenu from '@/assets/sider/organmenu.svg';
import BaseMenu from '@/assets/sider/basemenu.svg';
import HomeIcon from '@/assets/sider/home.svg';
import RuleRunLogIcon from '@/assets/sider/rule-run-log.svg';
import { IconMdpDatasetMgmt } from '@ceai-front/svg-icons';

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

const researchThemeIcons = [
  <OntologyLibrary key="research-icon-0" className={iconClass} />,
  <AIOntoWorkbench key="research-icon-1" className={iconClass} />,
  <RuleRunLogIcon key="research-icon-2" className={iconClass} />,
  <BaseMenu key="research-icon-3" className={iconClass} />,
  <OrganMenu key="research-icon-4" className={iconClass} />,
  <IconMdpDatasetMgmt key="research-icon-5" className={iconClass} />
];

export const menus: MenuModel[] = [
  {
    type: 'itemGroup',
    title: '首页',
    key: 'homeGroup',
    children: [
      {
        title: SECONDARY_MENU_ITEMS.home,
        icon: <HomeIcon className={iconClass} />,
        key: 'home',
        path: '/tenant/compute/onto/home'
      },
      {
        title: SECONDARY_MENU_ITEMS.ontologyOverview,
        icon: <OntologyLibrary className={iconClass} />,
        key: 'ontologyOverview',
        path: '/tenant/compute/onto/home/ontologyOverview'
      }
    ]
  },
  {
    type: 'itemGroup',
    title: '本体管理',
    key: 'OntologyManagement',
    children: [
      {
        title: SECONDARY_MENU_ITEMS.OntologySceneLibrary,
        icon: <OntologyLibrary className={iconClass} />,
        key: 'OntologySceneLibrary',
        path: '/tenant/compute/onto/ontologyScene/list',
        permission: ONTOLOGY_PERMISSIONS.LIST
      },
      {
        title: SECONDARY_MENU_ITEMS.ontologyElements,
        icon: <OntologyLibrary className={iconClass} />,
        key: 'ontologyElements',
        path: '/tenant/compute/onto/ontologyElements/objectType',
        activePaths: ['/tenant/compute/onto/ontologyElements'],
        permission: ONTOLOGY_PERMISSIONS.LIST
      },
      {
        title: SECONDARY_MENU_ITEMS.ontologyPermission,
        icon: <OrganMenu className={iconClass} />,
        key: 'ontologyPermission',
        path: '/tenant/compute/onto/ontologyPermission',
        permission: ONTOLOGY_PERMISSIONS.LIST
      },
      {
        title: SECONDARY_MENU_ITEMS.ontologyMonitor,
        icon: <RuleRunLogIcon className={iconClass} />,
        key: 'ontologyMonitor',
        path: '/tenant/compute/onto/ontologyMonitor',
        permission: ONTOLOGY_PERMISSIONS.LIST
      }
    ]
  },
  {
    type: 'itemGroup',
    title: '本体洞察',
    key: 'ExploreAnalysis',
    children: [
      {
        title: SECONDARY_MENU_ITEMS.OntologyQuery,
        icon: <OntologyLibrary className={iconClass} />,
        key: 'OntologyQuery',
        path: '/tenant/compute/onto/exploreAnalysis/ontologyQuery',
        permission: ONTOLOGY_PERMISSIONS.LIST
      },
      {
        title: SECONDARY_MENU_ITEMS.ObjectBrowse,
        icon: <AIOntoWorkbench className={iconClass} />,
        key: 'ObjectBrowse',
        path: '/tenant/compute/onto/exploreAnalysis/objectBrowse',
        permission: ONTOLOGY_PERMISSIONS.LIST
      },
      {
        title: SECONDARY_MENU_ITEMS.RelationInsight,
        icon: <RuleRunLogIcon className={iconClass} />,
        key: 'RelationInsight',
        path: '/tenant/compute/onto/exploreAnalysis/relationInsight',
        permission: ONTOLOGY_PERMISSIONS.LIST
      },
      {
        title: SECONDARY_MENU_ITEMS.ImplicitRelation,
        icon: <RuleRunLogIcon className={iconClass} />,
        key: 'ImplicitRelation',
        path: '/tenant/compute/onto/exploreAnalysis/implicitRelation',
        permission: ONTOLOGY_PERMISSIONS.LIST
      },
      {
        title: SECONDARY_MENU_ITEMS.InferenceAnalysis,
        icon: <BaseMenu className={iconClass} />,
        key: 'InferenceAnalysis',
        path: '/tenant/compute/onto/exploreAnalysis/inferenceAnalysis',
        permission: ONTOLOGY_PERMISSIONS.LIST
      }
    ]
  },
  {
    type: 'itemGroup',
    title: '业务自动化',
    key: 'BusinessAutomation',
    children: [
      {
        title: SECONDARY_MENU_ITEMS.AutomationRuleManagement,
        icon: <IconMdpDatasetMgmt className={iconClass} />,
        key: 'AutomationRuleManagement',
        path: '/tenant/compute/onto/businessAutomation/management',
        permission: AUTOMATION_PERMISSIONS.LIST
      },
      {
        title: SECONDARY_MENU_ITEMS.AutomationRuleRunLog,
        icon: <RuleRunLogIcon className={iconClass} />,
        key: 'AutomationRuleRunLog',
        path: '/tenant/compute/onto/businessAutomation/runLog',
        permission: AUTOMATION_PERMISSIONS.LIST
      }
    ]
  },
  {
    type: 'itemGroup',
    title: '模拟仿真',
    key: 'Simulation',
    children: [
      {
        title: SECONDARY_MENU_ITEMS.SimulationComparison,
        icon: <OntologyLibrary className={iconClass} />,
        key: 'SimulationComparison',
        path: '/tenant/compute/onto/simulation/simulationComparison',
        permission: ONTOLOGY_PERMISSIONS.LIST
      },
      {
        title: SECONDARY_MENU_ITEMS.SimulationDeduction,
        icon: <AIOntoWorkbench className={iconClass} />,
        key: 'SimulationDeduction',
        path: '/tenant/compute/onto/simulation/simulationDeduction',
        permission: ONTOLOGY_PERMISSIONS.LIST
      }
    ]
  },
  {
    type: 'itemGroup',
    title: '应用中心',
    key: 'SceneCenter',
    children: [
      {
        title: SECONDARY_MENU_ITEMS.ApplicationScenario,
        icon: <IconMdpDatasetMgmt className={iconClass} />,
        key: 'ApplicationScenario',
        path: '/tenant/compute/onto/sceneCenter/applicationScene',
        activePaths: ['/tenant/compute/onto/sceneCenter/applicationScene'],
        permission: ONTOLOGY_PERMISSIONS.LIST
      },
      {
        title: SECONDARY_MENU_ITEMS.ComponentManagement,
        icon: <BaseMenu className={iconClass} />,
        key: 'ComponentManagement',
        path: '/tenant/compute/onto/sceneCenter/componentManagement',
        activePaths: ['/tenant/compute/onto/sceneCenter/componentManagement'],
        permission: ONTOLOGY_PERMISSIONS.LIST
      }
    ]
  },
  {
    type: 'itemGroup',
    title: '知识管理',
    key: 'KnowledgeManagement',
    children: [
      {
        title: SECONDARY_MENU_ITEMS.KnowledgeBase,
        icon: <OntologyLibrary className={iconClass} />,
        key: 'KnowledgeBase',
        path: '/tenant/compute/onto/knowledgeManagement/knowledgeBase',
        permission: ONTOLOGY_PERMISSIONS.LIST
      },
      {
        title: SECONDARY_MENU_ITEMS.SemanticMapping,
        icon: <BaseMenu className={iconClass} />,
        key: 'SemanticMapping',
        path: '/tenant/compute/onto/knowledgeManagement/semanticMapping',
        permission: ONTOLOGY_PERMISSIONS.LIST
      },
      {
        title: SECONDARY_MENU_ITEMS.DomainAxiom,
        icon: <OrganMenu className={iconClass} />,
        key: 'DomainAxiom',
        path: '/tenant/compute/onto/knowledgeManagement/domainAxiom',
        permission: ONTOLOGY_PERMISSIONS.LIST
      }
    ]
  },
  {
    type: 'itemGroup',
    title: '数据管理',
    key: 'DataConnection',
    children: [
      {
        title: SECONDARY_MENU_ITEMS.DataResourceManagement,
        icon: <IconMdpDatasetMgmt className={iconClass} />,
        key: 'DataResourceManagement',
        path: '/tenant/compute/onto/dataConnection/dataResource',
        permission: DATA_SOURCE_PERMISSIONS.LIST
      },
      {
        title: SECONDARY_MENU_ITEMS.DataTaskManagement2,
        icon: <RuleRunLogIcon className={iconClass} />,
        key: 'DataTaskManagement2',
        path: '/tenant/compute/onto/dataConnection/dataTask2',
        permission: DATA_SOURCE_PERMISSIONS.LIST
      },
      {
        title: SECONDARY_MENU_ITEMS.DataTaskManagement,
        icon: <RuleRunLogIcon className={iconClass} />,
        key: 'DataTaskManagement',
        path: '/tenant/compute/onto/dataConnection/dataTask',
        permission: DATA_SOURCE_PERMISSIONS.LIST
      },
      {
        title: SECONDARY_MENU_ITEMS.DataSourceManagement,
        icon: <IconMdpDatasetMgmt className={iconClass} />,
        key: 'DataSourceManagement',
        path: '/tenant/compute/onto/dataConnection/dataSource',
        permission: DATA_SOURCE_PERMISSIONS.LIST
      }
    ]
  },
  {
    type: 'itemGroup',
    title: '本体服务',
    key: 'OntologyService',
    children: [
      {
        title: SECONDARY_MENU_ITEMS.apiManagement,
        icon: <OrganMenu className={iconClass} />,
        key: 'apiManagement',
        path: '/tenant/compute/onto/platformResource/apiManagement',
        activePaths: ['/tenant/compute/onto/platformResource/apiManagement'],
        anyPermission: [API_KEY_PERMISSIONS.MENU, TAG_PERMISSIONS.LIST]
      },
      {
        title: SECONDARY_MENU_ITEMS.sdkManagement,
        icon: <OntologyLibrary className={iconClass} />,
        key: 'sdkManagement',
        path: '/tenant/compute/onto/platformResource/sdkManagement',
        permission: ONTOLOGY_PERMISSIONS.LIST
      }
    ]
  },
  {
    type: 'itemGroup',
    title: '军事主题',
    key: 'MilitaryTheme',
    children: [
      {
        title: SECONDARY_MENU_ITEMS.IntelligenceAnalysis,
        icon: <OntologyLibrary className={iconClass} />,
        key: 'IntelligenceAnalysis',
        path: '/tenant/compute/onto/sceneCenter/intelligenceAnalysis',
        permission: ONTOLOGY_PERMISSIONS.LIST
      },
      {
        title: SECONDARY_MENU_ITEMS.CounterEspionage,
        icon: <OrganMenu className={iconClass} />,
        key: 'CounterEspionage',
        path: '/tenant/compute/onto/militaryTheme/counterEspionage',
        permission: ONTOLOGY_PERMISSIONS.LIST
      },
      {
        title: SECONDARY_MENU_ITEMS.SituationalAwareness,
        icon: <AIOntoWorkbench className={iconClass} />,
        key: 'SituationalAwareness',
        path: '/tenant/compute/onto/militaryTheme/situationalAwareness',
        permission: ONTOLOGY_PERMISSIONS.LIST
      },
      {
        title: SECONDARY_MENU_ITEMS.JointOperations,
        icon: <AIOntoWorkbench className={iconClass} />,
        key: 'JointOperations',
        path: '/tenant/compute/onto/sceneCenter/jointOperations',
        permission: ONTOLOGY_PERMISSIONS.LIST
      },
      {
        title: SECONDARY_MENU_ITEMS.LogisticsSupport,
        icon: <IconMdpDatasetMgmt className={iconClass} />,
        key: 'LogisticsSupport',
        path: '/tenant/compute/onto/militaryTheme/logisticsSupport',
        permission: ONTOLOGY_PERMISSIONS.LIST
      }
    ]
  },
  {
    type: 'itemGroup',
    title: '科研主题',
    key: 'ResearchTheme',
    children: RESEARCH_THEME_ITEMS.map((item, index) => ({
      title: item.title,
      icon: researchThemeIcons[index % researchThemeIcons.length],
      key: item.key,
      path: `/tenant/compute/onto/researchTheme/${item.pathSegment}`,
      permission: ONTOLOGY_PERMISSIONS.LIST
    }))
  },
  {
    type: 'itemGroup',
    title: '平台管理',
    key: 'PlatformManagement',
    children: [
      {
        key: 'modelManagement',
        title: SECONDARY_MENU_ITEMS.modelManagement,
        icon: <BaseMenu className={iconClass} />,
        path: '/tenant/compute/onto/platformResource/modelManagement',
        permission: MODEL_MANAGEMENT_PERMISSIONS.LIST
      }
    ]
  }
];
