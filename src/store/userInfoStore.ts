import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { GetProjOrg } from '@/api/modules/project';
import { GetUser } from '@/api/modules/user';
import { isRequestSuccess } from '@/api/utils';
import { ProjectIdKey } from '@/utils/const';
import { getLocalStorage, setLocalStorage } from '@/utils/storage';
import {
  applyDevAuthBootstrap,
  getDevAdminActions,
  getDevProjectList,
  getDevRealProjectIdFromEnv,
  getDevRealFsIdFromEnv,
  isDevBypassEnabled,
  isDevFallbackProjectId
} from '@/utils/devFallback';
import {
  extractAndNormalizeProjOrgList,
  getDefaultProjectId,
  isValidProjectId,
  type NormalizedOrgNode
} from '@/utils/projOrg';
import { resolveProjectFilesystemId } from '@/utils/projectFilesystem';

// 用户信息类型定义
export interface UserInfo {
  account?: string;
  username?: string;
  phone?: string;
  created_at?: string;
  organization?: {
    description: string;
    fullOrgPath: string;
    id: string;
    name: string;
  };
  role?: {
    id: string;
    name: string;
    description: string;
    scope: string;
    organizationId: string;
  }[];
  perms?: string[]; // 用户权限数组
  // 可以根据实际 API 返回的字段进行扩展
  [key: string]: any;
}

export interface ProjectItem {
  id: string;
  name: string;
  description?: string;
  organization: {
    id: string;
    name: string;
    fullOrgPath: string;
    description: string;
  };
}

// Store 状态类型定义
interface UserInfoState {
  userInfo: UserInfo | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean; // 标记是否已经初始化过
  projectList: null | NormalizedOrgNode[];
  projectId: string[]; // 当前项目 ID，根据实际需求定义
  orgId: string; // 当前组织 ID，根据实际需求定义
  userMenus: any[];
  userActions: {
    isAdmin: boolean;
    actions: string[] | null;
  }; // 用户权限点数组，根据实际 API 返回的类型定义
}

// Store 操作类型定义
interface UserInfoActions {
  // 获取用户信息
  fetchUserInfo: () => Promise<void>;
  // 更新用户信息
  updateUserInfo: (userInfo: Partial<UserInfo>) => void;
  // 获取项目列表
  fetchProjectList: () => Promise<void>;
  /** 刷新组织/项目树（与平台管理共用 GetProjOrg 数据源） */
  refreshProjectList: () => Promise<void>;
  // 初始化当前组织/项目（登录后、刷新时调用）
  initializeProjects: () => Promise<void>;
  // 创建/写入前确保已关联有效项目
  ensureProjectReady: () => Promise<boolean>;
  /** 获取可用于 API 请求的项目 ID（store 或环境变量） */
  getEffectiveProjectId: () => string | undefined;
  /** 获取分片上传用的文件存储 ID（项目元数据或环境变量） */
  getEffectiveFilesystemId: () => string | undefined;
  // 获取用户权限点
  setUserActions: (params: {
    isAdmin: boolean;
    actions: string[] | null;
  }) => void;
  setUserMenus: (menus: any[]) => void;
  setProjectId: (projectId: string[]) => void;
  setOrgId: (orgId: string) => void;
  // 设置加载状态
  setLoading: (loading: boolean) => void;
  // 设置错误信息
  setError: (error: string | null) => void;
  // 清除用户信息（登出时使用）
  clearUserInfo: () => void;
  // 重置初始化状态
  resetInitialized: () => void;
}

// 合并状态和操作的类型
type UserInfoStore = UserInfoState & UserInfoActions;

let fetchUserInfoPromise: Promise<void> | null = null;

