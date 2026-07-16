import UAPI from '@/api';
import type { WorkflowDraft } from '../../types';

export interface FetchWorkflowDraftParams {
  processId: string;
}

export interface SaveWorkflowDraftParams {
  processId: string;
  dagInfo: WorkflowDraft;
}

export const fetchWorkflowDraft = async (params: FetchWorkflowDraftParams) => {
  const response = await UAPI.RES.workflowDraft({})
    .post({
      process_id: params.processId
    })
    .inRegion()
    .do();

  return response;
};

export const saveWorkflowDraft = async (params: SaveWorkflowDraftParams) => {
  const response = await UAPI.RES.editWorkFlowDraft({})
    .post({
      process_id: params.processId,
      dag_info: params.dagInfo
    })
    .inRegion()
    .do();

  return response;
};

export const createWorkflowProcess = async (params: {
  name: string;
  description?: string;
}) => {
  const response = await UAPI.RES.createWorkflow({})
    .post(params)
    .inRegion()
    .do();

  return response;
};

export const updateWorkflowProcess = async (params: {
  process_id: string;
  name?: string;
  description?: string;
}) => {
  const response = await UAPI.RES.editWorkflow({}).post(params).inRegion().do();

  return response;
};
