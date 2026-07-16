import { DATA_TASK_NODE_META_MAP } from '../constants/nodeTypes';
import { DATA_TASK_SOURCE_TYPE, DataTaskNodeType } from '../types';
import type { WorkflowDraft } from '../types';
import { createEmptyWorkflowDraft } from '../utils/workflowDraft';

const WORKFLOW_CUSTOM_NODE_TYPE = 'custom';

interface MockNodeSpec {
  id: string;
  type: DataTaskNodeType;
  title: string;
  x: number;
  y: number;
  data?: Record<string, unknown>;
}

const HORIZONTAL_GAP = 180;
const BASE_Y = 120;

const buildNode = ({ id, type, title, x, y, data = {} }: MockNodeSpec) => {
  const meta = DATA_TASK_NODE_META_MAP[type];

  return {
    id,
    type: WORKFLOW_CUSTOM_NODE_TYPE,
    position: { x, y },
    targetPosition: 'left',
    sourcePosition: 'right',
    data: {
      _isSingleRun: true,
      variables: [],
      outputs: [],
      ...meta?.defaultConfig,
      type,
      title: title ?? meta?.title ?? type,
      desc: meta?.description ?? '',
      ...data
    }
  };
};

const buildLinearEdges = (nodeIds: string[]) =>
  nodeIds.slice(0, -1).map((sourceId, index) => ({
    id: `edge-${sourceId}-${nodeIds[index + 1]}`,
    source: sourceId,
    target: nodeIds[index + 1],
    type: WORKFLOW_CUSTOM_NODE_TYPE,
    sourceHandle: 'source',
    targetHandle: 'target'
  }));

const buildLinearDraft = (
  taskId: string,
  nodes: MockNodeSpec[]
): WorkflowDraft => {
  const graphNodes = nodes.map((node, index) =>
    buildNode({
      ...node,
      x: node.x ?? index * HORIZONTAL_GAP,
      y: node.y ?? BASE_Y
    })
  );
  const nodeIds = graphNodes.map((node) => node.id);

  return {
    ...createEmptyWorkflowDraft(taskId),
    graph: {
      nodes: graphNodes,
      edges: buildLinearEdges(nodeIds),
      viewport: { x: 0, y: 0, zoom: 0.85 }
    }
  };
};

const buildDraftWithGraph = (
  taskId: string,
  nodes: MockNodeSpec[],
  edges: Array<{ id: string; source: string; target: string }>
): WorkflowDraft => ({
  ...createEmptyWorkflowDraft(taskId),
  graph: {
    nodes: nodes.map((node) => buildNode(node)),
    edges: edges.map((edge) => ({
      ...edge,
      type: WORKFLOW_CUSTOM_NODE_TYPE,
      sourceHandle: 'source',
      targetHandle: 'target'
    })),
    viewport: { x: 0, y: 0, zoom: 0.75 }
  }
});

