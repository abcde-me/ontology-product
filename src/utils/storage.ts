/**
 * 安全存储数据到 localStorage
 * @param key 存储键名
 * @param value 存储值（支持任意类型）
 */
export const setLocalStorage = <T>(key: string, value: T): void => {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error(`LocalStorage 存储失败 (key: "${key}")：`, error);
  }
};

/**
 * 安全获取 localStorage 数据
 * @param key 要获取的键名
 * @param defaultValue 可选默认值（当数据不存在时返回）
 * @returns 解析后的数据或默认值
 */
export function getLocalStorage<T>(key: string): T | null;
export function getLocalStorage<T>(key: string, defaultValue: T): T;
export function getLocalStorage<T>(key: string, defaultValue?: T): T | null {
  try {
    const serializedValue = localStorage.getItem(key);
    if (serializedValue === null) {
      return defaultValue !== undefined ? defaultValue : null;
    }
    return JSON.parse(serializedValue) as T;
  } catch (error) {
    console.error(`LocalStorage 解析失败 (key: "${key}")：`, error);
    return defaultValue !== undefined ? defaultValue : null;
  }
}

// 删除指定存储项
export const removeLocalStorage = (key: string): void => {
  localStorage.removeItem(key);
};

// 清空所有存储项
export const clearLocalStorage = (): void => {
  localStorage.clear();
};
