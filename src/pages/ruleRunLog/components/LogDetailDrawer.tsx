import React, { useEffect, useState } from 'react';
import {
  ContentWithCopy,
  DrawerWithEditBtn,
  PyCodeContent
} from '@/pages/ontologyScene/components';
import {
  CopyItemIcon,
  copyToClipboard,
  DotStatus,
  NoDataCard
} from '@ceai-front/arco-material';
import { AutoExecLogDetail, AutoExecLogItem } from '../types';
import { fetchRuleRunLogDetail } from '../services';
import { IconCopy } from '@arco-design/web-react/icon';
import { Popover, Tooltip } from '@arco-design/web-react';

interface LogDetailDrawerProps {
  visible: boolean;
  onClose: () => void;
  record?: AutoExecLogItem;
}

const STATUS_MAP: Record<number, { label: string; color: string }> = {
  0: { label: '成功', color: '#10B981' },
  1: { label: '失败', color: '#E52E2D' },
  2: { label: '跳过', color: '#F59E0B' },
  3: { label: '待执行', color: '#86909C' }
};

export const LogDetailDrawer: React.FC<LogDetailDrawerProps> = ({
  visible,
  onClose,
  record
}) => {
  const [detail, setDetail] = useState<AutoExecLogDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    if (!visible || !record?.id) {
      setDetail(null);
      return;
    }

    setLoading(true);
    fetchRuleRunLogDetail(record.id)
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
  }, [record?.id, visible]);

  const logId = record?.logId || detail?.logId || '-';
  const statusValue = record?.status ?? detail?.status;
  const statusConfig =
    typeof statusValue === 'number' ? STATUS_MAP[statusValue] : undefined;
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
            <span>日志id：</span>
            <span className="text-[#1D2129]">{logId}</span>
            {logId !== '-' && (
              <Tooltip
                content={'复制'}
                triggerProps={{
                  position: 'right',
                  getPopupContainer: () => document.body,
                  popupStyle: {
                    zIndex: 9999
                  }
                }}
              >
                <IconCopy
                  className={
                    'flex-shrink-0 hover:cursor-pointer hover:text-[rgb(var(--primary-6))]'
                  }
                  onClick={() => {
                    copyToClipboard(String(logId));
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
            <span>门控耗时：</span>
            <span>{detail?.functionDuration || '-'}</span>
          </div>
          <div className="flex items-center gap-[8px] text-[14px] text-[#4E5969]">
            <span>行为耗时：</span>
            <span>{detail?.actionDuration || '-'}</span>
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
