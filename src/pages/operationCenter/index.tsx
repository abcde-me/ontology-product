import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from '@/utils/url';
import WujieReact from 'wujie-react';
import { OpenNewPageForOperationCenter } from '@/utils/env';
import { useHistory, useLocation } from 'react-router-dom';

const { bus } = WujieReact;

function OperationCenterPage() {
  const url = useParams('url');
  const history = useHistory();
  const pageUrl = useMemo(() => {
    return url ? decodeURIComponent(url) : url;
  }, [url]);
  // const lastUrl = useRef(pageUrl);

  const refreshOperationCenter = (search: string) => {
    const params = new URLSearchParams(search);
    const curUrl = params.get('url');
    const mdpUrl = params.get('mdp_operation_center');
    if (curUrl && !mdpUrl && curUrl.startsWith('/operationcenter/')) {
      bus.$emit('refresh', curUrl.replace('/operationcenter', ''));
    }
  };

  useEffect(() => {
    console.log('URL before:', history);
    refreshOperationCenter(history.location.search);
    const unlisten = history.listen((location, action) => {
      console.log('URL after:', location.search);
      refreshOperationCenter(location.search);
    });

    return () => unlisten();
  }, [history]);

  // useEffect(() => {
  //   if (lastUrl.current && pageUrl && pageUrl !== lastUrl.current) {
  //     lastUrl.current = pageUrl;
  //     bus.$emit('refresh', pageUrl.replace('/operationcenter', ''));
  //   }
  // }, [pageUrl]);

  return (
    <div className={`app-operation-center-page h-full w-full`}>
      {pageUrl && (
        <WujieReact
          width="100%"
          height="100%"
          name="mdp_operation_center"
          url={pageUrl}
          sync={true}
          alive={true}
          loading={document.createElement('span') as any}
          props={{
            embedBySingleApp: true,
            appName: 'modaforge',
            openNewPage: OpenNewPageForOperationCenter
          }}
        ></WujieReact>
      )}
    </div>
  );
}

export default OperationCenterPage;
