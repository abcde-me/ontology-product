import type {
  CommonNodeType,
  VarType,
  Variable
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
  variables: Variable[];
  code_language: CodeLanguage;
  code: string;
  outputs: OutputVar;
  app_scenarios: number;
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


export type enhancementNodeType = {
  source_path: []; // '源文件路径'; // 待定是否多个目录 【】
  target_path: string; ///'目标文件路径';
  type: 'enhancement'; // start、text、pic、audio、video、cleaning、enhancement、end
  title: '数据增强节点';
  app_scenarios: number; // '应用场景'; // 按通用（0）、文本分类（1）、文本提取（2）、文本生成（3）、多轮问答（4）
  sample_data: string; // 示例数据;
  prompt: string; // '提示词';
  enha_modle: string; //'数据增强模型名称';
};
