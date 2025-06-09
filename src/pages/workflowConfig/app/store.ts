import { create } from 'zustand'
import type { App, AppSSO } from '@/pages/workflowConfig/types/app'
import type { IChatItem } from '@/pages/workflowConfig/chat/chat/type'
// import appDetailJson from '@/pages/workflowConfig/mockData/appDetail.json'


interface State {
  appDetail?: App & Partial<AppSSO>
  appSidebarExpand: string
  currentLogItem?: IChatItem
  currentLogModalActiveTab: string
  showPromptLogModal: boolean
  showAgentLogModal: boolean
  showMessageLogModal: boolean
  showAppConfigureFeaturesModal: boolean
}

interface Action {
  setAppDetail: (appDetail?: App & Partial<AppSSO>) => void
  setAppSiderbarExpand: (state: string) => void
  setCurrentLogItem: (item?: IChatItem) => void
  setCurrentLogModalActiveTab: (tab: string) => void
  setShowPromptLogModal: (showPromptLogModal: boolean) => void
  setShowAgentLogModal: (showAgentLogModal: boolean) => void
  setShowMessageLogModal: (showMessageLogModal: boolean) => void
  setShowAppConfigureFeaturesModal: (showAppConfigureFeaturesModal: boolean) => void
}


console.warn('NEED LOAD API DETAIL BEFORE RUN')
export const useStore = create<State & Action>(set => ({
  appDetail: undefined,
  setAppDetail: appDetail => set(() => ({ appDetail })),
  appSidebarExpand: '',
  setAppSiderbarExpand: appSidebarExpand => set(() => ({ appSidebarExpand })),
  currentLogItem: undefined,
  currentLogModalActiveTab: 'DETAIL',
  setCurrentLogItem: currentLogItem => set(() => ({ currentLogItem })),
  setCurrentLogModalActiveTab: currentLogModalActiveTab => set(() => ({ currentLogModalActiveTab })),
  showPromptLogModal: false,
  setShowPromptLogModal: showPromptLogModal => set(() => ({ showPromptLogModal })),
  showAgentLogModal: false,
  setShowAgentLogModal: showAgentLogModal => set(() => ({ showAgentLogModal })),
  showMessageLogModal: false,
  setShowMessageLogModal: showMessageLogModal => set(() => {
    if (showMessageLogModal) {
      return { showMessageLogModal }
    }
    else {
      return {
        showMessageLogModal,
        currentLogModalActiveTab: 'DETAIL',
      }
    }
  }),
  showAppConfigureFeaturesModal: false,
  setShowAppConfigureFeaturesModal: showAppConfigureFeaturesModal => set(() => ({ showAppConfigureFeaturesModal })),
}))
