import type {
  CommonNodeType,
  VarType,
  Variable
} from '@/pages/workflowConfig/workflow/types';
import { string } from 'mobx-state-tree/dist/internal';

export type OutputVar = Record<
  string,
  {
    type: VarType;
    children: null; // support nest in the future,
  }
>;

export type TextParserNodeType = CommonNodeType & {
  files: string[];
  selected_files_num: number;
  text_slice_rule: number;
  slice_max_size: number;
  text_proc_rules: number[];
  text_ocr_model_id: string;
  text_pic_model_id: string;
  text_emb_model_id: string;
};
