import type { CommonNodeType, InputVar } from '@/pages/workflowConfig/workflow/types'

export type StartNodeType = CommonNodeType & {
  variables?: InputVar[]
  srcDir: string
  doc: {
    enabled: boolean
    types: string[]
  }
  image: {
    enabled: boolean
    types: string[]
  }
  audio: {
    enabled: boolean
    types: string[]
  }
  video: {
    enabled: boolean
    types: string[]
  }
}
