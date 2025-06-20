import { useCallback, useState } from 'react'
import produce from 'immer'
import { useBoolean } from 'ahooks'
import type { StartNodeType } from './types'
import { ChangeType } from '@/pages/workflowConfig/workflow/types'
import type { InputVar, MoreInfo, ValueSelector } from '@/pages/workflowConfig/workflow/types'
import useNodeCrud from '@/pages/workflowConfig/workflow/nodes/_base/hooks/use-node-crud'
import {
  useIsChatMode,
  useNodesReadOnly,
  useWorkflow,
} from '@/pages/workflowConfig/workflow/hooks'

const useConfig = (id: string, payload: StartNodeType) => {
  const { nodesReadOnly: readOnly } = useNodesReadOnly()

  const { inputs, setInputs } = useNodeCrud<StartNodeType>(id, payload)

  const updateInputs = useCallback((payload: StartNodeType) => {
    const newInputs = produce(inputs, (draft: any) => {
      draft.srcDir = payload.srcDir
      draft.doc = payload.doc
      draft.image = payload.image
      draft.audio = payload.audio
      draft.video = payload.video
    })
    setInputs(newInputs)
  }, [inputs, setInputs])

  const initInputs = {
    srcDir: 'string',
    doc: {
      enabled: true,
      types: ['PDF', 'PPT/PPTX', 'DOC/DOCX', 'TXT/MD'],
    },
    image: {
      enabled: true,
      types: ['JPEG', 'PNG', 'JPG'],
    },
    audio: {
      enabled: true,
      types: ['WAV', 'MP#', 'AAC', 'FLAC'],
    },
    video: {
      enabled: true,
      types: ['MP4', 'MOV', 'MKV'],
    },
  }

  return {
    initInputs,
    readOnly,
    updateInputs,
    inputs,
  }
}

export default useConfig
