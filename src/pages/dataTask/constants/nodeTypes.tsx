import React, { type ReactNode } from 'react';
import {
  IconFile,
  IconImage,
  IconLanguage,
  IconMindMapping,
  IconMusic,
  IconSync,
  IconPlayArrow,
  IconRobot,
  IconSafe,
  IconStorage,
  IconVideoCamera
} from '@arco-design/web-react/icon';
import { DATA_TASK_SOURCE_TYPE, DataTaskNodeType } from '../types';

export type DataTaskNodeClassification =
  | 'input'
  | 'process'
  | 'control'
  | 'output';

export interface DataTaskNodeMeta {
  type: DataTaskNodeType;
  title: string;
  classification: DataTaskNodeClassification;
  description: string;
  icon: ReactNode;
  showSourceHandle: boolean;
  showTargetHandle: boolean;
  canNodeResize?: boolean;
  defaultConfig: Record<string, unknown>;
  summaryFields?: string[];
}

export const DATA_TASK_NODE_METAS: DataTaskNodeMeta[] = [
  {
    type: DataTaskNodeType.START,
    title: '开始',
    classification: 'input',
    description: '工作流开始节点，定义初始输出字段',
    icon: <IconPlayArrow />,
    showSourceHandle: true,
    showTargetHandle: false,
    defaultConfig: {
      outputs: [{ variable: 'result', type: 'string', des: '初始输出' }]
    },
    summaryFields: []
  },
  {
    type: DataTaskNodeType.DATA_SOURCE,
    title: '数据源',
    classification: 'input',
    description: '接入图文音视频等数据源',
    icon: <IconStorage />,
    showSourceHandle: true,
    showTargetHandle: false,
    defaultConfig: {
      sourceType: DATA_TASK_SOURCE_TYPE.DATABASE,
      sourceName: '',
      sourceDataInfo: { queryMode: 'selected' }
    },
    summaryFields: ['sourceType', 'sourceName']
  },
  {
    type: DataTaskNodeType.INFERENCE_AGENT,
    title: '推理AGENT',
    classification: 'process',
    description: '上游数据更新时触发推理 AGENT，并输出推理结果',
    icon: <IconRobot />,
    showSourceHandle: true,
    showTargetHandle: true,
    defaultConfig: {
      ontologyModelID: undefined,
      ontologyModelName: '',
      agentAppId: '',
      agentName: '',
      triggerMode: 'on_data_update',
      outputs: [
        { variable: 'inference_result', type: 'string', des: '推理结果内容' },
        { variable: 'reasoning_path', type: 'string', des: '推理路径' }
      ]
    },
    summaryFields: ['agentName']
  },
  {
    type: DataTaskNodeType.FILE_PARSE,
    title: '文件解析',
    classification: 'process',
    description: '解析文档并提取结构化数据',
    icon: <IconFile />,
    showSourceHandle: true,
    showTargetHandle: true,
    defaultConfig: { parseMode: 'auto', outputFormat: 'json' },
    summaryFields: ['parseMode']
  },
  {
    type: DataTaskNodeType.VIDEO_FRAME,
    title: '视频抽帧',
    classification: 'process',
    description: '从视频中抽取关键帧',
    icon: <IconVideoCamera />,
    showSourceHandle: true,
    showTargetHandle: true,
    defaultConfig: { frameInterval: 1, maxFrames: 100 },
    summaryFields: ['frameInterval']
  },
  {
    type: DataTaskNodeType.OCR,
    title: '图片OCR',
    classification: 'process',
    description: '识别图片中的文字内容',
    icon: <IconImage />,
    showSourceHandle: true,
    showTargetHandle: true,
    defaultConfig: { language: 'zh', enableLayout: true },
    summaryFields: ['language']
  },
  {
    type: DataTaskNodeType.AUDIO_TEXT,
    title: '音频文本提取',
    classification: 'process',
    description: '将音频转换为文本',
    icon: <IconMusic />,
    showSourceHandle: true,
    showTargetHandle: true,
    defaultConfig: { language: 'zh', enablePunctuation: true },
    summaryFields: ['language']
  },
  {
    type: DataTaskNodeType.SQL,
    title: 'SQL处理',
    classification: 'process',
    description: '执行 SQL 查询与数据转换',
    icon: <IconLanguage />,
    showSourceHandle: true,
    showTargetHandle: true,
    defaultConfig: { scriptId: '', scriptVersion: '' },
    summaryFields: ['scriptId']
  },
  {
    type: DataTaskNodeType.JSON_PARSE,
    title: 'JSON解析',
    classification: 'process',
    description: '按 JSON Path 提取字段',
    icon: <IconFile />,
    showSourceHandle: true,
    showTargetHandle: true,
    defaultConfig: { jsonPath: '', outputField: '' },
    summaryFields: ['jsonPath']
  },
  {
    type: DataTaskNodeType.LOGIC,
    title: '分支器',
    classification: 'control',
    description: '根据条件将数据路由到不同分支',
    icon: <IconMindMapping />,
    showSourceHandle: true,
    showTargetHandle: true,
    defaultConfig: { condition: '', trueBranch: '', falseBranch: '' },
    summaryFields: ['condition']
  },
  {
    type: DataTaskNodeType.LOOP,
    title: '循环',
    classification: 'control',
    description: '循环执行一段逻辑直到满足结束条件或者到达循环次数上限',
    icon: <IconSync />,
    showSourceHandle: true,
    showTargetHandle: true,
    canNodeResize: true,
    defaultConfig: {},
    summaryFields: ['loop_count']
  },
  {
    type: DataTaskNodeType.SCRIPT,
    title: '自定义脚本',
    classification: 'process',
    description: '运行自定义处理脚本',
    icon: <IconRobot />,
    showSourceHandle: true,
    showTargetHandle: true,
    defaultConfig: { scriptType: 'python', scriptContent: '' },
    summaryFields: ['scriptType']
  },
  {
    type: DataTaskNodeType.DESENSITIZE,
    title: '数据脱敏',
    classification: 'process',
    description: '对敏感字段进行脱敏处理',
    icon: <IconSafe />,
    showSourceHandle: true,
    showTargetHandle: true,
    defaultConfig: { rules: [] as string[] },
    summaryFields: []
  },
  {
    type: DataTaskNodeType.ONTOLOGY,
    title: '本体对象类型',
    classification: 'output',
    description: '选择本体场景库中的本体对象类型',
    icon: <IconStorage />,
    showSourceHandle: true,
    showTargetHandle: true,
    defaultConfig: {
      ontologyModelID: undefined,
      ontologyModelName: '',
      objectTypeId: undefined,
      objectTypeName: '',
      objectTypeCode: '',
      conflictStrategy: 'KEEP_SOURCE',
      parallelism: 1,
      exceptionStrategy: 'STOP_ON_ERROR'
    },
    summaryFields: ['ontologyModelName', 'objectTypeName', 'conflictStrategy']
  }
];

export const DATA_TASK_NODE_META_MAP = Object.fromEntries(
  DATA_TASK_NODE_METAS.map((meta) => [meta.type, meta])
) as Record<DataTaskNodeType, DataTaskNodeMeta>;
