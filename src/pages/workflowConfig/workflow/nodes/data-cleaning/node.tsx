import type { FC } from 'react'
import React, { useState } from 'react'
import type { CodeNodeType } from './types'
import type { NodeProps } from '@/pages/workflowConfig/workflow/types'
import { RiArrowDownSFill } from '@remixicon/react'
import { useStoreApi } from 'reactflow'

const Node: FC<NodeProps<CodeNodeType>> = (props) => {
  const { variables = [], outputs = [] } = props.data

  const store = useStoreApi()

  const [showInput, setShowInput] = useState(true)
  const [showOutput, setShowOutput] = useState(true)

  const toggleInputVars = () => {
    setShowInput(s => !s)
  }
  const toggleOutputVars = () => {
    setShowOutput(s => !s)
  }

  const findNode = (nodeId: string) => {
    const {
      getNodes,
      setNodes,
    } = store.getState()

    const nodes = getNodes()
    const currentNode = nodes.find(n => n.id === nodeId)!
    return currentNode
  }

  return (
    <div className={`wk-node-content`}>
      <div className={`output-section ${!showInput ? 'collapsed' : ''}`}>
        <div className='output-header' onClick={toggleInputVars}>
          <span className='txt'>输入</span>
          <RiArrowDownSFill className='icon' />
        </div>
        <div className='output-list'>
          {
            variables.map(({ value_selector, variable }, index) => {
              const node = value_selector.length ? findNode(value_selector[0]) : null
              console.log('code node', node)
              return (
                <div className='output-var-item' key={index}>
                  <span>
                    <span className='key-txt-origin mr-[8px]'>{variable || '未命名'}</span>
                    {node && <span className='extra-info'>
                      {/* <span className='type-txt'>{node.data.}</span> */}
                    </span>
                    }
                  </span>
                  {node && <span className='key-txt'>
                    <span className='node-type'>{node?.data.title}</span>
                    <span className='node-name-separator'>/</span>
                    <span className='var-name'>{value_selector[1]}</span>
                  </span>
                  }
                </div>
              )
            })
          }
          {!variables.length && <div className='output-var-item'><span className='extra-info'>未配置变量</span></div>}
        </div>
      </div>
      <div className={`input-section mt-[8px] ${!showOutput ? 'collapsed' : ''}`}>
        <div className='input-header' onClick={toggleOutputVars}>
          <span className='txt'>输出</span>
          <RiArrowDownSFill className='icon' />
        </div>
        <div className='input-list'>
          {
            Object.entries(outputs).map((output, index) => {
              return (
                <div className='input-var-item' key={index}>
                  <div className='left-part gap-12'>
                    <span className='key-txt'>{output[0] || '未命名'}</span>
                    <span className='extra-info'>
                      <span className='type-txt'>{output[1].type}</span>
                    </span>
                  </div>
                </div>
              )
            })
          }
          {!Object.keys(outputs).length && <div className='input-var-item'><span className='extra-info'>未配置变量</span></div>}
        </div>
      </div>
    </div>
  )
}

export default React.memo(Node)
