import React, { memo, useCallback, useRef, useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Button, Form, Modal, Radio } from '@arco-design/web-react';
import type { PublishWorkflowParams } from '@/pages/workflowConfig/types/workflow';
import { Space } from '@arco-design/web-react';
import { TaskOperationProps, ModelAndParameter } from '../../types';
import SchedulerRun from '@/components/scheduler-run';
import CircleIcon from '@/assets/workflow-header-circle.svg';
import CircleIconDisabled from '@/assets/workflow-header-circle-disabled.svg';
import PlayIcon from '@/assets/workflow-header-play.svg';
import PlayIconDisabled from '@/assets/workflow-header-play-disabled.svg';
import styles from './index.module.scss';
import { IsOnline, WorkflowOperation } from '@/types/workflowApi';
import { FORM_RADIO_SCHEMA } from '@/pages/workflowList/types';
import { useParams } from 'react-router-dom';

dayjs.extend(relativeTime);

const AppPublisher = ({
  workflowStatus,
  cycleText,
  onOperate
}: TaskOperationProps) => {
  const [newCycleText, setNewCycleText] = useState(cycleText);
  const [schedulerDialogVisible, setSchedulerDialogVisible] = useState(false);
  const isOnline = workflowStatus === IsOnline.online;
  const SchedulerRunRef = useRef<HTMLFormElement>(null);
  const { type: flowType = 'no_struct' } = useParams<Record<string, string>>();

  const handleOperate = useCallback(
    async (
      op: WorkflowOperation,
      params?: ModelAndParameter | PublishWorkflowParams
    ) => {
      try {
        if (op === WorkflowOperation.CRON_RUNNING) {
          setSchedulerDialogVisible(false);
        }

        await onOperate?.(op, params);
      } catch {}
    },
    [onOperate]
  );

  const handleOptionsChange = (options) => {
    setNewCycleText(options);
  };

  return (
    <>
      <Space className={styles['task-operation']}>
        <Button
          type="outline"
          className={styles['toggle-btn']}
          onClick={() => {
            console.log('我进行了操作', isOnline);
            handleOperate(
              isOnline ? WorkflowOperation.OFFLINE : WorkflowOperation.ONLINE
            );
          }}
        >
          {isOnline ? '下线' : '上线'}
        </Button>
        <div>
          <Button
            className={styles['scheduler-btn']}
            type="outline"
            disabled={!isOnline}
            onClick={() => setSchedulerDialogVisible(true)}
            icon={isOnline ? <CircleIcon /> : <CircleIconDisabled />}
          >
            定时运行
          </Button>
          <Modal
            title="定时任务设置"
            style={{ width: '640px' }}
            visible={schedulerDialogVisible}
            onOk={async () => {
              const valid = await SchedulerRunRef.current?.validate();

              if (!valid) {
                return;
              }

              handleOperate(WorkflowOperation.CRON_RUNNING, {
                cycle_text: newCycleText
              });
            }}
            onCancel={() => setSchedulerDialogVisible(false)}
          >
            <SchedulerRun
              // @ts-expect-error
              ref={SchedulerRunRef}
              options={newCycleText}
              onOptionsChange={handleOptionsChange}
            ></SchedulerRun>
          </Modal>
        </div>
        <Button
          className={styles['run-btn']}
          type="primary"
          disabled={!isOnline}
          onClick={() => handleOperate(WorkflowOperation.RUNNING)}
          icon={isOnline ? <PlayIcon /> : <PlayIconDisabled />}
        >
          运行
        </Button>
      </Space>
    </>
  );
};

export default memo(AppPublisher);
