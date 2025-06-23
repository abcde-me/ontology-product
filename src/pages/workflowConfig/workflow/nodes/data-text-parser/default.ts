import { BlockEnum } from '../../types'
import type { NodeDefault } from '../../types'
import { type TextParserNodeType } from './types'
import { ALL_CHAT_AVAILABLE_BLOCKS, ALL_COMPLETION_AVAILABLE_BLOCKS } from '@/pages/workflowConfig/workflow/blocks'

const i18nPrefix = 'workflow.errorMsg'

const nodeDefault: NodeDefault<TextParserNodeType> = {
  defaultValue: {
    files: [],
    selected_files_num: -1,
    text_slice_rule: 1,
    slice_max_size: 800,
    text_proc_rules: [1],
    text_orc_model_id: '',
    text_pic_model_id: '',
    text_emb_model_id: '',
  },
  getAvailablePrevNodes(isChatMode: boolean) {
    const nodes = isChatMode
      ? ALL_CHAT_AVAILABLE_BLOCKS
      : ALL_COMPLETION_AVAILABLE_BLOCKS.filter(type => type !== BlockEnum.End)
    return nodes
  },
  getAvailableNextNodes(isChatMode: boolean) {
    const nodes = isChatMode ? ALL_CHAT_AVAILABLE_BLOCKS : ALL_COMPLETION_AVAILABLE_BLOCKS
    return nodes
  },
  checkValid(payload: TextParserNodeType, t: any) {
    let errorMessages = ''
    const { selected_files_num } = payload

    if (selected_files_num <= 0) {
      errorMessages = '需要选择至少一个文本文件'
    }
    return {
      isValid: !errorMessages,
      errorMessage: errorMessages,
    }
  },

}

export default nodeDefault