export const MOCK_WORKFLOW_DRAFTS: Record<string, WorkflowDraft> = {
  'wf-1': buildLinearDraft('wf-1', [
    {
      id: 'wf1-source',
      type: DataTaskNodeType.DATA_SOURCE,
      title: '数据源',
      x: 0,
      y: BASE_Y,
      data: {
        sourceType: DATA_TASK_SOURCE_TYPE.DOCUMENT,
        sourceName: '文档数据源',
        outputs: [
          { variable: 'file_path', type: 'string', des: '文档路径' },
          { variable: 'file_name', type: 'string', des: '文档名称' }
        ]
      }
    },
    {
      id: 'wf1-parse',
      type: DataTaskNodeType.FILE_PARSE,
      title: '文件解析',
      x: HORIZONTAL_GAP,
      y: BASE_Y,
      data: {
        parseMode: 'auto',
        outputFormat: 'json',
        outputs: [
          { variable: 'parsed_content', type: 'object', des: '解析内容' }
        ]
      }
    },
    {
      id: 'wf1-ontology',
      type: DataTaskNodeType.ONTOLOGY,
      title: '本体对象类型',
      x: HORIZONTAL_GAP * 2,
      y: BASE_Y,
      data: {
        objectTypeName: '文档实例',
        conflictStrategy: 'KEEP_SOURCE'
      }
    }
  ]),
  'wf-2': buildLinearDraft('wf-2', [
    {
      id: 'wf2-source',
      type: DataTaskNodeType.DATA_SOURCE,
      title: '数据源',
      x: 0,
      y: BASE_Y,
      data: {
        sourceType: DATA_TASK_SOURCE_TYPE.DATABASE,
        sourceName: '业务库',
        outputs: [
          { variable: 'order_id', type: 'string', des: '订单ID' },
          { variable: 'payload', type: 'string', des: '原始JSON' }
        ]
      }
    },
    {
      id: 'wf2-sql',
      type: DataTaskNodeType.SQL,
      title: 'SQL处理',
      x: HORIZONTAL_GAP,
      y: BASE_Y,
      data: {
        scriptId: 'sql_merge_001',
        outputs: [{ variable: 'merged_row', type: 'object', des: '合并结果' }]
      }
    },
    {
      id: 'wf2-json',
      type: DataTaskNodeType.JSON_PARSE,
      title: 'JSON解析',
      x: HORIZONTAL_GAP * 2,
      y: BASE_Y,
      data: {
        jsonPath: '$.data.items[*]',
        outputField: 'item_name',
        outputs: [{ variable: 'item_name', type: 'string', des: '条目名称' }]
      }
    },
    {
      id: 'wf2-ontology',
      type: DataTaskNodeType.ONTOLOGY,
      title: '本体对象类型',
      x: HORIZONTAL_GAP * 3,
      y: BASE_Y
    }
  ]),
  'wf-3': buildLinearDraft('wf-3', [
    {
      id: 'wf3-source',
      type: DataTaskNodeType.DATA_SOURCE,
      title: '数据源',
      x: 0,
      y: BASE_Y,
      data: {
        sourceType: DATA_TASK_SOURCE_TYPE.DOCUMENT,
        sourceName: '音视频文件',
        outputs: [{ variable: 'media_url', type: 'string', des: '媒体地址' }]
      }
    },
    {
      id: 'wf3-audio',
      type: DataTaskNodeType.AUDIO_TEXT,
      title: '音频文本提取',
      x: HORIZONTAL_GAP,
      y: BASE_Y,
      data: {
        language: 'zh',
        outputs: [{ variable: 'transcript', type: 'string', des: '转写文本' }]
      }
    },
    {
      id: 'wf3-json',
      type: DataTaskNodeType.JSON_PARSE,
      title: 'JSON解析',
      x: HORIZONTAL_GAP * 2,
      y: BASE_Y,
      data: {
        outputField: 'structured_text',
        outputs: [
          { variable: 'structured_text', type: 'string', des: '结构化文本' }
        ]
      }
    },
    {
      id: 'wf3-ontology',
      type: DataTaskNodeType.ONTOLOGY,
      title: '本体对象类型',
      x: HORIZONTAL_GAP * 3,
      y: BASE_Y
    }
  ]),
  'wf-4': buildLinearDraft('wf-4', [
    {
      id: 'wf4-source',
      type: DataTaskNodeType.DATA_SOURCE,
      title: '数据源',
      x: 0,
      y: BASE_Y,
      data: {
        sourceType: DATA_TASK_SOURCE_TYPE.DOCUMENT,
        sourceName: '图片数据源',
        outputs: [
          { variable: 'image_url', type: 'string', des: '图片地址' },
          { variable: 'image_name', type: 'string', des: '图片名称' }
        ]
      }
    },
    {
      id: 'wf4-ocr',
      type: DataTaskNodeType.OCR,
      title: '图片OCR',
      x: HORIZONTAL_GAP,
      y: BASE_Y,
      data: {
        language: 'zh',
        outputs: [{ variable: 'ocr_text', type: 'string', des: '识别文本' }]
      }
    },
    {
      id: 'wf4-sql',
      type: DataTaskNodeType.SQL,
      title: 'SQL处理',
      x: HORIZONTAL_GAP * 2,
      y: BASE_Y,
      data: {
        scriptId: 'sql_ocr_clean',
        outputs: [{ variable: 'clean_row', type: 'object', des: '清洗结果' }]
      }
    },
    {
      id: 'wf4-ontology',
      type: DataTaskNodeType.ONTOLOGY,
      title: '本体对象类型',
      x: HORIZONTAL_GAP * 3,
      y: BASE_Y,
      data: {
        objectTypeName: '图片识别实例',
        conflictStrategy: 'KEEP_SOURCE'
      }
    }
  ]),
  'wf-5': buildLinearDraft('wf-5', [
    {
      id: 'wf5-source',
      type: DataTaskNodeType.DATA_SOURCE,
      title: '数据源',
      x: 0,
      y: BASE_Y,
      data: {
        outputs: [
          { variable: 'event_payload', type: 'object', des: '事件数据' }
        ]
      }
    },
    {
      id: 'wf5-agent',
      type: DataTaskNodeType.INFERENCE_AGENT,
      title: '推理AGENT',
      x: HORIZONTAL_GAP,
      y: BASE_Y,
      data: {
        agentName: '场景推理Agent',
        outputs: [
          { variable: 'inference_result', type: 'string', des: '推理结果' },
          { variable: 'reasoning_path', type: 'string', des: '推理路径' }
        ]
      }
    },
    {
      id: 'wf5-ontology',
      type: DataTaskNodeType.ONTOLOGY,
      title: '本体对象类型',
      x: HORIZONTAL_GAP * 2,
      y: BASE_Y
    }
  ]),
  'wf-6': buildLinearDraft('wf-6', [
    {
      id: 'wf6-source',
      type: DataTaskNodeType.DATA_SOURCE,
      title: '数据源',
      x: 0,
      y: BASE_Y,
      data: {
        sourceType: DATA_TASK_SOURCE_TYPE.DATABASE,
        outputs: [{ variable: 'user_phone', type: 'string', des: '手机号' }]
      }
    },
    {
      id: 'wf6-sql',
      type: DataTaskNodeType.SQL,
      title: 'SQL处理',
      x: HORIZONTAL_GAP,
      y: BASE_Y
    },
    {
      id: 'wf6-desensitize',
      type: DataTaskNodeType.DESENSITIZE,
      title: '数据脱敏',
      x: HORIZONTAL_GAP * 2,
      y: BASE_Y,
      data: {
        rules: ['user_phone', 'id_card'],
        outputs: [
          { variable: 'masked_phone', type: 'string', des: '脱敏手机号' }
        ]
      }
    },
    {
      id: 'wf6-ontology',
      type: DataTaskNodeType.ONTOLOGY,
      title: '本体对象类型',
      x: HORIZONTAL_GAP * 3,
      y: BASE_Y
    }
  ]),
  'wf-7': buildDraftWithGraph(
    'wf-7',
    [
      {
        id: 'wf7-source-image',
        type: DataTaskNodeType.DATA_SOURCE,
        title: '数据源',
        x: 0,
        y: 40,
        data: {
          sourceName: '图片数据源',
          outputs: [{ variable: 'image_url', type: 'string', des: '图片地址' }]
        }
      },
      {
        id: 'wf7-source-audio',
        type: DataTaskNodeType.DATA_SOURCE,
        title: '数据源_2',
        x: 0,
        y: 220,
        data: {
          sourceName: '音频数据源',
          outputs: [{ variable: 'audio_url', type: 'string', des: '音频地址' }]
        }
      },
      {
        id: 'wf7-ocr',
        type: DataTaskNodeType.OCR,
        title: '图片OCR',
        x: HORIZONTAL_GAP,
        y: 40,
        data: {
          outputs: [{ variable: 'ocr_text', type: 'string', des: '识别文本' }]
        }
      },
      {
        id: 'wf7-audio',
        type: DataTaskNodeType.AUDIO_TEXT,
        title: '音频文本提取',
        x: HORIZONTAL_GAP,
        y: 220,
        data: {
          outputs: [{ variable: 'transcript', type: 'string', des: '转写文本' }]
        }
      },
      {
        id: 'wf7-sql',
        type: DataTaskNodeType.SQL,
        title: 'SQL处理',
        x: HORIZONTAL_GAP * 2,
        y: 130,
        data: {
          outputs: [
            { variable: 'merged_record', type: 'object', des: '融合记录' }
          ]
        }
      },
      {
        id: 'wf7-ontology',
        type: DataTaskNodeType.ONTOLOGY,
        title: '本体对象类型',
        x: HORIZONTAL_GAP * 3,
        y: 130
      }
    ],
    [
      { id: 'wf7-e1', source: 'wf7-source-image', target: 'wf7-ocr' },
      { id: 'wf7-e2', source: 'wf7-source-audio', target: 'wf7-audio' },
      { id: 'wf7-e3', source: 'wf7-ocr', target: 'wf7-sql' },
      { id: 'wf7-e4', source: 'wf7-audio', target: 'wf7-sql' },
      { id: 'wf7-e5', source: 'wf7-sql', target: 'wf7-ontology' }
    ]
  ),
  'wf-8': buildLinearDraft('wf-8', [
    {
      id: 'wf8-source',
      type: DataTaskNodeType.DATA_SOURCE,
      title: '数据源',
      x: 0,
      y: BASE_Y,
      data: {
        sourceType: DATA_TASK_SOURCE_TYPE.MESSAGE_QUEUE,
        messageQueueTopic: 'order-events',
        outputs: [{ variable: 'message_body', type: 'string', des: '消息体' }]
      }
    },
    {
      id: 'wf8-json',
      type: DataTaskNodeType.JSON_PARSE,
      title: 'JSON解析',
      x: HORIZONTAL_GAP,
      y: BASE_Y,
      data: {
        jsonPath: '$.items[*]',
        outputField: 'item_id'
      }
    },
    {
      id: 'wf8-loop',
      type: DataTaskNodeType.LOOP,
      title: '循环',
      x: HORIZONTAL_GAP * 2,
      y: BASE_Y,
      data: {
        loop_count: 100,
        outputs: [
          { variable: 'batch_result', type: 'array', des: '批处理结果' }
        ]
      }
    },
    {
      id: 'wf8-sql',
      type: DataTaskNodeType.SQL,
      title: 'SQL处理',
      x: HORIZONTAL_GAP * 3,
      y: BASE_Y
    }
  ]),
  'wf-9': buildLinearDraft('wf-9', [
    {
      id: 'wf9-source',
      type: DataTaskNodeType.DATA_SOURCE,
      title: '数据源',
      x: 0,
      y: BASE_Y,
      data: {
        sourceType: DATA_TASK_SOURCE_TYPE.DATABASE,
        sourceName: '实例同步源表',
        outputs: [
          { variable: 'instance_id', type: 'string', des: '实例ID' },
          { variable: 'instance_name', type: 'string', des: '实例名称' }
        ]
      }
    },
    {
      id: 'wf9-ontology',
      type: DataTaskNodeType.ONTOLOGY,
      title: '本体对象类型',
      x: HORIZONTAL_GAP,
      y: BASE_Y,
      data: {
        objectTypeName: '业务对象',
        conflictStrategy: 'KEEP_SOURCE',
        parallelism: 2
      }
    }
  ])
};
