import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Drawer, Button, Message } from '@arco-design/web-react';
import { IconRefresh, IconCopy } from '@arco-design/web-react/icon';
import { useInfiniteScroll, useRequest } from 'ahooks';
import { copyToClipboard } from '@ceai-front/arco-material';

const PAGE_SIZE = 100;

export interface TaskLogDrawerProps {
  visible: boolean;
  taskInstanceId: number;
  taskName?: string;
  onClose: () => void;
  extraParams?: Record<string, any>;
  fetchLog: (
    params: {
      id: number;
      pageNo: number;
      pageSize: number;
    } & Record<string, any>
  ) => Promise<
    ApiRes<{
      message: string;
    }>
  >;
}

const TaskLogDrawer: React.FC<TaskLogDrawerProps> = ({
  visible,
  taskInstanceId,
  taskName,
  onClose,
  extraParams,
  fetchLog
}) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isNoMore, setIsNoMore] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageNoRef = useRef(1);

  // 重置状态
  const resetState = useCallback(() => {
    setLogs([]);
    pageNoRef.current = 1;
    setIsNoMore(false);
  }, [setLogs, setIsNoMore, pageNoRef]);

  // 使用 useRequest 加载日志
  const { loading, run: loadLogs } = useRequest(
    async () => {
      const params = {
        id: taskInstanceId,
        pageNo: pageNoRef.current,
        pageSize: PAGE_SIZE,
        ...(extraParams || {})
      };

      const res = await fetchLog(params);

      if (res.status !== 200) {
        throw new Error(res.message || '获取日志失败');
      }

      return res.data;
    },
    {
      manual: true,
      onSuccess: (data) => {
        const { message } = data;

        if (!message) {
          setIsNoMore(true);
          return;
        }

        // 将消息按行分割
        const newLogLines = message.split('\n');

        if (newLogLines.length > 0) {
          setLogs((prevLogs) => [...prevLogs, ...newLogLines]);
        }

        // 判断是否是最后一页：如果返回的行数小于pageSize，说明是最后一页
        if (newLogLines.length < PAGE_SIZE) {
          setIsNoMore(true);
        } else {
          // 更新页码，准备加载下一页
          pageNoRef.current += 1;
        }
      },
      onError: (error) => {
        console.error('获取日志失败:', error);
        Message.error(error.message || '获取日志失败');
        setIsNoMore(true);
      }
    }
  );

  // 包装 loadLogs 以添加条件检查
  const handleLoadLogs = useCallback(async () => {
    if (isNoMore || !visible || !taskInstanceId || loading) {
      return Promise.resolve();
    }
    return loadLogs();
  }, [isNoMore, visible, taskInstanceId, loading, loadLogs]);

  // 刷新：从第一页开始请求
  const handleRefresh = useCallback(() => {
    resetState();
    // 延迟一下确保状态已重置，然后触发加载
    setTimeout(() => {
      handleLoadLogs();
    }, 0);
  }, [resetState, handleLoadLogs]);

  // 复制日志
  const handleCopy = useCallback(async () => {
    const logText = logs.join('\n');
    const result = await copyToClipboard(logText);
    if (!result.success) {
      Message.error(result.message || '复制失败');
    }
  }, [logs]);

  // 无限滚动加载
  useInfiniteScroll(
    async () => {
      await handleLoadLogs();
      return { list: [] };
    },
    {
      target: scrollContainerRef,
      isNoMore: () => isNoMore || !visible || !taskInstanceId,
      reloadDeps: [visible, taskInstanceId, isNoMore]
    }
  );

  // 当visible或taskInstanceId变化时，重置状态并加载第一页
  useEffect(() => {
    if (visible && taskInstanceId) {
      resetState();
      // 延迟一下确保状态已重置，然后触发加载
      setTimeout(() => {
        handleLoadLogs();
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, taskInstanceId]);

  return (
    <Drawer
      visible={visible}
      onCancel={onClose}
      width="720px"
      title="日志"
      footer={null}
    >
      <div className="mb-[12px] flex w-full items-center justify-between">
        <div
          className="text-[16px] font-[500]"
          style={{ color: 'var(--color-text-1)' }}
        >
          {taskName || '任务节点'}
        </div>
        <div className="flex gap-[8px]">
          <Button
            className="h-[24px]"
            type="outline"
            icon={<IconRefresh />}
            onClick={handleRefresh}
          >
            刷新
          </Button>
          <Button
            className="h-[24px]"
            type="outline"
            icon={<IconCopy />}
            onClick={() => void handleCopy()}
            disabled={logs.length === 0}
          >
            复制
          </Button>
        </div>
      </div>
      <div
        ref={scrollContainerRef}
        className="h-[calc(100vh-120px)] overflow-x-auto overflow-y-auto whitespace-pre rounded-[4px] border border-[#E2E8F0] bg-[#F8FAFD] px-[12px] py-[8px] text-[14px] leading-[24px] text-[var(--color-text-1)]"
      >
        {logs.length === 0 && !loading && (
          <div className="flex h-[200px] items-center justify-center text-[14px] leading-[24px] text-[var(--color-text-1)]">
            暂无日志
          </div>
        )}
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
        {loading && (
          <div className="flex items-center justify-center p-4 text-[14px] text-[var(--color-text-3)]">
            加载中...
          </div>
        )}
        {isNoMore && logs.length > 0 && (
          <div className="flex items-center justify-center p-4 text-[14px] text-[var(--color-text-3)]">
            已加载全部日志
          </div>
        )}
      </div>
    </Drawer>
  );
};

export default TaskLogDrawer;
