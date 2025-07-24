import { BlockEnum } from '../../types';
import type { NodeDefault } from '../../types';
import { CodeLanguage, type CodeNodeType } from './types';
import {
  ALL_CHAT_AVAILABLE_BLOCKS,
  ALL_COMPLETION_AVAILABLE_BLOCKS
} from '@/pages/workflowConfig/workflow/blocks';
import TextPlan from './textDefault';

const i18nPrefix = 'workflow.errorMsg';

const nodeDefault: NodeDefault<CodeNodeType> = {
  defaultValue: {
    code: '',
    code_language: CodeLanguage.python3,
    variables: [],
    outputs: {},
    app_scenarios: {
      name: '通用',
      type: 'tongyong',
      option: {
        sample_num: 10,
        similarity_threshold: 0.7,
        generate_sample_num: 100,
        enhanced_proportion: 0.7,
        is_prompt: 0,
        prompt: TextPlan['tongyong'].prompt,
        sample_data: TextPlan['tongyong'].data
      }
    }
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
    const { enha_modle_id, app_scenarios, modelList } = payload;
    const {
      enhanced_proportion,
      sample_num,
      similarity_threshold,
      generate_sample_num
    } = app_scenarios?.option ?? {};
    if (!app_scenarios?.name) {
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
