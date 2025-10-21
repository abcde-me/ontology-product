import type {
  CommonNodeType,
  VarType,
} from '@/pages/workflowConfig/workflow/types';

export type OutputVar = Record<
  string,
  {
    type: VarType;
    children: null; // support nest in the future,
  }
>;

export type VideoParserNodeType = CommonNodeType & {
  files: string[];
  selected_files_num: number;
  is_poly_orbit: number;
  is_denoise: number;
  audio_options: string[];
  vad_enabled: number;
  activity_mode: number;
  activity_mode_num: string | undefined | null;
  is_open_multi_conv: number;
  vad_options: string[];
  audio_model_id: string | number;
  after_proc: number[];
};
