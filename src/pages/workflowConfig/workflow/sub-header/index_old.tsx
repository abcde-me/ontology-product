

import { FC, useState } from 'react'
import React, {
  memo,
  useCallback,
  useMemo,
} from 'react'
import { RiPlayFill, RiStopFill, RiFullscreenLine, RiFullscreenExitLine, RiApps2AddLine, RiArrowLeftLine, RiComputerLine, RiFileTextLine, RiHistoryLine, RiLoader2Line, RiPlayLargeLine, RiSettings3Line } from '@remixicon/react'
import { useNodes } from 'reactflow'
import { useTranslation } from 'react-i18next'
import { useContext, useContextSelector } from 'use-context-selector'
import {
  useStore,
  useWorkflowStore,
} from '../store'
import {
  BlockEnum,
  InputVarType,
  WorkflowVersion,
} from '../types'
import type { StartNodeType } from '../nodes/start/types'
import {
  useChecklistBeforePublish,
  useIsChatMode,
  useNodesInteractions,
  useNodesReadOnly,
  useNodesSyncDraft,
  useWorkflowMode,
  useWorkflowRun,
} from '../hooks'
// import AppPublisher from '../../app/app-publisher'
import Toast, { ToastContext } from '@/pages/workflowConfig/components/toast'
// import Divider from '../../base/divider'
// import RunAndHistory from '../header/run-and-history'
// import EditingTitle from '../header/editing-title'
// import RunningTitle from '../header/running-title'
// import RestoringTitle from '../header/restoring-title'
// import ViewHistory from '../header/view-history'
// import ChatVariableButton from '../header/chat-variable-button'
// import EnvButton from '../header/env-button'
import VersionHistoryButton from '../header/version-history-button'
// import Button from '@/pages/workflowConfig/components/button'
import { useStore as useAppStore } from '@/pages/workflowConfig/app/store'
// import { ArrowNarrowLeft } from '@/app/components/base/icons/src/vender/line/arrows'
// import { useFeatures } from '@/app/components/base/features/hooks'
// import { usePublishWorkflow, useResetWorkflowVersionHistory } from '@/service/use-workflow'
import type { PublishWorkflowParams } from '@/pages/workflowConfig/types/workflow'
// import { fetchAppDetail, fetchAppSSO } from '@/service/apps'
import AppContext from '@/pages/workflowConfig/context/app-context'
import FullscreenUtil from '@/pages/workflowConfig/utils/fullscreen'
import {
  useWorkflowStartRun,
} from '../hooks'
import { WorkflowRunningStatus } from '../types'
import cn from '@/pages/workflowConfig/utils/classnames'
import Checklist from '../header/checklist'
import ZoomInOut from '../operator/zoom-in-out'
import { getAppDetail } from '@/api/appsV2'
// import appDetailJson from '@/pages/workflowConfig/mockData/appDetail.json'

