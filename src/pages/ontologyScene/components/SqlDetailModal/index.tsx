import React from 'react';
import { Modal } from '@arco-design/web-react';
import { GlobalTooltip } from '@ceai-front/arco-material';

interface SqlDetailModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  sql?: string;
  fullSql?: string;
  incrementSql?: string;
}

export const SqlDetailModal: React.FC<SqlDetailModalProps> = ({
  visible,
  onClose,
  title = 'SQL详情',
  sql,
  fullSql,
  incrementSql
}) => {
  return (
    <Modal
      title={title}
      visible={visible}
      onCancel={onClose}
      footer={null}
      style={{ width: 600 }}
    >
      <div className="flex max-h-[600px] flex-col gap-[16px] overflow-y-auto pb-[16px]">
        {/* 单个SQL */}
        {sql && (
          <div className="flex flex-col gap-[8px]">
            <div className="text-[14px] font-[600] leading-[22px] text-[var(--color-text-1)]">
              SQL语句
            </div>
            <div className="max-h-[300px] overflow-auto rounded border border-[var(--color-border-2)] bg-[#f7f8fa] p-[12px]">
              <pre className="whitespace-pre-wrap break-words font-mono text-[12px] leading-[20px] text-[var(--color-text-1)]">
                {sql || '-'}
              </pre>
            </div>
          </div>
        )}

        {/* 全量SQL */}
        {fullSql && (
          <div className="flex flex-col gap-[8px]">
            <div className="text-[14px] font-[600] leading-[22px] text-[var(--color-text-1)]">
              全量SQL
            </div>
            <div className="max-h-[300px] overflow-auto rounded border border-[var(--color-border-2)] bg-[#f7f8fa] p-[12px]">
              <pre className="whitespace-pre-wrap break-words font-mono text-[12px] leading-[20px] text-[var(--color-text-1)]">
                {fullSql || '-'}
              </pre>
            </div>
          </div>
        )}

        {/* 增量SQL */}
        {incrementSql && (
          <div className="flex flex-col gap-[8px]">
            <div className="text-[14px] font-[600] leading-[22px] text-[var(--color-text-1)]">
              增量SQL
            </div>
            <div className="max-h-[300px] overflow-auto rounded border border-[var(--color-border-2)] bg-[#f7f8fa] p-[12px]">
              <pre className="whitespace-pre-wrap break-words font-mono text-[12px] leading-[20px] text-[var(--color-text-1)]">
                {incrementSql || '-'}
              </pre>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SqlDetailModal;
