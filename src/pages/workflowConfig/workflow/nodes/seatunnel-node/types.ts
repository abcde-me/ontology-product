import type {
  CommonNodeType,
  VarType
} from '@/pages/workflowConfig/workflow/types';
import { ReactNode, Key } from 'react';

// 映射字段
export interface FieldMapping {
  source_field: string;
  source_field_type: string;
  target_field: string;
  target_field_type: string;
}

export interface LocalParam {
  prop: string;
  direct: string;
  type: string;
  value?: string;
}

export interface SeatunnelConfig extends CommonNodeType {
  source_database?: string;
  source_table_name?: string;
  /**
   * 目标-连接器id
   */
  target_datasource_id?: number;
  /**
   * 目标-表名
   */
  target_table_name?: string;
  /**
   * 目标-连接器名称
   */
  target_datasource_name: string;
  /**
   * 目标-库名
   */
  target_datasource_table: string;
  field_mapping_list: FieldMapping[];
  primary_keys: string[];
  query?: string;
  fail_retry_interval: string;
  fail_retry_times: string;
  task_priority: string;
  // 自定义参数
  local_params?: LocalParam[];
}

export interface DatabaseConfig {
  database: string;
  host: string;
  port: string;
  subType: string;
  system: string;
  type: string;
  typeIdentifier: string;
  user: string;
  label?: ReactNode;
  value?: Key;
  isLeaf?: boolean;
  children?: any[];
}

export interface ConnectionItem {
  id: number;
  name: string;
  type: string;
  sub_type: string;
  config: DatabaseConfig;
  children?: DatabaseConfig[];
  creator: string;
  created_at: string;
  updated_at: string;
  status: string;
  tunnel_id: number;
  perms?: any;
  table_name?: string;
  label?: ReactNode;
  value?: Key;
}

export interface SourceDatabase {
  databaseName: string;
  id: number;
}

export interface SourceTable {
  tableName: string;
  id: number;
}

export interface TargetField {
  name: string;
  type: string;
}

export interface SourceField {
  createBy: string;
  createTime: string;
  dataType: string;
  description: string;
  fieldName: string;
  id: string;
  updateTime: string;
}

export interface SyncField {
  source_field: string;
  source_field_type: string;
  target_field: string;
  target_field_type: string;
  sync?: boolean;
  primary?: boolean;
}

export interface SyncFieldValue {
  field_mapping_list: SyncField[];
  primary_keys: string[];
}
