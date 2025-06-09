
import type { FC } from 'react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  RiBookmark3Line,
  RiErrorWarningFill,
} from '@remixicon/react'
import { useBoolean } from 'ahooks'
import TabHeader from '@/pages/workflowConfig/components/tab-header'
// import MenuDropdown from './menu-dropdown'
import RunBatch from './run-batch'
import ResDownload from './run-batch/res-download'
import useBreakpoints, { MediaType } from '@/pages/workflowConfig/hooks/use-breakpoints'
import RunOnce from './run-once'
import type { SiteInfo } from '@/pages/workflowConfig/models/share'
import type {
  MoreLikeThisConfig,
  PromptConfig,
  SavedMessage,
  TextToSpeechConfig,
} from '@/pages/workflowConfig/models/debug'
import AppIcon from '@/pages/workflowConfig/components/app-icon'
import Badge from '@/pages/workflowConfig/components/badge'
import Loading from '@/pages/workflowConfig/components/loading'
import { userInputsFormToPromptVariables } from '@/pages/workflowConfig/utils/model-config'
import Res from './result'
import SavedItems from '@/pages/workflowConfig/app/text-generate/saved-items'
import type { InstalledApp } from '@/pages/workflowConfig/models/explore'
import { DEFAULT_VALUE_MAX_LEN, appDefaultIconBackground } from '@/pages/workflowConfig/config'
import Toast from '@/pages/workflowConfig/components/toast'
import type { VisionFile, VisionSettings } from '@/pages/workflowConfig/types/app'
import { Resolution, TransferMethod } from '@/pages/workflowConfig/types/app'
import { useAppFavicon } from '@/pages/workflowConfig/hooks/use-app-favicon'
// import LogoSite from '@/pages/workflowConfig/components/logo/logo-site'
import cn from '@/pages/workflowConfig/utils/classnames'
import { getWorkflowPublishParams } from '@/api/workflowV2'
import { getAppDetail } from '@/api/appsV2'
import { useParams } from '@/utils/url'
// import appSiteDetail from '@/pages/workflowConfig/mockData/appSiteDetail.json'
// import appSiteParams from '@/pages/workflowConfig/mockData/appSiteParams.json'


const GROUP_SIZE = 5 // to avoid RPM(Request per minute) limit. The group task finished then the next group.
enum TaskStatus {
  pending = 'pending',
  running = 'running',
  completed = 'completed',
  failed = 'failed',
}

type TaskParam = {
  inputs: Record<string, any>
}

type Task = {
  id: number
  status: TaskStatus
  params: TaskParam
}

export type IMainProps = {
  isInstalledApp?: boolean
  installedAppInfo?: InstalledApp
  isWorkflow?: boolean
}

