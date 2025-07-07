import {
  createContext,
  useContext,
  useContextSelector
} from 'use-context-selector';
import React, { useState } from 'react';
import {
  ModelTypeEnum,
  type Model,
  type ModelProvider
} from '@/pages/workflowConfig/models/model';
import type { RETRIEVE_METHOD } from '@/pages/workflowConfig/types/app';
import {
  Plan,
  type UsagePlanInfo
} from '@/pages/workflowConfig/models/billing';
// import { useModelList, useProviderList } from '@/pages/workflowConfig/hooks/use-model'
// import ProviderData from '@/pages/workflowConfig/mockData/providersData.json'
// import llmListData from '@/pages/workflowConfig/mockData/llmList.json'

type ProviderContextState = {
  modelProviders: ModelProvider[];
  refreshModelProviders: () => void;
  textGenerationModelList: Model[];
  supportRetrievalMethods: RETRIEVE_METHOD[];
  isAPIKeySet: boolean;
  plan: {
    type: Plan;
    usage: UsagePlanInfo;
    total: UsagePlanInfo;
  };
  isFetchedPlan: boolean;
  enableBilling: boolean;
  onPlanInfoChanged: () => void;
  enableReplaceWebAppLogo: boolean;
  modelLoadBalancingEnabled: boolean;
  datasetOperatorEnabled: boolean;
};
const ProviderContext = createContext<ProviderContextState>({
  modelProviders: [],
  refreshModelProviders: () => {},
  textGenerationModelList: [],
  supportRetrievalMethods: [],
  isAPIKeySet: true,
  plan: {
    type: Plan.sandbox,
    usage: {
      vectorSpace: 32,
      buildApps: 12,
      teamMembers: 1,
      annotatedResponse: 1,
      documentsUploadQuota: 50
    },
    total: {
      vectorSpace: 200,
      buildApps: 50,
      teamMembers: 1,
      annotatedResponse: 10,
      documentsUploadQuota: 500
    }
  },
  isFetchedPlan: false,
  enableBilling: false,
  onPlanInfoChanged: () => {},
  enableReplaceWebAppLogo: false,
  modelLoadBalancingEnabled: false,
  datasetOperatorEnabled: false
});

export const useProviderContext = () => useContext(ProviderContext);

// Adding a dangling comma to avoid the generic parsing issue in tsx, see:
// https://github.com/microsoft/TypeScript/issues/15713
export const useProviderContextSelector = <T,>(
  selector: (state: ProviderContextState) => T
): T => useContextSelector(ProviderContext, selector);

type ProviderContextProviderProps = {
  children: React.ReactNode;
};
export const ProviderContextProvider = ({
  children
}: ProviderContextProviderProps) => {
  const [plan, setPlan] = useState({
    type: Plan.sandbox,
    usage: {
      documents: 50,
      vectorSpace: 1,
      buildApps: 1,
      teamMembers: 1,
      annotatedResponse: 1,
      documentsUploadQuota: 0
    },
    total: {
      documents: 50,
      vectorSpace: 10,
      buildApps: 10,
      teamMembers: 1,
      annotatedResponse: 10,
      documentsUploadQuota: 0
    }
  });
  const [isFetchedPlan, setIsFetchedPlan] = useState(false);
  const [enableBilling, setEnableBilling] = useState(true);
  const [enableReplaceWebAppLogo, setEnableReplaceWebAppLogo] = useState(false);
  const [modelLoadBalancingEnabled, setModelLoadBalancingEnabled] =
    useState(false);
  const [datasetOperatorEnabled, setDatasetOperatorEnabled] = useState(false);

  // const { data: textGenerationModelList } = useModelList(ModelTypeEnum.textGeneration)
  // const { data: providersData, mutate: refreshModelProviders } = useProviderList()
  const textGenerationModelList = undefined;
  const providersData = undefined;
  const refreshModelProviders = () => {};

  return (
    <ProviderContext.Provider
      value={{
        modelProviders: (providersData || []) as any[],
        refreshModelProviders,
        textGenerationModelList: (textGenerationModelList || []) as any[],
        isAPIKeySet: true,
        supportRetrievalMethods: [
          'semantic_search',
          'full_text_search',
          'hybrid_search'
        ] as any,
        plan,
        isFetchedPlan,
        enableBilling,
        onPlanInfoChanged: () => {},
        enableReplaceWebAppLogo,
        modelLoadBalancingEnabled,
        datasetOperatorEnabled
      }}
    >
      {children}
    </ProviderContext.Provider>
  );
};

export default ProviderContext;
