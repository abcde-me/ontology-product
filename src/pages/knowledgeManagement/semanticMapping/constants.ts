/** 预置领域，首次进入时写入本地存储 */
export const DEFAULT_DOMAIN_NAMES = [
  '装备保障',
  '作战指挥',
  '情报侦察',
  '后勤保障',
  '训练管理'
] as const;

/** 同义词 / 别名 Tag 轮换色 */
export const SYNONYM_TAG_COLORS = [
  'arcoblue',
  'green',
  'orangered',
  'purple',
  'cyan',
  'gold',
  'magenta',
  'lime',
  'blue',
  'pinkpurple'
] as const;

export const LIST_PATH =
  '/tenant/compute/onto/knowledgeManagement/semanticMapping';

export const DETAIL_PATH = `${LIST_PATH}/detail`;
