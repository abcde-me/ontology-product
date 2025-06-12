import React, { useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Initor } from '@/pages/workflowConfig/initor'
import Workflow from '@/pages/workflowConfig/workflow'
import { useStore } from '@/pages/workflowConfig/app/store'
import { createWorkflow, getWorkflowDetail } from '@/api/workflow'
import { useParams } from '@/utils/url'
import { useHistory } from 'react-router-dom'
import './styles/index.css'
import './styles/markdown.scss'
import './styles/custom.scss'

function WorkflowConfig() {
  const { setWorkflowDetail } = useStore(useShallow(state => ({
    setWorkflowDetail: state.setAppDetail,
  })))
  const [loading, setLoading] = useState(true)
  const appId = useParams('id')
  const history = useHistory()

  useEffect(() => {
    const init = async () => {
      if (appId) {
        const app = await getWorkflowDetail(appId)
        setWorkflowDetail(app.data)
        setLoading(false)
      } else {
        const app = await createWorkflow({ name: '新建工作流', mode: "workflow" })
        console.log('appappapp', app);
        history.push('/tenant/compute/modaforge/workflowConfig?id=' + app.data.id)
      }
    }
    init()
  }, [appId, history, setWorkflowDetail])

  return (
    <Initor>
      <div className='w-full h-full overflow-x-auto app-workflow-page'>
        {!loading && <Workflow />}
      </div>
    </Initor>
  )
}

export default WorkflowConfig
