// src/utils/authUtils.ts
export const getTokenExpiration = (token: string): number | null => {
  try {
    // 确保 token 不为空并且是有效的 JWT 格式
    if (!token || token.split('.').length !== 3) {
      console.error('Token 格式无效');
      return null;
    }

    // 获取 payload 部分
    const payload = token.split('.')[1];
    
    // 进行 Base64URL 到 Base64 的转换
    let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    
    // 添加填充以确保长度是 4 的倍数
    while (base64.length % 4) {
      base64 += '=';
    }
    
    // 解码 Base64
    const jsonStr = window.atob(base64);
    const decoded = JSON.parse(jsonStr);
    
    // 获取过期时间
    if (!decoded.exp) {
      console.error('Token 中没有 exp 字段');
      return null;
    }
    
    const expTime = decoded.exp * 1000; // 转换为毫秒
    const expDate = new Date(expTime).toLocaleString();
    const nowDate = new Date().toLocaleString();
    const remainingMs = expTime - Date.now();
    const remainingMin = Math.floor(remainingMs / (60 * 1000));
    const remainingSec = Math.floor((remainingMs % (60 * 1000)) / 1000);
    
    // console.log(`Token 解析成功，详细信息:`);
    // console.log(`- 过期时间: ${expDate}`);
    // console.log(`- 当前时间: ${nowDate}`);
    // console.log(`- 剩余时间: ${remainingMin}分${remainingSec}秒`);
    // console.log(`- 完整信息:`, decoded);
    
    return expTime;
  } catch (e) {
    console.error('解析Token失败:', e);
    console.error('原始token:', token);
    return null;
  }
};

export const isValidToken = (token: string): boolean => {
  if (!token) return false;
  
  try {
    // 1. 基本格式检查 - 三部分用点分隔
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Token 不是三段式格式');
      return false;
    }
    
    // 2. 尝试解析 payload 部分
    const payload = parts[1];
    let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    
    const jsonStr = window.atob(base64);
    const decoded = JSON.parse(jsonStr);
    
    // 3. 检查必要的 JWT 字段
    if (!decoded.exp) {
      console.error('Token 缺少过期时间字段');
      return false;
    }
    
    // 4. 检查是否已过期 (注意：在自动续约的情况下，我们可能不想过滤掉过期的 token)
    // 续约流程会处理过期的 token，所以这里不检查过期
    /*
    const expTime = decoded.exp * 1000; // 转换为毫秒
    if (expTime <= Date.now()) {
      console.error('Token 已过期');
      return false;
    }
    */
    
    // console.log('Token 验证通过');
    return true;
  } catch (e) {
    console.error('Token 验证失败:', e);
    return false;
  }
};

