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

export type AudioParserNodeType = CommonNodeType & {
  files: string[];
  selected_files_num: number;
  vad_enabled: number;
  audio_pret: number[];
  activity_mode: number;
  activity_mode_num: string | undefined | null;
  is_open_multi_conv: number;
  vad_options: string[];
  audio_model_id: string | number;
  after_proc: number[];
};
