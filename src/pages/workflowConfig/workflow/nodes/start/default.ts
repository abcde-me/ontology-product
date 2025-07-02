import type { NodeDefault } from '../../types';
import type { StartNodeType } from './types';
import {
  ALL_CHAT_AVAILABLE_BLOCKS,
  ALL_COMPLETION_AVAILABLE_BLOCKS
} from '@/pages/workflowConfig/workflow/blocks';

const nodeDefault: NodeDefault<StartNodeType> = {
  defaultValue: {
    variables: [],
    data_path_id: '',
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
    // TODO: ts错误
    // @ts-expect-error
    if (!data.srcDir) {
      return {
        isValid: false,
        errorMessage: '请选择源数据目录'
      };
    }
    if (
      // TODO: ts错误
      // @ts-expect-error
      (data.doc.enabled && data.doc.types.length) ||
      // TODO: ts错误
      // @ts-expect-error
      (data.image.enabled && data.image.types.length) ||
      // TODO: ts错误
      // @ts-expect-error
      (data.audio.enabled && data.audio.types.length) ||
      // TODO: ts错误
      // @ts-expect-error
      (data.video.enabled && data.video.types.length)
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
