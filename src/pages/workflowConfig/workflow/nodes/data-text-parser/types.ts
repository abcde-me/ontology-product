import type { CommonNodeType, VarType, Variable } from '@/pages/workflowConfig/workflow/types'
import { string } from 'mobx-state-tree/dist/internal'

export enum CodeLanguage {
  python3 = 'python3',
  javascript = 'javascript',
  json = 'json',
}

export type OutputVar = Record<string, {
  type: VarType
  children: null // support nest in the future,
}>

export type TextParserNodeType = CommonNodeType & {
  files: string[]
  selected_files_num: number
  text_slice_rule: number
  slice_max_size: number
  text_proc_rules: number[]
  multi_model: string
  pic_model: string
  text_emb_model: string
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