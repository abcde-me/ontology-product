import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import WujieReact from 'wujie-react';

const { bus } = WujieReact;

function OperationCenterPage() {
  // 使用 useLocation 来响应式获取 URL 参数
  const location = useLocation();
  const [pageUrl, setPageUrl] = useState<string | null>(null);
  const [wujieKey, setWujieKey] = useState(0);
  const lastUrlRef = useRef<string | null>(null);

  // 从 URL 查询参数中提取 url 参数
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlParam = searchParams.get('url');
    const decodedUrl = urlParam ? decodeURIComponent(urlParam) : null;

    console.log('URL parameter changed:', decodedUrl);

    // 如果 URL 参数变化，更新 pageUrl 并强制重新加载 WujieReact
    if (decodedUrl && decodedUrl !== lastUrlRef.current) {
      lastUrlRef.current = decodedUrl;
      setPageUrl(decodedUrl);

      // 发送刷新事件给 wujie 应用
      try {
        bus.$emit('refresh', decodedUrl.replace('/operationcenter', ''));
      } catch (e) {
        console.warn('Failed to emit refresh event:', e);
      }

      // 强制重新加载 WujieReact 组件：改变 key 会导致组件卸载和重新挂载
      setWujieKey((prev) => prev + 1);
    }
  }, [location.search]);

  return (
    <div className={`app-operation-center-page h-full w-full`}>
      {pageUrl && (
        <WujieReact
          key={wujieKey}
          width="100%"
          height="100%"
          name="mdp_operation_center"
          url={pageUrl}
          sync={true}
          alive={false}
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
