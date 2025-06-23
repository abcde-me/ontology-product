import { useCallback, useEffect, useState } from 'react'
import produce from 'immer'
import type { ImageParserNodeType, OutputVar } from './types'
import useNodeCrud from '@/pages/workflowConfig/workflow/nodes/_base/hooks/use-node-crud'
import { useStore as useAppStore } from '@/pages/workflowConfig/app/store'
import { useNodesReadOnly } from '@/pages/workflowConfig/workflow/hooks'
import TextNodeDefault from './default'

const useConfig = (id: string, payload: ImageParserNodeType) => {
  const { nodesReadOnly: readOnly } = useNodesReadOnly()

  const appId = useAppStore.getState().appDetail?.id

  const defaultConfig = TextNodeDefault.defaultValue
  const { inputs, setInputs } = useNodeCrud<ImageParserNodeType>(id, payload)
 
  useEffect(() => {
    const isReady = defaultConfig && Object.keys(defaultConfig).length > 0
    if (isReady) {
      setInputs({
        ...inputs,
        ...defaultConfig,
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultConfig])

  const handleFilesChange = useCallback((files: string[]) => {
    const newInputs = produce(inputs, (draft) => {
      draft.files = files
    })
    setInputs(newInputs)
  }, [inputs, setInputs])

  const handleFilesCountChange = useCallback((count: number) => {
    const newInputs = produce(inputs, (draft) => {
      draft.selected_files_num = count
    })
    setInputs(newInputs)
  }, [inputs, setInputs])

  const handleFiledsChange = useCallback((fields: ImageParserNodeType) => {
    const newInputs = produce(inputs, (draft) => {
      draft.pic_caption_model = fields.pic_caption_model
      draft.pic_emb_model = fields.pic_emb_model
    })
    setInputs(newInputs)
  }, [inputs, setInputs])

  return {
    readOnly,
    inputs,
    handleFilesChange,
    handleFiledsChange,
    handleFilesCountChange,
  }
}

export default useConfig
