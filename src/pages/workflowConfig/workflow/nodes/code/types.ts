import type { CommonNodeType, VarType, Variable } from '@/pages/workflowConfig/workflow/types'

export enum CodeLanguage {
  python3 = 'python3',
  javascript = 'javascript',
  json = 'json',
}

export type OutputVar = Record<string, {
  type: VarType
  children: null // support nest in the future,
}>

export type CodeNodeType = CommonNodeType & {
  variables: Variable[]
  code_language: CodeLanguage
  code: string
  outputs: OutputVar
}

export type CodeDependency = any
