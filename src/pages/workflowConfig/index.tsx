import React, { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Initor } from '@/pages/workflowConfig/initor';
import Workflow from '@/pages/workflowConfig/workflow';
import { useStore } from '@/pages/workflowConfig/task/store';
import { createWorkflow, getWorkflowDetail } from '@/api/workflow';
import { useParams } from '@/utils/url';
import { useHistory } from 'react-router-dom';
import './styles/index.css';
import './styles/markdown.scss';
import './styles/custom.scss';

function WorkflowConfig({ setHeight }) {
  const { setWorkflowDetail } = useStore(
    useShallow((state) => ({
      setWorkflowDetail: state.setWorkflowDetail
    }))
  );
  const [loading, setLoading] = useState(true);
  const appId = useParams('workflow_uuid');
  const history = useHistory();

  useEffect(() => {
    const init = async () => {
      if (appId) {
        const workflowDetailRes = await getWorkflowDetail(appId);

        if (workflowDetailRes?.data) {
          setWorkflowDetail(workflowDetailRes.data);
        }

        setLoading(false);
      } else {
        const workflowInfo = await createWorkflow({
          workflow_name: '新建工作流'
        });

        if (workflowInfo?.data?.[0]?.workflow_uuid) {
          const { workflow_uuid, ds_workflow_id } = workflowInfo.data[0];
          history.push(
            `/tenant/compute/modaforge/workflowConfig?workflow_uuid=${workflow_uuid}&ds_workflow_id=${ds_workflow_id}`
          );
        }
      }
    };
    init();
  }, [appId, history, setWorkflowDetail]);

  return (
    <Initor>
      <div className={`app-workflow-page h-full w-full overflow-x-auto ${setHeight ? 'setHeight' : ''}`}>
        {!loading && <Workflow />}
      </div>
    </Initor>
  );
}

export default WorkflowConfig;
