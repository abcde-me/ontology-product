import React from 'react';
import { Button, Message, Modal } from '@arco-design/web-react';
import { IconCopy } from '@arco-design/web-react/icon';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import copy from 'copy-to-clipboard';
import EllipsisPopover from '@/components/ellipsis-popover-com';

interface ScriptDetailModalProps {
  visible: boolean;
  /** 脚本标题 */
  title?: string;
  /** 脚本内容 */
  content?: string;
  onCancel: () => void;
}

const ScriptDetailModal: React.FC<ScriptDetailModalProps> = ({
  visible,
  title,
  content,
  onCancel
}) => {
  const handleCopy = () => {
    if (!content) {
      Message.warning('暂无内容可复制');
      return;
    }
    const success = copy(content);
    if (success) {
      Message.success('复制成功');
    } else {
      Message.error('复制失败，请稍后重试');
    }
  };

  return (
    <Modal
      visible={visible}
      title="详情"
      onCancel={onCancel}
      footer={null}
      autoFocus={false}
      maskClosable
      unmountOnExit
      style={{ width: 900 }}
    >
      <div className="mb-[8px] flex items-center justify-between">
        <EllipsisPopover
          value={title}
          preferTypography
          wrapperClassName="text-[16px] font-[500] text-[var(--text-color-text-2)] w-[700px]"
        ></EllipsisPopover>
        <Button
          type="outline"
          icon={<IconCopy />}
          onClick={handleCopy}
          className="h-[24px] pl-[12px] pr-[12px]"
        >
          复制
        </Button>
      </div>
      <div className="border-[#E2E8F0]] mb-[24px] min-h-[200px] rounded-[8px] border p-[16px]">
        {content}
      </div>
    </Modal>
  );
};

export default ScriptDetailModal;
