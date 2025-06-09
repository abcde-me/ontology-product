import { type FC, useEffect, useRef, useState } from 'react'
import React from 'react'
import type { KnowledgeRetrievalNodeType } from './types'
import { RiFolder2Fill } from '@remixicon/react'
import type { NodeProps } from '@/pages/workflowConfig/workflow/types'
import type { DataSet } from '@/pages/workflowConfig/models/datasets'
// import datasetJson from '@/pages/workflowConfig/mockData/datasets.json'
import { getDatasetsList } from '@/api/datasetsV2'
import KbIcon from '@/pages/workflowConfig/styles/images/op-icons/kb.svg';
import { useNodes } from 'reactflow'
import type {
  CommonNodeType,
  Node,
} from '@/pages/workflowConfig/workflow/types'

const Node: FC<NodeProps<KnowledgeRetrievalNodeType>> = ({
  data,
}) => {
  const nodes = useNodes()
  const [selectedDatasets, setSelectedDatasets] = useState<DataSet[]>([])
  const updateTime = useRef(0)
  const node: Node<CommonNodeType> | undefined = nodes.find(n => n.id === data.query_variable_selector[0]) as Node<CommonNodeType>

  useEffect(() => {
    (async () => {
      updateTime.current = updateTime.current + 1
      const currUpdateTime = updateTime.current

      if (data.dataset_ids?.length > 0) {
        //  avoid old data overwrite new data
        const result = await getDatasetsList({page: 1, limit: Number.MAX_SAFE_INTEGER, ids: data.dataset_ids.join(',')})
        const dataSetsWithDetail = result.data.data || []

        if (currUpdateTime < updateTime.current)
          return
        setSelectedDatasets(dataSetsWithDetail)
      }
      else {
        setSelectedDatasets([])
      }
    })()
  }, [data.dataset_ids])

  // if (!selectedDatasets.length)
  //   return null
  return (
    // <div className='mb-1 px-3 py-1 wk-node-content'>
    //   <div className='space-y-0.5'>
    //     {selectedDatasets.map(({ id, name }) => (
    //       <div key={id} className='flex items-center h-[26px] bg-workflow-block-parma-bg rounded-md  px-1 text-xs font-normal text-gray-700 item-bg'>
    //         <div className='mr-1 shrink-0 p-1 bg-[#F5F8FF] rounded-md border-[0.5px] border-[#E0EAFF]'>
    //           <RiFolder2Fill className='w-3 h-3 text-[#444CE7]' />
    //         </div>
    //         <div className='grow w-0 text-text-secondary system-xs-regular truncate name'>
    //           {name}
    //         </div>
    //       </div>
    //     ))}
    //   </div>
    // </div>
    <div className={`wk-node-content`}>
      <div className={`input-section`}>
        <div className='input-header'>
          <span className='txt'>知识库</span>
        </div>
        <div className='input-list'>
          {selectedDatasets.map(({ id, name }) => (
            <div key={id} className='input-var-item'>
              <span className='flex items-center'>
                <KbIcon className='size-[16px] mr-[4px]'/>
                <span className='font-medium text-[#0F172A] text-[12px]/[20px]'>{name}</span>
              </span>
              
            </div>
          ))}
          {!selectedDatasets.length && <div className='input-var-item'><span className='extra-info'>未配置知识库</span></div>}
        </div>
      </div>
      <div className={`output-section`}>
        <div className='output-header'>
          <span className='txt'>输入</span>
        </div>
        <div className='output-list'>
          {!!data.query_variable_selector.length && <div className='output-var-item'>
              <div className='left-part'>
                <span className='key-txt-origin'>query</span>
                <span className='extra-info'>string</span>
              </div>
              <span className='key-txt'>
                <span className='node-type'>{node?.data.title}</span>
                <span className='node-name-separator'>/</span>
                <span className='var-name'>{data.query_variable_selector[1] || '未命名'}</span>
              </span>
            </div>
          }
          {!data.query_variable_selector.length && <div className='output-var-item'><span className='extra-info'>未配置变量</span></div>}
        </div>
      </div>
      <div className={`input-section`}>
        <div className='input-header'>
          <span className='txt'>输出</span>
        </div>
        <div className='input-list'>
          <div className='input-var-item'>
            <div className='left-part gap-12'>
              <span className='key-txt'>result</span>
              <span className='extra-info'>Array&lt;Object&gt;</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(Node)
