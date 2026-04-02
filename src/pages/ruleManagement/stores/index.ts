import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { OntologyFunctionDetail } from '@/pages/ontologyScene/types/ontologyFunction';
import type { BehaviorActionItem } from '@/pages/ontologyScene/types/behaviorActions';
import type {
  ActionConfigRes,
  AutoRuleDetail,
  ChangeConfigRes,
  GateConfigRes,
  OntologyModelInfo,
  OntologyObjectTypeInfo
} from '../types';

export interface RuleGateConfig extends GateConfigRes {
  functionInfo?: Partial<OntologyFunctionDetail>;
}

export interface RuleDetailData
  extends Omit<AutoRuleDetail, 'gateConfig' | 'changeConfig' | 'actionConfig'> {
  actionConfig?: ActionConfigRes;
  gateConfig?: RuleGateConfig;
  changeConfig?: ChangeConfigRes;
}

export interface ChangeObjectTypesPayload {
  modelId?: number;
  modelInfo?: OntologyModelInfo;
  objectTypeId?: number;
  objectTypeInfo?: OntologyObjectTypeInfo;
}

interface RuleManagementState {
  ruleData: AutoRuleDetail;
}

interface RuleManagementActions {
  init: (data?: Partial<AutoRuleDetail> | null) => void;
  changeAction: (actionData?: Partial<BehaviorActionItem> | null) => void;
  changeFunction: (
    functionInfo?: Partial<OntologyFunctionDetail> | null
  ) => void;
  changeObjectTypes: (payload?: ChangeObjectTypesPayload | null) => void;
  syncValidatedValues: (data?: Partial<RuleDetailData> | null) => void;
}

type RuleManagementStore = RuleManagementState & RuleManagementActions;

const cloneData = <T>(data: T): T => {
  if (data == null) return data;
  return JSON.parse(JSON.stringify(data)) as T;
};

const mergeRuleData = (
  currentRuleData: AutoRuleDetail,
  nextData?: Partial<RuleDetailData> | null
): AutoRuleDetail => {
  if (!nextData) return currentRuleData;

  const rawNextData = nextData;
  const clonedNextData = cloneData(nextData);
  const hasActionConfig = Object.prototype.hasOwnProperty.call(
    rawNextData,
    'actionConfig'
  );
  const hasGateConfig = Object.prototype.hasOwnProperty.call(
    rawNextData,
    'gateConfig'
  );
  const hasChangeConfig = Object.prototype.hasOwnProperty.call(
    rawNextData,
    'changeConfig'
  );
  const hasScheduleConfig = Object.prototype.hasOwnProperty.call(
    rawNextData,
    'scheduleConfig'
  );

  return {
    ...currentRuleData,
    ...clonedNextData,
    actionConfig: hasActionConfig
      ? rawNextData.actionConfig == null
        ? undefined
        : {
            ...(currentRuleData.actionConfig || {}),
            ...(clonedNextData.actionConfig || {})
          }
      : currentRuleData.actionConfig,
    gateConfig: hasGateConfig
      ? rawNextData.gateConfig == null
        ? undefined
        : {
            ...(currentRuleData.gateConfig || {}),
            ...(clonedNextData.gateConfig || {})
          }
      : currentRuleData.gateConfig,
    changeConfig: hasChangeConfig
      ? rawNextData.changeConfig == null
        ? undefined
        : {
            ...(currentRuleData.changeConfig || {}),
            ...(clonedNextData.changeConfig || {})
          }
      : currentRuleData.changeConfig,
    scheduleConfig: hasScheduleConfig
      ? rawNextData.scheduleConfig == null
        ? undefined
        : clonedNextData.scheduleConfig
      : currentRuleData.scheduleConfig
  } as AutoRuleDetail;
};

export const useRuleManagementStore = create<RuleManagementStore>()(
  devtools(
    (set, get) => ({
      ruleData: {
        triggerType: 1
      },

      init: (data) => {
        const nextData = cloneData(data || {});
        set({
          ruleData: nextData as AutoRuleDetail
        });
      },

      changeAction: (actionData) => {
        const currentRuleData = get().ruleData;
        set({
          ruleData: actionData
            ? mergeRuleData(currentRuleData, {
                actionConfig: {
                  actionId: actionData.id,
                  actionCode: actionData.code,
                  parameters: actionData.params,
                  actionInfo: actionData
                }
              })
            : ({
                ...currentRuleData,
                actionConfig: undefined
              } as AutoRuleDetail)
        });
      },

      changeFunction: (functionInfo) => {
        const currentRuleData = get().ruleData;
        const currentGateConfig = currentRuleData.gateConfig || {};

        set({
          ruleData: {
            ...currentRuleData,
            gateConfig: functionInfo
              ? {
                  ...currentGateConfig,
                  functionId: functionInfo.id,
                  functionCode: functionInfo.code,
                  functionName: functionInfo.name,
                  functionInfo: cloneData(functionInfo)
                }
              : {
                  ...currentGateConfig,
                  functionId: undefined,
                  functionCode: undefined,
                  functionName: undefined,
                  functionInfo: undefined
                }
          }
        });
      },

      changeObjectTypes: (payload) => {
        const currentRuleData = get().ruleData;
        const currentChangeConfig = currentRuleData.changeConfig || {};

        set({
          ruleData: {
            ...currentRuleData,
            modelId: payload?.modelId,
            modelInfo: payload?.modelInfo
              ? cloneData(payload.modelInfo)
              : undefined,
            changeConfig: {
              ...currentChangeConfig,
              objectTypeId: payload?.objectTypeId,
              objectTypeInfo: payload?.objectTypeInfo
                ? cloneData(payload.objectTypeInfo)
                : undefined
            }
          }
        });
      },

      syncValidatedValues: (data) => {
        const currentRuleData = get().ruleData;
        set({
          ruleData: mergeRuleData(currentRuleData, data)
        });
      }
    }),
    {
      name: 'rule-management-store'
    }
  )
);

export const useRuleData = () =>
  useRuleManagementStore((state) => state.ruleData);
