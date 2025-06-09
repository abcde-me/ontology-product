import { observer } from 'mobx-react-lite';
import * as React from 'react';
import Config from './config';
import { appConfigStore } from './model';
import DebugChat from './debug-chat';
import EmptyDebugChat from './debug-chat/empty';
import { useHistory } from 'react-router-dom';
function AppConfig(props: { appId?: string }) {
  const { appId } = props;
  const history = useHistory();

  React.useEffect(() => {
    appConfigStore.setHistory(history);
  }, [history]);

  React.useEffect(() => {
    if (appId) appConfigStore.getApp(appId);
  }, [appId]);

  return (
    <div className="flex flex-auto overflow-auto">
      <div className="mr-[10px] flex-1 overflow-auto rounded-[8px] bg-white">
        <Config />
      </div>
      <div className="flex-1 overflow-auto">
        {appConfigStore.app ? <DebugChat /> : <EmptyDebugChat />}
      </div>
    </div>
  );
}
export default observer(AppConfig);
