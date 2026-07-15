import type { DomainAxiomCandidate } from '../types';

const generateKey = () =>
  `candidate-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const stripQuotes = (value: string) =>
  value.replace(/^["'\s]+|["'\s]+$/g, '').trim();

const parseNameExpression = (
  line: string
): Pick<DomainAxiomCandidate, 'name' | 'expression'> | null => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) {
    return null;
  }

  // 名称：表达式 / 名称 - 表达式 / 名称 => 表达式
  const matched = trimmed.match(/^(.{1,64}?)\s*[:：=>\-–—]+\s*(.+)$/);
  if (matched) {
    const name = stripQuotes(matched[1]);
    const expression = stripQuotes(matched[2]);
    if (name && expression) {
      return { name, expression };
    }
  }

  // CSV: name,expression[,description]
  if (trimmed.includes(',')) {
    const parts = trimmed.split(',').map((item) => stripQuotes(item));
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return { name: parts[0].slice(0, 64), expression: parts[1] };
    }
  }

  // 纯文本行：截取前若干字作为名称
  const name = trimmed.length > 24 ? `${trimmed.slice(0, 24)}…` : trimmed;
  return { name, expression: trimmed };
};

const extractFromJson = (raw: string): DomainAxiomCandidate[] => {
  try {
    const parsed = JSON.parse(raw) as unknown;
    const list = Array.isArray(parsed)
      ? parsed
      : parsed &&
          typeof parsed === 'object' &&
          Array.isArray((parsed as { axioms?: unknown }).axioms)
        ? (parsed as { axioms: unknown[] }).axioms
        : parsed &&
            typeof parsed === 'object' &&
            Array.isArray((parsed as { items?: unknown }).items)
          ? (parsed as { items: unknown[] }).items
          : null;

    if (!list) {
      return [];
    }

    return list
      .map((item): DomainAxiomCandidate | null => {
        if (!item || typeof item !== 'object') {
          return null;
        }
        const row = item as Record<string, unknown>;
        const name = String(
          row.name || row.title || row.axiomName || ''
        ).trim();
        const expression = String(
          row.expression || row.content || row.rule || row.text || ''
        ).trim();
        if (!name || !expression) {
          return null;
        }
        return {
          key: generateKey(),
          name: name.slice(0, 64),
          expression,
          description:
            String(row.description || row.desc || '').trim() || undefined,
          domain: String(row.domain || '').trim() || undefined
        };
      })
      .filter(Boolean) as DomainAxiomCandidate[];
  } catch {
    return [];
  }
};

/**
 * 从文本内容中提取领域公理候选。
 * 支持 JSON、按行分隔的「名称:表达式」、CSV 及纯文本。
 */
export const extractAxiomsFromText = (
  raw: string,
  fileName?: string
): DomainAxiomCandidate[] => {
  const content = raw.replace(/^\uFEFF/, '').trim();
  if (!content) {
    return [];
  }

  const lowerName = (fileName || '').toLowerCase();
  if (
    lowerName.endsWith('.json') ||
    content.startsWith('{') ||
    content.startsWith('[')
  ) {
    const fromJson = extractFromJson(content);
    if (fromJson.length) {
      return fromJson;
    }
  }

  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  // 跳过疑似 CSV 表头
  const dataLines =
    lines[0] &&
    /name|名称|公理|expression|表达式|content/i.test(lines[0]) &&
    lines[0].includes(',')
      ? lines.slice(1)
      : lines;

  const seen = new Set<string>();
  const result: DomainAxiomCandidate[] = [];

  dataLines.forEach((line) => {
    const parsed = parseNameExpression(line);
    if (!parsed) {
      return;
    }
    const dedupeKey = `${parsed.name}::${parsed.expression}`;
    if (seen.has(dedupeKey)) {
      return;
    }
    seen.add(dedupeKey);
    result.push({
      key: generateKey(),
      name: parsed.name,
      expression: parsed.expression
    });
  });

  return result;
};

export const readFileAsText = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(String(reader.result || ''));
    };
    reader.onerror = () => {
      reject(new Error('读取文件失败'));
    };
    reader.readAsText(file, 'UTF-8');
  });
