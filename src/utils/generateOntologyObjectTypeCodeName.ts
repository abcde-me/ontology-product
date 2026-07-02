import { extractFunctionCodeKeywords } from '@/utils/generateOntologyFunctionCodeName';

export const OBJECT_TYPE_CODE_MIN_LENGTH = 2;
export const OBJECT_TYPE_CODE_MAX_LENGTH = 100;
export const OBJECT_TYPE_CODE_PATTERN = /^[a-zA-Z0-9_]+$/;
export const OBJECT_TYPE_CODE_NAMING_PATTERN = /^ob_[a-z0-9_]+_[0-9a-z]{4}$/;

export const OBJECT_TYPE_CODE_EXTRA =
  '根据名称自动生成，可修改；格式为 ob_英文关键词_4位随机字符(0-9、a-z)，场景内对象类型唯一';

export const OBJECT_TYPE_CODE_FORMAT_MESSAGE =
  '格式应为 ob_英文关键词_4位随机字符(0-9、a-z)';

const RANDOM_CHARS = '0123456789abcdefghijklmnopqrstuvwxyz';

export const randomObjectTypeCodeSuffix = (): string => {
  let result = '';
  for (let i = 0; i < 4; i += 1) {
    result += RANDOM_CHARS[Math.floor(Math.random() * RANDOM_CHARS.length)];
  }
  return result;
};

export const isValidObjectTypeCode = (value: string): boolean => {
  const trimmed = value.trim();
  if (
    trimmed.length < OBJECT_TYPE_CODE_MIN_LENGTH ||
    trimmed.length > OBJECT_TYPE_CODE_MAX_LENGTH
  ) {
    return false;
  }
  return OBJECT_TYPE_CODE_PATTERN.test(trimmed);
};

export const isValidObjectTypeNamingFormat = (value: string): boolean => {
  const trimmed = value.trim().toLowerCase();
  if (!isValidObjectTypeCode(trimmed)) {
    return false;
  }
  return OBJECT_TYPE_CODE_NAMING_PATTERN.test(trimmed);
};

/** 从对象类型名称提取英文关键词 */
export const extractObjectTypeCodeKeywords = (displayName: string): string => {
  return extractFunctionCodeKeywords(displayName);
};

const normalizeSuffix = (raw: string): string => {
  const normalized = raw.replace(/[^0-9a-z]/g, '').slice(0, 4);
  if (normalized.length === 4) {
    return normalized;
  }
  return randomObjectTypeCodeSuffix();
};

const trimObjectTypeCodeLength = (value: string): string => {
  if (value.length <= OBJECT_TYPE_CODE_MAX_LENGTH) {
    return value;
  }

  const match = value.match(/^(ob_[a-z0-9_]+_)[0-9a-z]{4}$/);
  if (match) {
    const prefix = match[1];
    const maxKeywordLen = OBJECT_TYPE_CODE_MAX_LENGTH - prefix.length - 4;
    const keywordPart = prefix.slice(3, -1);
    const trimmedKeywords = keywordPart
      .slice(0, maxKeywordLen)
      .replace(/_+$/, '');
    return `ob_${trimmedKeywords}_${value.slice(-4)}`.slice(
      0,
      OBJECT_TYPE_CODE_MAX_LENGTH
    );
  }

  return value.slice(0, OBJECT_TYPE_CODE_MAX_LENGTH);
};

/** 将任意字符串规范为 ob_keywords_XXXX 格式 */
export const sanitizeObjectTypeCode = (raw: string): string => {
  let value = raw
    .replaceAll(/[\u200B-\u200D\uFEFF]/g, '')
    .trim()
    .toLowerCase();
  value = value
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  const match = value.match(/^ob_([a-z0-9_]+)_([0-9a-z]{1,4})$/);
  if (match) {
    const [, keywords, suffix] = match;
    value = `ob_${keywords.replace(/_+/g, '_').replace(/^_|_$/g, '')}_${normalizeSuffix(suffix)}`;
  } else if (value.startsWith('ob_')) {
    const parts = value.split('_').filter(Boolean);
    const keywords = parts.slice(1, -1).join('_') || parts[1] || 'object';
    const suffix = normalizeSuffix(parts[parts.length - 1] || '');
    value = `ob_${keywords}_${suffix}`;
  } else {
    const keywords = value || 'object';
    value = `ob_${keywords}_${randomObjectTypeCodeSuffix()}`;
  }

  if (!/^ob_[a-z0-9_]+_[0-9a-z]{4}$/.test(value)) {
    value = `ob_object_${randomObjectTypeCodeSuffix()}`;
  }

  return trimObjectTypeCodeLength(value);
};

export const ensureUniqueObjectTypeCode = (
  base: string,
  existingCodes: Iterable<string> = []
): string => {
  const used = new Set(
    Array.from(existingCodes)
      .map((code) => code?.trim().toLowerCase())
      .filter((code): code is string => Boolean(code))
  );

  const candidate = sanitizeObjectTypeCode(base);
  if (!used.has(candidate)) {
    return candidate;
  }

  const match = candidate.match(/^ob_([a-z0-9_]+)_[0-9a-z]{4}$/);
  if (match) {
    const keywords = match[1];
    for (let i = 0; i < 200; i += 1) {
      const next = `ob_${keywords}_${randomObjectTypeCodeSuffix()}`;
      if (!used.has(next)) {
        return next;
      }
    }
  }

  let index = 1;
  while (index < 1000) {
    const suffix = `_${index}`;
    const maxBaseLen = OBJECT_TYPE_CODE_MAX_LENGTH - suffix.length;
    const truncatedBase = candidate.slice(0, maxBaseLen).replace(/_+$/, '');
    const next = `${truncatedBase}${suffix}`;
    if (!used.has(next)) {
      return next;
    }
    index += 1;
  }

  return generateLocalObjectTypeCode('', existingCodes);
};

/** 本地生成对象类型 id（大模型不可用时的回退） */
export const generateLocalObjectTypeCode = (
  displayName: string,
  existingCodes: Iterable<string> = []
): string => {
  const keywords = extractObjectTypeCodeKeywords(displayName);
  const base = `ob_${keywords}_${randomObjectTypeCodeSuffix()}`;
  return ensureUniqueObjectTypeCode(base, existingCodes);
};

export const validateObjectTypeCode = (
  value: string | undefined,
  callback: (message?: string) => void
) => {
  const trimmed = value?.trim();
  if (!trimmed) {
    callback();
    return;
  }
  if (!isValidObjectTypeCode(trimmed)) {
    callback('仅允许英文字母、数字与下划线');
    return;
  }
  if (!isValidObjectTypeNamingFormat(trimmed)) {
    callback(OBJECT_TYPE_CODE_FORMAT_MESSAGE);
    return;
  }
  callback();
};

export const objectTypeCodeValidatorRule = {
  validator: validateObjectTypeCode
};
