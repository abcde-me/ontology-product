// import { TanstackQueryIniter } from '@/pages/workflowConfig/context/query-client'
import { AppContextProvider } from '@/pages/workflowConfig/context/app-context'
// import { getLocaleOnServer } from '@/pages/workflowConfig/i18n/server'
import { EventEmitterContextProvider } from '@/pages/workflowConfig/context/event-emitter'
import { ProviderContextProvider } from '@/pages/workflowConfig/context/provider-context'
import { ToastProvider } from '@/pages/workflowConfig/components/toast'
import BrowserInitor from './browser-initor'
// import SwrInitor from './swr-initor'
// import I18nServer from './i18n-server'
import React from 'react'

export const Initor = ({
  children,
}: { children: React.ReactElement }) => {
  // const locale = getLocaleOnServer()
  return (
    <BrowserInitor>
      {/* <TanstackQueryIniter> */}
        {/* <I18nServer> */}
          {/* <SwrInitor> */}
            <AppContextProvider>
              <EventEmitterContextProvider>
                <ProviderContextProvider>
                  <ToastProvider>
                    {children}
                  </ToastProvider>
                </ProviderContextProvider>
              </EventEmitterContextProvider>
            </AppContextProvider>
          {/* </SwrInitor> */}
        {/* </I18nServer> */}
      {/* </TanstackQueryIniter> */}
    </BrowserInitor>
  )
}