// 创建 zustand store
export const useUserInfoStore = create<UserInfoStore>()(
  devtools(
    (set, get) => ({
      // 初始状态
      userInfo: null,
      isLoading: false,
      error: null,
      isInitialized: false,

      // 获取用户信息
      fetchUserInfo: async () => {
        if (get().isInitialized) {
          return;
        }

        if (fetchUserInfoPromise) {
          return fetchUserInfoPromise;
        }

        fetchUserInfoPromise = (async () => {
          const finishInit = (patch: Partial<UserInfoState> = {}) => {
            const current = get();
            set({
              isLoading: false,
              isInitialized: true,
              projectList: current.projectList ?? [],
              userActions:
                current.userActions.actions === null && isDevBypassEnabled()
                  ? getDevAdminActions()
                  : current.userActions,
              ...patch
            });
          };

          try {
            set({ isLoading: true, error: null });

            let userInfo: UserInfo | null = null;

            try {
              const response = await GetUser();
              console.log(response, 'response.data');

              if (isRequestSuccess(response) && response.data?.id) {
                userInfo = response.data;
                set({
                  userInfo,
                  isLoading: false,
                  error: null
                });
              } else if (isDevBypassEnabled()) {
                throw new Error(response?.message || 'GetUser failed');
              } else {
                finishInit({
                  error: response?.message || '获取用户信息失败'
                });
                console.warn('Failed to fetch user info:', response?.message);
                return;
              }
            } catch (error) {
              if (!isDevBypassEnabled()) {
                throw error;
              }

              console.warn('[dev] GetUser 不可用，启用本地开发兜底账号', error);
              set({
                userInfo: applyDevAuthBootstrap().userInfo,
                userActions: getDevAdminActions(),
                isLoading: false,
                error: null
              });
              await get().initializeProjects();
              finishInit();
              return;
            }

            await get().initializeProjects();

            if (isDevBypassEnabled()) {
              const { userActions } = get();
              if (userActions.actions === null) {
                set({ userActions: getDevAdminActions() });
              }
            }

            finishInit({ error: null });
            console.log('User info fetched successfully:', userInfo);
          } catch (error) {
            console.error('Failed to fetch user info:', error);
            const errorMessage =
              error instanceof Error ? error.message : '获取用户信息失败';

            if (isDevBypassEnabled()) {
              console.warn('[dev] 初始化失败，启用本地开发兜底账号');
              set({
                userInfo: applyDevAuthBootstrap().userInfo,
                userActions: getDevAdminActions(),
                isLoading: false,
                error: null
              });
              await get().initializeProjects();
              finishInit();
              return;
            }

            finishInit({ error: errorMessage });
          }
        })();

        try {
          await fetchUserInfoPromise;
        } finally {
          fetchUserInfoPromise = null;
        }
      },

      // 更新用户信息
      updateUserInfo: (newUserInfo) => {
        const currentUserInfo = get().userInfo;
        set({
          userInfo: currentUserInfo
            ? { ...currentUserInfo, ...newUserInfo }
            : newUserInfo
        });
        console.log('User info updated:', newUserInfo);
      },

      projectList: null,
      initializeProjects: async () => {
        const { userInfo, projectId: currentProjectId } = get();

        const applyFallbackIfNeeded = () => {
          if (!isDevBypassEnabled()) {
            set({ projectList: [], projectId: [] });
            return;
          }

          const devList = getDevProjectList();
          const envProject = getDevRealProjectIdFromEnv();
          const defaultProjectId =
            envProject || getDefaultProjectId(devList) || [];

          if (envProject) {
            console.warn('[dev] 使用 REACT_APP_DEV_REAL_* 环境变量中的项目 ID');
          } else if (defaultProjectId.length) {
            console.warn('[dev] GetProjOrg 不可用，使用本地开发组织/项目');
          } else {
            console.warn(
              '[dev] 未获取到可用项目，请在左侧选择项目，或配置 REACT_APP_DEV_REAL_ORG_ID / REACT_APP_DEV_REAL_PROJECT_ID'
            );
          }

          if (defaultProjectId.length && userInfo?.id) {
            setLocalStorage(`${ProjectIdKey}${userInfo.id}`, defaultProjectId);
          }

          set({
            projectList: devList,
            projectId: defaultProjectId,
            userActions: getDevAdminActions()
          });
        };

        if (!userInfo?.id) {
          applyFallbackIfNeeded();
          return;
        }

        const fullProjectIdKey = `${ProjectIdKey}${userInfo.id}`;
        const cachedProjectId = getLocalStorage<string[]>(fullProjectIdKey);
        if (isDevFallbackProjectId(cachedProjectId)) {
          localStorage.removeItem(fullProjectIdKey);
        }

        try {
          const response = await GetProjOrg({});
          const result = extractAndNormalizeProjOrgList(response);

          if (!result.length) {
            applyFallbackIfNeeded();
            return;
          }

          set({ projectList: result });

          if (
            Array.isArray(currentProjectId) &&
            currentProjectId.length > 1 &&
            !isDevFallbackProjectId(currentProjectId) &&
            isValidProjectId(result, currentProjectId)
          ) {
            return;
          }

          const storedProjectId = getLocalStorage<string[]>(fullProjectIdKey);
          if (
            Array.isArray(storedProjectId) &&
            !isDevFallbackProjectId(storedProjectId) &&
            isValidProjectId(result, storedProjectId)
          ) {
            set({ projectId: storedProjectId });
            return;
          }

          if (isDevFallbackProjectId(storedProjectId)) {
            localStorage.removeItem(fullProjectIdKey);
          }

          const defaultProjectId = getDefaultProjectId(result);
          if (defaultProjectId) {
            setLocalStorage(fullProjectIdKey, defaultProjectId);
            set({ projectId: defaultProjectId });
            return;
          }

          applyFallbackIfNeeded();
        } catch (error) {
          console.error('Failed to initialize projects:', error);
          applyFallbackIfNeeded();
        }
      },
      ensureProjectReady: async () => {
        const currentProjectId = get().projectId;
        if (
          currentProjectId?.[1] &&
          !isDevFallbackProjectId(currentProjectId)
        ) {
          return true;
        }

        await get().initializeProjects();

        const nextProjectId = get().projectId;
        return !!(nextProjectId?.[1] && !isDevFallbackProjectId(nextProjectId));
      },
      getEffectiveProjectId: () => {
        const { projectId: currentProjectId } = get();
        const rawProjectId = currentProjectId?.[1];

        if (rawProjectId && !isDevFallbackProjectId(currentProjectId)) {
          return rawProjectId;
        }

        const envProject = getDevRealProjectIdFromEnv();
        return envProject?.[1];
      },
      getEffectiveFilesystemId: () => {
        const fromEnv = getDevRealFsIdFromEnv();
        if (fromEnv) {
          return fromEnv;
        }

        const { projectList, projectId: currentProjectId } = get();
        return resolveProjectFilesystemId(projectList, currentProjectId);
      },
      // 获取项目列表
      fetchProjectList: async () => {
        const { userInfo } = get();
        if (!userInfo || !userInfo?.organization?.id) return;
        try {
          const response = await GetProjOrg({
            organizationId: userInfo.organization?.id
          });

          console.log(response, 'response.data');
          if (isRequestSuccess(response)) {
            set({
              projectList: response.data
            });
            console.log('User info fetched successfully:', response.data);
          }
        } catch (error) {
          console.error('Failed to fetch project list:', error);
        }
      },

      refreshProjectList: async () => {
        if (isDevBypassEnabled()) {
          return;
        }

        try {
          const response = await GetProjOrg({});
          const result = extractAndNormalizeProjOrgList(response);
          if (result.length) {
            set({ projectList: result });
          }
        } catch (error) {
          console.error('Failed to refresh project list:', error);
        }
      },

      projectId: [],
      setProjectId: (projectId) => {
        set({ projectId });
      },

      orgId: '',
      setOrgId: (orgId) => {
        set({ orgId });
      },

      // 用户权限点
      userActions: {
        isAdmin: false,
        actions: null
      },
      setUserActions: (params) => {
        set({ userActions: params });
      },

      // 用户菜单
      userMenus: [],
      setUserMenus: (menus) => {
        set({ userMenus: menus });
      },

      // 设置加载状态
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      // 设置错误信息
      setError: (error) => {
        set({ error });
      },

      // 清除用户信息
      clearUserInfo: () => {
        set({
          userInfo: null,
          isLoading: false,
          error: null,
          isInitialized: false
        });
        console.log('User info cleared');
      },

      // 重置初始化状态
      resetInitialized: () => {
        set({ isInitialized: false });
      }
    }),
    {
      name: 'user-info-store' // devtools 中显示的名称
    }
  )
);

