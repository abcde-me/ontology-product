import type { CommonNodeType, Variable } from '@/pages/workflowConfig/workflow/types'

export type AnswerNodeType = CommonNodeType & {
  variables: Variable[]
  answer: string
}
