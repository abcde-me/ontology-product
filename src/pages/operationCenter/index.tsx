import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from '@/utils/url';
import WujieReact from 'wujie-react';

const { bus } = WujieReact;

function OperationCenterPage() {
  const url = useParams('url');
  const pageUrl = useMemo(() => {
    return url ? decodeURIComponent(url) : url;
  }, [url]);
  const lastUrl = useRef(pageUrl);

  useEffect(() => {
    if (lastUrl.current && pageUrl && pageUrl !== lastUrl.current) {
      lastUrl.current = pageUrl;
      bus.$emit('refresh', pageUrl.replace('/operationcenter', ''));
    }
  }, [pageUrl]);

  return (
    <div className={`app-operation-center-page h-full w-full`}>
      {pageUrl && (
        <WujieReact
          width="100%"
          height="100%"
          name="operationcenter"
          url={pageUrl}
          sync={true}
          alive={true}
          loading={document.createElement('span') as any}
          props={{
            embedBySingleApp: true,
            appName: 'modaforge'
          }}
        ></WujieReact>
      )}
    </div>
  );
}

export default OperationCenterPage;
