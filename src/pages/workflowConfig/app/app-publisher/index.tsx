import React, { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  RiArrowDownSLine,
  RiPlayCircleLine,
  RiPlayList2Line
} from '@remixicon/react';
import { useKeyPress } from 'ahooks';
import Toast from '@/pages/workflowConfig/components/toast';
// import type { ModelAndParameter } from '../configuration/debug/types'
import { getKeyboardKeyCodeBySystem } from '../../workflow/utils';
import SuggestedAction from './suggested-action';
import PublishWithMultipleModel from './publish-with-multiple-model';
import Button from '@/pages/workflowConfig/components/button';
import {
  PortalToFollowElem,
  PortalToFollowElemContent,
  PortalToFollowElemTrigger
} from '@/pages/workflowConfig/components/portal-to-follow-elem';
// import { fetchInstalledAppList } from '@/service/explore'
// import EmbeddedModal from '@/app/components/app/overview/embedded'
import { useStore as useAppStore } from '@/pages/workflowConfig/app/store';
import { useGetLanguage } from '@/pages/workflowConfig/context/i18n';
import WorkflowToolConfigureButton from '@/pages/workflowConfig/tools/workflow-tool/configure-button';
import type { InputVar } from '@/pages/workflowConfig/workflow/types';
import { appDefaultIconBackground } from '@/pages/workflowConfig/config/';
import type { PublishWorkflowParams } from '@/pages/workflowConfig/types/workflow';
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
  publishedAt,
  draftUpdatedAt,
  debugWithMultipleModel = false,
  multipleModelConfigs = [],
  onPublish,
  onRestore,
  onToggle,
  crossAxisOffset = 0,
  toolPublished,
  inputs,
  onRefreshData
}: AppPublisherProps) => {
  const { t } = useTranslation('plugin__console-plugin-appforge');
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

  const language = useGetLanguage();
  const formatTimeFromNow = useCallback(
    (time: number) => {
      return dayjs(time)
        .locale(language === 'zh_Hans' ? 'zh-cn' : language.replace('_', '-'))
        .fromNow();
    },
    [language]
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

  const handleOpenInExplore = useCallback(() => {
    try {
      const installed_apps = [] as any;
      // const { installed_apps }: any = await fetchInstalledAppList(appDetail?.id) || {}
      if (installed_apps?.length > 0)
        window.open(`/explore/installed/${installed_apps[0].id}`, '_blank');
      else throw new Error('No app found in Explore');
    } catch (e: any) {
      Toast.notify({ type: 'error', message: `${e.message || e}` });
    }
  }, [appDetail?.id]);

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
      <PortalToFollowElem
        open={false}
        onOpenChange={setOpen}
        placement="bottom-end"
        offset={{
          mainAxis: 4,
          crossAxis: crossAxisOffset
        }}
      >
        <PortalToFollowElemTrigger onClick={handleTrigger}>
          <Button
            variant="primary"
            className="custom-primary p-2"
            onClick={() => handlePublish()}
            disabled={disabled || publishDisabled || published}
          >
            {t('workflow.common.publish')}
            {/* <RiArrowDownSLine className='w-4 h-4 text-components-button-primary-text' /> */}
          </Button>
        </PortalToFollowElemTrigger>
        <PortalToFollowElemContent className="z-[11]">
          <div className="w-[320px] rounded-[4px] border-[0.5px] border-components-panel-border bg-components-panel-bg shadow-xl shadow-shadow-shadow-5">
            <div className="p-4 pt-3">
              <div className="system-xs-medium-uppercase flex h-6 items-center justify-between text-text-tertiary">
                <span>
                  {publishedAt
                    ? t('workflow.common.latestPublished')
                    : t('workflow.common.currentDraftUnpublished')}
                </span>
                {publishedAt ? (
                  <div className="flex items-center justify-between">
                    <div className="system-sm-medium flex items-center text-text-secondary">
                      {t('workflow.common.publishedAt')}{' '}
                      {formatTimeFromNow(publishedAt)}
                    </div>
                    {/* {isChatApp && <Button
                        variant='secondary-accent'
                        size='small'
                        onClick={handleRestore}
                        disabled={published}
                      >
                        {t('workflow.common.restore')}
                      </Button>} */}
                  </div>
                ) : (
                  <div className="system-sm-medium flex items-center text-text-secondary">
                    {t('workflow.common.autoSaved')} ·{' '}
                    {Boolean(draftUpdatedAt) &&
                      formatTimeFromNow(draftUpdatedAt!)}
                  </div>
                )}
              </div>

              {debugWithMultipleModel ? (
                <PublishWithMultipleModel
                  multipleModelConfigs={multipleModelConfigs}
                  onSelect={(item) => handlePublish(item)}
                  // textGenerationModelList={textGenerationModelList}
                />
              ) : (
                <Button
                  variant="primary"
                  className="mt-3 w-full"
                  onClick={() => handlePublish()}
                  disabled={publishDisabled || published}
                >
                  {published ? (
                    t('workflow.common.published')
                  ) : (
                    <div className="flex gap-1">
                      <span>{t('workflow.common.publishUpdate')}</span>
                      {/* <div className='flex gap-0.5'>
                              {PUBLISH_SHORTCUT.map(key => (
                                <span key={key} className='w-4 h-4 text-text-primary-on-surface system-kbd rounded-[4px] bg-components-kbd-bg-white'>
                                  {key}
                                </span>
                              ))}
                            </div> */}
                    </div>
                  )}
                </Button>
              )}
            </div>
            <div className="hidden border-t-[0.5px] border-t-divider-regular p-4 pt-3">
              <SuggestedAction
                disabled={!publishedAt}
                link={appURL}
                // icon={<RiPlayCircleLine className='w-4 h-4' />}
              >
                {/* {t('workflow.common.runApp')} */}
                体验应用
              </SuggestedAction>
              {appDetail?.mode === 'workflow' ? (
                <SuggestedAction
                  disabled={!publishedAt}
                  link={`${appURL}${appURL.includes('?') ? '&' : '?'}mode=batch`}
                  // icon={<RiPlayList2Line className='w-4 h-4' />}
                >
                  {t('workflow.common.batchRunApp')}
                </SuggestedAction>
              ) : (
                <></>
                // <SuggestedAction
                //   onClick={() => {
                //     setEmbeddingModalOpen(true)
                //     handleTrigger()
                //   }}
                //   disabled={!publishedAt}
                //   icon={<CodeBrowser className='w-4 h-4' />}
                // >
                //   {t('workflow.common.embedIntoSite')}
                // </SuggestedAction>
              )}
              {/* <SuggestedAction
                onClick={() => {
                  publishedAt && handleOpenInExplore()
                }}
                disabled={!publishedAt}
                icon={<RiPlanetLine className='w-4 h-4' />}
              >
                {t('workflow.common.openInExplore')}
              </SuggestedAction>
              <SuggestedAction
                disabled={!publishedAt}
                link='./develop'
                icon={<RiTerminalBoxLine className='w-4 h-4' />}
              >
                {t('workflow.common.accessAPIReference')}
              </SuggestedAction> */}
              {/* {appDetail?.mode === 'workflow' && (
                <WorkflowToolConfigureButton
                  disabled={!publishedAt}
                  published={!!toolPublished}
                  detailNeedUpdate={!!toolPublished && published}
                  workflowAppId={appDetail?.id}
                  icon={{
                    content: (appDetail.icon_type === 'image' ? '🤖' : appDetail?.icon) || '🤖',
                    background: (appDetail.icon_type === 'image' ? appDefaultIconBackground : appDetail?.icon_background) || appDefaultIconBackground,
                  }}
                  name={appDetail?.name}
                  description={appDetail?.description}
                  inputs={inputs}
                  handlePublish={handlePublish}
                  onRefreshData={onRefreshData}
                />
              )} */}
            </div>
          </div>
        </PortalToFollowElemContent>
        {/* <EmbeddedModal
          siteInfo={appDetail?.site}
          isShow={embeddingModalOpen}
          onClose={() => setEmbeddingModalOpen(false)}
          appBaseUrl={appBaseURL}
          accessToken={accessToken}
        /> */}
      </PortalToFollowElem>
    </>
  );
};

export default memo(AppPublisher);
