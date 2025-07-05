import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useWorkflow } from '../hooks';
import { useStore } from '@/pages/workflowConfig/workflow/store';
import useTimestamp from '@/pages/workflowConfig/hooks/use-timestamp';
import Clock1Icon from '@/pages/workflowConfig/styles/images/op-icons/clock1.svg';
import Success11Icon from '@/pages/workflowConfig/styles/images/op-icons/success1.svg';
import { useStore as useTaskStore } from '@/pages/workflowConfig/task/store';
import { IsOnline } from '@/types/workflowApi';

const EditingTitle = () => {
  const { t } = useTranslation('plugin__console-plugin-appforge');
  const { formatTime } = useTimestamp();
  const { formatTimeFromNow } = useWorkflow();
  const draftUpdatedAt = useStore((state) => state.draftUpdatedAt);
  const publishedAt = useStore((state) => state.publishedAt);
  const isSyncingWorkflowDraft = useStore((s) => s.isSyncingWorkflowDraft);
  const workflowDetail = useTaskStore((s) => s.workflowDetail);

  return (
    <div className="system-xs-regular save-info flex h-[18px] items-center text-text-tertiary">
      {!!draftUpdatedAt && (
        <div className="auto-save-part">
          {t('workflow.common.autoSaved')}{' '}
          {formatTime(draftUpdatedAt / 1000, 'HH:mm:ss')}
        </div>
      )}
      <div
        className={`publish-part ${workflowDetail?.is_online === IsOnline.online ? 'published' : 'not-published'}`}
      >
        {workflowDetail?.is_online === IsOnline.online ? (
          <Success11Icon className="mr-[6px] size-[16px]" />
        ) : (
          <Clock1Icon className="mr-[6px] size-[16px]" />
        )}
        {workflowDetail?.is_online === IsOnline.online ? '已上线' : '未上线'}
      </div>
      {isSyncingWorkflowDraft && (
        <div className="syncing-data-part">
          {t('workflow.common.syncingData')}
        </div>
      )}
    </div>
  );
};

export default memo(EditingTitle);
