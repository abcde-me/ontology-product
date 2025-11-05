import { string } from 'mobx-state-tree/dist/internal';
import type { CommonNodeType } from '@/pages/workflowConfig/workflow/types';

export type EndNodeType = CommonNodeType & {
  outputs: any[];
  target_path_id: number;
  target_path_name: string;
  isKnowledgeBaseNameValid: boolean;
  knowledge_base_name_msg: string;
  is_embedding: boolean;
  knowledge_base_name: string;
  dataSource: Array<any>;
  scene_id: number;
  name: string;
  description: string;
  tag_names: string[];
  data: {
    type: string;
    title: string;
    desc: string;
    selected: boolean;
    target_path_id: number;
    target_path_name: string;
    is_embedding: boolean;
    knowledge_base_name: string;
    isKnowledgeBaseNameValid: boolean;
    knowledge_base_name_msg: string;
  };
};
