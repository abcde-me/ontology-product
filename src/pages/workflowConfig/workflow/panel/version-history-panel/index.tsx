import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RiArrowDownDoubleLine, RiCloseLine, RiLoader2Line } from '@remixicon/react'
import { useNodesSyncDraft, useWorkflowRun } from '../../hooks'
import { useStore, useWorkflowStore } from '../../store'
import { VersionHistoryContextMenuOptions, WorkflowVersionFilterOptions } from '../../types'
import VersionHistoryItem from './version-history-item'
// import Filter from './filter'
import type { VersionHistory } from '@/pages/workflowConfig/types/workflow'
import { useStore as useAppStore } from '@/pages/workflowConfig/app/store'
// import Divider from '@/pages/workflowConfig/components/divider'
import Loading from './loading'
import Empty from './empty'
import { useSelector as useAppContextSelector } from '@/pages/workflowConfig/context/app-context'
import RestoreConfirmModal from './restore-confirm-modal'
import DeleteConfirmModal from './delete-confirm-modal'
import VersionInfoModal from '@/pages/workflowConfig/app/app-publisher/version-info-modal'
import Toast from '@/pages/workflowConfig/components/toast'
import { getWorkflowPublishHistory, updateWorkflowPublishDetail, deleteWorkflowPublish } from '@/api/workflowV2'

