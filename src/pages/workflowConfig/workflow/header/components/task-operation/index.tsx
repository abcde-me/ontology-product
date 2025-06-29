import React, { memo, useCallback, useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useKeyPress } from 'ahooks';
import { getKeyboardKeyCodeBySystem } from '@/pages/workflowConfig/workflow/utils';
import { Button, Modal } from '@arco-design/web-react';
import { useStore as useTaskStore } from '@/pages/workflowConfig/task/store';
import type { PublishWorkflowParams } from '@/pages/workflowConfig/types/workflow';
import { Space } from '@arco-design/web-react';
import { AppPublisherProps, ModelAndParameter } from '../../types';
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
  disabled = false,
  publishDisabled = false,
  onOperate,
  onRestore,
  onToggle
}: AppPublisherProps) => {
  const [published, setPublished] = useState(false);
  const [schedulerDialogVisible, setSchedulerDialogVisible] = useState(false);
  const isOnline = workflowStatus === IsOnline.online;

  const handleOperate = useCallback(
    async (
      op: WorkflowOperation,
      params?: ModelAndParameter | PublishWorkflowParams
    ) => {
      if (op === WorkflowOperation.CRON_RUNNING) {
        setSchedulerDialogVisible(false);
        return;
      }

      console.log('点击操作按钮params:', params);
      try {
        await onOperate?.(op, params);
        setPublished(true);
        // 发布操作在弹框里面时，需要去掉下面这个计时器
        window.setTimeout(() => {
          setPublished(false);
        }, 1000);
      } catch {
        setPublished(false);
      }
    },
    [onOperate]
  );

  // useKeyPress(
  //     `${getKeyboardKeyCodeBySystem('ctrl')}.shift.p`,
  //     (e) => {
  //         e.preventDefault();
  //         if (publishDisabled || published) return;
  //         handleOperate();
  //     },
  //     { exactMatch: true, useCapture: true }
  // );

  return (
    <>
      <Space>
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
            onOk={() => handleOperate(WorkflowOperation.CRON_RUNNING)}
            onCancel={() => setSchedulerDialogVisible(false)}
          >
            <SchedulerRun></SchedulerRun>
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
