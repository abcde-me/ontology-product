/** 运营中心（平台管理）页面路径 */
const OC_BASE = '/operationcenter/tenant/compute/operationcenter';

export const OPERATION_CENTER_PATHS = {
  organization: `${OC_BASE}/organization`,
  organizationEdit: (orgId: string) =>
    `${OC_BASE}/organization?action=edit&id=${encodeURIComponent(orgId)}`,
  project: `${OC_BASE}/project`,
  projectCreate: `${OC_BASE}/project?action=create`,
  projectEdit: (projectId: string) =>
    `${OC_BASE}/project?action=edit&id=${encodeURIComponent(projectId)}`,
  api: `${OC_BASE}/api`
} as const;

/** 本体平台内嵌运营中心的路由前缀 */
export const ONTO_OPERATION_CENTER_ROUTE =
  '/tenant/compute/onto/operationCenter';

/** 构建在本体平台内打开运营中心页面的路由 */
export const buildOntoOperationCenterRoute = (operationCenterUrl: string) =>
  `${ONTO_OPERATION_CENTER_ROUTE}?url=${encodeURIComponent(operationCenterUrl)}`;