const VersionHistoryPanel = () => {
  const [filterValue, setFilterValue] = useState(WorkflowVersionFilterOptions.all)
  const [isOnlyShowNamedVersions, setIsOnlyShowNamedVersions] = useState(false)
  const [operatedItem, setOperatedItem] = useState<VersionHistory>()
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const workflowStore = useWorkflowStore()
  const { handleSyncWorkflowDraft } = useNodesSyncDraft()
  const { handleRestoreFromPublishedWorkflow, handleLoadBackupDraft } = useWorkflowRun()
  const appDetail = useAppStore.getState().appDetail
  const setShowWorkflowVersionHistoryPanel = useStore(s => s.setShowWorkflowVersionHistoryPanel)
  const currentVersion = useStore(s => s.currentVersion)
  const setCurrentVersion = useStore(s => s.setCurrentVersion)
  const publishedAt = useStore(s => s.publishedAt)
  const userProfile = useAppContextSelector(s => s.userProfile)
  const { t } = useTranslation('plugin__console-plugin-appforge')

  const [versionHistory, setVersionHistory] = useState({pages: []})
  const [hasNextPage, setHasNextPage] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const page = useRef(1)

  const fetchNextPage = useCallback(async() => {
    setIsFetching(true)
    const { data: res } = await getWorkflowPublishHistory(appDetail.id, { page: page.current, limit: 10 })
    page.current++
    setVersionHistory(v => ({ pages: [...v.pages, {items: res.data}] }))
    setHasNextPage(res.page * res.limit < res.total)
    setIsFetching(false)
  },[appDetail.id])

  const handleVersionClick = useCallback((item: VersionHistory) => {
    if (item.id !== currentVersion?.id) {
      setCurrentVersion(item)
      handleRestoreFromPublishedWorkflow(item)
    }
  }, [currentVersion?.id, setCurrentVersion, handleRestoreFromPublishedWorkflow])

  const handleNextPage = () => {
    if (hasNextPage)
      fetchNextPage()
  }

  const handleClose = () => {
    handleLoadBackupDraft()
    workflowStore.setState({ isRestoring: false })
    setShowWorkflowVersionHistoryPanel(false)
  }

  const handleClickFilterItem = useCallback((value: WorkflowVersionFilterOptions) => {
    setFilterValue(value)
  }, [])

  const handleSwitch = useCallback((value: boolean) => {
    setIsOnlyShowNamedVersions(value)
  }, [])

  const handleResetFilter = useCallback(() => {
    setFilterValue(WorkflowVersionFilterOptions.all)
    setIsOnlyShowNamedVersions(false)
  }, [])

  const handleClickMenuItem = useCallback((item: VersionHistory, operation: VersionHistoryContextMenuOptions) => {
    setOperatedItem(item)
    switch (operation) {
      case VersionHistoryContextMenuOptions.restore:
        setRestoreConfirmOpen(true)
        break
      case VersionHistoryContextMenuOptions.edit:
        setEditModalOpen(true)
        break
      case VersionHistoryContextMenuOptions.delete:
        setDeleteConfirmOpen(true)
        break
    }
  }, [])

  const handleCancel = useCallback((operation: VersionHistoryContextMenuOptions) => {
    switch (operation) {
      case VersionHistoryContextMenuOptions.restore:
        setRestoreConfirmOpen(false)
        break
      case VersionHistoryContextMenuOptions.edit:
        setEditModalOpen(false)
        break
      case VersionHistoryContextMenuOptions.delete:
        setDeleteConfirmOpen(false)
        break
    }
  }, [])

  const resetWorkflowVersionHistory = useCallback(() => {
    page.current = 1
    setVersionHistory({ pages: [] })
    fetchNextPage()
  },[fetchNextPage])

  const handleRestore = useCallback((item: VersionHistory) => {
    setShowWorkflowVersionHistoryPanel(false)
    handleRestoreFromPublishedWorkflow(item)
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
  }, [setShowWorkflowVersionHistoryPanel, handleSyncWorkflowDraft, workflowStore, handleRestoreFromPublishedWorkflow, resetWorkflowVersionHistory, t])

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteWorkflowPublish(appDetail.id, id)
      setDeleteConfirmOpen(false)
      Toast.notify({
        type: 'success',
        message: t('workflow.versionHistory.action.deleteSuccess'),
      })
      resetWorkflowVersionHistory()
    } catch {
      Toast.notify({
        type: 'error',
        message: t('workflow.versionHistory.action.deleteFailure'),
      })
    } finally {
      setDeleteConfirmOpen(false)
    }
  }, [appDetail.id, t, resetWorkflowVersionHistory])

  const handleUpdateWorkflow = useCallback(async (params: { id?: string, title: string, releaseNotes: string }) => {
    try {
      await updateWorkflowPublishDetail(appDetail.id, params.id, {marked_name: params.title, marked_comment: params.releaseNotes})
      setEditModalOpen(false)
      Toast.notify({
        type: 'success',
        message: t('workflow.versionHistory.action.updateSuccess'),
      })
      setVersionHistory(v => {
        const result: any[] = []
        v.pages.forEach(p => {
          p.items.forEach((i: any) => {
            if (i.id === params.id) {
              i.marked_name = params.title
              i.marked_comment = params.releaseNotes
            }
          })
          result.push(p)
        })
        return { pages: result }
      })
    } catch {
      Toast.notify({
        type: 'error',
        message: t('workflow.versionHistory.action.updateFailure'),
      })
    } finally {
      setEditModalOpen(false)
    }

  }, [appDetail.id, t])

  useEffect(() => {
    page.current = 1
    setVersionHistory({ pages: [] })
    fetchNextPage()
  }, [publishedAt, fetchNextPage])

  return (
    <div className='view-history-panel flex flex-col w-[240px] bg-components-panel-bg rounded-[12px] border-y-[0.5px] border-l-[0.5px] border-components-panel-border shadow-xl shadow-shadow-shadow-5'>
      <div className='flex items-center gap-x-2 px-[16px] pt-[20px] h-[64px]'>
        <div className='flex-1 py-1 text-text-primary system-xl-semibold'>{t('workflow.versionHistory.title')}</div>
        {/* <Filter
          filterValue={filterValue}
          isOnlyShowNamedVersions={isOnlyShowNamedVersions}
          onClickFilterItem={handleClickFilterItem}
          handleSwitch={handleSwitch}
        />
        <Divider type='vertical' className='h-3.5 mx-1' /> */}
        <div
          className='flex items-center justify-center w-6 h-6 p-0.5 cursor-pointer'
          onClick={handleClose}
        >
          <RiCloseLine className='size-[16px] text-text-tertiary' />
        </div>
      </div>
      <div className="flex-1 relative px-3 py-2 overflow-y-auto">
        {(isFetching && !versionHistory?.pages?.length)
          ? (
            <Loading />
          )
          : (
            <>
              {versionHistory?.pages?.map((page, pageNumber) => (
                page.items?.map((item, idx) => {
                  const isLast = pageNumber === versionHistory.pages.length - 1 && idx === page.items.length - 1
                  return <VersionHistoryItem
                    key={item.id}
                    item={item}
                    currentVersion={currentVersion}
                    latestVersionId={appDetail.workflow?.id}
                    onClick={handleVersionClick}
                    handleClickMenuItem={handleClickMenuItem.bind(null, item)}
                    isLast={isLast}
                  />
                })
              ))}
              {hasNextPage && (
                <div className='flex absolute bottom-2 left-2 p-2'>
                  <div
                    className='flex items-center gap-x-1 cursor-pointer'
                    onClick={handleNextPage}
                  >
                    <div className='flex item-center justify-center p-0.5'>
                      {
                        isFetching
                          ? <RiLoader2Line className='w-3.5 h-3.5 text-text-accent animate-spin' />
                          : <RiArrowDownDoubleLine className='w-3.5 h-3.5 text-text-accent' />}
                    </div>
                    <div className='py-[1px] text-text-accent system-xs-medium-uppercase'>
                      {t('workflow.common.loadMore')}
                    </div>
                  </div>
                </div>
              )}
              {!isFetching && (!versionHistory?.pages?.length || !versionHistory.pages[0].items.length) && (
                <Empty onResetFilter={handleResetFilter} />
              )}
            </>
          )}
      </div>
      {restoreConfirmOpen && (<RestoreConfirmModal
        isOpen={restoreConfirmOpen}
        versionInfo={operatedItem!}
        onClose={handleCancel.bind(null, VersionHistoryContextMenuOptions.restore)}
        onRestore={handleRestore}
      />)}
      {deleteConfirmOpen && (<DeleteConfirmModal
        isOpen={deleteConfirmOpen}
        versionInfo={operatedItem!}
        onClose={handleCancel.bind(null, VersionHistoryContextMenuOptions.delete)}
        onDelete={handleDelete}
      />)}
      {editModalOpen && (<VersionInfoModal
        isOpen={editModalOpen}
        versionInfo={operatedItem}
        onClose={handleCancel.bind(null, VersionHistoryContextMenuOptions.edit)}
        onPublish={handleUpdateWorkflow}
      />)}
    </div>
  )
}

export default React.memo(VersionHistoryPanel)
