import { FC, useMemo, useState } from 'react'
import React from 'react'
import type { LLMNodeType } from './types'
import {
  useTextGenerationCurrentProviderAndModelAndModelList,
} from '@/pages/workflowConfig/hooks/use-model'
import ModelSelector from '@/pages/workflowConfig/app/model-selector'
import type { NodeProps } from '@/pages/workflowConfig/workflow/types'
import { RiArrowDownSFill } from '@remixicon/react'
import ModelIcon from '@/pages/workflowConfig/app/model-icon'

const Node: FC<NodeProps<LLMNodeType>> = ({
  data,
}) => {
  const { provider, name: modelId } = data.model || {}
  const {
    textGenerationModelList,
  } = useTextGenerationCurrentProviderAndModelAndModelList()
  const hasSetModel = provider && modelId

  const [show, setShow] = useState(true)

  const currentProvider = useMemo(() => {
    return textGenerationModelList.find(t => t.provider === provider) || {}
  }, [textGenerationModelList, provider])
  
  const toggleVars = () => {
    setShow(s => !s)
  }

  // if (!hasSetModel)
  //   return null

  return (
    // <div className='mb-1 px-3 py-1 wk-node-content'>
    //   {hasSetModel && (
    //     <ModelSelector
    //       defaultModel={{ provider, model: modelId }}
    //       modelList={textGenerationModelList}
    //       triggerClassName='!h-6 !rounded-md'
    //       readonly
    //     />
    //   )}
    // </div>
    <div className={`wk-node-content`}>
      <div className={`input-section mb-[8px]`}>
        <div className='input-header'>
          <span className='txt'>模型</span>
        </div>
        <div className='input-list'>
          { hasSetModel && <div className='input-var-item !justify-start'>
              <ModelIcon
                className='mr-[4px] !w-[16px] !h-[16px]'
                provider={currentProvider}
              />
              <span className='text-[#0F172A] text-[12px]/[20px] font-medium'>{modelId}</span>
            </div>
          }
          {!hasSetModel && <div className='input-var-item'><span className='extra-info'>未配置模型</span></div>}
        </div>
      </div>
      <div className={`input-section ${!show ? 'collapsed' : ''}`}>
        <div className='input-header' onClick={toggleVars}>
          <span className='txt'>输出</span>
          <RiArrowDownSFill className='icon'/>
        </div>
        <div className='input-list'>
          <div className='input-var-item'>
            <div className='left-part gap-12'>
              <span className='key-txt'>text</span>
              <span className='extra-info'>
                <span className='type-txt'>string</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(Node)
