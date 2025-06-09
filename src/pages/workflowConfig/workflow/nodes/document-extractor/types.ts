import type { CommonNodeType, ValueSelector } from '@/pages/workflowConfig/workflow/types'

export type DocExtractorNodeType = CommonNodeType & {
  variable_selector: ValueSelector
  is_array_file: boolean
}
