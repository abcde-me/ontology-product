import { pinyin } from 'pinyin-pro';

export const FUNCTION_CODE_MIN_LENGTH = 2;
export const FUNCTION_CODE_MAX_LENGTH = 100;
export const FUNCTION_CODE_PATTERN = /^[a-zA-Z0-9_]+$/;
export const FUNCTION_CODE_NAMING_PATTERN = /^fn_[0-9a-z]{4}_[a-z0-9_]+$/;

const RANDOM_CHARS = '0123456789abcdefghijklmnopqrstuvwxyz';

export const isValidFunctionCode = (value: string): boolean => {
  const trimmed = value.trim();
  if (
    trimmed.length < FUNCTION_CODE_MIN_LENGTH ||
    trimmed.length > FUNCTION_CODE_MAX_LENGTH
  ) {
    return false;
  }
  return FUNCTION_CODE_PATTERN.test(trimmed);
};

export const isValidFunctionNamingFormat = (value: string): boolean => {
  const trimmed = value.trim();
  if (!isValidFunctionCode(trimmed)) {
    return false;
  }
  return FUNCTION_CODE_NAMING_PATTERN.test(trimmed.toLowerCase());
};

export const randomFunctionCodeSuffix = (): string => {
  let result = '';
  for (let i = 0; i < 4; i += 1) {
    result += RANDOM_CHARS[Math.floor(Math.random() * RANDOM_CHARS.length)];
  }
  return result;
};

/** 从显示名称提取英文关键词（英文原词 + 中文拼音） */
export const extractFunctionCodeKeywords = (displayName: string): string => {
  const trimmed = displayName.trim();
  if (!trimmed) {
    return 'func';
  }

  const parts: string[] = [];
  const englishMatches = trimmed.match(/[a-zA-Z]+/g);
  if (englishMatches?.length) {
    parts.push(...englishMatches.map((word) => word.toLowerCase()));
  }

  const chinesePart = trimmed.replace(/[a-zA-Z0-9_\s]+/g, '').trim();
  if (chinesePart) {
    const fromPinyin = pinyin(chinesePart, { toneType: 'none', type: 'array' })
      .map((segment) => segment.replace(/[^a-z0-9]/gi, '').toLowerCase())
      .filter(Boolean);
    parts.push(...fromPinyin);
  }

  const keywords = parts.join('_').replace(/_+/g, '_').replace(/^_|_$/g, '');

  return (keywords || 'func').slice(0, 80);
};

const normalizeSuffix = (raw: string): string => {
  const normalized = raw.replace(/[^0-9a-z]/g, '').slice(0, 4);
  if (normalized.length === 4) {
    return normalized;
  }
  return randomFunctionCodeSuffix();
};

const trimFunctionCodeLength = (value: string): string => {
  if (value.length <= FUNCTION_CODE_MAX_LENGTH) {
    return value;
  }

  const prefixMatch = value.match(/^(fn_[0-9a-z]{4}_)/);
  if (prefixMatch) {
    const prefix = prefixMatch[1];
    const keywords = value.slice(prefix.length);
    const maxKeywordsLen = FUNCTION_CODE_MAX_LENGTH - prefix.length;
    return (
      prefix + keywords.slice(0, maxKeywordsLen).replace(/_+$/, '')
    ).slice(0, FUNCTION_CODE_MAX_LENGTH);
  }

  return value.slice(0, FUNCTION_CODE_MAX_LENGTH);
};

/** 将任意字符串规范为 fn_XXXX_keywords 格式 */
export const sanitizeFunctionCode = (raw: string): string => {
  let value = raw
    .replaceAll(/[\u200B-\u200D\uFEFF]/g, '')
    .trim()
    .toLowerCase();
  value = value
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  const match = value.match(/^fn_([0-9a-z]{1,4})_(.+)$/);
  if (match) {
    const [, suffix, keywords] = match;
    value = `fn_${normalizeSuffix(suffix)}_${keywords.replace(/_+/g, '_').replace(/^_|_$/g, '')}`;
  } else if (value.startsWith('fn_')) {
    const parts = value.split('_').filter(Boolean);
    const suffix = normalizeSuffix(parts[1] || '');
    const keywords = parts.slice(2).join('_') || 'func';
    value = `fn_${suffix}_${keywords}`;
  } else {
    const keywords = value || 'func';
    value = `fn_${randomFunctionCodeSuffix()}_${keywords}`;
  }

  if (!/^fn_[0-9a-z]{4}_.+/.test(value)) {
    value = `fn_${randomFunctionCodeSuffix()}_func`;
  }

  return trimFunctionCodeLength(value);
};

export const ensureUniqueFunctionCode = (
  base: string,
  existingCodes: Iterable<string> = []
): string => {
  const used = new Set(
    Array.from(existingCodes)
      .map((code) => code?.trim())
      .filter((code): code is string => Boolean(code))
  );

  const candidate = sanitizeFunctionCode(base);
  if (!used.has(candidate)) {
    return candidate;
  }

  let index = 1;
  while (index < 1000) {
    const suffix = `_${index}`;
    const maxBaseLen = FUNCTION_CODE_MAX_LENGTH - suffix.length;
    const truncatedBase = candidate.slice(0, maxBaseLen).replace(/_+$/, '');
    const next = `${truncatedBase}${suffix}`;
    if (!used.has(next)) {
      return next;
    }
    index += 1;
  }

  return generateLocalFunctionCode('', used);
};

/** 本地生成函数名称（大模型不可用时的回退） */
export const generateLocalFunctionCode = (
  displayName: string,
  existingCodes: Iterable<string> = []
): string => {
  const keywords = extractFunctionCodeKeywords(displayName);
  const base = `fn_${randomFunctionCodeSuffix()}_${keywords}`;
  return ensureUniqueFunctionCode(base, existingCodes);
};
