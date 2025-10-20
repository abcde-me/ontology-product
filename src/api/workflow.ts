import {
  CreateWorkflowParams,
  CreateWorkflowRes,
  WorkflowDetailRes,
  WorkflowOperationParams,
  WorkflowOperation,
  WorkflowDetailParams,
  EditWorkflowParams
} from '@/types/workflowApi';
import UAPI from '@/api';

// 创建工作流
export async function createWorkflow(
  params: CreateWorkflowParams
): Promise<ApiRes<CreateWorkflowRes>> {
  return await UAPI.RES.createWorkflow({}).post(params).inRegion().do();
}

// 编辑工作流
export async function editWorkflow(
  params: EditWorkflowParams
): Promise<ApiRes<CreateWorkflowRes>> {
  return await UAPI.RES.editWorkflow({}).post(params).inRegion().do();
}

// 获取工作流详情
export async function getWorkflowDetail(
  params: WorkflowDetailParams
): Promise<ApiRes<WorkflowDetailRes>> {
  return await UAPI.RES.workflowDetail({}).post(params).inRegion().do();
}

// 工作流操作（上下线、运行）
export async function operateWorkflow(params: WorkflowOperationParams) {
  return UAPI.RES.workflowOperation({}).post(params).inRegion().do();
}

// 获取结束节点目标目录
export async function getWorkflowTargetPath(
  root_type: number, // 0: 获取所有数据目录，1: 获取源数据目录，2：获取目标数据目录
  search: string
) {
  return await UAPI.RES.workflowTargetPath({ root_type, search })
    .post({
      root_type,
      search
    })
    .inRegion()
    .do();
}

// 工作流-脚本类型
export async function getScriptingType() {
  return await UAPI.RES.scriptingType({}).post({}).inRegion().do();
}
// 工作流-脚本执行器列表
export async function getScriptingEngine(script_type: string) {
  return await UAPI.RES.scriptingEngine({ script_type })
    .post({
      script_type
    })
    .inRegion()
    .do();
}
// 工作流-脚本模板
export async function getScriptingTemplate(
  workflow_uuid: string,
  node_id: string
) {
  return await UAPI.RES.scriptingTemplate({})
    .post({
      id: workflow_uuid,
      node_id
    })
    .inRegion()
    .do();
}
// 工作流-脚本运行
export async function scriptingBench(
  workflow_uuid: string,
  session_id: string,
  node_id: string,
  params
) {
  return await UAPI.RES.scriptingBench({})
    .post({
      workflow_uuid,
      session_id,
      node_id,
      ...(params ?? {})
    })
    .inRegion()
    .do();
}
// 工作流-脚本运行结果
export async function scriptingBenchResult(
  workflow_uuid: string,
  session_id: string,
  node_id: string,
  bench_job_id: string
) {
  return await UAPI.RES.scriptingBenchResult({})
    .post({
      workflow_uuid,
      session_id,
      node_id,
      bench_job_id
    })
    .inRegion()
    .do();
}

// 工作流-脚本运行中止
export async function scriptingBenchCancel(
  workflow_uuid: string,
  session_id: string,
  node_id: string,
  bench_job_id: string
) {
  return await UAPI.RES.scriptingBenchResult({})
    .post({
      workflow_uuid,
      session_id,
      node_id,
      bench_job_id
    })
    .inRegion()
    .do();
}

// 工作流-知识库名称校验
export async function knowledgeBaseNameCheck(params: {
  knowledgeName: string;
  userId: string;
  dsWorkflowUuid: string;
}) {
  return await UAPI.RES.knowledgeBaseNameCheck({}).post(params).inRegion().do();
}
