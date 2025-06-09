import { FC, useState } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import InputVarTypeIcon from '../_base/components/input-var-type-icon'
import type { StartNodeType } from './types'
import type { NodeProps } from '@/pages/workflowConfig/workflow/types'
import { RiArrowDownSFill } from '@remixicon/react'

const i18nPrefix = 'workflow.nodes.start'

const Node: FC<NodeProps<StartNodeType>> = ({
  data,
}) => {
  const { t } = useTranslation('plugin__console-plugin-appforge')
  const { variables } = data
  
  const [show, setShow] = useState(true)
  
  const toggleVars = () => {
    setShow(s => !s)
  }

  // if (!variables.length)
  //   return null
  // console.log('variables', variables)
  return (
    // <div className='mb-1 px-3 py-1 wk-node-content'>
    //   <div className='space-y-[6px]'>
    //     {variables.map(variable => (
    //       <div key={variable.variable} className='flex items-center h-6 justify-between bg-gray-100 rounded-md  px-1 space-x-1 text-xs font-normal text-gray-700 item-bg'>
    //         <div className='w-0 grow flex items-center space-x-1'>
    //           <span className='w-0 grow truncate text-xs font-normal text-gray-700 name'>{variable.variable}</span>
    //         </div>

    //         <div className='ml-1 flex items-center space-x-1'>
    //           {variable.required && <span className='text-xs font-normal text-gray-500 uppercase'>{t(`${i18nPrefix}.required`)}</span>}
    //           <InputVarTypeIcon type={variable.type} className='w-3 h-3 text-gray-500' isTag/>
    //         </div>
    //       </div>
    //     ))}
    //   </div>
    // </div>
    <div className={`wk-node-content`}>
      <div className={`input-section ${!show ? 'collapsed' : ''}`}>
        <div className='input-header' onClick={toggleVars}>
          <span className='txt'>输入</span>
          <RiArrowDownSFill className='icon'/>
        </div>
        <div className='input-list'>
          {variables.map(variable => (
            <div className='input-var-item' key={variable.id || variable.variable}>
              <div className='left-part'>
                <span className='key-txt'>{variable.variable || '未命名'}</span>
                <span className='extra-info'>
                  {variable.required && <span className='required-txt'>{t(`${i18nPrefix}.required`)}</span>}
                  <span className='type-txt'>{variable.type}</span>
                </span>
              </div>
            </div>
          ))}
          {!variables.length && <div className='input-var-item'><span className='extra-info'>未配置变量</span></div>}
        </div>
      </div>
    </div>
  )
}

export default React.memo(Node)
