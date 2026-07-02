import { pinyin } from 'pinyin-pro';

const CODE_PATTERN = /^[a-zA-Z][a-zA-Z0-9]*$/;

/** 根据名称生成对象类型/链接 id（首字母英文，仅字母数字） */
export const generateOntologyIdentifier = (
  name: string,
  existingCodes: Iterable<string> = []
): string => {
  const used = new Set(
    Array.from(existingCodes)
      .map((code) => code?.trim())
      .filter((code): code is string => Boolean(code))
  );

  const trimmed = name.trim();
  if (!trimmed) {
    return ensureUnique('item', used);
  }

  const compactAscii = trimmed.replace(/\s+/g, '');
  let base = '';

  if (CODE_PATTERN.test(compactAscii)) {
    base = compactAscii;
  } else if (/^[a-zA-Z0-9]+$/.test(compactAscii)) {
    base = `o${compactAscii}`;
  } else {
    const fromPinyin = pinyin(trimmed, { toneType: 'none', type: 'array' })
      .join('')
      .replace(/[^a-zA-Z0-9]/g, '');

    base = fromPinyin || 'item';
    if (!/^[a-zA-Z]/.test(base)) {
      base = `o${base}`;
    }
  }

  base = base.slice(0, 40);
  return ensureUnique(base, used);
};

const ensureUnique = (base: string, used: Set<string>) => {
  let candidate = base;
  let index = 1;

  while (used.has(candidate)) {
    candidate = `${base}${index}`;
    index += 1;
  }

  return candidate;
};
