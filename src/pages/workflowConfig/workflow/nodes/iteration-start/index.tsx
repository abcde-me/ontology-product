import React, { memo } from 'react'
import { useTranslation } from 'react-i18next'
import type { NodeProps } from 'reactflow'
import { RiHome5Fill, RiHomeGearFill } from '@remixicon/react'
import Tooltip from '@/pages/workflowConfig/components/tooltip'
import { NodeSourceHandle } from '@/pages/workflowConfig/workflow/nodes/_base/components/node-handle'

const IterationStartNode = ({ id, data }: NodeProps) => {
  const { t } = useTranslation('plugin__console-plugin-appforge')

  return (
    <div className='group flex nodrag items-center justify-center p-[8px] rounded-[4px] border border-workflow-block-border bg-workflow-block-bg shadow-xs'>
      <Tooltip popupContent={t('workflow.blocks.iteration-start')} asChild={false}>
        {/* <div className='text-[#E2E8F0] font-bold flex items-center justify-center w-6 h-6 rounded-full border-[0.5px] border-components-panel-border-subtle bg-util-colors-blue-brand-blue-brand-500'>
          { <RiHomeGearFill className='w-3 h-3 text-text-primary-on-surface' /> }
        </div> */}
        <span className='text-[#007DFA] font-bold'>开始</span>
      </Tooltip>
      <NodeSourceHandle
        id={id}
        data={data}
        handleClassName='!top-1/2 !-right-[9px] !-translate-y-1/2'
        handleId='source'
      />
    </div>
  )
}

export const IterationStartNodeDumb = () => {
  const { t } = useTranslation('plugin__console-plugin-appforge')

  return (
    <div className='relative left-[17px] top-[21px] flex nodrag items-center justify-center p-[8px] rounded-4px border border-workflow-block-border bg-white z-[11]'>
      <Tooltip popupContent={t('workflow.blocks.iteration-start')} asChild={false}>
        {/* <div className='text-[#E2E8F0] font-bold flex items-center justify-center w-6 h-6 rounded-full border-[0.5px] border-components-panel-border-subtle bg-util-colors-blue-brand-blue-brand-500'>
          <RiHomeGearFill className='w-3 h-3 text-text-primary-on-surface' />
        </div> */}
        <span className='text-[#007DFA] font-bold'>开始</span>
      </Tooltip>
    </div>
  )
}

export default memo(IterationStartNode)
