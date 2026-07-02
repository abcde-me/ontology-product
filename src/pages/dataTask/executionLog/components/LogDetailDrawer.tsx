import React, { useEffect, useState } from 'react';
import { Tooltip } from '@arco-design/web-react';
import { IconCopy } from '@arco-design/web-react/icon';
import {
  DrawerWithEditBtn,
  PyCodeContent
} from '@/pages/ontologyScene/components';
import {
  copyToClipboard,
  DotStatus,
  NoDataCard
} from '@ceai-front/arco-material';
import type { ExecutionLogDetail, ExecutionLogItem } from '../types';
import { RunStatus } from '../types';
import { fetchExecutionLogDetail } from '../services/api';

interface LogDetailDrawerProps {
  visible: boolean;
  onClose: () => void;
  record?: ExecutionLogItem;
}

const STATUS_MAP: Record<RunStatus, { label: string; color: string }> = {
  [RunStatus.RUNNING]: { label: '执行中', color: '#ff7d00' },
  [RunStatus.SUCCESS]: { label: '成功', color: '#165dff' },
  [RunStatus.FAILED]: { label: '失败', color: '#f53f3f' }
};

export const LogDetailDrawer: React.FC<LogDetailDrawerProps> = ({
  visible,
  onClose,
  record
}) => {
  const [detail, setDetail] = useState<ExecutionLogDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    if (!visible || !record?.id) {
      setDetail(null);
      return;
    }

    setLoading(true);
    fetchExecutionLogDetail(record.id, record)
      .then((data) => {
        if (active) {
          setDetail(data || null);
        }
      })
      .catch((error) => {
        console.error('获取日志详情失败:', error);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [record, visible]);

  const runId = record?.runId || detail?.runId || '-';
  const statusValue = record?.status ?? detail?.status;
  const statusConfig = statusValue ? STATUS_MAP[statusValue] : undefined;
  const logContent = detail?.detailLog || detail?.errorMessage || '';

  return (
    <DrawerWithEditBtn
      visible={visible}
      onCancel={onClose}
      title="日志详情"
      footer={null}
      width={900}
    >
      <div className="flex h-full flex-col gap-[12px]">
        <div className="grid grid-cols-2 items-center gap-[16px]">
          <div className="flex items-center gap-[8px] text-[14px] text-[#4E5969]">
            <span>运行ID：</span>
            <span className="text-[#1D2129]">{runId}</span>
            {runId !== '-' && (
              <Tooltip
                content="复制"
                triggerProps={{
                  position: 'right',
                  getPopupContainer: () => document.body,
                  popupStyle: {
                    zIndex: 9999
                  }
                }}
              >
                <IconCopy
                  className="flex-shrink-0 hover:cursor-pointer hover:text-[rgb(var(--primary-6))]"
                  onClick={() => {
                    copyToClipboard(String(runId));
                  }}
                />
              </Tooltip>
            )}
          </div>
          <div className="flex items-center gap-[8px] text-[14px] text-[#4E5969]">
            <span>状态：</span>
            {statusConfig ? (
              <DotStatus text={statusConfig.label} color={statusConfig.color} />
            ) : (
              <span>-</span>
            )}
          </div>
          <div className="flex items-center gap-[8px] text-[14px] text-[#4E5969]">
            <span>开始时间：</span>
            <span>{detail?.startTime || record?.startTime || '-'}</span>
          </div>
          <div className="flex items-center gap-[8px] text-[14px] text-[#4E5969]">
            <span>结束时间：</span>
            <span>{detail?.endTime || record?.endTime || '-'}</span>
          </div>
          <div className="flex items-center gap-[8px] text-[14px] text-[#4E5969]">
            <span>运行时长：</span>
            <span>{detail?.duration || record?.duration || '-'}</span>
          </div>
          <div className="flex items-center gap-[8px] text-[14px] text-[#4E5969]">
            <span>失败重跑次数：</span>
            <span>
              {detail?.retryCount ?? record?.retryCount ?? 0} /{' '}
              {detail?.maxRetryCount ?? record?.maxRetryCount ?? 0}
            </span>
          </div>
        </div>
        <div className="min-h-0 flex-1">
          {loading ? (
            <div className="flex h-full items-center justify-center text-[#94A3B8]">
              加载中...
            </div>
          ) : logContent ? (
            <PyCodeContent
              value={logContent}
              readOnly
              style={{ height: '100%' }}
            />
          ) : (
            <NoDataCard type="block" title="暂无日志" />
          )}
        </div>
      </div>
    </DrawerWithEditBtn>
  );
};
