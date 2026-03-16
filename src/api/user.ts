// This file contains stub implementations for user-related API functions
// Most of the original endpoints don't exist in the current API
// Only keeping minimal functions that are actually used by the application

// 角色 - 返回空数据，避免编译错误
export async function getRoleData() {
  // 返回空角色数据，因为对应的API端点不存在
  return Promise.resolve({ data: [] });
}

// 修改密码 - 返回成功响应，避免编译错误
export async function updatePassword(params: Record<string, any>) {
  // 返回成功响应，因为对应的API端点不存在
  console.warn(
    'updatePassword: API endpoint not available, returning mock success'
  );
  return Promise.resolve({
    statusCode: 0,
    message: 'Password update not implemented'
  });
}

// 更新成员 - 返回成功响应，避免编译错误
export async function updateUser(params: Record<string, any>) {
  // 返回成功响应，因为对应的API端点不存在
  console.warn(
    'updateUser: API endpoint not available, returning mock success'
  );
  return Promise.resolve({
    statusCode: 0,
    message: 'User update not implemented'
  });
}

// 续约token - 返回失败响应，因为没有对应的API端点
export async function renew() {
  // 返回失败响应，提示功能不可用
  console.warn('renew: API endpoint not available');
  return Promise.resolve({
    success: false,
    message:
      'Token renewal not available - please re-login when session expires'
  });
}
