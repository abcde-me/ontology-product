import React, { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Initor } from '@/pages/workflowConfig/initor';
import Workflow from '@/pages/workflowConfig/workflow';
import { useStore } from '@/pages/workflowConfig/task/store';
import { createWorkflow, getWorkflowDetail } from '@/api/workflow';
import { useParams } from '@/utils/url';
import { useHistory } from 'react-router-dom';
import { Message } from '@arco-design/web-react';
import Cookies from 'js-cookie';
import './styles/index.css';
import './styles/custom.scss';

function WorkflowConfig({ setHeight }) {
  const { setWorkflowDetail } = useStore(
    useShallow((state) => ({
      setWorkflowDetail: state.setWorkflowDetail
    }))
  );
  const [loading, setLoading] = useState(true);
  const appId = useParams('workflow_uuid');
  const workflowVersion = useParams('workflow_version');
  const history = useHistory();

  useEffect(() => {
    const init = async () => {
      if (appId) {
        const workflowDetailRes = await getWorkflowDetail(appId, {
          workflow_version: workflowVersion
        });

        if (workflowDetailRes?.data) {
          setWorkflowDetail(workflowDetailRes.data);
          setLoading(false);
        } else {
          Message.error(workflowDetailRes?.message ?? '获取工作流失败');
        }
      } else {
        const workflowInfo = await createWorkflow({
          workflow_name: `新建工作流_${Date.now()}`
        });

        if (workflowInfo?.data?.workflow_uuid) {
          const { workflow_uuid, ds_workflow_id } = workflowInfo.data;

          history.push(
            `/tenant/compute/modaforge/workflowConfig?workflow_uuid=${workflow_uuid}&ds_workflow_id=${ds_workflow_id}`
          );
        } else {
          Message.error(workflowInfo?.message ?? '创建工作流失败');
        }
      }
    };

    const isSessionId = Cookies.get('session_id');
    if (!isSessionId) {
      // 生成随机session_id
      const sessionId = generateSessionId();
      // 设置 cookie，过期时间为1周
      Cookies.set('session_id', sessionId, {
        expires: 7, // 7天
        sameSite: 'strict'
      });
    }

    init();
  }, [appId, history, setWorkflowDetail]);

  // 生成随机sessionId
  const generateSessionId = () => {
    // 生成随机数 (0-999999)
    const randomNum = Math.floor(Math.random() * 1000000);
    // 获取当前时间戳
    const timestamp = Date.now();
    const combinedString = `${randomNum}-${timestamp}`;

    return combinedString;
  };

  return (
    <Initor>
      <div
        className={`app-workflow-page h-full w-full overflow-x-auto ${setHeight ? 'setHeight' : ''}`}
      >
        {!loading && <Workflow />}
      </div>
    </Initor>
  );
}

export default WorkflowConfig;
