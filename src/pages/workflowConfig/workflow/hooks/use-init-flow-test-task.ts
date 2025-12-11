import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams as useSearchParam } from '@/utils/url';
import { useNodesSyncDraft } from '@/pages/workflowConfig/workflow/hooks/use-nodes-sync-draft';
import { useWorkflowStore } from '@/pages/workflowConfig/workflow/store';
import { useUserInfo } from '@/store/userInfoStore';
import { useStore as useTaskStore } from '@/pages/workflowConfig/task/store';
import { useShallow } from 'zustand/react/shallow';

export default function useInitFlowTestTask() {
  const workflow_uuid = useSearchParam('workflow_uuid');
  const ds_workflow_id = useSearchParam('ds_workflow_id');
  const workflowStore = useWorkflowStore();
  const userInfo = useUserInfo();
  const { nodesProcessDetail, setNodesProcessDetail } =
    workflowStore.getState();
  const { workflowDetail } = useTaskStore(
    useShallow((state) => ({
      setWorkflowDetail: state.setWorkflowDetail,
      workflowDetail: state.workflowDetail
    }))
  );
}
