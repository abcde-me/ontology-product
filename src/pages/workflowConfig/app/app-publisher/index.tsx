import React, { memo, useCallback, useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useKeyPress } from 'ahooks';
import Toast from '@/pages/workflowConfig/components/toast';
import { getKeyboardKeyCodeBySystem } from '../../workflow/utils';
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
  /** only needed in workflow / chatflow mode */
  draftUpdatedAt?: number;
  debugWithMultipleModel?: boolean;
  multipleModelConfigs?: ModelAndParameter[];
  /** modelAndParameter is passed when debugWithMultipleModel is true */
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
  onToggle,
  crossAxisOffset = 0
}: AppPublisherProps) => {
  const [published, setPublished] = useState(false);
  const [open, setOpen] = useState(false);
  const appDetail = useAppStore((state) => state.appDetail);
  const { app_base_url: appBaseURL = '', access_token: accessToken = '' } =
    appDetail?.site ?? {};
  const appMode =
    appDetail?.mode !== 'completion' && appDetail?.mode !== 'workflow'
      ? 'chat'
      : appDetail.mode;
  const appURL = location.href.replace('workflowConfig', 'workflowPublic'); //`${appBaseURL}/${appMode}/${accessToken}`
  const isChatApp = ['chat', 'agent-chat', 'completion'].includes(
    appDetail?.mode || ''
  );

  const handleScheduledPublish = useCallback(
    async (params?: ModelAndParameter | PublishWorkflowParams) => {
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

  const handlePublish = useCallback(
    async (params?: ModelAndParameter | PublishWorkflowParams) => {
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

  const handleRestore = useCallback(async () => {
    try {
      await onRestore?.();
      setOpen(false);
    } catch {}
  }, [onRestore]);

  const handleTrigger = useCallback(() => {
    const state = !open;

    if (disabled) {
      setOpen(false);
      return;
    }

    onToggle?.(state);
    setOpen(state);

    if (state) setPublished(false);
  }, [disabled, onToggle, open]);

  const [embeddingModalOpen, setEmbeddingModalOpen] = useState(false);

  useKeyPress(
    `${getKeyboardKeyCodeBySystem('ctrl')}.shift.p`,
    (e) => {
      e.preventDefault();
      if (publishDisabled || published) return;
      handlePublish();
    },
    { exactMatch: true, useCapture: true }
  );

  return (
    <>
      <Space>
        <Button type="outline" onClick={() => handleScheduledPublish()}>
          上线
        </Button>
        <Button type="outline" onClick={() => handleScheduledPublish()}>
          定时运行
        </Button>
        <Button type="outline" onClick={() => handlePublish()}>
          运行
        </Button>
      </Space>
    </>
  );
};

export default memo(AppPublisher);
