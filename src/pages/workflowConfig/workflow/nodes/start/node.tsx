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
  const { doc, image, audio, video, srcDir } = data

  const hasFileTypes = doc?.enabled || image?.enabled || audio?.enabled || video?.enabled

  console.log('variables', doc, image, audio, video, srcDir)
  return (
    <div className={`wk-node-content`}>
      <div className={`input-section`}>
        <div className='input-header'>
          <span className='txt'>数据源目录</span>
        </div>
        <div className='input-list'>
          {!!srcDir &&
            <div className='input-var-item'>
              <span className='key-txt'>{srcDir}</span>
            </div>
          }
          {!srcDir && <div className='input-var-item'><span className='extra-info'>未配置</span></div>}
        </div>
      </div>
      <div className={`input-section`}>
        <div className='input-header'>
          <span className='txt'>文件类型</span>
        </div>
        <div className='input-list'>
          {!!hasFileTypes &&
            <div className='input-var-item flex gap-x-[4px] !justify-normal *:rounded-[4px] *:px-[4px] *:bg-[#E2E8F0] *:text-[12px]/[18px] *:text-[#0F172A]'>
              {doc?.enabled && doc?.types.length > 0 && <div>文档</div>}
              {image?.enabled && image?.types.length > 0 && <div>图片</div>}
              {audio?.enabled && audio?.types.length > 0 && <div>音频</div>}
              {video?.enabled && video?.types.length > 0 && <div>视频</div>}
            </div>
          }
          {!hasFileTypes && <div className='input-var-item'><span className='extra-info'>未配置</span></div>}
        </div>
      </div>
    </div>
  )
}

export default React.memo(Node)
