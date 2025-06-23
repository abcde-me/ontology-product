import { BlockEnum } from '../../types'
import type { NodeDefault } from '../../types'
import { type AudioParserNodeType } from './types'
import { ALL_CHAT_AVAILABLE_BLOCKS, ALL_COMPLETION_AVAILABLE_BLOCKS } from '@/pages/workflowConfig/workflow/blocks'

const i18nPrefix = 'workflow.errorMsg'

const nodeDefault: NodeDefault<AudioParserNodeType> = {
  defaultValue: {
    files: [],
    selected_files_num: -1,
    audio_pret: [1],
    vad_enabled: 1,
    activity_mode: '自动',
    is_open_multi_conv: 1,
    vad_options: ['vad', 'conv'],
    audio_model: '',
    after_proc: [0],
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
  checkValid(payload: AudioParserNodeType, t: any) {
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
