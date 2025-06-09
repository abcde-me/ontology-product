import { useStore } from './store'
import React from 'react'

const SyncingDataModal = () => {
  const isSyncingWorkflowDraft = useStore(s => s.isSyncingWorkflowDraft)

  if (!isSyncingWorkflowDraft)
    return null

  return (
    <div className='absolute inset-0 z-[9999] syncing-data-modal'>
    </div>
  )
}

export default SyncingDataModal
