export enum PopupsFormFrom {
  /** 数据集 */
  DatasetManagement = 'datasetManagement',
  /** 源数据 */
  SourceData = 'sourceData',
  /** 目标数据 */
  TargetData = 'targetData'
}

export interface SourceDataItem {
  abs_data_path: string;
  connector_id: number;
  connector_name: string;
  data_path_id: number;
  file_name: string;
  file_size: number;
  file_sub_path: string;
  file_type: string;
  id: number;
  file_uuid: string;
  task_load_start_time: string;
  upload_user: string;
  real_abs_data_path: string;
}

export interface TargetDataItem {
  FileName: string;
  created_at: string;
  deleted_at: any;
  extras: {
    ds_workflow_id: string;
    file_name: string;
    workflow_uuid: string;
  };
  file_type: string;
  full_path: string;
  generated_at: string;
  id: number;
  short_content: string;
  updated_at: string;
  real_full_path: string;
}
