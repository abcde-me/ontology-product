import React, { memo, useCallback, useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useKeyPress } from 'ahooks';
import { getKeyboardKeyCodeBySystem } from '@/pages/workflowConfig/workflow/utils';
import { Button, Modal } from '@arco-design/web-react';
import { useStore as useAppStore } from '@/pages/workflowConfig/app/store';
import type { PublishWorkflowParams } from '@/pages/workflowConfig/types/workflow';
import { Space } from '@arco-design/web-react';
import {
  AppPublisherProps,
  ModelAndParameter,
  WORKFLOW_OPERATION
} from '../../types';
import SchedulerRun from '@/components/scheduler-run';

dayjs.extend(relativeTime);

const PUBLISH_SHORTCUT = ['⌘', '⇧', 'P'];

const AppPublisher = ({
  disabled = false,
  publishDisabled = false,
  onPublish,
  onRestore,
  onToggle
}: AppPublisherProps) => {
  const [published, setPublished] = useState(false);
  const [schedulerDialogVisible, setSchedulerDialogVisible] = useState(false);
  const appDetail = useAppStore((state) => state.appDetail);
  appDetail?.site ?? {};

  const handleOperate = useCallback(
    async (
      op: WORKFLOW_OPERATION,
      params?: ModelAndParameter | PublishWorkflowParams
    ) => {
      if (op === WORKFLOW_OPERATION.CRON_RUNNING) {
        setSchedulerDialogVisible(!schedulerDialogVisible);
        return;
      }

      console.log('点击操作按钮params:', params);
      try {
        await onPublish?.(op, params);
        setPublished(true);
        // 发布操作在弹框里面时，需要去掉下面这个计时器
        window.setTimeout(() => {
          setPublished(false);
        }, 1000);
      } catch {
        setPublished(false);
      }
    },
    [onPublish]
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
          className="!border-[rgb(var(--primary-4))]"
          type="outline"
          onClick={() => handleOperate(WORKFLOW_OPERATION.ONLINE)}
        >
          上线
        </Button>
        <Button
          className="!border-[rgb(var(--primary-4))]"
          type="outline"
          onClick={() => setSchedulerDialogVisible(true)}
        >
          定时运行
        </Button>
        <Modal
          title="Add User"
          visible={schedulerDialogVisible}
          onOk={() => handleOperate(WORKFLOW_OPERATION.CRON_RUNNING)}
          onCancel={() => setSchedulerDialogVisible(false)}
        >
          <SchedulerRun></SchedulerRun>
        </Modal>
        <Button
          className="!border-[rgb(var(--primary-4))]"
          type="outline"
          onClick={() => handleOperate(WORKFLOW_OPERATION.RUNNING)}
        >
          运行
        </Button>
      </Space>
    </>
  );
};

export default memo(AppPublisher);
