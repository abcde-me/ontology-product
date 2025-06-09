import type { FC } from 'react'
import React, { useState } from 'react'
import ReadonlyInputWithSelectVar from '../_base/components/readonly-input-with-select-var'
import type { HttpNodeType } from './types'
import type { NodeProps } from '@/pages/workflowConfig/workflow/types'
import { RiArrowDownSFill } from '@remixicon/react'
import { useStoreApi } from 'reactflow'
import { parseSpecialString } from './utils'

const Node: FC<NodeProps<HttpNodeType>> = ({
  id,
  data,
}) => {
  const { method, url, variables, params } = data
  console.log('......http', data, params.split('\n'))
  const parsedUrl = parseSpecialString(url)
  const paramsArr = params ? params.split('\n') : []

  const store = useStoreApi()
  const [showInput, setShowInput] = useState(true)
  const [showOutput, setShowOutput] = useState(true)
    
  const toggleInput = () => {
    setShowInput(s => !s)
  }
  const toggleOutput = () => {
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
    // <div className='mb-1 px-3 py-1 wk-node-content'>
    //   <div className='flex items-center p-1 rounded-md bg-gray-100 item-bg'>
    //     <div className='flex items-center h-4 shrink-0 px-1 rounded bg-gray-25 text-xs font-semibold text-gray-700 uppercase'>{method}</div>
    //     <div className='pl-1 pt-1 http-url-param'>
    //       <ReadonlyInputWithSelectVar
    //         value={url}
    //         nodeId={id}
    //       />
    //     </div>
    //   </div>
    // </div>
    <div className={`wk-node-content`}>
      <div className={`output-section`}>
        <div className='output-header'>
          <span className='txt'>API</span>
        </div>
        <div className='output-list'>
          <div className='output-var-item'>
            {!!parsedUrl.length && <div className='left-part w-full'>
                <span className='uppercase border-[#CBD5E1] border-[1px] rounded-[4px] text-[#6E7B8D] text-[12px]/[20px] px-[8px]'>{method}</span>
                <span className='url-part grow flex flex-wrap gap-y-[4px]'>
                  {parsedUrl.map((u, index) => {
                    if (Array.isArray(u)) {
                      const node = findNode(u[0])
                      return <span key={index} className='key-txt'>
                        <span className='node-type'>{node?.data.title}</span>
                        <span className='node-name-separator'>/</span>
                        <span className='var-name'>{u[1]}</span>
                      </span>
                    } else {
                      return <span key={index} className='key-txt-origin !font-medium'>{u}</span>
                    }
                  })}
                </span>
              </div>
            }
            {!parsedUrl.length && <span className='extra-info'>未配置变量</span>}
          </div>
        </div>
      </div>
      <div className={`output-section ${!showInput ? 'collapsed' : ''}`}>
        <div className='output-header' onClick={toggleInput}>
          <span className='txt'>输入</span>
          <RiArrowDownSFill className='icon'/>
        </div>
        <div className='output-list'>
          {
            paramsArr.map((param, index) => {
              const paramArr = param.split(':')
              const paramKey = parseSpecialString(paramArr[0])
              const paramValue = parseSpecialString(paramArr[1])
              
              return (
                <div className='output-var-item gap-x-[8px]' key={index}>
                  <div className='left-part flex flex-wrap gap-y-[4px] w-1/2 grow'>
                    {!!paramKey.length && paramKey.map((p, i) => {
                      if (Array.isArray(p)) {
                        const node = findNode(p[0])
                        return <span key={i} className='key-txt'>
                          <span className='node-type'>{node?.data.title}</span>
                          <span className='node-name-separator'>/</span>
                          <span className='var-name'>{p[1]}</span>
                        </span>
                      } else {
                        return <span key={i} className='key-txt-origin !font-medium'>{p}</span>
                      }
                    })}
                    {!paramKey.length && <span className='key-txt-origin !font-medium'>未命名</span>}
                  </div>
                  {!!paramValue.length && <div className='right-part flex flex-wrap gap-y-[4px] w-1/2 grow'>
                    {paramValue.map((p, i) => {
                      if (Array.isArray(p)) {
                        const node = findNode(p[0])
                        return <span key={i} className='key-txt'>
                          <span className='node-type'>{node?.data.title}</span>
                          <span className='node-name-separator'>/</span>
                          <span className='var-name'>{p[1]}</span>
                        </span>
                      } else {
                        return <span key={i} className='key-txt-origin !font-medium'>{p}</span>
                      }
                    })}
                  </div>}
                </div>
              )
              // const nodeInfo = paramArr[1].indexOf('{{#') > -1 ? paramArr[1].match(/\{\{#(.*?)#\}\}/)[1] : ''
              // const [nodeId, nodeText] = nodeInfo.split('.')
              // const node = nodeId ? findNode(nodeId) : null
              // return (
              //   <div className='output-var-item' key={index}>
              //     <div className='left-part'>
              //       <span className='key-txt-origin'>{paramArr[0]}</span>
              //       <span className='extra-info'>
              //         <span className='type-txt'>{}</span>
              //       </span>
              //     </div>
              //     {node ? <span className='key-txt'>
              //         <span className='node-type'>{node?.data.title}</span>
              //         <span className='node-name-separator'>/</span>
              //         <span className='var-name'>{nodeText}</span>
              //       </span> :
              //       <span className='key-txt-origin !font-medium'>{paramArr[1]}</span>
              //     }
              //   </div>
              // )
            })
          }
          {!paramsArr.length && <div className='output-var-item'><span className='extra-info'>未配置变量</span></div>}
        </div>
      </div>
      <div className={`output-section ${!showOutput ? 'collapsed' : ''}`}>
        <div className='output-header' onClick={toggleOutput}>
          <span className='txt'>输出</span>
          <RiArrowDownSFill className='icon'/>
        </div>
        <div className='output-list'>
          <div className='output-var-item'>
            <div className='left-part'>
              <span className='key-txt-origin'>body</span>
              <span className='extra-info'>
                <span className='type-txt'>string</span>
              </span>
            </div>
          </div>
          <div className='output-var-item'>
            <div className='left-part'>
              <span className='key-txt-origin'>status_code</span>
              <span className='extra-info'>
                <span className='type-txt'>number</span>
              </span>
            </div>
          </div>
          <div className='output-var-item'>
            <div className='left-part'>
              <span className='key-txt-origin'>headers</span>
              <span className='extra-info'>
                <span className='type-txt'>object</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(Node)
