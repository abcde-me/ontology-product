import { FC } from 'react'
import React, {
  memo,
} from 'react'

import {
  useWorkflowMode,
} from '../hooks'
import EditingTitle from '../header/editing-title'
import RunningTitle from '../header/running-title'
import RestoringTitle from '../header/restoring-title'

const Footer: FC = () => {
  const {
    normal,
    restoring,
    viewHistory,
  } = useWorkflowMode()


  return (
    <div
      className='app-workflow-page-footer z-10 flex items-center gap-x-[20px] w-full px-3 h-14 bg-mask-top2bottom-gray-50-to-transparent'
    >
      {
        normal && <EditingTitle />
      }
      {
        viewHistory && <RunningTitle />
      }
      {
        restoring && <RestoringTitle />
      } 
    </div>
  )
}

export default memo(Footer)
