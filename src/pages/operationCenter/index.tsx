import React, { useEffect, useMemo, useRef } from 'react';
import WujieReact from 'wujie-react';
import { OpenNewPageForOperationCenter } from '@/utils/env';
import { useHistory, useLocation } from 'react-router-dom';

const { bus } = WujieReact;

function getOperationCenterUrl(search: string) {
  const params = new URLSearchParams(search);
  const url = params.get('url');
  return url ? decodeURIComponent(url) : '';
}

function OperationCenterPage() {
  const history = useHistory();
  const location = useLocation();
  const pageUrl = useMemo(
    () => getOperationCenterUrl(location.search),
    [location.search]
  );
  const lastUrl = useRef<string | undefined>();

  const refreshOperationCenter = (search: string) => {
    const params = new URLSearchParams(search);
    const curUrl = params.get('url');
    const mdpUrl = params.get('mdp_operation_center');
    if (curUrl && !mdpUrl && curUrl.startsWith('/operationcenter/')) {
      bus.$emit('refresh', curUrl.replace('/operationcenter', ''), 'onto');
    }
  };

  useEffect(() => {
    refreshOperationCenter(history.location.search);
    const unlisten = history.listen((nextLocation) => {
      refreshOperationCenter(nextLocation.search);
    });

    return () => unlisten();
  }, [history]);

  useEffect(() => {
    if (!pageUrl || pageUrl === lastUrl.current) {
      return;
    }

    lastUrl.current = pageUrl;
    if (pageUrl.startsWith('/operationcenter/')) {
      bus.$emit('refresh', pageUrl.replace('/operationcenter', ''), 'noto');
    }
  }, [pageUrl]);

  const wujieUrl = useMemo(() => {
    if (!pageUrl) {
      return '';
    }

    if (/^https?:\/\//.test(pageUrl)) {
      return pageUrl;
    }

    return `${window.location.origin}${pageUrl}`;
  }, [pageUrl]);

  return (
    <div className="app-operation-center-page h-full w-full">
      {wujieUrl ? (
        <WujieReact
          key={wujieUrl}
          width="100%"
          height="100%"
          name="mdp_operation_center"
          url={wujieUrl}
          sync={true}
          alive={true}
          loading={document.createElement('span') as any}
          props={{
            embedBySingleApp: true,
            appName: 'noto',
            openNewPage: OpenNewPageForOperationCenter
          }}
        />
      ) : null}
    </div>
  );
}

export default OperationCenterPage;
