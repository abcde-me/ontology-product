import type { Block } from '../types';
import { BlockEnum } from '../types';
import { BlockClassificationEnum } from './types';

export const BLOCKS: Block[] = [
  {
    classification: BlockClassificationEnum.Default,
    type: BlockEnum.Start,
    title: 'Start',
    description: ''
  },
  {
    classification: BlockClassificationEnum.Default,
    type: BlockEnum.Text,
    title: '文本解析'
  },
  {
    classification: BlockClassificationEnum.Default,
    type: BlockEnum.Pic,
    title: '图片解析'
  },
  {
    classification: BlockClassificationEnum.Default,
    type: BlockEnum.Audio,
    title: '音频解析'
  },
  {
    classification: BlockClassificationEnum.Default,
    type: BlockEnum.Video,
    title: '视频解析'
  },
  {
    classification: BlockClassificationEnum.Default,
    type: BlockEnum.Cleaning,
    title: '数据清洗'
  },
  {
    classification: BlockClassificationEnum.Default,
    type: BlockEnum.Enhancement,
    title: '数据增强'
  },
  {
    classification: BlockClassificationEnum.Default,
    type: BlockEnum.Customize,
    title: '自定义代码'
  },
  {
    classification: BlockClassificationEnum.Default,
    type: BlockEnum.End,
    title: '结束节点'
  }
];

// 结构化画布节点
const STRUCTURED_NODES: Block[] = [
  {
    classification: BlockClassificationEnum.Default,
    type: BlockEnum.SQL,
    title: 'SQL开发'
  },
  {
    classification: BlockClassificationEnum.Default,
    type: BlockEnum.Seatunnel,
    title: '数据推送'
  },
  {
    classification: BlockClassificationEnum.Default,
    type: BlockEnum.Dependent,
    title: '外部前置任务'
  }
];

export const BLOCK_CLASSIFICATIONS: string[] = [
  BlockClassificationEnum.Default
];

/**
 * 不同工作流类型展示不同的节点
 * 后续可能会有其他扩展
 */
export const FLOW_TYPE2BLOCKS_CONF: Record<string, Block[]> = {
  no_struct: BLOCKS,
  struct: STRUCTURED_NODES
};
