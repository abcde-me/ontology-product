import type { InputVar } from '@/pages/workflowConfig/workflow/types';

export enum WORKFLOW_OPERATION {
  /**
   * 一次性任务上线
   */
  ONLINE = 'ONLINE',
  /**
   * 下线（一次性任务和定时调度全部下线）
   */
  OFFLINE = 'OFFLINE',
  /**
   * 运行（一次性任务）
   */
  RUNNING = 'RUNNING',
  /**
   * 定时运行
   */
  CRON_RUNNING = 'CRON_RUNNING'
}

export type ModelAndParameter = any;

export type AppPublisherProps = {
  disabled?: boolean;
  publishDisabled?: boolean;
  publishedAt?: number;
  draftUpdatedAt?: number;
  debugWithMultipleModel?: boolean;
  multipleModelConfigs?: ModelAndParameter[];
  onOperate?: (op: WORKFLOW_OPERATION, params?: any) => Promise<any> | any;
  onRestore?: () => Promise<any> | any;
  onToggle?: (state: boolean) => void;
  crossAxisOffset?: number;
  toolPublished?: boolean;
  inputs?: InputVar[];
  onRefreshData?: () => void;
};
