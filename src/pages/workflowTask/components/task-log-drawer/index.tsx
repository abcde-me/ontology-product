import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Drawer, Button, Message } from '@arco-design/web-react';
import { IconRefresh, IconCopy } from '@arco-design/web-react/icon';
import { useInfiniteScroll } from 'ahooks';
import { getRunLogs } from '@/api/workflowTask';
import type { GetRunLogsParams } from '@/types/workflowTaskApi';
import copy from 'copy-to-clipboard';

export interface TaskLogDrawerProps {
  visible: boolean;
  taskInstanceId: number;
  taskName?: string;
  onClose: () => void;
}

const TaskLogDrawer: React.FC<TaskLogDrawerProps> = ({
  visible,
  taskInstanceId,
  taskName,
  onClose
}) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isNoMore, setIsNoMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const skipLineNumRef = useRef(0);

  // 重置状态
  const resetState = useCallback(() => {
    setLogs([]);
    skipLineNumRef.current = 0;
    setIsNoMore(false);
  }, []);

  // 加载日志的函数
  const loadLogs = useCallback(async () => {
    if (isNoMore || !visible || !taskInstanceId || loading) {
      return;
    }

    setLoading(true);
    try {
      const params: GetRunLogsParams = {
        task_instance_id: taskInstanceId,
        limit: 1000, // 每次加载100行
        skip_line_num: skipLineNumRef.current
      };

      const res = await getRunLogs(params);

      if (res.status !== 200) {
        Message.error(res.message || '获取日志失败');
        setIsNoMore(true);
        return;
      }

      const { skip_line_num, message } = res.data;

      if (!message) {
        setIsNoMore(true);
        return;
      }

      // 更新跳过的行数
      skipLineNumRef.current = skip_line_num;

      // 将消息按行分割并追加到日志列表
      const newLogLines = message
        .split('\n')
        .filter((line) => line.trim() !== '');

      if (newLogLines.length > 0) {
        setLogs((prevLogs) => [...prevLogs, ...newLogLines]);
      }

      // 如果返回的消息为空或行数少于limit，说明没有更多数据了
      if (!message || newLogLines.length < 1000) {
        setIsNoMore(true);
      }
    } catch (error) {
      console.error('获取日志失败:', error);
      Message.error('获取日志失败');
      setIsNoMore(true);
    } finally {
      setLoading(false);
    }
  }, [isNoMore, visible, taskInstanceId, loading]);

  // 刷新：从第一页开始请求
  const handleRefresh = useCallback(() => {
    resetState();
    // 触发重新加载
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    // 延迟一下确保状态已重置，然后触发加载
    setTimeout(() => {
      loadLogs();
    }, 0);
  }, [resetState, loadLogs]);

  // 复制日志
  const handleCopy = useCallback(() => {
    const logText = logs.join('\n');
    const success = copy(logText);
    if (success) {
      Message.success('已复制到剪贴板');
    } else {
      Message.error('复制失败');
    }
  }, [logs]);

  // 无限滚动加载
  useInfiniteScroll(
    async () => {
      await loadLogs();
      return { list: [] };
    },
    {
      target: scrollContainerRef,
      isNoMore: () => isNoMore || !visible || !taskInstanceId,
      reloadDeps: [visible, taskInstanceId]
    }
  );

  // 当visible或taskInstanceId变化时，重置状态
  useEffect(() => {
    if (visible && taskInstanceId) {
      resetState();
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
            loading={loading}
          >
            刷新
          </Button>
          <Button
            className="h-[24px]"
            type="outline"
            icon={<IconCopy />}
            onClick={handleCopy}
            disabled={logs.length === 0}
          >
            复制
          </Button>
        </div>
      </div>
      <div
        ref={scrollContainerRef}
        className="h-[calc(100vh-120px)] overflow-y-auto whitespace-pre-wrap break-all rounded-[4px] border border-[#E2E8F0] bg-[#F8FAFD] px-[12px] py-[8px] text-[14px] leading-[24px] text-[var(--color-text-1)]"
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
