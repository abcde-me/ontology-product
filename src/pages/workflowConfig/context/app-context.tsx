import React, { createRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createContext, useContext, useContextSelector } from 'use-context-selector'
import type { FC, ReactNode } from 'react'
import Loading from '@/pages/workflowConfig/components/loading'
import type { App } from '@/pages/workflowConfig/types/app'
import type { ICurrentWorkspace, LangGeniusVersionResponse, UserProfileResponse } from '@/pages/workflowConfig/models/common'
import type { SystemFeatures } from '@/pages/workflowConfig/types/feature'
import { defaultSystemFeatures } from '@/pages/workflowConfig/types/feature'

export type AppContextValue = {
  apps: App[]
  systemFeatures: SystemFeatures
  mutateApps: VoidFunction
  userProfile: UserProfileResponse
  mutateUserProfile: VoidFunction
  currentWorkspace: ICurrentWorkspace
  isCurrentWorkspaceManager: boolean
  isCurrentWorkspaceOwner: boolean
  isCurrentWorkspaceEditor: boolean
  isCurrentWorkspaceDatasetOperator: boolean
  mutateCurrentWorkspace: VoidFunction
  // pageContainerRef: React.RefObject<HTMLDivElement>
  langeniusVersionInfo: LangGeniusVersionResponse
  useSelector: typeof useSelector
  isLoadingCurrentWorkspace: boolean
}

const initialLangeniusVersionInfo = {
  current_env: '',
  current_version: '',
  latest_version: '',
  release_date: '',
  release_notes: '',
  version: '',
  can_auto_update: false,
}

const initialWorkspaceInfo: ICurrentWorkspace = {
  id: '',
  name: '',
  plan: '',
  status: '',
  created_at: 0,
  role: 'normal',
  providers: [],
  in_trail: true,
}

const AppContext = createContext<AppContextValue>({
  systemFeatures: defaultSystemFeatures,
  apps: [],
  mutateApps: () => { },
  userProfile: {
    id: '',
    name: '',
    email: '',
    avatar: '',
    avatar_url: '',
    is_password_set: false,
  },
  currentWorkspace: initialWorkspaceInfo,
  isCurrentWorkspaceManager: false,
  isCurrentWorkspaceOwner: false,
  isCurrentWorkspaceEditor: false,
  isCurrentWorkspaceDatasetOperator: false,
  mutateUserProfile: () => { },
  mutateCurrentWorkspace: () => { },
  // pageContainerRef: createRef(),
  langeniusVersionInfo: initialLangeniusVersionInfo,
  useSelector,
  isLoadingCurrentWorkspace: false,
})

export function useSelector<T>(selector: (value: AppContextValue) => T): T {
  return useContextSelector(AppContext, selector)
}

export type AppContextProviderProps = {
  children: ReactNode
}

export const AppContextProvider: FC<AppContextProviderProps> = ({ children }) => {
  // const pageContainerRef = useRef<HTMLDivElement>(null)

  const appList = { data: [] }

  const systemFeatures = {}

  const [userProfile, setUserProfile] = useState<UserProfileResponse>({id: 1, name: '1'} as unknown as UserProfileResponse)
  const [langeniusVersionInfo, setLangeniusVersionInfo] = useState<LangGeniusVersionResponse>(initialLangeniusVersionInfo)
  const [currentWorkspace, setCurrentWorkspace] = useState<ICurrentWorkspace>(initialWorkspaceInfo)
  const isCurrentWorkspaceManager = true
  const isCurrentWorkspaceOwner = true
  const isCurrentWorkspaceEditor = true
  const isCurrentWorkspaceDatasetOperator = true
  

  if (!appList || !userProfile)
    return <Loading type='app' />

  return (
    <AppContext.Provider value={{
      apps: appList.data,
      systemFeatures: { ...defaultSystemFeatures, ...systemFeatures },
      mutateApps: () => {},
      userProfile,
      mutateUserProfile: () => {},
      // pageContainerRef,
      langeniusVersionInfo,
      useSelector,
      currentWorkspace,
      isCurrentWorkspaceManager,
      isCurrentWorkspaceOwner,
      isCurrentWorkspaceEditor,
      isCurrentWorkspaceDatasetOperator,
      mutateCurrentWorkspace: () => {},
      isLoadingCurrentWorkspace: false,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => useContext(AppContext)

export default AppContext
