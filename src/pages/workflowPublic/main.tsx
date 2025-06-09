import React from 'react'
import { Initor } from '@/pages/workflowPublic/initor'
import Workflow from '@/pages/workflowPublic'
import '@/pages/workflowConfig/styles/index.css'
import '@/pages/workflowConfig/styles/markdown.scss'
import '@/pages/workflowConfig/styles/custom.scss'

function WorkflowPublic() {
  return (
    <Initor>
      <div className='w-full h-full overflow-x-auto public-content-wrapper'>
        <Workflow isWorkflow/>
      </div>
    </Initor>
  )
}

export default WorkflowPublic
