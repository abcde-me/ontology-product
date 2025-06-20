import type { CommonNodeType, VarType, Variable } from '@/pages/workflowConfig/workflow/types'

export enum CodeLanguage {
  python3 = 'python3',
  javascript = 'javascript',
  json = 'json',
}

export type OutputVar = Record<string, {
  type: VarType
  children: null // support nest in the future,
}>

export type CodeNodeType = CommonNodeType & {
  variables: Variable[]
  code_language: CodeLanguage
  code: string
  outputs: OutputVar
}

export type CodeDependency = any

// 分段方式 按字符 0 按段落 1 按句子 2
// 定义分段选项的类型
export type SegmentationOption = {
  value: string;
  label: string;
  key: number;
  map: any;
};

export type TextProcessingRules = {
  replaceExpressionsAndSymbols: boolean;
  removeValidUrlsAndEmails: boolean;
};