import { useCallback } from 'react'
import produce from 'immer'
import { useStoreApi } from 'reactflow'
import {
  useStore,
  useWorkflowStore,
} from '../store'
import { BlockEnum } from '../types'
import { useWorkflowUpdate } from '../hooks'
import {
  useNodesReadOnly,
} from './use-workflow'
import { createWorkflowDraft } from '@/api/workflowV2'
import { PrefixV2 } from '@/api/endpoints'
import { useParams } from '@/utils/url'

export const useNodesSyncDraft = () => {
  const store = useStoreApi()
  const workflowStore = useWorkflowStore()

  const { getNodesReadOnly } = useNodesReadOnly()
  const { handleRefreshWorkflowDraft } = useWorkflowUpdate()
  const debouncedSyncWorkflowDraft = useStore(s => s.debouncedSyncWorkflowDraft)

  const appId = useParams('id')

  const getPostParams = useCallback(() => {
    const {
      getNodes,
      edges,
      transform,
    } = store.getState()
    const [x, y, zoom] = transform
    const {
      appId,
      conversationVariables,
      environmentVariables,
      syncWorkflowDraftHash,
    } = workflowStore.getState()

    if (appId) {
      const nodes = getNodes()
      const hasStartNode = nodes.find(node => node.data.type === BlockEnum.Start)

      if (!hasStartNode)
        return

      const features = {} as any
      const producedNodes = produce(nodes, (draft) => {
        draft.forEach((node) => {
          Object.keys(node.data).forEach((key) => {
            if (key.startsWith('_'))
              delete node.data[key]
          })
        })
      })
      const producedEdges = produce(edges, (draft) => {
        draft.forEach((edge) => {
          Object.keys(edge.data).forEach((key) => {
            if (key.startsWith('_'))
              delete edge.data[key]
          })
        })
      })
      return {
        params: {
          graph: {
            nodes: producedNodes,
            edges: producedEdges,
            viewport: {
              x,
              y,
              zoom,
            },
          },
          features: {
            opening_statement: features.opening?.enabled ? (features.opening?.opening_statement || '') : '',
            suggested_questions: features.opening?.enabled ? (features.opening?.suggested_questions || []) : [],
            suggested_questions_after_answer: features.suggested,
            text_to_speech: features.text2speech,
            speech_to_text: features.speech2text,
            retriever_resource: features.citation,
            sensitive_word_avoidance: features.moderation,
            file_upload: features.file,
          },
          environment_variables: environmentVariables,
          conversation_variables: conversationVariables,
          hash: syncWorkflowDraftHash,
        },
      }
    }
  }, [store, workflowStore])

  const syncWorkflowDraftWhenPageClose = useCallback(() => {
    if (getNodesReadOnly())
      return
    const postParams = getPostParams()
    if (postParams) {
      navigator.sendBeacon(
        `${PrefixV2}/apps/${appId}/workflows/draft`,
        JSON.stringify(postParams.params),
      )
    }
  }, [getPostParams, appId, getNodesReadOnly])

  const doSyncWorkflowDraft = useCallback(async (
    notRefreshWhenSyncError?: boolean,
    callback?: {
      onSuccess?: () => void
      onError?: () => void
      onSettled?: () => void
    },
  ) => {
    if (getNodesReadOnly())
      return
    const postParams = getPostParams()

    if (postParams) {
      const {
        setSyncWorkflowDraftHash,
        setDraftUpdatedAt,
      } = workflowStore.getState()
      try {
        const { data: res } = await createWorkflowDraft(appId, postParams.params)
        setSyncWorkflowDraftHash(res.hash)
        setDraftUpdatedAt(res.updated_at)
        callback?.onSuccess && callback.onSuccess()
      }
      catch (error: any) {
        if (error && error.json && !error.bodyUsed) {
          error.json().then((err: any) => {
            if (err.code === 'draft_workflow_not_sync' && !notRefreshWhenSyncError)
              handleRefreshWorkflowDraft()
          })
        }
        callback?.onError && callback.onError()
      }
      finally {
        callback?.onSettled && callback.onSettled()
      }
    }
  }, [appId, workflowStore, getPostParams, getNodesReadOnly, handleRefreshWorkflowDraft])

  const handleSyncWorkflowDraft = useCallback((
    sync?: boolean,
    notRefreshWhenSyncError?: boolean,
    callback?: {
      onSuccess?: () => void
      onError?: () => void
      onSettled?: () => void
    },
  ) => {
    if (getNodesReadOnly())
      return

    if (sync)
      doSyncWorkflowDraft(notRefreshWhenSyncError, callback)
    else
      debouncedSyncWorkflowDraft(doSyncWorkflowDraft)
  }, [debouncedSyncWorkflowDraft, doSyncWorkflowDraft, getNodesReadOnly])

  return {
    doSyncWorkflowDraft,
    handleSyncWorkflowDraft,
    syncWorkflowDraftWhenPageClose,
  }
}
