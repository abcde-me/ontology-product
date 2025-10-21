import type {
  CommonNodeType,
  VarType,
} from '@/pages/workflowConfig/workflow/types';

export enum CodeLanguage {
  python3 = 'python3',
  javascript = 'javascript',
  json = 'json'
}

export type OutputVar = Record<
  string,
  {
    type: VarType;
    children: null; // support nest in the future,
  }
>;

export type CodeNodeType = CommonNodeType & {
  variables: any[];
  code_language: CodeLanguage;
  code: string;
  outputs: OutputVar;
  data_standardization: boolean | number;
  threshold: number;
  threshold_switch: boolean;
  unicode: boolean | number;
  traditional_to_simplified: boolean | number;
  case_uniformity: boolean;
  case_transform: number; // 1 大写。2 小写
  oh_is: boolean | number;
  df_is: boolean | number;
  qd_is: boolean | number;
  mg_is: boolean | number;
  ts_remove: boolean | number;
  remove_url: boolean | number;
  remove_invisible: boolean | number;
  remove_html: boolean | number;
  sample_data: string;
  md5: boolean | number;
  ngram: boolean | number;
  mg_duplicate_checkbox: string;
  mg_duplicate_ngram: number;
  mg_duplicate: boolean;
};

export type CodeDependency = any;

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
