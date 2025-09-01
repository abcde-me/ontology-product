import { linter } from '@codemirror/lint';

export interface SqlDiagnostic {
  from: number;
  to: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  rule?: string;
  suggestion?: string;
}

export interface SqlLinterConfig {
  checkInjection?: boolean;
  checkPerformance?: boolean;
}

const DEFAULT_CONFIG: SqlLinterConfig = {
  checkInjection: true,
  checkPerformance: true
};

/**
 * 基础语法检查
 */
function basicSyntaxCheck(sqlText: string): SqlDiagnostic[] {
  const diagnostics: SqlDiagnostic[] = [];

  // 检查引号匹配
  const singleQuotes = (sqlText.match(/'/g) || []).length;
  const doubleQuotes = (sqlText.match(/"/g) || []).length;
  const backticks = (sqlText.match(/`/g) || []).length;

  if (singleQuotes % 2 !== 0) {
    diagnostics.push({
      from: 0,
      to: sqlText.length,
      message: '单引号不匹配',
      severity: 'error',
      rule: 'quote-mismatch'
    });
  }

  if (doubleQuotes % 2 !== 0) {
    diagnostics.push({
      from: 0,
      to: sqlText.length,
      message: '双引号不匹配',
      severity: 'error',
      rule: 'quote-mismatch'
    });
  }

  if (backticks % 2 !== 0) {
    diagnostics.push({
      from: 0,
      to: sqlText.length,
      message: '反引号不匹配',
      severity: 'error',
      rule: 'quote-mismatch'
    });
  }

  // 检查括号匹配
  const parentheses = (sqlText.match(/\(/g) || []).length;
  const closeParentheses = (sqlText.match(/\)/g) || []).length;

  if (parentheses !== closeParentheses) {
    diagnostics.push({
      from: 0,
      to: sqlText.length,
      message: '括号不匹配',
      severity: 'error',
      rule: 'parentheses-mismatch'
    });
  }

  // 检查分号结尾
  if (sqlText.trim() && !sqlText.trim().endsWith(';')) {
    diagnostics.push({
      from: sqlText.length - 1,
      to: sqlText.length,
      message: '建议在语句末尾添加分号',
      severity: 'warning',
      rule: 'missing-semicolon'
    });
  }

  return diagnostics;
}

/**
 * SQL 结构检查
 */
function sqlStructureCheck(sqlText: string): SqlDiagnostic[] {
  const diagnostics: SqlDiagnostic[] = [];
  const upperText = sqlText.toUpperCase();

  // 检查 SELECT 语句
  if (upperText.includes('SELECT') && !upperText.includes('FROM')) {
    diagnostics.push({
      from: 0,
      to: sqlText.length,
      message: 'SELECT 语句缺少 FROM 子句',
      severity: 'error',
      rule: 'missing-from-clause'
    });
  }

  // 检查 INSERT 语句
  if (upperText.includes('INSERT') && !upperText.includes('INTO')) {
    diagnostics.push({
      from: 0,
      to: sqlText.length,
      message: 'INSERT 语句缺少 INTO 关键字',
      severity: 'error',
      rule: 'missing-into-keyword'
    });
  }

  // 检查 UPDATE 语句
  if (upperText.includes('UPDATE') && !upperText.includes('SET')) {
    diagnostics.push({
      from: 0,
      to: sqlText.length,
      message: 'UPDATE 语句缺少 SET 子句',
      severity: 'error',
      rule: 'missing-set-clause'
    });
  }

  // 检查 DELETE 语句
  if (upperText.includes('DELETE') && !upperText.includes('FROM')) {
    diagnostics.push({
      from: 0,
      to: sqlText.length,
      message: 'DELETE 语句缺少 FROM 子句',
      severity: 'error',
      rule: 'missing-from-clause'
    });
  }

  // 检查 JOIN 语句
  if (upperText.includes('JOIN') && !upperText.includes('ON')) {
    diagnostics.push({
      from: 0,
      to: sqlText.length,
      message: 'JOIN 语句缺少 ON 条件',
      severity: 'error',
      rule: 'missing-join-condition'
    });
  }

  return diagnostics;
}

/**
 * 性能和安全检查
 */
function performanceSecurityCheck(
  sqlText: string,
  config: SqlLinterConfig
): SqlDiagnostic[] {
  const diagnostics: SqlDiagnostic[] = [];
  const upperText = sqlText.toUpperCase();

  if (!config.checkPerformance && !config.checkInjection) {
    return diagnostics;
  }

  // 性能检查
  if (config.checkPerformance) {
    // 检查 SELECT *
    if (upperText.includes('SELECT *')) {
      diagnostics.push({
        from: 0,
        to: sqlText.length,
        message: '不建议使用 SELECT *',
        severity: 'warning',
        rule: 'select-all-columns'
      });
    }

    // 检查缺少 WHERE 条件的 UPDATE/DELETE
    if (
      (upperText.includes('UPDATE') || upperText.includes('DELETE')) &&
      !upperText.includes('WHERE')
    ) {
      diagnostics.push({
        from: 0,
        to: sqlText.length,
        message: 'UPDATE/DELETE 语句缺少 WHERE 条件',
        severity: 'warning',
        rule: 'missing-where-clause'
      });
    }
  }

  // 安全检查
  if (config.checkInjection) {
    const injectionPatterns = [
      { pattern: /'.*OR.*=.*OR.*'/i, message: '检测到 OR 条件注入风险' },
      { pattern: /'.*UNION.*SELECT/i, message: '检测到 UNION 注入风险' },
      { pattern: /'.*DROP.*TABLE/i, message: '检测到 DROP 注入风险' }
    ];

    injectionPatterns.forEach(({ pattern, message }) => {
      if (pattern.test(sqlText)) {
        diagnostics.push({
          from: 0,
          to: sqlText.length,
          message,
          severity: 'warning',
          rule: 'sql-injection-risk'
        });
      }
    });
  }

  return diagnostics;
}

/**
 * 主要的 SQL Linter 函数
 * 可以直接用于 CodeMirror extensions
 */
export default function createSqlLinter(config: SqlLinterConfig = {}): any {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  return linter((view) => {
    const sqlText = view.state.doc.toString();
    if (!sqlText.trim()) return [];

    const diagnostics: SqlDiagnostic[] = [];

    // 执行所有检查
    diagnostics.push(...basicSyntaxCheck(sqlText));
    diagnostics.push(...sqlStructureCheck(sqlText));
    diagnostics.push(...performanceSecurityCheck(sqlText, finalConfig));

    return diagnostics;
  });
}
