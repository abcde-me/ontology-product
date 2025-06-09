import type { VarType } from '@/pages/workflowConfig/workflow/types'

export enum ErrorHandleTypeEnum {
  none = 'none',
  failBranch = 'fail-branch',
  defaultValue = 'default-value',
}

export type DefaultValueForm = {
  key: string
  type: VarType
  value?: any
}
