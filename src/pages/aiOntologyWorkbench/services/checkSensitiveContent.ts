import { BUILTIN_SECURITY_KEYWORDS } from './securityKeywordLibrary';
import {
  SECURITY_CATEGORY_LABELS,
  type SecurityProtectionConfig,
  type SensitiveCheckResult,
  SecurityCategory
} from '../types/securityProtection';

const parseCustomKeywords = (raw: string) => {
  return raw
    .split(/[\n,，;；]+/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const findMatchedKeywords = (text: string, keywords: string[]) => {
  const normalizedText = text.toLowerCase();

  return keywords.filter((keyword) => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    return normalizedKeyword && normalizedText.includes(normalizedKeyword);
  });
};

const buildWarningMessage = (categories: SecurityCategory[]) => {
  const labels = categories.map((item) => SECURITY_CATEGORY_LABELS[item]);

  if (labels.length === 1) {
    return `检测到您的输入可能涉及${labels[0]}话题，请调整内容后再发送。`;
  }

  return `检测到您的输入可能涉及${labels.join('、')}等敏感话题，请调整内容后再发送。`;
};

export const checkSensitiveContent = (
  text: string,
  config: SecurityProtectionConfig | null | undefined
): SensitiveCheckResult => {
  const emptyResult: SensitiveCheckResult = {
    matched: false,
    categories: [],
    matchedKeywords: [],
    message: ''
  };

  if (!config?.enabled || !text.trim()) {
    return emptyResult;
  }

  const enabledCategories = new Set(
    config.categories.filter((item) => item.enabled).map((item) => item.type)
  );

  const matchedCategorySet = new Set<SecurityCategory>();
  const matchedKeywords: string[] = [];

  enabledCategories.forEach((category) => {
    const hits = findMatchedKeywords(text, BUILTIN_SECURITY_KEYWORDS[category]);
    if (hits.length) {
      matchedCategorySet.add(category);
      matchedKeywords.push(...hits);
    }
  });

  const customHits = findMatchedKeywords(
    text,
    parseCustomKeywords(config.customKeywords)
  );

  if (customHits.length) {
    matchedKeywords.push(...customHits);
  }

  const categories = Array.from(matchedCategorySet);

  if (!categories.length && !customHits.length) {
    return emptyResult;
  }

  const message =
    categories.length > 0
      ? buildWarningMessage(categories)
      : '检测到您的输入包含自定义敏感词，请调整内容后再发送。';

  return {
    matched: true,
    categories,
    matchedKeywords: Array.from(new Set(matchedKeywords)),
    message
  };
};
