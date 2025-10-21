import type { CommonNodeType, VarType } from '@/pages/workflowConfig/workflow/types';

export type OutputVar = Record<
  string,
  {
    type: VarType;
    children: null; // support nest in the future,
  }
>;

export type ImageParserNodeType = CommonNodeType & {
  files: string[];
  pic_model_id: string | number;
  pic_emb_model_id: string | number;
  selected_files_num: number | number;
};
