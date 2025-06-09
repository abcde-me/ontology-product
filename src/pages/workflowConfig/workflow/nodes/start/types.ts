import type { CommonNodeType, InputVar } from '@/pages/workflowConfig/workflow/types'

export type StartNodeType = CommonNodeType & {
  variables: InputVar[]
}
