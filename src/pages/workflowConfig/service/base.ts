import { API_PREFIX, PUBLIC_API_PREFIX } from '@/pages/workflowConfig/config/'
import Toast from '@/pages/workflowConfig/components/toast'
import type { AnnotationReply, MessageEnd, MessageReplace, ThoughtItem } from '@/pages/workflowConfig/chat/chat/type'
import type { VisionFile } from '@/pages/workflowConfig/types/app'
import type {
  AgentLogResponse,
  IterationFinishedResponse,
  IterationNextResponse,
  IterationStartedResponse,
  LoopFinishedResponse,
  LoopNextResponse,
  LoopStartedResponse,
  NodeFinishedResponse,
  NodeStartedResponse,
  ParallelBranchFinishedResponse,
  ParallelBranchStartedResponse,
  TextChunkResponse,
  TextReplaceResponse,
  WorkflowFinishedResponse,
  WorkflowStartedResponse,
} from '@/pages/workflowConfig/types/workflow'
import type { FetchOptionType } from './fetch'
import { ContentType, baseOptions, getAccessToken } from './fetch'
import { PrefixV2 } from '@/api/endpoints'
import { getToken } from '@/utils/request'
import { queryCurrentRegionInfo } from '@/hooks//use-region-info'

export type IOnDataMoreInfo = {
  conversationId?: string
  taskId?: string
  messageId: string
  errorMessage?: string
  errorCode?: string
}

export type IOnData = (message: string, isFirstMessage: boolean, moreInfo: IOnDataMoreInfo) => void
export type IOnThought = (though: ThoughtItem) => void
export type IOnFile = (file: VisionFile) => void
export type IOnMessageEnd = (messageEnd: MessageEnd) => void
export type IOnMessageReplace = (messageReplace: MessageReplace) => void
export type IOnAnnotationReply = (messageReplace: AnnotationReply) => void
export type IOnCompleted = (hasError?: boolean, errorMessage?: string) => void
export type IOnError = (msg: string, code?: string) => void

export type IOnWorkflowStarted = (workflowStarted: WorkflowStartedResponse) => void
export type IOnWorkflowFinished = (workflowFinished: WorkflowFinishedResponse) => void
export type IOnNodeStarted = (nodeStarted: NodeStartedResponse) => void
export type IOnNodeFinished = (nodeFinished: NodeFinishedResponse) => void
export type IOnIterationStarted = (workflowStarted: IterationStartedResponse) => void
export type IOnIterationNext = (workflowStarted: IterationNextResponse) => void
export type IOnNodeRetry = (nodeFinished: NodeFinishedResponse) => void
export type IOnIterationFinished = (workflowFinished: IterationFinishedResponse) => void
export type IOnParallelBranchStarted = (parallelBranchStarted: ParallelBranchStartedResponse) => void
export type IOnParallelBranchFinished = (parallelBranchFinished: ParallelBranchFinishedResponse) => void
export type IOnTextChunk = (textChunk: TextChunkResponse) => void
export type IOnTTSChunk = (messageId: string, audioStr: string, audioType?: string) => void
export type IOnTTSEnd = (messageId: string, audioStr: string, audioType?: string) => void
export type IOnTextReplace = (textReplace: TextReplaceResponse) => void
export type IOnLoopStarted = (workflowStarted: LoopStartedResponse) => void
export type IOnLoopNext = (workflowStarted: LoopNextResponse) => void
export type IOnLoopFinished = (workflowFinished: LoopFinishedResponse) => void
export type IOnAgentLog = (agentLog: AgentLogResponse) => void

