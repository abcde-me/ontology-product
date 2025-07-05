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
  generate_sample_num: number; // 生成样本数
  similarity_threshold: number; // 相似度阈值
  sample_num: number; // 指令生成依赖样本数
  prompt: string;
  prompt_checkbox: boolean;
  enhanced_proportion: number; // 任务描述增强占比
  modelList: Array<any>;
  sample_data: string;
  app_scenarios_name: string;
  customPromptChecked: boolean;
  app_scenarios: {
    name: string;
    type: string;
    option: {
      sample_num: number;
      similarity_threshold: number;
      generate_sample_num: number;
      enhanced_proportion: number;
      prompt: string;
      sample_data: string;
    };
  };
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

export type EnhancementNodeType = {
  source_path: []; // '源文件路径'; // 待定是否多个目录 【】
  target_path: string; ///'目标文件路径';
  type: 'enhancement'; // start、text、pic、audio、video、cleaning、enhancement、end
  title: '数据增强节点';
  app_scenarios: {
    name: string;
    type: string;
    option: {
      sample_num: number;
      similarity_threshold: number;
      generate_sample_num: number;
      enhanced_proportion: number;
      prompt: string;
      sample_data: string;
    };
  }; // '应用场景'; // 按通用（0）、文本分类（1）、文本提取（2）、文本生成（3）、多轮问答（4）
  sample_data: string; // 示例数据;
  prompt: string; // '提示词';
  enha_modle_id: number; //'数据增强模型名称';
  generate_sample_num: number; // 生成样本数
  similarity_threshold: number; // 相似度阈值
  sample_num: number; // 指令生成依赖样本数
  prompt_checkbox: boolean; // 提示词 开关
  modelList: Array<any>;
  enhanced_proportion: number; // 任务描述占比值
  app_scenarios_name: string; // 场景
  customPromptChecked: boolean;
};
