import type { NodeDefault } from '../../types'
import type { StartNodeType } from './types'
import { ALL_CHAT_AVAILABLE_BLOCKS, ALL_COMPLETION_AVAILABLE_BLOCKS } from '@/pages/workflowConfig/workflow/blocks'

const nodeDefault: NodeDefault<StartNodeType> = {
  defaultValue: {
    variables: [],
  },
  getAvailablePrevNodes() {
    return []
  },
  getAvailableNextNodes(isChatMode: boolean) {
    const nodes = isChatMode ? ALL_CHAT_AVAILABLE_BLOCKS : ALL_COMPLETION_AVAILABLE_BLOCKS
    return nodes
  },
  checkValid(data: StartNodeType) {
    if (!data.srcDir) {
      return {
        isValid: false,
        errorMessage: '请选择源数据目录',
      }
    }
    if (data.doc.enabled && data.doc.types.length ||
      data.image.enabled && data.image.types.length ||
      data.audio.enabled && data.audio.types.length ||
      data.video.enabled && data.video.types.length
    ) {
      return {
        isValid: true,
      }
    } else {
      return {
        isValid: false,
        errorMessage: '请至少选择一种文件类型',
      }
    }
  },
}

export default nodeDefault