export type IOtherOptions = {
  isPublicAPI?: boolean
  isMarketplaceAPI?: boolean
  bodyStringify?: boolean
  needAllResponseContent?: boolean
  deleteContentType?: boolean
  silent?: boolean
  onData?: IOnData // for stream
  onThought?: IOnThought
  onFile?: IOnFile
  onMessageEnd?: IOnMessageEnd
  onMessageReplace?: IOnMessageReplace
  onError?: IOnError
  onCompleted?: IOnCompleted // for stream
  getAbortController?: (abortController: AbortController) => void

  onWorkflowStarted?: IOnWorkflowStarted
  onWorkflowFinished?: IOnWorkflowFinished
  onNodeStarted?: IOnNodeStarted
  onNodeFinished?: IOnNodeFinished
  onIterationStart?: IOnIterationStarted
  onIterationNext?: IOnIterationNext
  onIterationFinish?: IOnIterationFinished
  onNodeRetry?: IOnNodeRetry
  onParallelBranchStarted?: IOnParallelBranchStarted
  onParallelBranchFinished?: IOnParallelBranchFinished
  onTextChunk?: IOnTextChunk
  onTTSChunk?: IOnTTSChunk
  onTTSEnd?: IOnTTSEnd
  onTextReplace?: IOnTextReplace
  onLoopStart?: IOnLoopStarted
  onLoopNext?: IOnLoopNext
  onLoopFinish?: IOnLoopFinished
  onAgentLog?: IOnAgentLog
}

function unicodeToChar(text: string) {
  if (!text)
    return ''

  return text.replace(/\\u[0-9a-f]{4}/g, (_match, p1) => {
    return String.fromCharCode(Number.parseInt(p1, 16))
  })
}

export function format(text: string) {
  let res = text.trim()
  if (res.startsWith('\n'))
    res = res.replace('\n', '')

  return res.replaceAll('\n', '<br/>').replaceAll('```', '')
}

