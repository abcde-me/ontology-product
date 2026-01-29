import React, { useEffect } from 'react';
import {
  Drawer,
  Tag,
  Button,
  Empty,
  Spin,
  Message
} from '@arco-design/web-react';
import {
  IconCheckCircleFill,
  IconCloseCircleFill
} from '@arco-design/web-react/icon';
import { useUIStore } from '../../store/uiStore';
import { useBusinessStore } from '../../store/businessStore';

export const TestHistoryDrawer: React.FC = () => {
  const testHistoryVisible = useUIStore((state) => state.testHistoryVisible);
  const setTestHistoryVisible = useUIStore(
    (state) => state.setTestHistoryVisible
  );

  const historyList = useBusinessStore((state) => state.historyList);
  const fetchHistory = useBusinessStore((state) => state.fetchHistory);
  const restoreHistory = useBusinessStore((state) => state.restoreHistory);

  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    if (testHistoryVisible) {
      loadHistory();
    }
  }, [testHistoryVisible]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      await fetchHistory();
    } catch (error) {
      Message.error('获取历史记录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTestHistoryVisible(false);
  };

  const handleRestore = (historyItem: any) => {
    try {
      restoreHistory(historyItem);
      Message.success('已恢复历史编排');
      handleClose();
    } catch (error) {
      Message.error('恢复失败，请重试');
    }
  };

  return (
    <Drawer
      visible={testHistoryVisible}
      title="测试历史"
      onCancel={handleClose}
      width={600}
      placement="right"
    >
      <div className="flex h-full flex-col">
        <Spin loading={loading} className="flex-1">
          {historyList.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <Empty description="暂无测试历史记录" />
            </div>
          ) : (
            <div className="space-y-3 px-6 py-4">
              {historyList.map((item) => (
                <div
                  key={item.id}
                  className="cursor-pointer rounded-lg border border-[#e5e6eb] bg-white p-4 transition-all duration-200 hover:border-[#c9cdd4] hover:shadow-md"
                >
                  {/* 头部 */}
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm text-[#4e5969]">
                      {item.createdAt}
                    </span>
                    <Tag
                      color={item.status === 'success' ? 'green' : 'red'}
                      icon={
                        item.status === 'success' ? (
                          <IconCheckCircleFill />
                        ) : (
                          <IconCloseCircleFill />
                        )
                      }
                    >
                      {item.status === 'success' ? '成功' : '失败'}
                    </Tag>
                  </div>

                  {/* 内容 */}
                  <div className="mb-3 flex items-center gap-6 text-sm text-[#86909c]">
                    <span>节点数量: {item.nodeCount}</span>
                    <span>执行时长: {item.duration}ms</span>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex justify-end">
                    <Button
                      size="small"
                      type="outline"
                      onClick={() => handleRestore(item)}
                    >
                      恢复
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Spin>
      </div>
    </Drawer>
  );
};
