import { linter } from '@codemirror/lint';

export interface PythonDiagnostic {
  from: number;
  to: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  rule?: string;
  suggestion?: string;
}

export interface PythonLinterConfig {
  checkSyntax?: boolean;
  checkStyle?: boolean;
  checkImports?: boolean;
  checkIndentation?: boolean;
}

const DEFAULT_CONFIG: PythonLinterConfig = {
  checkSyntax: true,
  checkStyle: true,
  checkImports: true,
  checkIndentation: true
};

/**
 * 基础语法检查
 */
function basicSyntaxCheck(pythonText: string): PythonDiagnostic[] {
  const diagnostics: PythonDiagnostic[] = [];
  const lines = pythonText.split('\n');

  // 检查引号匹配
  const singleQuotes = (pythonText.match(/'/g) || []).length;
  const doubleQuotes = (pythonText.match(/"/g) || []).length;
  const tripleSingleQuotes = (pythonText.match(/'''/g) || []).length;
  const tripleDoubleQuotes = (pythonText.match(/"""/g) || []).length;

  if (singleQuotes % 2 !== 0) {
    diagnostics.push({
      from: 0,
      to: pythonText.length,
      message: '单引号不匹配',
      severity: 'error',
      rule: 'quote-mismatch'
    });
  }

  if (doubleQuotes % 2 !== 0) {
    diagnostics.push({
      from: 0,
      to: pythonText.length,
      message: '双引号不匹配',
      severity: 'error',
      rule: 'quote-mismatch'
    });
  }

  if (tripleSingleQuotes % 2 !== 0) {
    diagnostics.push({
      from: 0,
      to: pythonText.length,
      message: '三引号（单引号）不匹配',
      severity: 'error',
      rule: 'quote-mismatch'
    });
  }

  if (tripleDoubleQuotes % 2 !== 0) {
    diagnostics.push({
      from: 0,
      to: pythonText.length,
      message: '三引号（双引号）不匹配',
      severity: 'error',
      rule: 'quote-mismatch'
    });
  }

  // 检查括号匹配
  const parentheses = (pythonText.match(/\(/g) || []).length;
  const closeParentheses = (pythonText.match(/\)/g) || []).length;
  const squareBrackets = (pythonText.match(/\[/g) || []).length;
  const closeSquareBrackets = (pythonText.match(/\]/g) || []).length;
  const curlyBraces = (pythonText.match(/\{/g) || []).length;
  const closeCurlyBraces = (pythonText.match(/\}/g) || []).length;

  if (parentheses !== closeParentheses) {
    diagnostics.push({
      from: 0,
      to: pythonText.length,
      message: '圆括号不匹配',
      severity: 'error',
      rule: 'parentheses-mismatch'
    });
  }

  if (squareBrackets !== closeSquareBrackets) {
    diagnostics.push({
      from: 0,
      to: pythonText.length,
      message: '方括号不匹配',
      severity: 'error',
      rule: 'brackets-mismatch'
    });
  }

  if (curlyBraces !== closeCurlyBraces) {
    diagnostics.push({
      from: 0,
      to: pythonText.length,
      message: '花括号不匹配',
      severity: 'error',
      rule: 'braces-mismatch'
    });
  }

  return diagnostics;
}

/**
 * 缩进检查
 */
function indentationCheck(pythonText: string): PythonDiagnostic[] {
  const diagnostics: PythonDiagnostic[] = [];
  const lines = pythonText.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // 跳过空行和注释行
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }

    // 检查混合使用空格和制表符
    if (line.includes(' ') && line.includes('\t')) {
      const startPos = pythonText.indexOf(line);
      diagnostics.push({
        from: startPos,
        to: startPos + line.length,
        message: '第' + (i + 1) + '行：混合使用空格和制表符进行缩进',
        severity: 'error',
        rule: 'mixed-indentation',
        suggestion: '建议统一使用4个空格进行缩进'
      });
    }

    // 检查缩进是否使用4的倍数
    const leadingSpaces = line.match(/^ */)?.[0].length || 0;
    if (leadingSpaces > 0 && leadingSpaces % 4 !== 0) {
      const startPos = pythonText.indexOf(line);
      diagnostics.push({
        from: startPos,
        to: startPos + line.length,
        message: '第' + (i + 1) + '行：缩进应该使用4的倍数个空格',
        severity: 'warning',
        rule: 'indent-size',
        suggestion: '建议使用4个空格的倍数进行缩进'
      });
    }
  }

  return diagnostics;
}

/**
 * 导入语句检查
 */
function importCheck(pythonText: string): PythonDiagnostic[] {
  const diagnostics: PythonDiagnostic[] = [];
  const lines = pythonText.split('\n');
  const importLines: number[] = [];
  const nonImportLines: number[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('import ') || line.startsWith('from ')) {
      importLines.push(i);
    } else if (line && !line.startsWith('#')) {
      nonImportLines.push(i);
    }
  }

  // 检查导入语句是否在文件顶部
  if (importLines.length > 0 && nonImportLines.length > 0) {
    const firstImport = Math.min(...importLines);
    const firstNonImport = Math.min(...nonImportLines);

    if (firstImport > firstNonImport) {
      const startPos = pythonText.indexOf(lines[firstImport]);
      diagnostics.push({
        from: startPos,
        to: startPos + lines[firstImport].length,
        message: '导入语句应该在文件顶部',
        severity: 'warning',
        rule: 'import-position',
        suggestion: '将导入语句移动到文件顶部'
      });
    }
  }

  // 检查重复导入
  const importSet = new Set<string>();
  for (const lineIndex of importLines) {
    const line = lines[lineIndex].trim();
    if (importSet.has(line)) {
      const startPos = pythonText.indexOf(line);
      diagnostics.push({
        from: startPos,
        to: startPos + line.length,
        message: '重复的导入语句',
        severity: 'warning',
        rule: 'duplicate-import',
        suggestion: '删除重复的导入语句'
      });
    } else {
      importSet.add(line);
    }
  }

  return diagnostics;
}

/**
 * 代码风格检查
 */
function styleCheck(pythonText: string): PythonDiagnostic[] {
  const diagnostics: PythonDiagnostic[] = [];
  const lines = pythonText.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // 跳过空行和注释行
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }

    // 检查行长度（建议不超过120字符）
    if (line.length > 120) {
      const startPos = pythonText.indexOf(line);
      diagnostics.push({
        from: startPos,
        to: startPos + line.length,
        message: '第' + (i + 1) + '行：行长度超过120字符',
        severity: 'warning',
        rule: 'line-too-long',
        suggestion: '建议将长行拆分为多行'
      });
    }

    // 检查行尾空格
    if (line.endsWith(' ')) {
      const startPos = pythonText.indexOf(line);
      diagnostics.push({
        from: startPos + line.trimEnd().length,
        to: startPos + line.length,
        message: '第' + (i + 1) + '行：行尾有多余的空格',
        severity: 'warning',
        rule: 'trailing-whitespace',
        suggestion: '删除行尾的空格'
      });
    }

    // 检查是否使用 == 比较 None
    if (trimmedLine.includes('== None') || trimmedLine.includes('!= None')) {
      const startPos = pythonText.indexOf(line);
      diagnostics.push({
        from: startPos,
        to: startPos + line.length,
        message:
          '第' + (i + 1) + '行：应该使用 is None 或 is not None 来比较 None',
        severity: 'warning',
        rule: 'none-comparison',
        suggestion: '使用 is None 或 is not None 替代 == None 或 != None'
      });
    }

    // 检查是否使用 == 比较 True/False
    if (trimmedLine.includes('== True') || trimmedLine.includes('== False')) {
      const startPos = pythonText.indexOf(line);
      diagnostics.push({
        from: startPos,
        to: startPos + line.length,
        message:
          '第' + (i + 1) + '行：应该直接使用布尔值，不需要与 True/False 比较',
        severity: 'warning',
        rule: 'boolean-comparison',
        suggestion: '直接使用布尔值，删除 == True 或 == False'
      });
    }
  }

  return diagnostics;
}

/**
 * 语法结构检查
 */
function syntaxStructureCheck(pythonText: string): PythonDiagnostic[] {
  const diagnostics: PythonDiagnostic[] = [];
  const lines = pythonText.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // 跳过空行和注释行
    if (!line || line.startsWith('#')) {
      continue;
    }

    // 检查函数定义后是否有冒号
    if (line.startsWith('def ') && !line.endsWith(':')) {
      const startPos = pythonText.indexOf(line);
      diagnostics.push({
        from: startPos,
        to: startPos + line.length,
        message: '第' + (i + 1) + '行：函数定义后缺少冒号',
        severity: 'error',
        rule: 'missing-colon',
        suggestion: '在函数定义后添加冒号'
      });
    }

    // 检查类定义后是否有冒号
    if (line.startsWith('class ') && !line.endsWith(':')) {
      const startPos = pythonText.indexOf(line);
      diagnostics.push({
        from: startPos,
        to: startPos + line.length,
        message: '第' + (i + 1) + '行：类定义后缺少冒号',
        severity: 'error',
        rule: 'missing-colon',
        suggestion: '在类定义后添加冒号'
      });
    }

    // 检查 if/elif/else/for/while/try/except/finally 后是否有冒号
    const controlStructures = [
      'if ',
      'elif ',
      'else:',
      'for ',
      'while ',
      'try:',
      'except',
      'finally:'
    ];
    for (const structure of controlStructures) {
      if (line.startsWith(structure) && !line.endsWith(':')) {
        const startPos = pythonText.indexOf(line);
        diagnostics.push({
          from: startPos,
          to: startPos + line.length,
          message: '第' + (i + 1) + '行：控制结构后缺少冒号',
          severity: 'error',
          rule: 'missing-colon',
          suggestion: '在控制结构后添加冒号'
        });
      }
    }

    // 检查是否有未闭合的字符串
    const singleQuoteCount = (line.match(/'/g) || []).length;
    const doubleQuoteCount = (line.match(/"/g) || []).length;

    if (singleQuoteCount % 2 !== 0 && !line.includes("'''")) {
      const startPos = pythonText.indexOf(line);
      diagnostics.push({
        from: startPos,
        to: startPos + line.length,
        message: '第' + (i + 1) + '行：字符串未正确闭合',
        severity: 'error',
        rule: 'unclosed-string',
        suggestion: '检查字符串的引号是否匹配'
      });
    }

    if (doubleQuoteCount % 2 !== 0 && !line.includes('"""')) {
      const startPos = pythonText.indexOf(line);
      diagnostics.push({
        from: startPos,
        to: startPos + line.length,
        message: '第' + (i + 1) + '行：字符串未正确闭合',
        severity: 'error',
        rule: 'unclosed-string',
        suggestion: '检查字符串的引号是否匹配'
      });
    }
  }

  return diagnostics;
}

/**
 * 主要的 Python Linter 函数
 * 可以直接用于 CodeMirror extensions
 */
export default function createPythonLinter(
  config: PythonLinterConfig = {}
): any {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  return linter((view) => {
    const pythonText = view.state.doc.toString();
    if (!pythonText.trim()) return [];

    const diagnostics: PythonDiagnostic[] = [];

    // 执行所有检查
    if (finalConfig.checkSyntax) {
      diagnostics.push(...basicSyntaxCheck(pythonText));
      diagnostics.push(...syntaxStructureCheck(pythonText));
    }

    if (finalConfig.checkIndentation) {
      diagnostics.push(...indentationCheck(pythonText));
    }

    if (finalConfig.checkImports) {
      diagnostics.push(...importCheck(pythonText));
    }

    if (finalConfig.checkStyle) {
      diagnostics.push(...styleCheck(pythonText));
    }

    return diagnostics;
  });
}
