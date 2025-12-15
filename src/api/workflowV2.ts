import UAPI from '@/api';
import { getModels, getModelsGroupByProvider, getProviders } from './modelV2';
import {
  SQLScriptItem,
  SQLVersion
} from '@/pages/workflowConfig/workflow/nodes/sql-node/types';
import React from 'react';
import { WorkflowRunTask } from '@/pages/workflowConfig/types/workflow';
import { NodeProcessData } from '@/pages/workflowConfig/workflow/types';

export async function getWorkflowDraft(params: any = {}) {
  const searchParams = new URLSearchParams(location.search);
  const workflowUUID = params.workflowUUID || searchParams.get('workflow_uuid');
  const dsWorkflowId =
    params.dsWorkflowId || searchParams.get('ds_workflow_id');
  const workflowVersion =
    params.workflowVersion || searchParams.get('workflow_version') || '';
  return UAPI.RES.workflowDraft({})
    .post({
      workflow_uuid: workflowUUID,
      ds_workflow_id: dsWorkflowId,
      workflow_version: workflowVersion
    })
    .inRegion()
    .do();
}

export function createWorkflowDraft(params: any = {}) {
  const searchParams = new URLSearchParams(location.search);
  const workflowUUID = params.workflowUUID || searchParams.get('workflow_uuid');
  const dsWorkflowId =
    params.dsWorkflowId || searchParams.get('ds_workflow_id');
  const workflowVersion =
    params.workflowVersion || searchParams.get('workflow_version') || 0;
  return UAPI.RES.editWorkFlowDraft({})
    .post({
      workflow_uuid: workflowUUID,
      ds_workflow_id: dsWorkflowId,
      workflow_version: workflowVersion,
      ...(params ?? {})
    })
    .inRegion()
    .do();
}

export async function publishWorkflow(appId: string, params: any = {}) {
  return UAPI.RES.workflowPublish({ appId }).post(params).inRegion().do();
}

export async function getWorkflowPublish(appId: string, params: any = {}) {
  return UAPI.RES.workflowPublish({ appId }).get(params).inRegion().do();
}

export async function getWorkflowPublishHistory(
  appId: string | number,
  params: any = {}
) {
  return UAPI.RES.workflowPublishHistory({ appId }).get(params).inRegion().do();
}

export async function getWorkflowBlockConfig(appId: string, params: any = {}) {
  return UAPI.RES.workflowBlockConfig({ appId }).get(params).inRegion().do();
}

export async function updateWorkflowPublishDetail(
  appId: string,
  workflowId: string,
  params: any = {}
) {
  return UAPI.RES.workflowPublishDetail({ appId, workflowId })
    .patch(params)
    .inRegion()
    .do();
}

export async function deleteWorkflowPublish(
  appId: string,
  workflowId: string,
  params: any = {}
) {
  return UAPI.RES.workflowPublishDetail({ appId, workflowId })
    .delete()
    .inRegion()
    .do();
}

export async function getWorkflowPublishParams(
  appId: string,
  params: any = {}
) {
  return UAPI.RES.workflowPublishParam({ appId }).get(params).inRegion().do();
}

export async function getDifyModelList(type?: any) {
  const modelsList = await getModelsGroupByProvider();
  let result = type
    ? modelsList.map((m) => ({
        ...m,
        models: m.models.filter((model) => model.model_type === type)
      }))
    : modelsList;
  result = result.map((r) => {
    return {
      tenant_id: r.provider_id,
      provider: r.provider_name,
      label: {
        zh_Hans: r.provider_name,
        en_US: r.provider_name
      },
      icon_small: {
        zh_Hans: r.provider_icon_base64,
        en_US: r.provider_icon_base64
      },
      icon_large: {
        zh_Hans: r.provider_icon_base64,
        en_US: r.provider_icon_base64
      },
      status: 'active',
      models: r.models.map((m) => ({
        model: m.model_name,
        label: {
          zh_Hans: m.model_name,
          en_US: m.model_name
        },
        model_type: m.model_type,
        features: [
          m.credentials.agent_though_support === 'supported'
            ? 'agent-thought'
            : '',
          m.credentials.vision_support === 'support' ? 'vision' : ''
        ].filter(Boolean),
        fetch_from: 'predefined-model',
        model_properties: {
          context_size: +m.credentials.context_size,
          mode: m.credentials.mode
        },
        deprecated: false,
        status: 'active',
        load_balancing_enabled: false
      }))
    };
  });
  // console.log('getDifyModelList', result)
  return result;
}

export async function getDifyDefaultModel(type: any) {
  const { data: modelsList } = await getModels({ model_type: type });
  let result = modelsList?.data?.length ? modelsList.data[0] : {};
  result = {
    model: result.model_name,
    model_type: result.model_type,
    provider: {
      provider: result.provider_name,
      label: {
        zh_Hans: result.provider_name,
        en_US: result.provider_name
      },
      icon_small: {
        zh_Hans: result.provider_icon_base64,
        en_US: result.provider_icon_base64
      },
      icon_large: {
        zh_Hans: result.provider_icon_base64,
        en_US: result.provider_icon_base64
      },
      supported_model_types: result.support_model_types || [],
      models: [],
      tenant_id: result.provider_id
    }
  };
  console.log('getDifyDefaultModel', result);
  return result;
}

