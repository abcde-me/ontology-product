import { BlockEnum } from '../../types';
import type { NodeDefault } from '../../types';
import { CodeLanguage, type CodeNodeType } from './types';
import {
  ALL_CHAT_AVAILABLE_BLOCKS,
  ALL_COMPLETION_AVAILABLE_BLOCKS
} from '@/pages/workflowConfig/workflow/blocks';

const i18nPrefix = 'workflow.errorMsg';

const nodeDefault: NodeDefault<CodeNodeType> = {
  defaultValue: {
    code: '',
    code_language: CodeLanguage.python3,
    variables: [],
    outputs: {}
  },
  getAvailablePrevNodes(isChatMode: boolean) {
    const nodes = isChatMode
      ? ALL_CHAT_AVAILABLE_BLOCKS
      : ALL_COMPLETION_AVAILABLE_BLOCKS.filter(
          (type) => type !== BlockEnum.End
        );
    return nodes;
  },
  getAvailableNextNodes(isChatMode: boolean) {
    const nodes = isChatMode
      ? ALL_CHAT_AVAILABLE_BLOCKS
      : ALL_COMPLETION_AVAILABLE_BLOCKS;
    return nodes;
  },
  checkValid(payload: CodeNodeType, t: any) {
    let errorMessages = '';
    const {
      app_scenarios_name,
      enha_modle_id,
      enhanced_proportion,
      sample_num,
      similarity_threshold,
      generate_sample_num,
      modelList
    } = payload;
    if (!app_scenarios_name) {
      errorMessages = '场景未选择';
    }
    if (!enha_modle_id) {
      errorMessages = '模型未选择';
    }
    if (enhanced_proportion > 1) {
      errorMessages = '任务描述增强占比为非法内容';
    }
    if (similarity_threshold > 1) {
      errorMessages = '过滤相似度阈值为非法内容';
    }
    if (generate_sample_num < 1 || generate_sample_num > 20000) {
      errorMessages = '生成样本数为范围1~20000';
    }
    if (sample_num < 1 || sample_num > 10000) {
      errorMessages = '指令生成依赖样本数为范围1~10000';
    }

    return {
      isValid: !errorMessages,
      errorMessage: errorMessages
    };
  }
};

export default nodeDefault;
