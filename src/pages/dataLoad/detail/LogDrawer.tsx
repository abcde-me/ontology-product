import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Drawer, Button, Message } from '@arco-design/web-react';
import { IconRefresh, IconCopy } from '@arco-design/web-react/icon';
import { useVirtualList } from 'ahooks';
import { getLoadTaskInstanceLog } from '@/api/loadApi';
import copy from 'copy-to-clipboard';

export interface LogDrawerProps {
  visible: boolean;
  executionId: number;
  executionName?: string;
  onClose: () => void;
}

const LogDrawer: React.FC<LogDrawerProps> = ({
  visible,
  executionId,
  executionName,
  onClose
}) => {
  const [logContent, setLogContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 将日志按行分割
  const logLines = useMemo(() => {
    if (!logContent || logContent.trim() === '') return [];
    return logContent.split('\n');
  }, [logContent]);

  // 使用虚拟列表渲染日志
  const [logList] = useVirtualList(logLines, {
    containerTarget: containerRef,
    wrapperTarget: wrapperRef,
    itemHeight: 24, // 每行大约24px高度，参考样式中的 leading-[24px]
    overscan: 100 // 额外渲染的行数
  });

  // 加载日志
  const loadLogs = async () => {
    if (!executionId) return;

    setLoading(true);
    setLogContent('');
    try {
      const res = await getLoadTaskInstanceLog({ execution_id: executionId });
      if (res.status === 200 && res.data) {
        setLogContent(res.data || '');
      } else {
        Message.error(res.message || '获取日志失败');
        setLogContent('');
      }
    } catch (error) {
      console.error('获取日志失败:', error);
      Message.error('获取日志失败');
      setLogContent('');
    } finally {
      setLoading(false);
    }
  };

  // 刷新日志
  const handleRefresh = () => {
    loadLogs();
  };

  // 复制日志
  const handleCopy = () => {
    const success = copy(logContent);
    if (success) {
      Message.success('已复制到剪贴板');
    } else {
      Message.error('复制失败');
    }
  };

  // 当 visible 或 executionId 变化时，加载日志
  useEffect(() => {
    if (visible && executionId) {
      loadLogs();
    } else {
      setLogContent('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, executionId]);

  return (
    <Drawer
      visible={visible}
      onCancel={onClose}
      mask={true}
      width="720px"
      title="日志"
      footer={null}
    >
      <div className="mb-[12px] flex w-full items-center justify-between">
        <div
          className="text-[16px] font-[500]"
          style={{ color: 'var(--color-text-1)' }}
        >
          {executionName || `RUN${executionId}`}
        </div>
        <div className="flex gap-[8px]">
          <Button
            className="h-[24px]"
            type="outline"
            icon={<IconRefresh />}
            onClick={handleRefresh}
            loading={loading}
          >
            刷新
          </Button>
          <Button
            className="h-[24px]"
            type="outline"
            icon={<IconCopy />}
            onClick={handleCopy}
            disabled={logLines.length === 0}
          >
            复制
          </Button>
        </div>
      </div>
      <div
        ref={containerRef}
        className="h-[calc(100vh-120px)] overflow-x-auto overflow-y-auto whitespace-pre rounded-[4px] border border-[#E2E8F0] bg-[#F8FAFD] px-[12px] py-[8px] text-[14px] leading-[24px] text-[var(--color-text-1)]"
      >
        {logLines.length === 0 && !loading && (
          <div className="flex h-[200px] items-center justify-center text-[14px] leading-[24px] text-[var(--color-text-1)]">
            暂无日志
          </div>
        )}
        {loading && logLines.length === 0 && (
          <div className="flex items-center justify-center p-4 text-[14px] text-[var(--color-text-3)]">
            加载中...
          </div>
        )}
        {logLines.length > 0 && (
          <div ref={wrapperRef}>
            {logList.map((item) => (
              <div
                key={item.index}
                className="whitespace-pre text-[14px] leading-[24px] text-[var(--color-text-1)]"
              >
                {item.data}
              </div>
            ))}
          </div>
        )}
      </div>
    </Drawer>
  );
};

export default LogDrawer;
