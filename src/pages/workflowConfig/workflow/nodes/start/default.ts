import type { NodeDefault } from '../../types';
import type { StartNodeType } from './types';
import {
  ALL_CHAT_AVAILABLE_BLOCKS,
  ALL_COMPLETION_AVAILABLE_BLOCKS
} from '@/pages/workflowConfig/workflow/blocks';

const nodeDefault: NodeDefault<StartNodeType> = {
  defaultValue: {
    variables: [],
    data_path_id: undefined,
    data_path_name: '',
    data_category: [
      {
        id: 1,
        category: '文档',
        enabled: true,
        format: ['PDF', 'PPT/PPTX', 'DOC/DOCX', 'TXT/MD']
      },
      {
        id: 2,
        category: '图片',
        enabled: true,
        format: ['JPEG', 'PNG', 'JPG']
      },
      {
        id: 3,
        category: '音频',
        enabled: true,
        format: ['WAV', 'MP3', 'AAC', 'FLAC']
      },
      {
        id: 4,
        category: '视频',
        enabled: true,
        format: ['MP4', 'MOV', 'MKV']
      },
      {
        id: 999,
        category: '自定义',
        enabled: true,
        format: []
      }
    ]
  },
  getAvailablePrevNodes() {
    return [];
  },
  getAvailableNextNodes(isChatMode: boolean) {
    const nodes = isChatMode
      ? ALL_CHAT_AVAILABLE_BLOCKS
      : ALL_COMPLETION_AVAILABLE_BLOCKS;
    return nodes;
  },
  checkValid(data: StartNodeType) {
    if (!data.data_path_id) {
      return {
        isValid: false,
        errorMessage: '请选择源数据目录'
      };
    }
    if (
      (data.data_category[0].enabled && data.data_category[0].format.length) ||
      (data.data_category[1].enabled && data.data_category[1].format.length) ||
      (data.data_category[2].enabled && data.data_category[2].format.length) ||
      (data.data_category[3].enabled && data.data_category[3].format.length) ||
      (data.data_category[4].enabled && data.data_category[4].format.length)
    ) {
      return {
        isValid: true
      };
    } else {
      return {
        isValid: false,
        errorMessage: '请至少选择一种文件类型'
      };
    }
  }
};

const FileOptions = {
  doc: ['PDF', 'PPT/PPTX', 'DOC/DOCX', 'TXT/MD'],
  image: ['JPEG', 'PNG', 'JPG'],
  audio: ['WAV', 'MP3', 'AAC', 'FLAC'],
  video: ['MP4', 'MOV', 'MKV']
};

export default nodeDefault;

export { FileOptions };
