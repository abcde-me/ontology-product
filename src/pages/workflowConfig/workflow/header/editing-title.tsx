import React, { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { useWorkflow } from '../hooks'
import { useStore } from '@/pages/workflowConfig/workflow/store'
import useTimestamp from '@/pages/workflowConfig/hooks/use-timestamp'
import Clock1Icon from '@/pages/workflowConfig/styles/images/op-icons/clock1.svg';
import Success11Icon from '@/pages/workflowConfig/styles/images/op-icons/success1.svg';

const EditingTitle = () => {
  const { t } = useTranslation('plugin__console-plugin-appforge')
  const { formatTime } = useTimestamp()
  const { formatTimeFromNow } = useWorkflow()
  const draftUpdatedAt = useStore(state => state.draftUpdatedAt)
  const publishedAt = useStore(state => state.publishedAt)
  const isSyncingWorkflowDraft = useStore(s => s.isSyncingWorkflowDraft)

  return (
    <div className='flex items-center h-[18px] system-xs-regular text-text-tertiary save-info'>
      {
        !!draftUpdatedAt && (
          <div className='auto-save-part'>
            {t('workflow.common.autoSaved')} {formatTime(draftUpdatedAt / 1000, 'HH:mm:ss')}
          </div>
        )
      }
      <div className={`publish-part ${publishedAt ? 'published' : 'not-published'}`}>
        { publishedAt ? <Success11Icon className='size-[16px] mr-[6px]'/> : <Clock1Icon className='size-[16px] mr-[6px]'/>}
        {
          publishedAt
            ? `${t('workflow.common.published')} ${formatTimeFromNow(publishedAt)}`
            : t('workflow.common.unpublished')
        }
      </div>
      {
        isSyncingWorkflowDraft && (
          <div className='syncing-data-part'>
            {t('workflow.common.syncingData')}
          </div>
        )
      }
    </div>
  )
}

export default memo(EditingTitle)
