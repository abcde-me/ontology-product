import React, {
  useEffect,
  useState,
} from 'react'
import {
  RiArrowRightSLine,
  RiErrorWarningFill,
  RiLoader2Line,
  RiCheckboxCircleFill,
} from '@remixicon/react'
import { useTranslation } from 'react-i18next'
import type { ChatItem, WorkflowProcess } from '../../types'
import TracingPanel from '@/pages/workflowConfig/workflow/run/tracing-panel'
import cn from '@/pages/workflowConfig/utils/classnames'
import { WorkflowRunningStatus } from '@/pages/workflowConfig/workflow/types'

type WorkflowProcessProps = {
  data: WorkflowProcess
  item?: ChatItem
  expand?: boolean
  hideInfo?: boolean
  hideProcessDetail?: boolean
  readonly?: boolean
}
const WorkflowProcessItem = ({
  data,
  expand = false,
  hideInfo = false,
  hideProcessDetail = false,
  readonly = false,
}: WorkflowProcessProps) => {
  const { t } = useTranslation('plugin__console-plugin-appforge')
  const [collapse, setCollapse] = useState(!expand)
  const running = data.status === WorkflowRunningStatus.Running
  const succeeded = data.status === WorkflowRunningStatus.Succeeded
  const failed = data.status === WorkflowRunningStatus.Failed || data.status === WorkflowRunningStatus.Stopped

  useEffect(() => {
    setCollapse(!expand)
  }, [expand])

  return (
    <div
      className={cn(
        '-mx-1 px-2.5 rounded-xl',
        collapse ? 'collapse-process py-[7px] border-l-[0.25px] border-components-panel-border' : 'expand-process pt-[7px] px-1 pb-1 border-[0.5px] border-components-panel-border-subtle',
        running && !collapse && 'bg-background-section-burn',
        succeeded && !collapse && 'bg-state-success-hover',
        failed && !collapse && 'bg-state-destructive-hover',
        collapse && 'bg-workflow-process-bg',
        'workflow-process'
      )}
    >
      <div
        className={cn('flex items-center cursor-pointer', !collapse && 'px-1.5', readonly && 'cursor-default')}
        onClick={() => !readonly && setCollapse(!collapse)}
      >
        {
          running && (
            <RiLoader2Line className='shrink-0 mr-1 w-3.5 h-3.5 animate-spin text-text-tertiary' />
          )
        }
        {
          succeeded && (
            <RiCheckboxCircleFill className='shrink-0 mr-1 w-3.5 h-3.5 text-text-success' />
          )
        }
        {
          failed && (
            <RiErrorWarningFill className='shrink-0 mr-1 w-3.5 h-3.5 text-text-destructive' />
          )
        }
        <div className={cn('system-xs-medium text-text-secondary', 'grow')}>
          {t('workflow.common.workflowProcess')}
        </div>
        {!readonly && <RiArrowRightSLine className={cn('ml-1 w-4 h-4 text-text-tertiary', !collapse && 'rotate-90')} />}
      </div>
      {
        !collapse && !readonly && (
          <div className='mt-1.5'>
            {
              <TracingPanel
                list={data.tracing}
                hideNodeInfo={hideInfo}
                hideNodeProcessDetail={hideProcessDetail}
              />
            }
          </div>
        )
      }
    </div>
  )
}

export default WorkflowProcessItem
