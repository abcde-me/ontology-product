export enum SecurityCategory {
  Confidential = 'confidential',
  Pornographic = 'pornographic',
  Explosive = 'explosive',
  Gang = 'gang'
}

export interface SecurityCategoryRule {
  type: SecurityCategory;
  name: string;
  description: string;
  enabled: boolean;
}

export interface SecurityProtectionConfig {
  /** 是否启用安全防护 */
  enabled: boolean;
  /** 检测到敏感内容时是否拦截发送 */
  blockOnMatch: boolean;
  /** 分类规则 */
  categories: SecurityCategoryRule[];
  /** 自定义敏感词，每行一个 */
  customKeywords: string;
}

export const SECURITY_CATEGORY_LABELS: Record<SecurityCategory, string> = {
  [SecurityCategory.Confidential]: '涉密',
  [SecurityCategory.Pornographic]: '涉黄',
  [SecurityCategory.Explosive]: '涉爆',
  [SecurityCategory.Gang]: '涉黑'
};

export const DEFAULT_SECURITY_PROTECTION_CONFIG: SecurityProtectionConfig = {
  enabled: true,
  blockOnMatch: true,
  categories: [
    {
      type: SecurityCategory.Confidential,
      name: '涉密内容',
      description: '检测国家秘密、内部资料、机密文件等涉密话题',
      enabled: true
    },
    {
      type: SecurityCategory.Pornographic,
      name: '涉黄内容',
      description: '检测色情、淫秽等违规内容',
      enabled: true
    },
    {
      type: SecurityCategory.Explosive,
      name: '涉爆内容',
      description: '检测爆炸物、危险品制作等涉爆话题',
      enabled: true
    },
    {
      type: SecurityCategory.Gang,
      name: '涉黑内容',
      description: '检测黑社会、涉黑犯罪等违法话题',
      enabled: true
    }
  ],
  customKeywords: ''
};

export interface SensitiveCheckResult {
  matched: boolean;
  categories: SecurityCategory[];
  matchedKeywords: string[];
  message: string;
}
