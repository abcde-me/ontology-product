import {
  API_KEY_PERMISSIONS,
  AUTOMATION_PERMISSIONS,
  DATA_SOURCE_PERMISSIONS,
  ONTOLOGY_PERMISSIONS,
  ORGANIZATION_PERMISSIONS,
  PROJECT_PERMISSIONS,
  REQUIREMENT_PERMISSIONS,
  ROLE_PERMISSIONS,
  TAG_PERMISSIONS,
  MODEL_MANAGEMENT_PERMISSIONS,
  USER_GROUP_PERMISSIONS,
  USER_PERMISSIONS
} from '@/config/permissions';
import type { NormalizedOrgNode } from '@/utils/projOrg';

export const DEV_USER_ID = 'dev-user-local';
export const DEV_ORG_ID = 'dev-org-local';
export const DEV_PROJECT_ID = 'dev-project-local';
export const DEV_CEAI_USER_ID =
  process.env.REACT_APP_DEV_CEAI_USER_ID || 'user-gqj121nu';

/** 本地开发无项目/权限时的兜底开关 */
export const isDevBypassEnabled = () => {
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  if (process.env.REACT_APP_DEV_BYPASS_PERMISSION === 'true') {
    return true;
  }

  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('devBypass') === '1') {
      return true;
    }
    if (window.localStorage.getItem('DEV_BYPASS_PERMISSION') === 'true') {
      return true;
    }
  } catch {
    // ignore
  }

  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
};

export const getDevUserInfo = () => ({
  id: DEV_USER_ID,
  name: '本地开发用户',
  account: 'dev-user',
  phone: '',
  description: '',
  position: '',
  organization: {
    id: DEV_ORG_ID,
    name: '本地开发组织',
    description: '',
    fullOrgPath: '本地开发组织'
  },
  status: 'active',
  createdAt: new Date().toISOString(),
  roles: [
    {
      subjectRoleId: 'dev-role',
      id: 'dev-role',
      name: '开发管理员',
      description: '',
      scope: 'project',
      builtin: true,
      admin: true,
      organizationId: DEV_ORG_ID,
      organizations: null,
      projects: null,
      createdBy: '',
      createdByName: '',
      createdAt: ''
    }
  ]
});

export const getDevProjectList = (): NormalizedOrgNode[] => [
  {
    id: DEV_ORG_ID,
    title: '本地开发组织',
    name: '本地开发组织',
    projectList: [
      {
        id: DEV_PROJECT_ID,
        title: '本地开发项目',
        name: '本地开发项目'
      }
    ]
  }
];

export const getDevProjectId = (): string[] => [DEV_ORG_ID, DEV_PROJECT_ID];

/** 开发环境可通过 .env 指定真实后端项目（GetProjOrg 不可用时） */
export const getDevRealProjectIdFromEnv = (): string[] | null => {
  const orgId = process.env.REACT_APP_DEV_REAL_ORG_ID?.trim();
  const projectId = process.env.REACT_APP_DEV_REAL_PROJECT_ID?.trim();

  if (orgId && projectId) {
    return [orgId, projectId];
  }

  return null;
};

/** 开发环境：分片上传所需的文件存储 ID（向管理员获取） */
export const getDevRealFsIdFromEnv = (): string | undefined => {
  const fsId = process.env.REACT_APP_DEV_REAL_FS_ID?.trim();
  return fsId || undefined;
};

export const isDevFallbackProjectId = (
  projectId?: string | string[] | null
) => {
  if (!projectId) {
    return false;
  }

  const values = Array.isArray(projectId) ? projectId : [projectId];
  return values.some(
    (id) => id === DEV_PROJECT_ID || id === DEV_ORG_ID || id === DEV_USER_ID
  );
};

export const getDevPermissionActions = (): string[] =>
  Object.values({
    ...ONTOLOGY_PERMISSIONS,
    ...AUTOMATION_PERMISSIONS,
    ...DATA_SOURCE_PERMISSIONS,
    ...REQUIREMENT_PERMISSIONS,
    ...ORGANIZATION_PERMISSIONS,
    ...USER_PERMISSIONS,
    ...USER_GROUP_PERMISSIONS,
    ...ROLE_PERMISSIONS,
    ...PROJECT_PERMISSIONS,
    ...API_KEY_PERMISSIONS,
    ...TAG_PERMISSIONS,
    ...MODEL_MANAGEMENT_PERMISSIONS
  });

export const applyDevProjectFallback = () => {
  return {
    projectList: getDevProjectList(),
    projectId: [] as string[]
  };
};

export const getDevAdminActions = () => ({
  isAdmin: true,
  actions: getDevPermissionActions()
});

/** 开发环境完整兜底：用户 + 管理员权限（项目仍从后端获取） */
export const applyDevAuthBootstrap = (userId = DEV_USER_ID) => {
  return {
    userInfo: getDevUserInfo(),
    userActions: getDevAdminActions()
  };
};

export const ONTOLOGY_MANAGER_API_PREFIX = '/ontology-manager/api/v1';

/** 开发环境 ontology-manager 接口超时上限（仅用于明确离线场景，勿用于正常联调） */
export const DEV_ONTOLOGY_API_TIMEOUT_MS = 25000;

export const isOntologyManagerApiUrl = (requestUrl?: string) =>
  !!requestUrl?.includes(ONTOLOGY_MANAGER_API_PREFIX);

/**
 * 开发环境可选的 API 竞速超时。
 * 默认不启用：后端慢但可达时（如 9s 内返回 200），避免过早走兜底导致重复请求与图谱空白。
 */
export const withDevApiTimeout = <T>(
  promise: Promise<T>,
  label: string
): Promise<T> => {
  if (!isDevBypassEnabled()) {
    return promise;
  }

  if (process.env.REACT_APP_DEV_FAST_API_FALLBACK !== 'true') {
    return promise;
  }

  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => {
        reject(new Error(`${label} timeout`));
      }, DEV_ONTOLOGY_API_TIMEOUT_MS);
    })
  ]);
};
