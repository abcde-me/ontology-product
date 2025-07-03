import { string } from 'mobx-state-tree/dist/internal';
import type {
  CommonNodeType,
  Variable
} from '@/pages/workflowConfig/workflow/types';

export type EndNodeType = CommonNodeType & {
  outputs: Variable[];
  target_path: string;
  target_path_name: string;
  dataSource: Array<any>;
};
