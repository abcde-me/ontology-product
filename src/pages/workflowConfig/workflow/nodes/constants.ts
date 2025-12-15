import type { ComponentType } from 'react';
import { BlockEnum } from '../types';
import StartNode from './start/node';
import StartPanel from './start/panel';
import EndNode from './end/node';
import EndPanel from './end/panel';
import { TransferMethod } from '@/pages/workflowConfig/types/app';
import TextNode from './data-text-parser/node';
import TextPanel from './data-text-parser/panel';
import ImageNode from './data-image-parser/node';
import ImagePanel from './data-image-parser/panel';
import AudioNode from './data-audio-parser/node';
import AudioPanel from './data-audio-parser/panel';
import VideoNode from './data-video-parser/node';
import VideoPanel from './data-video-parser/panel';
import CleaningNode from './data-cleaning/node';
import CleaningPanel from './data-cleaning/panel';
import EnhancementNode from './data-enhancement/node';
import EnhancementPanel from './data-enhancement/panel';
import CustomizeNode from './data-customize/node';
import CustomizePanel from './data-customize/panel';
import SQLNode from './sql-node';
import DependentNode from './dependent-node';
import SQLPanel from './sql-node/panel';
import SeatunnelNode from './seatunnel-node';
import SeatunnelPanel from './seatunnel-node/panel';
import DependentPanel from './dependent-node/panel';

export const NodeComponentMap: Record<string, ComponentType<any>> = {
  [BlockEnum.Start]: StartNode,
  [BlockEnum.End]: EndNode,
  [BlockEnum.Text]: TextNode,
  [BlockEnum.Pic]: ImageNode,
  [BlockEnum.Video]: VideoNode,
  [BlockEnum.Audio]: AudioNode,
  [BlockEnum.Enhancement]: EnhancementNode,
  [BlockEnum.Cleaning]: CleaningNode,
  [BlockEnum.Customize]: CustomizeNode,
  [BlockEnum.SQL]: SQLNode,
  [BlockEnum.Seatunnel]: SeatunnelNode,
  [BlockEnum.Dependent]: DependentNode
};

export const PanelComponentMap: Record<string, ComponentType<any>> = {
  [BlockEnum.Start]: StartPanel,
  [BlockEnum.End]: EndPanel,
  [BlockEnum.Text]: TextPanel,
  [BlockEnum.Pic]: ImagePanel,
  [BlockEnum.Video]: VideoPanel,
  [BlockEnum.Audio]: AudioPanel,
  [BlockEnum.Cleaning]: CleaningPanel,
  [BlockEnum.Enhancement]: EnhancementPanel,
  [BlockEnum.Customize]: CustomizePanel,
  [BlockEnum.SQL]: SQLPanel,
  [BlockEnum.Dependent]: DependentPanel,
  [BlockEnum.Seatunnel]: SeatunnelPanel
};

export const CUSTOM_NODE_TYPE = 'custom';

export const FILE_TYPE_OPTIONS = [
  { value: 'image', i18nKey: 'image' },
  { value: 'document', i18nKey: 'doc' },
  { value: 'audio', i18nKey: 'audio' },
  { value: 'video', i18nKey: 'video' }
];

export const TRANSFER_METHOD = [
  { value: TransferMethod.local_file, i18nKey: 'localUpload' },
  { value: TransferMethod.remote_url, i18nKey: 'url' }
];

export const SUB_VARIABLES = [
  'type',
  'size',
  'name',
  'url',
  'extension',
  'mime_type',
  'transfer_method'
];
export const OUTPUT_FILE_SUB_VARIABLES = SUB_VARIABLES.filter(
  (key) => key !== 'transfer_method'
);

export const CATEGORY_MAP: Record<string, string> = {
  文档: 'text',
  图片: 'pic',
  音频: 'audio',
  视频: 'video',
  自定义: 'scripting'
};
