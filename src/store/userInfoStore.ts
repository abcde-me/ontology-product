import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { GetUser } from '@/api/modules/user';
import { User } from '@/pages/user/types';
import { isRequestSuccess } from '@/api/utils';

// 用户信息类型定义
export interface UserInfo {
  account?: string;
  username?: string;
  phone?: string;
  created_at?: string;
  organization?: string;
  role?: string;
  perms?: string[]; // 用户权限数组
  // 可以根据实际 API 返回的字段进行扩展
  [key: string]: any;
}

// Store 状态类型定义
interface UserInfoState {
  userInfo: User | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean; // 标记是否已经初始化过
}

// Store 操作类型定义
interface UserInfoActions {
  // 获取用户信息
  fetchUserInfo: () => Promise<void>;
  // 更新用户信息
  updateUserInfo: (userInfo: Partial<User>) => void;
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
        const { isLoading } = get();

        // 如果正在加载中，避免重复请求
        if (isLoading) {
          return;
        }

        try {
          set({ isLoading: true, error: null });

          const response = await GetUser({});

          if (isRequestSuccess(response)) {
            set({
              userInfo: response.data,
              isLoading: false,
              error: null,
              isInitialized: true
            });
          } else {
            // 当 success 为 false 时，记录错误信息
            // 权限相关的跳转已经在请求拦截器中统一处理
            const errorMessage = response.message || '获取用户信息失败';
            set({
              isLoading: false,
              error: errorMessage,
              isInitialized: true
            });
            console.warn('Failed to fetch user info:', errorMessage);
          }
        } catch (error) {
          console.error('Failed to fetch user info:', error);
          const errorMessage =
            error instanceof Error ? error.message : '获取用户信息失败';

          set({
            isLoading: false,
            error: errorMessage,
            isInitialized: true
          });

          // 权限相关的错误处理已经在请求拦截器中统一处理
          // 这里只需要记录错误状态
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
export const useUserLoading = () =>
  useUserInfoStore((state) => state.isLoading);
export const useUserError = () => useUserInfoStore((state) => state.error);
export const useUserInitialized = () =>
  useUserInfoStore((state) => state.isInitialized);

// 权限相关的 hooks
export const useUserPermissions = () =>
  useUserInfoStore((state) => state.userInfo?.perms || []);

/**
 * 检查用户是否有指定权限的 hook
 * @param permission 权限标识符
 * @returns 是否有权限
 */
export const useHasPermission = (permission: string | string[]) => {
  const userPermissions = useUserPermissions();

  if (Array.isArray(permission)) {
    // 如果传入的是权限数组，检查是否拥有所有权限
    return permission.every((perm) => userPermissions.includes(perm));
  }

  return userPermissions.includes(permission);
};

/**
 * 检查用户是否有任意一个权限的 hook
 * @param permissions 权限标识符数组
 * @returns 是否有任意一个权限
 */
export const useHasAnyPermission = (permissions: string[]) => {
  const userPermissions = useUserPermissions();
  return permissions.some((perm) => userPermissions.includes(perm));
};