export async function getDifyProversList() {
  const { data: providers } = await getProviders();
  const result = providers.data.map((p) => ({
    tenant_id: p.id,
    provider: p.name,
    label: {
      zh_Hans: p.name,
      en_US: p.name
    },
    description: {
      zh_Hans: p.name,
      en_US: p.name
    },
    icon_small: {
      zh_Hans: p.icon_base64,
      en_US: p.icon_base64
    },
    icon_large: {
      zh_Hans: p.icon_base64,
      en_US: p.icon_base64
    },
    background: '#EFF1FE',
    help: {},
    supported_model_types: p.support_model_types,
    configurate_methods: ['predefined-model'],
    provider_credential_schema: { credential_form_schemas: [] },
    model_credential_schema: { model: {}, credential_form_schemas: [] },
    preferred_provider_type: 'custom',
    custom_configuration: {
      status: 'active'
    },
    system_configuration: {
      enabled: false,
      current_quota_type: null,
      quota_configurations: []
    }
  }));
  console.log('getDifyProversList', result);
  return result;
}

// SQL列表
export async function getSQLListInSQLNode() {
  const res = await UAPI.RES.getSQLListInSQLNode({})
    .post({
      page: 0,
      page_size: 999,
      is_release: 1
    })
    .inRegion()
    .do();
  const list = (res.data?.items || []) as SQLScriptItem[];
  return list
    .filter(({ process_name }) => !process_name)
    .map(({ script_name, script_id, ...other }) => ({
      ...other,
      label: script_name,
      value: script_id
    }));
}

// SQL版本列表
export async function getSQLVersionInSQLNode(script_id: React.Key) {
  const res = await UAPI.RES.getSQLVersionInSQLNode({})
    .post({
      page: 0,
      page_size: 999,
      script_id
    })
    .inRegion()
    .do();
  return ((res.data?.items || []) as SQLVersion[]).map(
    ({ version, version_name, ...other }) => ({
      ...other,
      value: version,
      version_name,
      label: [version_name, other.script_desc].join('_'),
      isLeaf: true
    })
  );
}

// 工作流-获取工作流最后一条运行记录
export async function getWorkflowLastTask(flow_id: React.Key) {
  const res = await UAPI.RES.getWorkflowLastTask({})
    .post({
      process_definition_code: flow_id,
      orders: [
        {
          column: 'id',
          asc: false
        }
      ],
      page: 1,
      page_size: 1
    })
    .inRegion()
    .do();
  return (res.data?.items || [])?.[0] as WorkflowRunTask;
}

// 工作流-获取工作流节点运行记录
export async function getWorkflowNodeTask(task_id: React.Key) {
  const res = await UAPI.RES.getWorkflowNodeTask({})
    .post({
      process_instance_id: task_id,
      page: 1,
      page_size: 999
    })
    .inRegion()
    .do();
  return (res.data?.items || []) as NodeProcessData[];
}

// 工作流-获取工作流运行日志
export async function getWorkflowTaskLogs(task_id: React.Key) {
  const res = await UAPI.RES.getWorkflowTaskLogs({})
    .post({
      task_instance_id: task_id,
      limit: 1000,
      skip_line_num: 0
    })
    .inRegion()
    .do();
  return res.data?.message || '暂无日志';
}

/**
 *  // 工作流-结构化-数据推送-来源库
 *   getSourceDatabaseList: PrefixAimdp + '/ListMetadataIcebergDatabaseName',

 */
export async function getSourceDatabaseList() {
  const res = await UAPI.RES.getSourceDatabaseList({})
    .post({
      instanceId: 1
    })
    .inRegion()
    .do();
  return res;
}

/**
 *   // 工作流-结构化-数据推送-来源表
 *   getSourceTable: PrefixAimdp + '/ListMetadataIcebergTable',
 */
export async function getSourceTable(databaseId: React.Key) {
  const res = await UAPI.RES.getSourceTable({})
    .post({
      pageNum: 1,
      pageSize: 999,
      filters: {
        databaseId
      }
    })
    .inRegion()
    .do();
  return res;
}

/**
 *   // 工作流-结构化-数据推送-来源表字段
 *   getSourceTableField: PrefixAimdp + '/ListMetadataIcebergField',
 */
export async function getSourceTableField(tableId: React.Key) {
  const res = await UAPI.RES.getSourceTableField({})
    .post({
      pageNum: 1,
      pageSize: 999,
      filters: {
        tableId
      }
    })
    .inRegion()
    .do();
  return res.data?.message || '暂无日志';
}
