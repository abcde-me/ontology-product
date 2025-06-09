import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { useParams } from '../../utils/url';
import AppConfig from './appConfig';
import ConfigTabs from './tabs';
import { appConfigStore } from './appConfig/model';
import { Spin } from '@arco-design/web-react';
function AppCreatePage() {
  const appId = useParams('id');

  const initRef = React.useRef(false);
  if (!initRef.current) {
    initRef.current = true;
    appConfigStore.reset();
  }
  return (
    <Spin
      className="appforge-spin"
      loading={appConfigStore.loading || appConfigStore.creating}
    >
      <ConfigTabs appconfig={<AppConfig appId={appId} />} />
    </Spin>
  );
}
export default observer(AppCreatePage);