const Header: FC = () => {
  const { t } = useTranslation('plugin__console-plugin-appforge')
  const workflowStore = useWorkflowStore()
  const appDetail = useAppStore(s => s.appDetail)
  const setAppDetail = useAppStore(s => s.setAppDetail)
  const systemFeatures = useContextSelector(AppContext, state => state.systemFeatures)
  const appID = appDetail?.id
  const isChatMode = useIsChatMode()
  const { nodesReadOnly, getNodesReadOnly } = useNodesReadOnly()
  const { handleNodeSelect } = useNodesInteractions()
  const publishedAt = useStore(s => s.publishedAt)
  const draftUpdatedAt = useStore(s => s.draftUpdatedAt)
  const toolPublished = useStore(s => s.toolPublished)
  const currentVersion = useStore(s => s.currentVersion)
  const setShowWorkflowVersionHistoryPanel = useStore(s => s.setShowWorkflowVersionHistoryPanel)
  const setShowEnvPanel = useStore(s => s.setShowEnvPanel)
  const setShowDebugAndPreviewPanel = useStore(s => s.setShowDebugAndPreviewPanel)
  const nodes = useNodes<StartNodeType>()
  const startNode = nodes.find(node => node.data.type === BlockEnum.Start)
  const selectedNode = nodes.find(node => node.data.selected)
  const startVariables = startNode?.data.variables
  // const fileSettings = useFeatures(s => s.features.file)
  const fileSettings = {} as any
  const variables = useMemo(() => {
    const data = startVariables || []
    if (fileSettings?.image?.enabled) {
      return [
        ...data,
        {
          type: InputVarType.files,
          variable: '__image',
          required: false,
          label: 'files',
        },
      ]
    }

    return data
  }, [fileSettings?.image?.enabled, startVariables])

  const [isFullscreen, setIsFullscreen] = useState(false)

  const {
    handleLoadBackupDraft,
    handleBackupDraft,
  } = useWorkflowRun()
  const { handleCheckBeforePublish } = useChecklistBeforePublish()
  const { handleSyncWorkflowDraft } = useNodesSyncDraft()
  const { notify } = useContext(ToastContext)
  const {
    normal,
    restoring,
    viewHistory,
  } = useWorkflowMode()

  const handleShowFeatures = useCallback(() => {
    const {
      showFeaturesPanel,
      isRestoring,
      setShowFeaturesPanel,
    } = workflowStore.getState()
    if (getNodesReadOnly() && !isRestoring)
      return
    setShowFeaturesPanel(!showFeaturesPanel)
  }, [workflowStore, getNodesReadOnly])

  const handleCancelRestore = useCallback(() => {
    handleLoadBackupDraft()
    workflowStore.setState({ isRestoring: false })
    setShowWorkflowVersionHistoryPanel(false)
  }, [workflowStore, handleLoadBackupDraft, setShowWorkflowVersionHistoryPanel])

  // const resetWorkflowVersionHistory = useResetWorkflowVersionHistory(appDetail!.id)
  console.warn('API NOT IMPLEMENTED ', 'resetWorkflowVersionHistory')
  const resetWorkflowVersionHistory = () => {}

  const handleRestore = useCallback(() => {
    setShowWorkflowVersionHistoryPanel(false)
    workflowStore.setState({ isRestoring: false })
    workflowStore.setState({ backupDraft: undefined })
    handleSyncWorkflowDraft(true, false, {
      onSuccess: () => {
        Toast.notify({
          type: 'success',
          message: t('workflow.versionHistory.action.restoreSuccess'),
        })
      },
      onError: () => {
        Toast.notify({
          type: 'error',
          message: t('workflow.versionHistory.action.restoreFailure'),
        })
      },
      onSettled: () => {
        resetWorkflowVersionHistory()
      },
    })
  }, [handleSyncWorkflowDraft, workflowStore, setShowWorkflowVersionHistoryPanel, resetWorkflowVersionHistory, t])

  const updateAppDetail = useCallback(async () => {
    try {
      const result = await getAppDetail(appID!)
      const res = result.data
      setAppDetail({ ...res })
    }
    catch (error) {
      console.error(error)
    }
  }, [appID, setAppDetail, systemFeatures.enable_web_sso_switch_component])

  console.warn('API NOT IMPLEMENTED ', 'publishWorkflow')
  const publishWorkflow = (args: any) => { return {} as any }

  // const onPublish = useCallback(async (params?: PublishWorkflowParams) => {
  //   if (handleCheckBeforePublish()) {
  //     const res = await publishWorkflow({
  //       title: params?.title || '',
  //       releaseNotes: params?.releaseNotes || '',
  //     })

  //     if (res) {
  //       notify({ type: 'success', message: t('common.api.actionSuccess') })
  //       updateAppDetail()
  //       workflowStore.getState().setPublishedAt(res.created_at)
  //       resetWorkflowVersionHistory()
  //     }
  //   }
  //   else {
  //     throw new Error('Checklist failed')
  //   }
  // }, [handleCheckBeforePublish, notify, t, workflowStore, publishWorkflow, resetWorkflowVersionHistory, updateAppDetail])

  const onStartRestoring = useCallback(() => {
    workflowStore.setState({ isRestoring: true })
    handleBackupDraft()
    // clear right panel
    if (selectedNode)
      handleNodeSelect(selectedNode.id, true)
    setShowWorkflowVersionHistoryPanel(true)
    setShowEnvPanel(false)
    setShowDebugAndPreviewPanel(false)
  }, [handleBackupDraft, workflowStore, handleNodeSelect, selectedNode,
    setShowWorkflowVersionHistoryPanel, setShowEnvPanel, setShowDebugAndPreviewPanel])

  const onPublisherToggle = useCallback((state: boolean) => {
    if (state)
      handleSyncWorkflowDraft(true)
  }, [handleSyncWorkflowDraft])

  const handleGoBackToEdit = useCallback(() => {
    handleLoadBackupDraft()
    workflowStore.setState({ historyWorkflowData: undefined })
  }, [workflowStore, handleLoadBackupDraft])

  const handleToolConfigureUpdate = useCallback(() => {
    workflowStore.setState({ toolPublished: true })
  }, [workflowStore])


  const RunMode = memo(() => {
    const { t } = useTranslation('plugin__console-plugin-appforge')
    const { handleWorkflowStartRunInWorkflow } = useWorkflowStartRun()
    const { handleStopRun } = useWorkflowRun()
    const workflowRunningData = useStore(s => s.workflowRunningData)
    const isRunning = workflowRunningData?.result.status === WorkflowRunningStatus.Running
  
    return (
      <>
        <div
          className={cn('run-action-btn', isRunning ? 'is-running' : '')}
          onClick={() => isRunning ?  handleStopRun(workflowRunningData?.task_id || '') :  handleWorkflowStartRunInWorkflow()}
        >
          <div className='play-icon-circle'>
            {isRunning ? <RiStopFill className='play-icon'/> : <RiPlayFill className='play-icon'/>}
          </div>
          <span className='text-[12px]/[20px]'>{isRunning ? '停止' : '运行'}</span>
        </div>
      </>
    )
  })
  RunMode.displayName = 'RunMode';

  const handleFullscreen = () => {
    if (isFullscreen) {
      FullscreenUtil.exitFullscreen()
    } else {
      FullscreenUtil.requestFullscreen(document.getElementById('workflow-container'));
    }
    setIsFullscreen(prev => !prev);
  }

  return (
    <div
      className='app-workflow-page-sub-header absolute top-0 left-0 z-10 flex items-center justify-between w-full px-3 h-14 bg-mask-top2bottom-gray-50-to-transparent'
    >
      <div className='left-part'>
        <RunMode />
        <div className='separator'></div>
        <div className='history-check-group'>
          {/* <ViewHistory /> */}
          <VersionHistoryButton className='history-btn' onClick={onStartRestoring} />
          <Checklist disabled={nodesReadOnly} />
        </div>
      </div>
      <div className='right-part'>
        <ZoomInOut />
        <div className='separator'></div>
        <div className='fullscreen-btn' onClick={handleFullscreen}>
          { isFullscreen ? <RiFullscreenExitLine /> : <RiFullscreenLine /> }
        </div>
      </div>
    </div>
  )
}

export default memo(Header)
