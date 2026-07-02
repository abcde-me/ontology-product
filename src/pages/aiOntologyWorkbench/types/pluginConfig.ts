export enum WorkbenchPluginType {
  Ontology = 'ontology',
  Knowledge = 'knowledge',
  Workflow = 'workflow',
  Mcp = 'mcp',
  Http = 'http'
}

export interface WorkbenchPluginItem {
  type: WorkbenchPluginType;
  name: string;
  description: string;
  /** 本体工具为核心能力，不可关闭 */
  required?: boolean;
  enabled: boolean;
  config: Record<string, string>;
}

export interface PluginConfigStore {
  plugins: WorkbenchPluginItem[];
}

export const DEFAULT_PLUGIN_CONFIG: PluginConfigStore = {
  plugins: [
    {
      type: WorkbenchPluginType.Ontology,
      name: '本体工具',
      description: '查询与操作本体场景库中的对象类型、链接、行为与函数',
      required: true,
      enabled: true,
      config: {}
    },
    {
      type: WorkbenchPluginType.Knowledge,
      name: '知识库',
      description: '检索关联知识库内容，辅助回答与推理',
      enabled: false,
      config: {
        datasetIds: ''
      }
    },
    {
      type: WorkbenchPluginType.Workflow,
      name: '工作流',
      description: '调用已发布的工作流完成复杂任务',
      enabled: false,
      config: {
        workflowIds: ''
      }
    },
    {
      type: WorkbenchPluginType.Mcp,
      name: 'MCP',
      description: '通过 MCP 协议调用外部工具服务',
      enabled: false,
      config: {
        serverName: '',
        serverUrl: ''
      }
    },
    {
      type: WorkbenchPluginType.Http,
      name: 'HTTP 插件',
      description: '调用外部 HTTP API 插件扩展助手能力',
      enabled: false,
      config: {
        endpointUrl: '',
        authToken: ''
      }
    }
  ]
};

export const PLUGIN_CONFIG_FIELD_LABELS: Record<
  WorkbenchPluginType,
  Array<{ key: string; label: string; placeholder?: string }>
> = {
  [WorkbenchPluginType.Ontology]: [],
  [WorkbenchPluginType.Knowledge]: [
    {
      key: 'datasetIds',
      label: '知识库 ID',
      placeholder: '多个 ID 用英文逗号分隔'
    }
  ],
  [WorkbenchPluginType.Workflow]: [
    {
      key: 'workflowIds',
      label: '工作流 ID',
      placeholder: '多个 ID 用英文逗号分隔'
    }
  ],
  [WorkbenchPluginType.Mcp]: [
    {
      key: 'serverName',
      label: '服务名称',
      placeholder: '例如：filesystem'
    },
    {
      key: 'serverUrl',
      label: '服务地址',
      placeholder: '例如：https://mcp.example.com/sse'
    }
  ],
  [WorkbenchPluginType.Http]: [
    {
      key: 'endpointUrl',
      label: '接口地址',
      placeholder: '例如：https://api.example.com/plugin'
    },
    {
      key: 'authToken',
      label: '鉴权 Token',
      placeholder: '可选，Bearer Token'
    }
  ]
};
