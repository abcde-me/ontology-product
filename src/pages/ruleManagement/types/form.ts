export interface RuleFormSchema {
  action?: number | string;
  actionParams?: Record<string, any>[];
  advConfig?: boolean;
  changeType?: number | string;
  cycle?: string;
  date?: string | string[];
  description?: string;
  function?: number | string;
  functionParams?: Record<string, any>[];
  insType?: string;
  instanceIds?: Array<number | string>;
  modelId?: number | string;
  name?: string;
  objectTypeId?: number | string;
  propertyConditions?: Array<number | string>;
  propertyList?: Record<string, any>[];
  time?: string;
  triggerType?: number;
}
