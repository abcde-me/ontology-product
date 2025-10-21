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

export const BLOCK_CLASSIFICATIONS: string[] = [
  BlockClassificationEnum.Default
];
