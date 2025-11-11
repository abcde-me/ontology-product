/**
 * PPT Viewer Component
 * PPT在线查看器 - 类似PdfViewer的实现
 * 使用iframe + Office Online Viewer或Google Docs Viewer来渲染PPT文件
 */

import React, { useState, useEffect, useRef } from 'react';
import { useRagDetailStore } from '../../../store/ragDetailStore';

interface PptViewerProps {
  fileName?: string;
  filePath?: string;
  pptData?: ArrayBuffer; // 支持直接传入二进制数据
  hideHeader?: boolean;
}

const PptViewer: React.FC<PptViewerProps> = ({
  fileName,
  filePath,
  pptData,
  hideHeader = false
}) => {
  const { selectedSegmentId, segments } = useRagDetailStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [pptUrl, setPptUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 显示的文件名
  const displayFileName = fileName || filePath?.split('/').pop() || 'PPT文档';

  // 处理PPT文件URL
  useEffect(() => {
    if (pptData) {
      // 如果有二进制数据，创建Blob URL
      const blob = new Blob([pptData], {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      });
      const url = URL.createObjectURL(blob);
      setPptUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    } else if (filePath) {
      // 使用文件路径
      setPptUrl(filePath);
    }
  }, [pptData, filePath]);

  // 监听selectedSegmentId变化，跳转到对应的幻灯片
  useEffect(() => {
    if (selectedSegmentId && segments.length > 0 && iframeRef.current) {
      const segment = segments.find((seg: any) => seg.id === selectedSegmentId);
      if (segment && 'slideNumber' in segment) {
        const slideNumber = (segment as any).slideNumber;
        // 尝试通过postMessage与iframe通信来跳转到指定页面
        // 注意：这取决于使用的PPT查看器是否支持
        try {
          iframeRef.current.contentWindow?.postMessage(
            {
              type: 'gotoSlide',
              slideNumber: slideNumber
            },
            '*'
          );
        } catch (e) {
          console.warn('无法跳转到指定幻灯片:', e);
        }
      }
    }
  }, [selectedSegmentId, segments]);

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleIframeError = () => {
    setLoading(false);
    setError('无法加载PPT文件');
  };

  // 使用Office Online Viewer或Google Docs Viewer
  const getViewerUrl = (url: string) => {
    // 如果URL已经包含viewer，直接返回
    if (
      url.includes('view.officeapps.live.com') ||
      url.includes('docs.google.com/gview')
    ) {
      return url;
    }

    // 方案1: Microsoft Office Online Viewer
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;

    // 方案2: Google Docs Viewer
    // return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
  };

  return (
    <div className="flex h-full w-full flex-col">
      {/* PPT头部 - 文件名（可选） */}
      {!hideHeader && (
        <div className="flex h-[56px] items-center border-b border-gray-200 px-5">
          <span className="text-[14px] font-medium text-gray-900">
            {displayFileName}
          </span>
        </div>
      )}

      {/* PPT内容 */}
      <div className="relative flex-1 overflow-hidden bg-[#F7F8FA]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
              <p className="text-gray-600">加载PPT中...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <div className="text-center">
              <p className="text-red-500">{error}</p>
              <p className="mt-2 text-sm text-gray-500">
                请确保PPT文件可访问或使用支持的格式
              </p>
            </div>
          </div>
        )}

        {pptUrl && (
          <iframe
            ref={iframeRef}
            src={getViewerUrl(pptUrl)}
            className="h-full w-full border-0"
            title={displayFileName}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
        )}

        {!pptUrl && !loading && !error && (
          <div className="flex h-full items-center justify-center">
            <div className="text-gray-500">暂无PPT数据</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PptViewer;
