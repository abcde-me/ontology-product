import { format } from 'sql-formatter';

export interface SqlFormatterOptions {
  /**
   * 占位符匹配的正则表达式
   * @default /\$\{([^$}]+)\}/g
   * 注意：在遇到下一个 $ 时会停止匹配，用于处理嵌套情况
   */
  placeholderRegex?: RegExp;
  /**
   * 临时占位符模板，${index} 会被替换为索引
   * @default '__PLACEHOLDER_${index}__'
   */
  tempPlaceholderTemplate?: string;
  /**
   * SQL 格式化选项
   */
  formatOptions?: {
    language?:
      | 'sql'
      | 'mysql'
      | 'mariadb'
      | 'postgresql'
      | 'plsql'
      | 'n1ql'
      | 'redshift'
      | 'spark'
      | 'tsql';
    [key: string]: any;
  };
}

/**
 * 格式化 SQL 代码，支持占位符保护
 *
 * @example
 * // 基本使用（默认处理 ${...} 占位符）
 * formatSQL('SELECT * FROM users WHERE id = ${userId}')
 *
 * @example
 * // 自定义占位符正则和临时占位符模板
 * formatSQL('SELECT * FROM users WHERE id = :userId', {
 *   placeholderRegex: /:(\w+)/g,
 *   tempPlaceholderTemplate: '__TEMP_${index}__',
 *   formatOptions: { language: 'mysql' }
 * })
 *
 * @param sql SQL 代码
 * @param options 格式化选项
 * @returns 格式化后的 SQL 代码
 */
export function formatSQL(
  sql: string,
  options: SqlFormatterOptions = {}
): string {
  const {
    placeholderRegex = /\$\{([^$}]+)\}/g,
    tempPlaceholderTemplate = '__PLACEHOLDER_${index}__',
    formatOptions = { language: 'sql' }
  } = options;

  // 保存所有占位符
  const placeholders: string[] = [];

  // 临时替换占位符，避免格式化错误
  const codeWithPlaceholders = sql.replace(placeholderRegex, (match) => {
    placeholders.push(match);
    const index = placeholders.length - 1;
    return tempPlaceholderTemplate.replace('${index}', String(index));
  });

  // 格式化代码
  const formattedCode = format(codeWithPlaceholders, formatOptions);

  // 构建恢复占位符的正则表达式
  // 先转义特殊字符，再替换 ${index} 为数字匹配
  const tempPlaceholderPattern = tempPlaceholderTemplate
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // 先转义所有特殊字符
    .replace(/\\\$\\\{index\\\}/g, '(\\d+)'); // 然后将转义后的 ${index} 替换为数字匹配
  const tempPlaceholderRegex = new RegExp(tempPlaceholderPattern, 'g');

  // 恢复占位符
  const finalCode = formattedCode.replace(tempPlaceholderRegex, (_, index) => {
    return (
      placeholders[Number(index)] ||
      tempPlaceholderTemplate.replace('${index}', index)
    );
  });

  return finalCode;
}
