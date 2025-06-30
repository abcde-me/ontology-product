import type { InputVar } from '@/pages/workflowConfig/workflow/types';
import type { IsOnline, WorkflowOperation } from '@/types/workflowApi';

export type ModelAndParameter = any;

export type AppPublisherProps = {
  workflowStatus: IsOnline;
  disabled?: boolean;
  publishDisabled?: boolean;
  publishedAt?: number;
  draftUpdatedAt?: number;
  debugWithMultipleModel?: boolean;
  multipleModelConfigs?: ModelAndParameter[];
  onOperate?: (op: WorkflowOperation, params?: any) => Promise<any> | any;
  onRestore?: () => Promise<any> | any;
  onToggle?: (state: boolean) => void;
  crossAxisOffset?: number;
  toolPublished?: boolean;
  inputs?: InputVar[];
  onRefreshData?: () => void;
};
