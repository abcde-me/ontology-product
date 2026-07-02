import type { ApiAuthorizationUser } from '../types';

const MOCK_USERS: ApiAuthorizationUser[] = [
  { id: 'user-001', name: '张三', account: 'zhangsan' },
  { id: 'user-002', name: '李四', account: 'lisi' },
  { id: 'user-003', name: '王五', account: 'wangwu' },
  { id: 'user-004', name: '赵六', account: 'zhaoliu' },
  { id: 'user-005', name: '陈七', account: 'chenqi' },
  { id: 'user-006', name: '刘八', account: 'liuba' }
];

export const searchAuthorizationUsers = (
  keyword = ''
): Promise<ApiAuthorizationUser[]> => {
  const normalized = keyword.trim().toLowerCase();
  const users = MOCK_USERS;

  if (!normalized) {
    return Promise.resolve(users);
  }

  return Promise.resolve(
    users.filter((user) =>
      [user.name, user.account, user.id]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalized)
    )
  );
};

export const getAuthorizationUsersByIds = (userIds: string[]) => {
  const idSet = new Set(userIds);
  return MOCK_USERS.filter((user) => idSet.has(user.id));
};