const TextGeneration: FC<IMainProps> = ({
  isInstalledApp = false,
  installedAppInfo,
  isWorkflow = false,
}) => {
  const { notify } = Toast

  const { t } = useTranslation('plugin__console-plugin-appforge')
  const media = useBreakpoints()
  const isPC = media === MediaType.pc

  const searchParams = new URLSearchParams()
  const mode = searchParams.get('mode') || 'create'
  const queryAppId = useParams('id')
  const [currentTab, setCurrentTab] = useState<string>(['create', 'batch'].includes(mode) ? mode : 'create')

  // const router = {} as any
  // const pathname = {} as any
  // useEffect(() => {
  //   const params = new URLSearchParams(searchParams)
  //   if (params.has('mode')) {
  //     params.delete('mode')
  //     router.replace(`${pathname}?${params.toString()}`)
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [])

  // Notice this situation isCallBatchAPI but not in batch tab
  const [isCallBatchAPI, setIsCallBatchAPI] = useState(false)
  const isInBatchTab = currentTab === 'batch'
  const [inputs, doSetInputs] = useState<Record<string, any>>({})
  const inputsRef = useRef(inputs)
  const setInputs = useCallback((newInputs: Record<string, any>) => {
    doSetInputs(newInputs)
    inputsRef.current = newInputs
  }, [])
  const [appId, setAppId] = useState<string>('')
  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null)
  const [canReplaceLogo, setCanReplaceLogo] = useState<boolean>(false)
  const [customConfig, setCustomConfig] = useState<Record<string, any> | null>(null)
  const [promptConfig, setPromptConfig] = useState<PromptConfig | null>(null)
  const [moreLikeThisConfig, setMoreLikeThisConfig] = useState<MoreLikeThisConfig | null>(null)
  const [textToSpeechConfig, setTextToSpeechConfig] = useState<TextToSpeechConfig | null>(null)

  // save message
  const [savedMessages, setSavedMessages] = useState<SavedMessage[]>([])
  const fetchSavedMessage = async () => {
    // const res: any = await doFetchSavedMessage(isInstalledApp, installedAppInfo?.id)
    // setSavedMessages(res.data)
    setSavedMessages([])
  }
  const handleSaveMessage = async (messageId: string) => {
    // await saveMessage(messageId, isInstalledApp, installedAppInfo?.id)
    notify({ type: 'success', message: t('common.api.saved') })
    fetchSavedMessage()
  }
  const handleRemoveSavedMessage = async (messageId: string) => {
    // await removeMessage(messageId, isInstalledApp, installedAppInfo?.id)
    notify({ type: 'success', message: t('common.api.remove') })
    fetchSavedMessage()
  }

  // send message task
  const [controlSend, setControlSend] = useState(0)
  const [controlStopResponding, setControlStopResponding] = useState(0)
  const [visionConfig, setVisionConfig] = useState<VisionSettings>({
    enabled: false,
    number_limits: 2,
    detail: Resolution.low,
    transfer_methods: [TransferMethod.local_file],
  })
  const [completionFiles, setCompletionFiles] = useState<VisionFile[]>([])

  const handleSend = () => {
    setIsCallBatchAPI(false)
    setControlSend(Date.now())

    setAllTaskList([]) // clear batch task running status
    showResultPanel()
  }

  const [controlRetry, setControlRetry] = useState(0)
  const handleRetryAllFailedTask = () => {
    setControlRetry(Date.now())
  }
  const [allTaskList, doSetAllTaskList] = useState<Task[]>([])
  const allTaskListRef = useRef<Task[]>([])
  const getLatestTaskList = () => allTaskListRef.current
  const setAllTaskList = (taskList: Task[]) => {
    doSetAllTaskList(taskList)
    allTaskListRef.current = taskList
  }
  const pendingTaskList = allTaskList.filter(task => task.status === TaskStatus.pending)
  const noPendingTask = pendingTaskList.length === 0
  const showTaskList = allTaskList.filter(task => task.status !== TaskStatus.pending)
  const [currGroupNum, doSetCurrGroupNum] = useState(0)
  const currGroupNumRef = useRef(0)
  const setCurrGroupNum = (num: number) => {
    doSetCurrGroupNum(num)
    currGroupNumRef.current = num
  }
  const getCurrGroupNum = () => {
    return currGroupNumRef.current
  }
  const allSuccessTaskList = allTaskList.filter(task => task.status === TaskStatus.completed)
  const allFailedTaskList = allTaskList.filter(task => task.status === TaskStatus.failed)
  const allTasksFinished = allTaskList.every(task => task.status === TaskStatus.completed)
  const allTasksRun = allTaskList.every(task => [TaskStatus.completed, TaskStatus.failed].includes(task.status))
  const [batchCompletionRes, doSetBatchCompletionRes] = useState<Record<string, string>>({})
  const batchCompletionResRef = useRef<Record<string, string>>({})
  const setBatchCompletionRes = (res: Record<string, string>) => {
    doSetBatchCompletionRes(res)
    batchCompletionResRef.current = res
  }
  const getBatchCompletionRes = () => batchCompletionResRef.current
  const exportRes = allTaskList.map((task) => {
    const batchCompletionResLatest = getBatchCompletionRes()
    const res: Record<string, string> = {}
    const { inputs } = task.params
    promptConfig?.prompt_variables.forEach((v) => {
      res[v.name] = inputs[v.key]
    })
    let result = batchCompletionResLatest[task.id]
    // task might return multiple fields, should marshal object to string
    if (typeof batchCompletionResLatest[task.id] === 'object')
      result = JSON.stringify(result)

    res[t('share.generation.completionResult')] = result
    return res
  })
  const checkBatchInputs = (data: string[][]) => {
    if (!data || data.length === 0) {
      notify({ type: 'error', message: t('share.generation.errorMsg.empty') })
      return false
    }
    const headerData = data[0]
    let isMapVarName = true
    promptConfig?.prompt_variables.forEach((item, index) => {
      if (!isMapVarName)
        return

      if (item.name !== headerData[index])
        isMapVarName = false
    })

    if (!isMapVarName) {
      notify({ type: 'error', message: t('share.generation.errorMsg.fileStructNotMatch') })
      return false
    }

    let payloadData = data.slice(1)
    if (payloadData.length === 0) {
      notify({ type: 'error', message: t('share.generation.errorMsg.atLeastOne') })
      return false
    }

    // check middle empty line
    const allEmptyLineIndexes = payloadData.filter(item => item.every(i => i === '')).map(item => payloadData.indexOf(item))
    if (allEmptyLineIndexes.length > 0) {
      let hasMiddleEmptyLine = false
      let startIndex = allEmptyLineIndexes[0] - 1
      allEmptyLineIndexes.forEach((index) => {
        if (hasMiddleEmptyLine)
          return

        if (startIndex + 1 !== index) {
          hasMiddleEmptyLine = true
          return
        }
        startIndex++
      })

      if (hasMiddleEmptyLine) {
        notify({ type: 'error', message: t('share.generation.errorMsg.emptyLine', { rowIndex: startIndex + 2 }) })
        return false
      }
    }

    // check row format
    payloadData = payloadData.filter(item => !item.every(i => i === ''))
    // after remove empty rows in the end, checked again
    if (payloadData.length === 0) {
      notify({ type: 'error', message: t('share.generation.errorMsg.atLeastOne') })
      return false
    }
    let errorRowIndex = 0
    let requiredVarName = ''
    let moreThanMaxLengthVarName = ''
    let maxLength = 0
    payloadData.forEach((item, index) => {
      if (errorRowIndex !== 0)
        return

      promptConfig?.prompt_variables.forEach((varItem, varIndex) => {
        if (errorRowIndex !== 0)
          return
        if (varItem.type === 'string') {
          const maxLen = varItem.max_length || DEFAULT_VALUE_MAX_LEN
          if (item[varIndex].length > maxLen) {
            moreThanMaxLengthVarName = varItem.name
            maxLength = maxLen
            errorRowIndex = index + 1
            return
          }
        }
        if (!varItem.required)
          return

        if (item[varIndex].trim() === '') {
          requiredVarName = varItem.name
          errorRowIndex = index + 1
        }
      })
    })

    if (errorRowIndex !== 0) {
      if (requiredVarName)
        notify({ type: 'error', message: t('share.generation.errorMsg.invalidLine', { rowIndex: errorRowIndex + 1, varName: requiredVarName }) })

      if (moreThanMaxLengthVarName)
        notify({ type: 'error', message: t('share.generation.errorMsg.moreThanMaxLengthLine', { rowIndex: errorRowIndex + 1, varName: moreThanMaxLengthVarName, maxLength }) })

      return false
    }
    return true
  }
  const handleRunBatch = (data: string[][]) => {
    if (!checkBatchInputs(data))
      return
    if (!allTasksFinished) {
      notify({ type: 'info', message: t('appDebug.errorMessage.waitForBatchResponse') })
      return
    }

    const payloadData = data.filter(item => !item.every(i => i === '')).slice(1)
    const varLen = promptConfig?.prompt_variables.length || 0
    setIsCallBatchAPI(true)
    const allTaskList: Task[] = payloadData.map((item, i) => {
      const inputs: Record<string, string> = {}
      if (varLen > 0) {
        item.slice(0, varLen).forEach((input, index) => {
          inputs[promptConfig?.prompt_variables[index].key as string] = input
        })
      }
      return {
        id: i + 1,
        status: i < GROUP_SIZE ? TaskStatus.running : TaskStatus.pending,
        params: {
          inputs,
        },
      }
    })
    setAllTaskList(allTaskList)
    setCurrGroupNum(0)
    setControlSend(Date.now())
    // clear run once task status
    setControlStopResponding(Date.now())

    showResultPanel()
  }
  const handleCompleted = (completionRes: string, taskId?: number, isSuccess?: boolean) => {
    const allTaskListLatest = getLatestTaskList()
    const batchCompletionResLatest = getBatchCompletionRes()
    const pendingTaskList = allTaskListLatest.filter(task => task.status === TaskStatus.pending)
    const runTasksCount = 1 + allTaskListLatest.filter(task => [TaskStatus.completed, TaskStatus.failed].includes(task.status)).length
    const needToAddNextGroupTask = (getCurrGroupNum() !== runTasksCount) && pendingTaskList.length > 0 && (runTasksCount % GROUP_SIZE === 0 || (allTaskListLatest.length - runTasksCount < GROUP_SIZE))
    // avoid add many task at the same time
    if (needToAddNextGroupTask)
      setCurrGroupNum(runTasksCount)

    const nextPendingTaskIds = needToAddNextGroupTask ? pendingTaskList.slice(0, GROUP_SIZE).map(item => item.id) : []
    const newAllTaskList = allTaskListLatest.map((item) => {
      if (item.id === taskId) {
        return {
          ...item,
          status: isSuccess ? TaskStatus.completed : TaskStatus.failed,
        }
      }
      if (needToAddNextGroupTask && nextPendingTaskIds.includes(item.id)) {
        return {
          ...item,
          status: TaskStatus.running,
        }
      }
      return item
    })
    setAllTaskList(newAllTaskList)
    if (taskId) {
      setBatchCompletionRes({
        ...batchCompletionResLatest,
        [`${taskId}`]: completionRes,
      })
    }
  }

  const fetchInitData = async () => {
    const { data: appSiteData } = await getAppDetail(queryAppId)
    const { data: appSiteParams } = await getWorkflowPublishParams(queryAppId)
    const appSiteDetail = {
      app_id: appSiteData.id,
      enable_site: true,
      model_config: null,
      plan: "basic",
      can_replace_logo: false,
      custom_config: null,
      site: { ...appSiteData, title: appSiteData.name, prompt_public: false, }
    }
    return Promise.all([
      isInstalledApp
        ? {
          app_id: installedAppInfo?.id,
          site: {
            title: installedAppInfo?.app.name,
            prompt_public: false,
            copyright: '',
            icon: installedAppInfo?.app.icon,
            icon_background: installedAppInfo?.app.icon_background,
          },
          plan: 'basic',
        }
        : appSiteDetail,
      appSiteParams,
      !isWorkflow
        ? fetchSavedMessage()
        : {},
    ])
  }

  useEffect(() => {
    (async () => {
      const [appData, appParams]: any = await fetchInitData()
      const { app_id: appId, site: siteInfo, can_replace_logo, custom_config } = appData
      setAppId(appId)
      setSiteInfo(siteInfo as SiteInfo)
      setCanReplaceLogo(can_replace_logo)
      setCustomConfig(custom_config)
      console.log('siteinfo...', siteInfo)
      const { user_input_form, more_like_this, file_upload, text_to_speech }: any = appParams
      setVisionConfig({
        // legacy of image upload compatible
        ...file_upload,
        transfer_methods: file_upload.allowed_file_upload_methods || file_upload.allowed_upload_methods,
        // legacy of image upload compatible
        image_file_size_limit: appParams?.system_parameters?.image_file_size_limit,
        fileUploadConfig: appParams?.system_parameters,
      })
      const prompt_variables = userInputsFormToPromptVariables(user_input_form)
      setPromptConfig({
        prompt_template: '', // placeholder for future
        prompt_variables,
      } as PromptConfig)
      setMoreLikeThisConfig(more_like_this)
      setTextToSpeechConfig(text_to_speech)
    })()
  }, [])

  // Can Use metadata(https://beta.nextjs.org/docs/api-reference/metadata) to set title. But it only works in server side client.
  useEffect(() => {
    if (siteInfo?.title) {
      if (canReplaceLogo)
        document.title = `${siteInfo.title}`
      else
        document.title = `${siteInfo.title} - Powered by AppForge`
    }
  }, [siteInfo?.title, canReplaceLogo])

  useAppFavicon({
    enable: !isInstalledApp,
    icon_type: siteInfo?.icon_type,
    icon: siteInfo?.icon,
    icon_background: siteInfo?.icon_background,
    icon_url: siteInfo?.icon_url,
  })

  const [isShowResultPanel, { setTrue: doShowResultPanel, setFalse: hideResultPanel }] = useBoolean(false)
  const showResultPanel = () => {
    // fix: useClickAway hideResSidebar will close sidebar
    setTimeout(() => {
      doShowResultPanel()
    }, 0)
  }
  const [resultExisted, setResultExisted] = useState(false)

  const renderRes = (task?: Task) => (<Res
    key={task?.id}
    isWorkflow={isWorkflow}
    isCallBatchAPI={isCallBatchAPI}
    isPC={isPC}
    isMobile={!isPC}
    isInstalledApp={isInstalledApp}
    installedAppInfo={installedAppInfo}
    isError={task?.status === TaskStatus.failed}
    promptConfig={promptConfig}
    moreLikeThisEnabled={!!moreLikeThisConfig?.enabled}
    inputs={isCallBatchAPI ? (task as Task).params.inputs : inputs}
    controlSend={controlSend}
    controlRetry={task?.status === TaskStatus.failed ? controlRetry : 0}
    controlStopResponding={controlStopResponding}
    onShowRes={showResultPanel}
    handleSaveMessage={handleSaveMessage}
    taskId={task?.id}
    onCompleted={handleCompleted}
    visionConfig={visionConfig}
    completionFiles={completionFiles}
    isShowTextToSpeech={!!textToSpeechConfig?.enabled}
    siteInfo={siteInfo}
    onRunStart={() => setResultExisted(true)}
  />)

  const renderBatchRes = () => {
    return (showTaskList.map(task => renderRes(task)))
  }

  const renderResWrap = (
    <div
      className={cn(
        'relative flex flex-col h-full',
        !isPC && 'h-[calc(100vh_-_36px)] rounded-t-2xl shadow-lg backdrop-blur-sm',
        !isPC
          ? isShowResultPanel
            ? 'bg-background-default-burn'
            : 'bg-components-panel-bg border-t-[0.5px] border-divider-regular'
          : '',
      )}
    >
      {isCallBatchAPI && (
        <div className={cn(
          'shrink-0 px-14 pt-9 pb-2 flex items-center justify-between',
          !isPC && 'px-4 pt-3 pb-1',
        )}>
          <div className='text-text-primary system-md-semibold-uppercase'>{t('share.generation.executions', { num: allTaskList.length })}</div>
          {allSuccessTaskList.length > 0 && (
            <ResDownload
              isMobile={!isPC}
              values={exportRes}
            />
          )}
        </div>
      )}
      <div className={cn(
        'grow flex flex-col h-0 overflow-y-auto',
        isPC && 'px-14 py-8',
        isPC && isCallBatchAPI && 'pt-0',
        !isPC && 'p-0 pb-2',
      )}>
        {!isCallBatchAPI ? renderRes() : renderBatchRes()}
        {!noPendingTask && (
          <div className='mt-4'>
            <Loading type='area' />
          </div>
        )}
      </div>
      {isCallBatchAPI && allFailedTaskList.length > 0 && (
        <div className='z-10 absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-3 rounded-xl bg-components-panel-bg-blur backdrop-blur-sm border border-components-panel-border shadow-lg'>
          <RiErrorWarningFill className='w-4 h-4 text-text-destructive' />
          <div className='text-text-secondary system-sm-medium'>{t('share.generation.batchFailed.info', { num: allFailedTaskList.length })}</div>
          <div className='w-px h-3.5 bg-divider-regular'></div>
          <div onClick={handleRetryAllFailedTask} className='text-text-accent system-sm-semibold-uppercase cursor-pointer'>{t('share.generation.batchFailed.retry')}</div>
        </div>
      )}
    </div>
  )

  if (!appId || !siteInfo || !promptConfig) {
    return (
      <div className='flex items-center h-full'>
        <Loading type='app' />
      </div>)
  }

  return (
    <div className={cn(
      'text-generation-wrapper',
      isPC && 'flex',
      !isPC && 'flex-col bg-background-default-burn',
      isInstalledApp ? 'h-full rounded-2xl shadow-md' : 'h-full',
    )}>
      {/* Left */}
      <div className={cn(
        'shrink-0 relative flex flex-col h-full text-generation-left',
        isPC ? 'w-[500px] max-w-[50%]' : resultExisted ? 'h-[calc(100%_-_64px)]' : '',
        isInstalledApp && 'rounded-l-2xl',
      )}>
        {/* header */}
        <div className={cn('shrink-0 space-y-4', isPC ? '' : 'p-4 pb-0')}>
          <div className='flex items-center gap-3'>
            <AppIcon
              size={isPC ? 'large' : 'small'}
              iconType={siteInfo.icon_type}
              icon={siteInfo.icon}
              background={siteInfo.icon_background || appDefaultIconBackground}
              imageUrl={siteInfo.icon_url}
              className="size-[44px] rounded-[4px]"
              appMode={isWorkflow ? 'workflow': 'agent'} 
            />
            <div className='flex flex-col gap-y-[2px]'>
              <div className='grow text-text-secondary system-md-semibold truncate text-[16px]/[24px] text-[#1E293B]'>{siteInfo.title}</div>
              {siteInfo.description && (
                <div className='system-xs-regular text-text-tertiary'>{siteInfo.description}</div>
              )}
              {/* <MenuDropdown data={siteInfo} /> */}
            </div>
          </div>
          
          <TabHeader
            items={[
              { id: 'create', name: t('share.generation.tabs.create') },
              { id: 'batch', name: t('share.generation.tabs.batch') },
              ...(!isWorkflow
                ? [{
                  id: 'saved',
                  name: t('share.generation.tabs.saved'),
                  isRight: true,
                  icon: <RiBookmark3Line className='w-4 h-4' />,
                  extra: savedMessages.length > 0
                    ? (
                      <Badge className='ml-1'>
                        {savedMessages.length}
                      </Badge>
                    )
                    : null,
                }]
                : []),
            ]}
            value={currentTab}
            onChange={setCurrentTab}
          />
        </div>
        {/* form */}
        <div className={cn(
          'overflow-y-auto rounded-[4px]',
          isInBatchTab ? '' : 'bg-components-panel-bg',
          isPC && !isInBatchTab ? 'px-[16px]' : '',
          isPC ? 'pb-[20px]' : 'px-4 grow h-0 ',
          !isPC && resultExisted && customConfig?.remove_webapp_brand && 'rounded-b-2xl border-b-[0.5px] border-divider-regular',
        )}>
          <div className={cn(currentTab === 'create' ? 'block' : 'hidden')}>
            <RunOnce
              siteInfo={siteInfo}
              inputs={inputs}
              inputsRef={inputsRef}
              onInputsChange={setInputs}
              promptConfig={promptConfig}
              onSend={handleSend}
              visionConfig={visionConfig}
              onVisionFilesChange={setCompletionFiles}
            />
          </div>
          <div className={cn(isInBatchTab ? 'block' : 'hidden')}>
            <RunBatch
              vars={promptConfig.prompt_variables}
              onSend={handleRunBatch}
              isAllFinished={allTasksRun}
            />
          </div>
          {currentTab === 'saved' && (
            <SavedItems
              className={cn(isPC ? 'mt-6' : 'mt-4')}
              isShowTextToSpeech={textToSpeechConfig?.enabled}
              list={savedMessages}
              onRemove={handleRemoveSavedMessage}
              onStartCreateContent={() => setCurrentTab('create')}
            />
          )}
        </div>
        {/* powered by */}
        {/* {!customConfig?.remove_webapp_brand && (
          <div className={cn(
            'shrink-0 py-3 flex items-center gap-1.5 bg-components-panel-bg',
            isPC ? 'px-8' : 'px-4',
            !isPC && resultExisted && 'rounded-b-2xl border-b-[0.5px] border-divider-regular',
          )}>
            <div className='text-text-tertiary system-2xs-medium-uppercase'>{t('share.chat.poweredBy')}</div>
            {customConfig?.replace_webapp_logo && (
              <img src={customConfig?.replace_webapp_logo} alt='logo' className='block w-auto h-5' />
            )}
            {!customConfig?.replace_webapp_logo && (
              <LogoSite className='!h-5' />
            )}
          </div>
        )} */}
      </div>
      {/* Result */}
      <div className={cn(
        'text-generation-right right-part-bg',
        isPC
          ? 'grow h-full'
          : isShowResultPanel
            ? 'fixed z-50 inset-0 bg-background-overlay backdrop-blur-sm'
            : resultExisted
              ? 'relative shrink-0 h-16 pt-2.5 bg-background-default-burn overflow-hidden'
              : '',
      )}>
        {!isPC && (
          <div
            className={cn(
              isShowResultPanel
                ? 'p-2 pt-6 flex items-center justify-center'
                : 'z-10 absolute top-0 left-0 w-full px-2 pt-[3px] pb-[57px] flex items-center justify-center',
            )}
            onClick={() => {
              if (isShowResultPanel)
                hideResultPanel()
              else
                showResultPanel()
            }}
          >
            <div className='w-8 h-1 rounded bg-divider-solid cursor-grab'/>
          </div>
        )}
        {renderResWrap}
      </div>
    </div>
  )
}

export default TextGeneration
