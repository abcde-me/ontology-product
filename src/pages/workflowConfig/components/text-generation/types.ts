import type {
  ModelConfig,
  VisionFile,
  VisionSettings,
} from '@/pages/workflowConfig/types/app'
import type { ExternalDataTool } from '@/pages/workflowConfig/models/common'
export type { VisionFile } from '@/pages/workflowConfig/types/app'
export { TransferMethod } from '@/pages/workflowConfig/types/app'

export interface UserInputForm {
  default: string
  label: string
  required: boolean
  variable: string
}

export interface UserInputFormTextInput {
  'text-input': UserInputForm & {
    max_length: number
  }
}

export interface UserInputFormSelect {
  select: UserInputForm & {
    options: string[]
  }
}

export interface UserInputFormParagraph {
  paragraph: UserInputForm
}

export type VisionConfig = VisionSettings

export interface EnableType {
  enabled: boolean
}

export type TextGenerationConfig = Omit<ModelConfig, 'model'> & {
  external_data_tools: ExternalDataTool[]
}

export type OnSend = (message: string, files?: VisionFile[]) => void
