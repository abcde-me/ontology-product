import type {
  IOnCompleted,
  IOnData,
  IOnError,
  IOnIterationFinished,
  IOnIterationNext,
  IOnIterationStarted,
  IOnLoopFinished,
  IOnLoopNext,
  IOnLoopStarted,
  IOnMessageReplace,
  IOnNodeFinished,
  IOnNodeStarted,
  IOnTextChunk,
  IOnTextReplace,
  IOnWorkflowFinished,
  IOnWorkflowStarted,
} from './base'
import {
  ssePost,
} from './base'

export function getUrl(url: string, isInstalledApp: boolean, installedAppId: string) {
  return isInstalledApp ? `installed-apps/${installedAppId}/${url.startsWith('/') ? url.slice(1) : url}` : url
}

export const sendCompletionMessage = async (body: Record<string, any>, { onData, onCompleted, onError, onMessageReplace }: {
  onData: IOnData
  onCompleted: IOnCompleted
  onError: IOnError
  onMessageReplace: IOnMessageReplace
}, isInstalledApp: boolean, installedAppId = '') => {
  return ssePost(getUrl('completion-messages', isInstalledApp, installedAppId), {
    body: {
      ...body,
      response_mode: 'streaming',
    },
  }, { onData, onCompleted, isPublicAPI: !isInstalledApp, onError, onMessageReplace })
}

export const sendWorkflowMessage = async (
  body: Record<string, any>,
  {
    onWorkflowStarted,
    onNodeStarted,
    onNodeFinished,
    onWorkflowFinished,
    onIterationStart,
    onIterationNext,
    onIterationFinish,
    onLoopStart,
    onLoopNext,
    onLoopFinish,
    onTextChunk,
    onTextReplace,
  }: {
    onWorkflowStarted: IOnWorkflowStarted
    onNodeStarted: IOnNodeStarted
    onNodeFinished: IOnNodeFinished
    onWorkflowFinished: IOnWorkflowFinished
    onIterationStart: IOnIterationStarted
    onIterationNext: IOnIterationNext
    onIterationFinish: IOnIterationFinished
    onLoopStart: IOnLoopStarted
    onLoopNext: IOnLoopNext
    onLoopFinish: IOnLoopFinished
    onTextChunk: IOnTextChunk
    onTextReplace: IOnTextReplace
  },
  isInstalledApp: boolean,
  installedAppId = '',
) => {
  // return ssePost(getUrl('workflows/run', isInstalledApp, installedAppId), {
  return ssePost('/workflows/run', {
    body: {
      ...body,
      response_mode: 'streaming',
    },
  }, {
    onNodeStarted,
    onWorkflowStarted,
    onWorkflowFinished,
    isPublicAPI: !isInstalledApp,
    onNodeFinished,
    onIterationStart,
    onIterationNext,
    onIterationFinish,
    onLoopStart,
    onLoopNext,
    onLoopFinish,
    onTextChunk,
    onTextReplace,
  })
}

