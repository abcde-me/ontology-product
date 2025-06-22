import { useCallback, useEffect, useState } from 'react'
import produce from 'immer'
import type { TextParserNodeType, OutputVar } from './types'
import useNodeCrud from '@/pages/workflowConfig/workflow/nodes/_base/hooks/use-node-crud'
import { useStore as useAppStore } from '@/pages/workflowConfig/app/store'
import { useNodesReadOnly } from '@/pages/workflowConfig/workflow/hooks'
import TextNodeDefault from './default'

const useConfig = (id: string, payload: TextParserNodeType) => {
  const { nodesReadOnly: readOnly } = useNodesReadOnly()

  const appId = useAppStore.getState().appDetail?.id

  const defaultConfig = TextNodeDefault.defaultValue
  const { inputs, setInputs } = useNodeCrud<TextParserNodeType>(id, payload)
 
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

  const handleFiledsChange = useCallback((fields: TextParserNodeType) => {
    const newInputs = produce(inputs, (draft) => {
      draft.text_slice_rule = inputs.text_slice_rule
      draft.slice_max_size = inputs.slice_max_size
      draft.text_proc_rules = inputs.text_proc_rules
      draft.multi_model = inputs.multi_model
      draft.pic_model = inputs.pic_model
      draft.text_emb_model = inputs.text_emb_model
    })
    setInputs(newInputs)
  }, [inputs, setInputs])

  return {
    readOnly,
    inputs,
    handleFilesChange,
    handleFiledsChange,
  }
}

export default useConfig
