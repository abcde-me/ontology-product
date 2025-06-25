import type {
  CommonNodeType,
  Variable
} from '@/pages/workflowConfig/workflow/types';

export type EndNodeType = CommonNodeType & {
  outputs: Variable[];
  target_path: string;
};