// 导出一些便捷的选择器 hooks
export const useUserInfo = () => useUserInfoStore((state) => state.userInfo);
export const useUserProjectList = () =>
  useUserInfoStore((state) => state.projectList);
export const useUserLoading = () =>
  useUserInfoStore((state) => state.isLoading);
export const useUserError = () => useUserInfoStore((state) => state.error);
export const useUserInitialized = () =>
  useUserInfoStore((state) => state.isInitialized);

// 权限相关的 hooks
export const useUserPermissions = () =>
  useUserInfoStore((state) => state.userActions || []);

/**
 * 检查用户是否有指定权限的 hook
 * @param permission 权限标识符
 * @returns 是否有权限
 */
export const useHasPermission = (permission: string | string[]) => {
  const userPermissions = useUserPermissions();
  const { isAdmin, actions } = userPermissions;

  if (isAdmin) return true; // 管理员拥有所有权限，直接返回 true
  if (Array.isArray(permission)) {
    // 如果传入的是权限数组，检查是否拥有所有权限
    return permission.every((perm) => actions && actions.includes(perm));
  }

  return actions?.includes(permission) || false;
};

/**
 * 检查用户是否有任意一个权限的 hook
 * @param permissions 权限标识符数组
 * @returns 是否有任意一个权限
 */
export const useHasAnyPermission = (permissions: string[]) => {
  const userPermissions = useUserPermissions();
  const { isAdmin, actions } = userPermissions;
  if (isAdmin) return true; // 管理员拥有所有权限，直接返回 true
  return permissions.some((perm) => actions && actions.includes(perm));
};

// 判断是否为超级管理员
export const useSuperAdmin = () =>
  useUserInfoStore((state) =>
    state.userInfo?.roles?.some((role) => role.scope === 'global' && role.admin)
  );

// 判断是否为组织管理员
export const useOrganizationAdmin = () =>
  useUserInfoStore((state) =>
    state.userInfo?.roles?.some(
      (role) => role.scope === 'organization' && role.admin
    )
  );

// 判断是否为项目管理员
export const useProjectAdmin = () =>
  useUserInfoStore((state) =>
    state.userInfo?.roles?.some(
      (role) => role.scope === 'project' && role.admin
    )
  );