const handleStream = (
  response: Response,
  onData: IOnData,
  onCompleted?: IOnCompleted,
  onThought?: IOnThought,
  onMessageEnd?: IOnMessageEnd,
  onMessageReplace?: IOnMessageReplace,
  onFile?: IOnFile,
  onWorkflowStarted?: IOnWorkflowStarted,
  onWorkflowFinished?: IOnWorkflowFinished,
  onNodeStarted?: IOnNodeStarted,
  onNodeFinished?: IOnNodeFinished,
  onIterationStart?: IOnIterationStarted,
  onIterationNext?: IOnIterationNext,
  onIterationFinish?: IOnIterationFinished,
  onLoopStart?: IOnLoopStarted,
  onLoopNext?: IOnLoopNext,
  onLoopFinish?: IOnLoopFinished,
  onNodeRetry?: IOnNodeRetry,
  onParallelBranchStarted?: IOnParallelBranchStarted,
  onParallelBranchFinished?: IOnParallelBranchFinished,
  onTextChunk?: IOnTextChunk,
  onTTSChunk?: IOnTTSChunk,
  onTTSEnd?: IOnTTSEnd,
  onTextReplace?: IOnTextReplace,
  onAgentLog?: IOnAgentLog,
) => {
  if (!response.ok)
    throw new Error('Network response was not ok')

  const reader = response.body?.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  let bufferObj: Record<string, any>
  let isFirstMessage = true
  function read() {
    let hasError = false
    reader?.read().then((result: any) => {
      if (result.done) {
        onCompleted && onCompleted()
        return
      }
      buffer += decoder.decode(result.value, { stream: true })
      const lines = buffer.split('\n')
      try {
        lines.forEach((message) => {
          if (message.startsWith('data: ')) { // check if it starts with data:
            try {
              bufferObj = JSON.parse(message.substring(6)) as Record<string, any>// remove data: and parse as json
            }
            catch (e) {
              // mute handle message cut off
              onData('', isFirstMessage, {
                conversationId: bufferObj?.conversation_id,
                messageId: bufferObj?.message_id,
              })
              return
            }
            if (bufferObj.status === 400 || !bufferObj.event) {
              onData('', false, {
                conversationId: undefined,
                messageId: '',
                errorMessage: bufferObj?.message,
                errorCode: bufferObj?.code,
              })
              hasError = true
              onCompleted?.(true, bufferObj?.message)
              return
            }
            if (bufferObj.event === 'message' || bufferObj.event === 'agent_message') {
              // can not use format here. Because message is splitted.
              onData(unicodeToChar(bufferObj.answer), isFirstMessage, {
                conversationId: bufferObj.conversation_id,
                taskId: bufferObj.task_id,
                messageId: bufferObj.id,
              })
              isFirstMessage = false
            }
            else if (bufferObj.event === 'agent_thought') {
              onThought?.(bufferObj as ThoughtItem)
            }
            else if (bufferObj.event === 'message_file') {
              onFile?.(bufferObj as VisionFile)
            }
            else if (bufferObj.event === 'message_end') {
              onMessageEnd?.(bufferObj as MessageEnd)
            }
            else if (bufferObj.event === 'message_replace') {
              onMessageReplace?.(bufferObj as MessageReplace)
            }
            else if (bufferObj.event === 'workflow_started') {
              onWorkflowStarted?.(bufferObj as WorkflowStartedResponse)
            }
            else if (bufferObj.event === 'workflow_finished') {
              onWorkflowFinished?.(bufferObj as WorkflowFinishedResponse)
            }
            else if (bufferObj.event === 'node_started') {
              onNodeStarted?.(bufferObj as NodeStartedResponse)
            }
            else if (bufferObj.event === 'node_finished') {
              onNodeFinished?.(bufferObj as NodeFinishedResponse)
            }
            else if (bufferObj.event === 'iteration_started') {
              onIterationStart?.(bufferObj as IterationStartedResponse)
            }
            else if (bufferObj.event === 'iteration_next') {
              onIterationNext?.(bufferObj as IterationNextResponse)
            }
            else if (bufferObj.event === 'iteration_completed') {
              onIterationFinish?.(bufferObj as IterationFinishedResponse)
            }
            else if (bufferObj.event === 'loop_started') {
              onLoopStart?.(bufferObj as LoopStartedResponse)
            }
            else if (bufferObj.event === 'loop_next') {
              onLoopNext?.(bufferObj as LoopNextResponse)
            }
            else if (bufferObj.event === 'loop_completed') {
              onLoopFinish?.(bufferObj as LoopFinishedResponse)
            }
            else if (bufferObj.event === 'node_retry') {
              onNodeRetry?.(bufferObj as NodeFinishedResponse)
            }
            else if (bufferObj.event === 'parallel_branch_started') {
              onParallelBranchStarted?.(bufferObj as ParallelBranchStartedResponse)
            }
            else if (bufferObj.event === 'parallel_branch_finished') {
              onParallelBranchFinished?.(bufferObj as ParallelBranchFinishedResponse)
            }
            else if (bufferObj.event === 'text_chunk') {
              onTextChunk?.(bufferObj as TextChunkResponse)
            }
            else if (bufferObj.event === 'text_replace') {
              onTextReplace?.(bufferObj as TextReplaceResponse)
            }
            else if (bufferObj.event === 'agent_log') {
              onAgentLog?.(bufferObj as AgentLogResponse)
            }
            else if (bufferObj.event === 'tts_message') {
              onTTSChunk?.(bufferObj.message_id, bufferObj.audio, bufferObj.audio_type)
            }
            else if (bufferObj.event === 'tts_message_end') {
              onTTSEnd?.(bufferObj.message_id, bufferObj.audio)
            }
          }
        })
        buffer = lines[lines.length - 1]
      }
      catch (e) {
        onData('', false, {
          conversationId: undefined,
          messageId: '',
          errorMessage: `${e}`,
        })
        hasError = true
        onCompleted?.(true, e as string)
        return
      }
      if (!hasError)
        read()
    })
  }
  read()
}

export const upload = (options: any, searchParams?: string): Promise<any> => {
  const urlPrefix = PrefixV2
  const defaultOptions = {
    method: 'POST',
    url: `${urlPrefix}/files/upload` + (searchParams || ''),
    headers: {},
    data: {},
  }
  options = {
    ...defaultOptions,
    ...options,
    headers: { ...defaultOptions.headers, ...options.headers },
  }
  return new Promise((resolve, reject) => {
    const xhr = options.xhr
    xhr.open(options.method, options.url)
    for (const key in options.headers)
      xhr.setRequestHeader(key, options.headers[key])

    xhr.withCredentials = true
    xhr.responseType = 'json'
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200 || xhr.status === 201)
          resolve(xhr.response)
        else
          reject(xhr)
      }
    }
    xhr.upload.onprogress = options.onprogress
    xhr.send(options.data)
  })
}

