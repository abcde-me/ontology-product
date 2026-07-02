import { SecurityCategory } from '../types/securityProtection';

/** 内置敏感词库（按分类），可在设置中按分类开关 */
export const BUILTIN_SECURITY_KEYWORDS: Record<SecurityCategory, string[]> = {
  [SecurityCategory.Confidential]: [
    '涉密',
    '国家秘密',
    '机密文件',
    '绝密',
    '秘密级',
    '内部资料',
    '保密协议',
    '泄密',
    '机要',
    '密级'
  ],
  [SecurityCategory.Pornographic]: [
    '涉黄',
    '色情',
    '淫秽',
    '裸聊',
    '黄片',
    '卖淫',
    '嫖娼',
    '色情网站'
  ],
  [SecurityCategory.Explosive]: [
    '涉爆',
    '爆炸物',
    '制作炸弹',
    '炸药配方',
    '自制爆炸',
    '雷管制作',
    '恐怖袭击',
    '爆炸装置'
  ],
  [SecurityCategory.Gang]: [
    '涉黑',
    '黑社会',
    '黑帮',
    '帮派火并',
    '洗钱',
    '保护伞',
    '涉黑组织',
    '恶势力'
  ]
};
