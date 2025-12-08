import JSON5 from 'json5';
import { jsonrepair } from 'jsonrepair';
import copy from 'copy-to-clipboard';
import { Message } from '@arco-design/web-react';

/**
 * 统一处理 JSON 字符串，自动尝试标准解析、JSON5 解析和修复
 * @param {string} jsonString - 待解析的 JSON 字符串
 * @returns {Object} - 解析后的对象
 * @throws {Error} - 当所有解析方法都失败时抛出错误
 */
export function parseJson(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch {
    try {
      return JSON5.parse(jsonString);
    } catch {
      try {
        const repairedJson = jsonrepair(jsonString);
        return JSON.parse(repairedJson);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        throw new Error(`JSON 解析失败: ${errorMessage}`);
      }
    }
  }
}

export const copyCode = (str: string) => {
  const success = copy(str);
  Message[success ? 'success' : 'error'](
    success ? '已复制到剪贴板' : '复制失败'
  );
};
