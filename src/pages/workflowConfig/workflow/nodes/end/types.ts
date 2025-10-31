import { string } from 'mobx-state-tree/dist/internal';
import type {
  CommonNodeType,
  Variable
} from '@/pages/workflowConfig/workflow/types';

export type EndNodeType = CommonNodeType & {
  outputs: Variable[];
  target_path_id: number;
  target_path_name: string;
  isKnowledgeBaseNameValid: boolean;
  knowledge_base_name_msg: string;
  is_embedding: boolean;
  knowledge_base_name: string;
  dataSource: Array<any>;
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
