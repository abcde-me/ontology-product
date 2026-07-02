import React, { useCallback, useMemo } from 'react';
import { Dropdown, Menu } from '@arco-design/web-react';
import { IconLaunch, IconSettings } from '@arco-design/web-react/icon';
import { ProjectSelect } from '@ceai-front/arco-material';
import { useHistory } from 'react-router-dom';
import { usePermission } from '@/hooks/usePermission';
import {
  ORGANIZATION_PERMISSIONS,
  PROJECT_PERMISSIONS
} from '@/config/permissions';
import { useUserInfoStore } from '@/store/userInfoStore';
import { toProjectSelectTreeData } from '@/utils/projOrg';
import {
  buildOntoOperationCenterRoute,
  OPERATION_CENTER_PATHS
} from '@/utils/operationCenterNavigation';
import { OpenNewPageForOperationCenter } from '@/utils/env';
import './index.scss';

interface SidebarProjectSelectProps {
  value?: string[];
  onChange: (value: string[] | undefined) => void;
  collapsed?: boolean;
}

export default function SidebarProjectSelect({
  value,
  onChange,
  collapsed
}: SidebarProjectSelectProps) {
  const history = useHistory();
  const { hasMenuPermission } = usePermission();
  const { projectList, refreshProjectList, projectId } = useUserInfoStore();

  const canManageOrg = hasMenuPermission(ORGANIZATION_PERMISSIONS.MENU);
  const canManageProject = hasMenuPermission(PROJECT_PERMISSIONS.MENU);

  const treeData = useMemo(
    () => toProjectSelectTreeData(projectList),
    [projectList]
  );

  const currentOrgId = value?.[0] || projectId?.[0];
  const currentProjectId = value?.[1] || projectId?.[1];

  const navigateInApp = useCallback(
    (operationCenterUrl: string) => {
      history.push(buildOntoOperationCenterRoute(operationCenterUrl));
    },
    [history]
  );

  const handleVisibleChange = useCallback(
    (visible: boolean) => {
      if (visible) {
        refreshProjectList();
      }
    },
    [refreshProjectList]
  );

  const handleCreateProject = useCallback(() => {
    OpenNewPageForOperationCenter(OPERATION_CENTER_PATHS.projectCreate);
  }, []);

  const manageMenu = (
    <Menu
      onClickMenuItem={(key) => {
        switch (key) {
          case 'orgList':
            navigateInApp(OPERATION_CENTER_PATHS.organization);
            break;
          case 'projectList':
            navigateInApp(OPERATION_CENTER_PATHS.project);
            break;
          case 'editOrg':
            if (currentOrgId) {
              navigateInApp(
                OPERATION_CENTER_PATHS.organizationEdit(currentOrgId)
              );
            }
            break;
          case 'editProject':
            if (currentProjectId) {
              navigateInApp(
                OPERATION_CENTER_PATHS.projectEdit(currentProjectId)
              );
            }
            break;
          case 'createProject':
            handleCreateProject();
            break;
          default:
            break;
        }
      }}
    >
      {canManageOrg && (
        <Menu.Item key="orgList">
          组织管理
          <IconLaunch className="sidebar-project-select__menu-icon" />
        </Menu.Item>
      )}
      {canManageProject && (
        <Menu.Item key="projectList">
          项目管理
          <IconLaunch className="sidebar-project-select__menu-icon" />
        </Menu.Item>
      )}
      {canManageOrg && currentOrgId && (
        <Menu.Item key="editOrg">
          编辑当前组织
          <IconLaunch className="sidebar-project-select__menu-icon" />
        </Menu.Item>
      )}
      {canManageProject && currentProjectId && (
        <Menu.Item key="editProject">
          编辑当前项目
          <IconLaunch className="sidebar-project-select__menu-icon" />
        </Menu.Item>
      )}
      {canManageProject && (
        <Menu.Item key="createProject">
          创建项目
          <IconLaunch className="sidebar-project-select__menu-icon" />
        </Menu.Item>
      )}
    </Menu>
  );

  const showManageEntry = canManageOrg || canManageProject;

  if (collapsed) {
    return null;
  }

  return (
    <div className="sidebar-project-select">
      <ProjectSelect
        treeData={treeData}
        value={value}
        showAddButton={canManageProject}
        onAdd={handleCreateProject}
        onVisibleChange={handleVisibleChange}
        onChange={(nextValue) => {
          onChange(nextValue);
        }}
      />
      {showManageEntry && (
        <Dropdown droplist={manageMenu} position="bl" trigger="click">
          <button
            type="button"
            className="sidebar-project-select__manage-btn"
            aria-label="组织与项目管理"
          >
            <IconSettings />
          </button>
        </Dropdown>
      )}
    </div>
  );
}
