import BrowserInitor from '@/pages/workflowConfig/initor/browser-initor';
// import I18nServer from '@/pages/workflowConfig/initor/i18n-server'
import React from 'react';

export const Initor = ({ children }: { children: React.ReactElement }) => {
  // const locale = getLocaleOnServer()
  return (
    <BrowserInitor>
      {/* <I18nServer> */}
      {children}
      {/* </I18nServer> */}
    </BrowserInitor>
  );
};
