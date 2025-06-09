import React, { useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Spin } from '@arco-design/web-react';
import { Initor } from '@/pages/workflowConfig/initor'
import Workflow from '@/pages/workflowConfig/workflow'
import { useStore } from '@/pages/workflowConfig/app/store'
import { createApp, getAppDetail } from '@/api/appsV2'
import { useParams } from '@/utils/url'
import { useHistory } from 'react-router-dom'
import './styles/index.css'
import './styles/markdown.scss'
import './styles/custom.scss'

function WorkflowConfig() {
  const { setAppDetail } = useStore(useShallow(state => ({
    setAppDetail: state.setAppDetail,
  })))
  const [loading, setLoading] = useState(true)
  const appId = useParams('id')
  const history = useHistory()
  
  useEffect(() => {
    const init = async () => {
      if (appId) {
        const app = await getAppDetail(appId)
        setAppDetail(app.data)
        setLoading(false)
      } else {
        const app = await createApp({ name: '新建工作流', mode: "workflow" })
        history.push('/tenant/compute/appforge/workflowConfig?id=' + app.data.id)
      }
    }
    init()
  }, [appId, setAppDetail, history])

  return (
    <Initor>
      <div className='w-full h-full overflow-x-auto app-workflow-page'>
        {!loading && <Workflow />}
      </div>
    </Initor>
  )
}

export default WorkflowConfig
