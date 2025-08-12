import type {
  CommonNodeType,
  InputVar
} from '@/pages/workflowConfig/workflow/types';

export type StartNodeType = CommonNodeType & {
  variables?: InputVar[];
  data_path_id: string | number | undefined;
  data_path_name: string;
  data_category: Array<{
    id: number;
    category: string;
    enabled: boolean;
    format: string[];
  }>;
};
