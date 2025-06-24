import type { CommonNodeType, InputVar } from '@/pages/workflowConfig/workflow/types'

export type StartNodeType = CommonNodeType & {
  variables?: InputVar[]
  source_path: string
  data_category: Array<{
    "id": number,
    "category": string,
    "enabled": boolean,
    "format": string[]
  }>
}
