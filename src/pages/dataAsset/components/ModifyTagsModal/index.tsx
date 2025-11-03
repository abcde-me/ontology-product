import React, { useState, useEffect } from 'react';
import { Modal, Button, Select } from '@arco-design/web-react';

interface ModifyTagsModalProps {
  visible: boolean;
  tagOptions: Array<{ label: string; value: any }>;
  initialTags?: string[];
  onCancel: () => void;
  onConfirm: (tags: string[]) => void;
}

const ModifyTagsModal: React.FC<ModifyTagsModalProps> = ({
  visible,
  tagOptions,
  initialTags = [],
  onCancel,
  onConfirm
}) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      setSelectedTags(initialTags);
    }
  }, [visible, initialTags]);

  const handleConfirm = () => {
    onConfirm(selectedTags);
  };

  return (
    <Modal
      title="编辑标签"
      visible={visible}
      onCancel={onCancel}
      footer={null}
      style={{ width: 400 }}
      className="modify-tags-modal"
    >
      <div className="flex flex-col gap-4">
        {/* 选择标签 */}
        <div>
          <label className="mb-2 block text-sm">
            <span className="text-[#F53F3F]">*</span>
            <span className="ml-1">选择标签:</span>
          </label>
          <Select
            mode="multiple"
            placeholder="请选择标签"
            value={selectedTags}
            onChange={setSelectedTags}
            style={{ width: '100%' }}
            options={tagOptions}
            allowCreate
          />
        </div>

        {/* 按钮 */}
        <div className="mb-[20px] flex justify-end gap-[8px]">
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={handleConfirm}>
            确定
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ModifyTagsModal;
