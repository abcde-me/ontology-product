import type { CommonNodeType, VarType, Variable } from '@/pages/workflowConfig/workflow/types'
import { string } from 'mobx-state-tree/dist/internal'


export type OutputVar = Record<string, {
  type: VarType
  children: null // support nest in the future,
}>

export type AudioParserNodeType = CommonNodeType & {
  files: string[]
  selected_files_num: number
  vad_enabled: number
  audio_pret: number[]
  activity_mode: string
  is_open_multi_conv: number
  vad_options: string[]
  audio_model: string
  after_proc: number[]
}
