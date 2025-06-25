import React, { memo, useCallback, useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useKeyPress } from 'ahooks';
import { getKeyboardKeyCodeBySystem } from '@/pages/workflowConfig/workflow/utils';
import { Button } from '@arco-design/web-react';
import { useStore as useAppStore } from '@/pages/workflowConfig/app/store';
import type { InputVar } from '@/pages/workflowConfig/workflow/types';
import type { PublishWorkflowParams } from '@/pages/workflowConfig/types/workflow';
import { Space } from '@arco-design/web-react';
dayjs.extend(relativeTime);

type ModelAndParameter = any;

export type AppPublisherProps = {
  disabled?: boolean;
  publishDisabled?: boolean;
  publishedAt?: number;
  draftUpdatedAt?: number;
  debugWithMultipleModel?: boolean;
  multipleModelConfigs?: ModelAndParameter[];
  onPublish?: (params?: any) => Promise<any> | any;
  onRestore?: () => Promise<any> | any;
  onToggle?: (state: boolean) => void;
  crossAxisOffset?: number;
  toolPublished?: boolean;
  inputs?: InputVar[];
  onRefreshData?: () => void;
};

const PUBLISH_SHORTCUT = ['⌘', '⇧', 'P'];

const AppPublisher = ({
  disabled = false,
  publishDisabled = false,
  onPublish,
  onRestore,
  onToggle
}: AppPublisherProps) => {
  const [published, setPublished] = useState(false);
  const appDetail = useAppStore((state) => state.appDetail);
  appDetail?.site ?? {};

  const handleOperate = useCallback(
    async (params?: ModelAndParameter | PublishWorkflowParams) => {
      console.log('点击操作按钮', params);
      try {
        await onPublish?.(params);
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

  useKeyPress(
    `${getKeyboardKeyCodeBySystem('ctrl')}.shift.p`,
    (e) => {
      e.preventDefault();
      if (publishDisabled || published) return;
      handleOperate();
    },
    { exactMatch: true, useCapture: true }
  );

  return (
    <>
      <Space>
        <Button
          className="!border-[rgb(var(--primary-4))]"
          type="outline"
          onClick={() => handleOperate()}
        >
          上线
        </Button>
        <Button
          className="!border-[rgb(var(--primary-4))]"
          type="outline"
          onClick={() => handleOperate()}
        >
          定时运行
        </Button>
        <Button
          className="!border-[rgb(var(--primary-4))]"
          type="outline"
          onClick={() => handleOperate()}
        >
          运行
        </Button>
      </Space>
    </>
  );
};

export default memo(AppPublisher);
