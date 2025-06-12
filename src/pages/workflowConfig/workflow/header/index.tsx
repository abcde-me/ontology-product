import { FC, useState } from 'react'
import React, {
  memo,
  useCallback,
  useMemo,
} from 'react'
import { RiApps2AddLine, RiArrowLeftLine, RiComputerLine, RiFileTextLine, RiHistoryLine, RiSettings3Line } from '@remixicon/react'
import { useNodes } from 'reactflow'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom';
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
import AppPublisher from '@/pages/workflowConfig/app/app-publisher'
import Toast, { ToastContext } from '@/pages/workflowConfig/components/toast'
// import Divider from '@/componnets/workflow/divider'
// import RunAndHistory from './run-and-history'
import EditingTitle from './editing-title'
// import RunningTitle from './running-title'
// import RestoringTitle from './restoring-title'
// import ViewHistory from './view-history'
// import ChatVariableButton from './chat-variable-button'
// import EnvButton from './env-button'
import VersionHistoryButton from './version-history-button'
import { CreateAppModal } from './create-app-modal'
// import Button from '@/pages/workflowConfig/components/button'
import { useStore as useAppStore } from '@/pages/workflowConfig/app/store'
// import { ArrowNarrowLeft } from '@/app/components/base/icons/src/vender/line/arrows'
// import { useFeatures } from '@/app/components/base/features/hooks'
// import { usePublishWorkflow, useResetWorkflowVersionHistory } from '@/service/use-workflow'
import type { PublishWorkflowParams } from '@/pages/workflowConfig/types/workflow'
import AppContext from '@/pages/workflowConfig/context/app-context'
import { getAppDetail } from '@/api/appsV2'
import { publishWorkflow } from '@/api/workflowV2'
import BackIcon from '@/pages/workflowConfig/styles/images/op-icons/back.svg';
import EditIcon from '@/pages/workflowConfig/styles/images/op-icons/edit.svg';
import WorkflowIcon from '@/pages/workflowConfig/styles/images/op-icons/workflow.svg';
import { PrefixV2 } from '@/api/endpoints'


const Header: FC = () => {
  const { t } = useTranslation('plugin__console-plugin-appforge')
  const history = useHistory()
  const [showEditModal, setShowEditModal] = useState(false)

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

  // const handleShowFeatures = useCallback(() => {
  //   const {
  //     showFeaturesPanel,
  //     isRestoring,
  //     setShowFeaturesPanel,
  //   } = workflowStore.getState()
  //   if (getNodesReadOnly() && !isRestoring)
  //     return
  //   setShowFeaturesPanel(!showFeaturesPanel)
  // }, [workflowStore, getNodesReadOnly])

  // const handleCancelRestore = useCallback(() => {
  //   handleLoadBackupDraft()
  //   workflowStore.setState({ isRestoring: false })
  //   setShowWorkflowVersionHistoryPanel(false)
  // }, [workflowStore, handleLoadBackupDraft, setShowWorkflowVersionHistoryPanel])

  // const resetWorkflowVersionHistory = useResetWorkflowVersionHistory(appDetail!.id)
  console.warn('API NOT IMPLEMENTED ', 'resetWorkflowVersionHistory')
  const resetWorkflowVersionHistory = () => { } // 这里是重新查询version history，暂时无用

  // const handleRestore = useCallback(() => {
  //   setShowWorkflowVersionHistoryPanel(false)
  //   workflowStore.setState({ isRestoring: false })
  //   workflowStore.setState({ backupDraft: undefined })
  //   handleSyncWorkflowDraft(true, false, {
  //     onSuccess: () => {
  //       Toast.notify({
  //         type: 'success',
  //         message: t('workflow.versionHistory.action.restoreSuccess'),
  //       })
  //     },
  //     onError: () => {
  //       Toast.notify({
  //         type: 'error',
  //         message: t('workflow.versionHistory.action.restoreFailure'),
  //       })
  //     },
  //     onSettled: () => {
  //       resetWorkflowVersionHistory()
  //     },
  //   })
  // }, [handleSyncWorkflowDraft, workflowStore, setShowWorkflowVersionHistoryPanel, resetWorkflowVersionHistory, t])

  const updateAppDetail = useCallback(async () => {
    try {
      const result = await getAppDetail(appID!)
      const res = result.data
      setAppDetail({ ...res })
    }
    catch (error) {
      console.error(error)
    }
  }, [appID, setAppDetail])

  const onPublish = useCallback(async (params?: PublishWorkflowParams) => {
    if (handleCheckBeforePublish()) {
      const { data: res } = await publishWorkflow(appID, {
        title: params?.title || '',
        releaseNotes: params?.releaseNotes || '',
        marked_name: params?.title || '',
        marked_comment: params?.releaseNotes || '',
      })

      if (res) {
        notify({ type: 'success', message: t('common.api.actionSuccess') })
        updateAppDetail()
        console.log('res.created_at', res.created_at)
        workflowStore.getState().setPublishedAt(res.created_at)
        resetWorkflowVersionHistory()
      }
    }
    else {
      throw new Error('Checklist failed')
    }
  }, [appID, handleCheckBeforePublish, notify, t, workflowStore, resetWorkflowVersionHistory, updateAppDetail])

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

  // const handleGoBackToEdit = useCallback(() => {
  //   handleLoadBackupDraft()
  //   workflowStore.setState({ historyWorkflowData: undefined })
  // }, [workflowStore, handleLoadBackupDraft])

  const handleToolConfigureUpdate = useCallback(() => {
    workflowStore.setState({ toolPublished: true })
  }, [workflowStore])

  return (
    <div
      className='app-workflow-page-header absolute top-0 left-0 z-10 flex items-center justify-between w-full px-3 h-14 bg-mask-top2bottom-gray-50-to-transparent'
    >
      <div className='left-part'>
        <div className='back-icon' onClick={() => history.push('/tenant/compute/appforge/workflowList')}>
          <BackIcon className='size-[16px]' />
        </div>
        <div className="app-icon">
          {appDetail.icon ? <img src={`${PrefixV2}/files/browser/${appDetail.icon}`} /> : <WorkflowIcon />}
        </div>
        <div className="app-info">
          <div className='app-name'>
            <span className='txt'>{appDetail.name}</span>
            <div className='op-icon' onClick={() => setShowEditModal(true)}>
              <EditIcon className='size-[16px]' />
            </div>
          </div>
          {
            normal && <EditingTitle />
          }
        </div>
      </div>
      <div className='right-part'>
        <VersionHistoryButton className='history-btn' onClick={onStartRestoring} />
        <AppPublisher
          {...{
            publishedAt,
            draftUpdatedAt,
            disabled: nodesReadOnly,
            toolPublished,
            inputs: variables,
            onRefreshData: handleToolConfigureUpdate,
            onPublish,
            onToggle: onPublisherToggle,
            crossAxisOffset: 4,
          }}
        />
      </div>
      {showEditModal && <CreateAppModal visible={showEditModal} setVisible={setShowEditModal} />}
    </div>
  )
}

export default memo(Header)
