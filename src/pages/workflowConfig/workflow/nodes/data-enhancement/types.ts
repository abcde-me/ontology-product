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
  enha_modle_id: number;
  prompt_checkbox: boolean;
  modelList: Array<any>;
  customPromptChecked: boolean;
  app_scenarios: AppScenario;
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

export interface AppScenario {
  name: string;
  type?: string;
  option: {
    /** 自定义提示词开关 */
    is_prompt: number;
    /** 指令生成依赖样本数 */
    sample_num: number;
    /** 相似度阈值 */
    similarity_threshold: number;
    /** 生成样本数 */
    generate_sample_num: number;
    /** 任务描述增强占比 */
    enhanced_proportion: number;
    /** 自定义提示词 */
    prompt: string;
    /** 数据示例 */
    sample_data: string;
  };
}

export type EnhancementNodeType = {
  source_path: []; // '源文件路径'; // 待定是否多个目录 【】
  target_path: string; // '目标文件路径';
  type: 'enhancement'; // start、text、pic、audio、video、cleaning、enhancement、end
  title: '数据增强节点';
  app_scenarios: AppScenario;
  enha_modle_id: number; //'数据增强模型名称';
  prompt_checkbox: boolean; // 提示词 开关
  modelList: Array<any>;
  customPromptChecked: boolean;
};
