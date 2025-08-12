import type {
  CommonNodeType,
  VarType
} from '@/pages/workflowConfig/workflow/types';

export type OutputVar = Record<
  string,
  {
    type: VarType;
    children: null; // support nest in the future,
  }
>;

export type CustomNodeType = CommonNodeType & {
  script_content: string;
};