export const ssePost = (
  url: string,
  fetchOptions: FetchOptionType,
  otherOptions: IOtherOptions,
) => {
  const {
    isPublicAPI = false,
    onData,
    onCompleted,
    onThought,
    onFile,
    onMessageEnd,
    onMessageReplace,
    onWorkflowStarted,
    onWorkflowFinished,
    onNodeStarted,
    onNodeFinished,
    onIterationStart,
    onIterationNext,
    onIterationFinish,
    onNodeRetry,
    onParallelBranchStarted,
    onParallelBranchFinished,
    onTextChunk,
    onTTSChunk,
    onTTSEnd,
    onTextReplace,
    onAgentLog,
    onError,
    getAbortController,
    onLoopStart,
    onLoopNext,
    onLoopFinish,
  } = otherOptions
  const abortController = new AbortController()

  const region = queryCurrentRegionInfo()
  const accessToken = getToken()

  const options = Object.assign({}, baseOptions, {
    method: 'POST',
    signal: abortController.signal,
    headers: new Headers({
      ...accessToken
    }),
  } as RequestInit, fetchOptions)

  const contentType = (options.headers as Headers).get('Content-Type')
  if (!contentType)
    (options.headers as Headers).set('Content-Type', ContentType.json)

  getAbortController?.(abortController)

  const urlPrefix = PrefixV2
  const urlWithPrefix = (url.startsWith('http://') || url.startsWith('https://'))
    ? url
    : `${urlPrefix}${url.startsWith('/') ? url : `/${url}`}`

  const { body } = options
  if (body)
    options.body = JSON.stringify(body)

  
  if (accessToken.authorization) {
    (options.headers as Headers).set('Authorization', accessToken.authorization)
  }
  if (region.regionId) {
    (options.headers as Headers).set('x-regionid', region.regionId)
  }

  globalThis.fetch(urlWithPrefix, options as RequestInit)
    .then((res) => {
      if (!/^(2|3)\d{2}$/.test(String(res.status))) {
        if (res.status === 401) {
          // refreshAccessTokenOrRelogin(TIME_OUT).then(() => {
          //   ssePost(url, fetchOptions, otherOptions)
          // }).catch(() => {
          //   res.json().then((data: any) => {
          //     if (isPublicAPI) {
          //       if (data.code === 'web_sso_auth_required')
          //         // requiredWebSSOLogin()
          //         console.error('need relogin')

          //       if (data.code === 'unauthorized') {
          //         removeAccessToken()
          //         globalThis.location.reload()
          //       }
          //     }
          //   })
          // })
          console.error('401 need relogin')
        }
        else {
          res.json().then((data) => {
            Toast.notify({ type: 'error', message: data.message || 'Server Error' })
          })
          onError?.('Server Error')
        }
        return
      }
      return handleStream(res, (str: string, isFirstMessage: boolean, moreInfo: IOnDataMoreInfo) => {
        if (moreInfo.errorMessage) {
          onError?.(moreInfo.errorMessage, moreInfo.errorCode)
          // TypeError: Cannot assign to read only property ... will happen in page leave, so it should be ignored.
          if (moreInfo.errorMessage !== 'AbortError: The user aborted a request.' && !moreInfo.errorMessage.includes('TypeError: Cannot assign to read only property'))
            Toast.notify({ type: 'error', message: moreInfo.errorMessage })
          return
        }
        onData?.(str, isFirstMessage, moreInfo)
      },
      onCompleted,
      onThought,
      onMessageEnd,
      onMessageReplace,
      onFile,
      onWorkflowStarted,
      onWorkflowFinished,
      onNodeStarted,
      onNodeFinished,
      onIterationStart,
      onIterationNext,
      onIterationFinish,
      onLoopStart,
      onLoopNext,
      onLoopFinish,
      onNodeRetry,
      onParallelBranchStarted,
      onParallelBranchFinished,
      onTextChunk,
      onTTSChunk,
      onTTSEnd,
      onTextReplace,
      onAgentLog,
      )
    }).catch((e) => {
      if (e.toString() !== 'AbortError: The user aborted a request.' && !e.toString().errorMessage.includes('TypeError: Cannot assign to read only property'))
        Toast.notify({ type: 'error', message: e })
      onError?.(e)
    })
}
