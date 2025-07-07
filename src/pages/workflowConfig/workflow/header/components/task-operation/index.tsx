import React, { memo, useCallback, useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useKeyPress } from 'ahooks';
import { getKeyboardKeyCodeBySystem } from '@/pages/workflowConfig/workflow/utils';
import { Button, Modal } from '@arco-design/web-react';
import {
  useStore,
  useStore as useTaskStore
} from '@/pages/workflowConfig/task/store';
import type { PublishWorkflowParams } from '@/pages/workflowConfig/types/workflow';
import { Space } from '@arco-design/web-react';
import { TaskOperationProps, ModelAndParameter } from '../../types';
import SchedulerRun from '@/components/scheduler-run';
import CircleIcon from '@/assets/workflow-header-circle.svg';
import CircleIconDisabled from '@/assets/workflow-header-circle-disabled.svg';
import PlayIcon from '@/assets/workflow-header-play.svg';
import PlayIconDisabled from '@/assets/workflow-header-play-disabled.svg';
import './index.css';
import { IsOnline, WorkflowOperation } from '@/types/workflowApi';

dayjs.extend(relativeTime);

const PUBLISH_SHORTCUT = ['⌘', '⇧', 'P'];

const AppPublisher = ({
  workflowStatus,
  cycleText,
  onOperate
}: TaskOperationProps) => {
  const [published, setPublished] = useState(false);
  const [newCycleText, setNewCycleText] = useState(cycleText);
  const [schedulerDialogVisible, setSchedulerDialogVisible] = useState(false);
  const isOnline = workflowStatus === IsOnline.online;

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
      <Space className="task-operation">
        <Button
          type="outline"
          className="toggle-btn"
          onClick={() =>
            handleOperate(
              isOnline ? WorkflowOperation.OFFLINE : WorkflowOperation.ONLINE
            )
          }
        >
          {isOnline ? '下线' : '上线'}
        </Button>
        <div>
          <Button
            className="scheduler-btn"
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
            onOk={() =>
              handleOperate(WorkflowOperation.CRON_RUNNING, {
                cycle_text: newCycleText
              })
            }
            onCancel={() => setSchedulerDialogVisible(false)}
          >
            <SchedulerRun
              options={newCycleText}
              onOptionsChange={handleOptionsChange}
            ></SchedulerRun>
          </Modal>
        </div>
        <Button
          className="run-btn"
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
