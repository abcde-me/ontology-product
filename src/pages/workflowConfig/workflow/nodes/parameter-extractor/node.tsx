import type { FC } from 'react'
import React from 'react'
import type { ParameterExtractorNodeType } from './types'
import {
  useTextGenerationCurrentProviderAndModelAndModelList,
} from '@/pages/workflowConfig/hooks/use-model'
import ModelSelector from '@/pages/workflowConfig/app/model-selector'
import type { NodeProps } from '@/pages/workflowConfig/workflow/types'

const Node: FC<NodeProps<ParameterExtractorNodeType>> = ({
  data,
}) => {
  const { provider, name: modelId } = data.model || {}
  const {
    textGenerationModelList,
  } = useTextGenerationCurrentProviderAndModelAndModelList()
  const hasSetModel = provider && modelId
  return (
    <div className='mb-1 px-3 py-1'>
      {hasSetModel && (
        <ModelSelector
          defaultModel={{ provider, model: modelId }}
          modelList={textGenerationModelList}
          triggerClassName='!h-6 !rounded-md item-bg'
          readonly
        />
      )}
    </div>
  )
}

export default React.memo(Node)
