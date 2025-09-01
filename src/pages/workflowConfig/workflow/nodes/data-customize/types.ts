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
  scripting_type: string;
  engine_id: string;
  desc: string;
  custom_run_status: boolean;
};
