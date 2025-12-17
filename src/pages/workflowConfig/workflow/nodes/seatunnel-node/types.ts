import type {
  CommonNodeType,
  VarType
} from '@/pages/workflowConfig/workflow/types';
import { ReactNode, Key } from 'react';

interface LocalParam {
  prop?: string;
  direct: string;
  type: string;
  value?: string;
}

// 映射字段
export interface FieldMapping {
  source_field: string;
  source_field_type: string;
  target_field: string;
  target_field_type: string;
}

export interface SeatunnelConfig extends CommonNodeType {
  source_database?: string;
  source_table_name?: string;
  target_datasource_id?: number;
  target_table_name?: string;
  field_mapping_list: FieldMapping[];
  primary_keys: string[];
  query?: string;
  fail_retry_interval: string;
  fail_retry_times: string;
  task_priority: string;
}

export interface DatasourceConfig {
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
  config: DatasourceConfig;
  children?: DatasourceConfig[];
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
