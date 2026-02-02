import React, { useState, useMemo, useEffect } from 'react';
import { Tabs, Tag, Button, Message, Spin } from '@arco-design/web-react';
import { IconCopy, IconFullscreen } from '@arco-design/web-react/icon';
import {
  InfoDescription,
  DotStatus,
  copyToClipboard
} from '@ceai-front/arco-material';
import { OsDrawer } from '@/pages/ontologyScene/componens/OSDrawer';
import { BehaviorLogItem, STATUS_CONFIG } from '../types';
import {
  fetchBehaviorLogInputParams,
  fetchBehaviorLogExecutionDetail
} from '../services/behaviorLogApi';

const TabPane = Tabs.TabPane;

interface DetailDrawerProps {
  visible: boolean;
  data: BehaviorLogItem | null;
  onClose: () => void;
}

// 格式化耗时
const formatDuration = (ms: number): string => {
  if (ms < 1000) {
    return `${ms}ms`;
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(2)}s`;
  } else {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}m ${seconds}s`;
  }
};

export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  visible,
  data,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('input');
  const [inputParams, setInputParams] = useState<Record<string, any> | null>(
    null
  );
  const [executionDetail, setExecutionDetail] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // 加载入参和执行详情
  useEffect(() => {
    if (!visible || !data) {
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const [inputData, executionData] = await Promise.all([
          fetchBehaviorLogInputParams(data.id),
          fetchBehaviorLogExecutionDetail(data.id)
        ]);
        setInputParams(inputData);
        setExecutionDetail(executionData);
      } catch (error) {
        console.error('加载详情失败:', error);
        Message.error('加载详情失败');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [visible, data]);

  const statusConfig = data
    ? STATUS_CONFIG[data.status]
    : STATUS_CONFIG.success;

  // InfoDescription 数据
  const detailData = useMemo(() => {
    if (!data) return [];
    return [
      {
        title: '基本信息',
        items: [
          {
            label: '行为名称',
            value: data.type
          },
          {
            label: '状态',
            value: (
              <DotStatus color={statusConfig.color}>
                {statusConfig.text}
              </DotStatus>
            )
          },
          {
            label: '描述说明',
            value: '分布在边界区域的实时气象采集设备信息流映射'
          },
          {
            label: 'id',
            value: (
              <div className="flex items-center gap-1">
                <span className="font-mono">Action</span>
                <IconCopy
                  className="cursor-pointer text-sm text-[#86909c] hover:text-[#165dff]"
                  onClick={() => {
                    copyToClipboard('Action');
                  }}
                />
              </div>
            ),
            isCopy: false
          }
        ]
      },
      {
        title: '执行信息',
        items: [
          {
            label: '触发时间',
            value: data.startTime
          },
          {
            label: '执行耗时',
            value:
              data.status === 'running' ? '-' : formatDuration(data.duration)
          },
          {
            label: '完成时间',
            value: data.endTime
          }
        ]
      }
    ];
  }, [data, statusConfig]);

  // 复制到剪贴板
  const handleCopy = () => {
    const content =
      activeTab === 'input'
        ? JSON.stringify(inputParams, null, 2)
        : executionDetail;
    navigator.clipboard.writeText(content);
    Message.success('已复制到剪贴板');
  };

  // 获取当前显示的内容
  const currentContent = useMemo(() => {
    if (activeTab === 'input') {
      return inputParams ? JSON.stringify(inputParams, null, 2) : '';
    }
    return executionDetail;
  }, [activeTab, inputParams, executionDetail]);

  // 如果没有数据，不渲染
  if (!data) {
    return null;
  }

  return (
    <OsDrawer
      visible={visible}
      title="执行记录详情"
      onCancel={onClose}
      width={720}
      placement="right"
      mask={false} // 不显示遮罩层
      maskClosable={false}
    >
      <div className="flex h-full flex-col">
        {/* 基本信息和执行信息 */}
        <div className="flex-shrink-0">
          <InfoDescription
            data={detailData}
            column={2}
            titleStyle={{ fontSize: '14px', fontWeight: 500 }}
          />
        </div>

        {/* Tab 切换 + 代码编辑器 */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#e5e6eb] px-6">
            <Tabs
              activeTab={activeTab}
              onChange={setActiveTab}
              type="line"
              className="flex-1"
            >
              <TabPane title="入参详情" key="input" />
              <TabPane title="执行详情" key="execution" />
            </Tabs>
            <div className="flex items-center gap-2">
              <Button
                type="text"
                size="small"
                icon={<IconCopy />}
                onClick={handleCopy}
              >
                复制
              </Button>
              <Button type="text" size="small" icon={<IconFullscreen />}>
                全屏
              </Button>
            </div>
          </div>

          {/* 代码编辑器 */}
          <div className="flex-1 overflow-auto bg-[#f7f8fa] p-4">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <Spin />
              </div>
            ) : (
              <pre className="m-0 text-[13px] leading-[20px] text-[#1d2129]">
                <code>{currentContent}</code>
              </pre>
            )}
          </div>
        </div>
      </div>
    </OsDrawer>
  );
};
