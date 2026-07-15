import type { AxiomSourceType } from './types';

export const LIST_PATH = '/tenant/compute/onto/knowledgeManagement/domainAxiom';

export const DETAIL_PATH = `${LIST_PATH}/detail`;

export const AXIOM_SOURCE_LABEL: Record<AxiomSourceType, string> = {
  manual: '人工创建',
  file: '文件提取',
  llm: '大模型生成'
};

export const AXIOM_SOURCE_COLOR: Record<AxiomSourceType, string> = {
  manual: 'arcoblue',
  file: 'orangered',
  llm: 'purple'
};

export const AXIOM_SOURCE_OPTIONS: Array<{
  label: string;
  value: AxiomSourceType;
}> = [
  { label: AXIOM_SOURCE_LABEL.manual, value: 'manual' },
  { label: AXIOM_SOURCE_LABEL.file, value: 'file' },
  { label: AXIOM_SOURCE_LABEL.llm, value: 'llm' }
];

/** 预置领域，便于快速选择 */
export const DEFAULT_DOMAIN_OPTIONS = [
  '装备保障',
  '作战指挥',
  '情报侦察',
  '后勤保障',
  '训练管理',
  '指挥控制',
  '战场环境'
] as const;

/** 支持提取的文件类型 */
export const EXTRACT_ACCEPT = '.txt,.md,.csv,.json,.yml,.yaml';
