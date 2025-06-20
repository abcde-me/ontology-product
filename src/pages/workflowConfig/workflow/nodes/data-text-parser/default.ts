import { BlockEnum } from '../../types'
import type { NodeDefault } from '../../types'
import { type TextParserNodeType } from './types'
import { ALL_CHAT_AVAILABLE_BLOCKS, ALL_COMPLETION_AVAILABLE_BLOCKS } from '@/pages/workflowConfig/workflow/blocks'

const i18nPrefix = 'workflow.errorMsg'

const nodeDefault: NodeDefault<TextParserNodeType> = {
  defaultValue: {
    files: [],
    text_slice_rule: 1,
    slice_max_size: 800,
    text_proc_rules: [0],
    multi_model: '',
    pic_model: '',
    text_emb_model: '',
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
    const errorMessages = ''
    // const { code, variables = [] } = payload
    // if (!errorMessages && variables.filter(v => !v.variable).length > 0)
    //   errorMessages = t(`${i18nPrefix}.fieldRequired`, { field: t(`${i18nPrefix}.fields.variable`) })
    // if (!errorMessages && variables.filter(v => !v.value_selector.length).length > 0)
    //   errorMessages = t(`${i18nPrefix}.fieldRequired`, { field: t(`${i18nPrefix}.fields.variableValue`) })
    // if (!errorMessages && !code)
    //   errorMessages = t(`${i18nPrefix}.fieldRequired`, { field: t(`${i18nPrefix}.fields.code`) })

    return {
      isValid: !errorMessages,
      errorMessage: errorMessages,
    }
  },

}

export default nodeDefault
