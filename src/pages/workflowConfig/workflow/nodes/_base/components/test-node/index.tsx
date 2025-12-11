import React, { memo, useMemo } from 'react';
import { IconCaretRight } from '@arco-design/web-react/icon';
import { editWorkflow, operateWorkflow } from '@/api/workflow';
import { WorkflowOperation } from '@/types/workflowApi';
import { useParams as useSearchParam } from '@/utils/url';
import { useUserInfo } from '@/store/userInfoStore';
import { Message } from '@arco-design/web-react';
import { useWorkflowStore } from '@/pages/workflowConfig/workflow/store';
import { useStore as useTaskStore } from '@/pages/workflowConfig/task/store';
import { useShallow } from 'zustand/react/shallow';
import { createWorkflowDraft } from '@/api/workflowV2';
import { useNodesSyncDraft } from '@/pages/workflowConfig/workflow/hooks';

export default memo(function TestNode(props: { id: React.Key }) {
  const workflow_uuid = useSearchParam('workflow_uuid');
  const ds_workflow_id = useSearchParam('ds_workflow_id');
  const { doSyncWorkflowDraft } = useNodesSyncDraft();
  const workflowStore = useWorkflowStore();
  const userInfo = useUserInfo();
  const { nodesProcessDetail } = workflowStore.getState();
  const { workflowDetail } = useTaskStore(
    useShallow((state) => ({
      setWorkflowDetail: state.setWorkflowDetail,
      workflowDetail: state.workflowDetail
    }))
  );

  const nodeProcessStatus = useMemo(() => {
    return nodesProcessDetail.find(({ task_code }) => {
      return task_code === props.id;
    });
  }, [props.id, nodesProcessDetail]);

  const testNode = () => {
    doSyncWorkflowDraft(
      false,
      {
        onSuccess(res) {
          operateWorkflow({
            op: WorkflowOperation.RUNNING,
            start_node: props.id,
            // 后端需要这个id是number类型，接口返回是字符串，后端改了前端也得改，所以前端强转
            ds_workflow_id: res?.ds_workflow_id ? +res.ds_workflow_id : 0,
            uid: userInfo?.id ?? '',
            workflow_uuid: workflow_uuid ?? ''
          })
            .then((res) => {
              if (!res.data) {
                return Promise.reject(res.message);
              }
              Message.success('开始测试');
            })
            .catch((e) => {
              Message.error(e);
              console.error(e);
            });
        }
      },
      {
        version: 'publish'
      }
    );
  };

  return (
    <IconCaretRight
      className={'h-4 w-4 cursor-pointer text-text-tertiary'}
      onClick={testNode}
    />
  );
});
