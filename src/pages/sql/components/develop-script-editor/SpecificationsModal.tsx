import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Message, Spin } from '@arco-design/web-react';
import {
  getDevelopStandards,
  updateDevelopSystemParam
} from '@/api/sql-develop';

const { TextArea } = Input;

interface SpecificationsModalProps {
  visible: boolean;
  onCancel: () => void;
  initialContent?: string;
  onSave?: (content: string) => void;
}

const SpecificationsModal: React.FC<SpecificationsModalProps> = ({
  visible,
  onCancel,
  initialContent = '',
  onSave
}) => {
  const [specificationsContent, setSpecificationsContent] =
    useState<string>(initialContent);
  const [newSpecificationsContent, setNewSpecificationsContent] =
    useState<string>('');
  const [isSpecificationsValid, setIsSpecificationsValid] = useState(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // 当 visible 变化时，主动请求获取开发规范
  useEffect(() => {
    if (visible) {
      fetchDevelopStandards();
    }
  }, [visible]);

  // 获取开发规范
  const fetchDevelopStandards = async () => {
    setLoading(true);
    try {
      const res = await getDevelopStandards({});
      if (res.status === 200) {
        const content = res?.data ?? '';
        setSpecificationsContent(content);
        setNewSpecificationsContent(content);
        setIsSpecificationsValid(true);
      } else {
        Message.error(res.message ?? '获取开发规范失败');
        // 如果没有数据，使用空字符串
        setSpecificationsContent('');
        setNewSpecificationsContent('');
        setIsSpecificationsValid(true);
      }
    } catch (error) {
      console.error('获取开发规范失败:', error);
      Message.error('获取开发规范失败');
      setSpecificationsContent('');
      setNewSpecificationsContent('');
    } finally {
      setLoading(false);
    }
  };

  const handleSpecificationsChange = (val: string) => {
    setNewSpecificationsContent(val);
  };

  const handleEdit = () => {
    setIsSpecificationsValid(false);
  };

  const handleCancel = () => {
    setIsSpecificationsValid(true);
    setNewSpecificationsContent(specificationsContent);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateDevelopSystemParam({
        config_value: newSpecificationsContent
      });
      if (res.status === 200 && res.code === '') {
        setSpecificationsContent(newSpecificationsContent);
        setIsSpecificationsValid(true);
        Message.success('保存成功');
        if (onSave) {
          onSave(newSpecificationsContent);
        }
      } else {
        Message.error(res.message ?? '保存失败');
      }
    } catch (error) {
      console.error('保存开发规范失败:', error);
      Message.error('保存开发规范失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="开发规范"
      visible={visible}
      onCancel={onCancel}
      footer={null}
      style={{
        width: 960,
        height: 678
      }}
    >
      <Spin loading={loading} style={{ width: '100%', height: '100%' }}>
        <div className="relative h-full w-full">
          <div className="absolute right-[10px] top-[10px] z-10 flex items-end">
            {isSpecificationsValid ? (
              <Button
                onClick={handleEdit}
                className="h-6 w-[52px] !border !border-[#cbd5e1] px-2 text-sm font-semibold leading-[22px] !text-[#1e293b] hover:!border-[#cbd5e1] hover:!text-[#1e293b]"
                style={{ fontFamily: "'PingFang SC'" }}
              >
                编辑
              </Button>
            ) : (
              <div className="flex items-center">
                <Button
                  onClick={handleCancel}
                  className="mr-2 h-6 w-[52px] px-2"
                  disabled={saving}
                >
                  取消
                </Button>
                <Button
                  onClick={handleSave}
                  type="primary"
                  className="h-6 w-[52px] px-2"
                  loading={saving}
                >
                  确定
                </Button>
              </div>
            )}
          </div>
          {isSpecificationsValid ? (
            <div
              className="h-[590px] max-h-[590px] overflow-y-auto border border-[#E2E8F0] p-[16px] text-[14px] text-[#000]"
              style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                borderRadius: '8px'
              }}
            >
              {specificationsContent}
            </div>
          ) : (
            <TextArea
              placeholder="请输入开发规范"
              style={{
                width: 912,
                maxHeight: 590,
                height: 590,
                color: '#000',
                padding: '16px'
              }}
              value={newSpecificationsContent}
              onChange={handleSpecificationsChange}
            />
          )}
        </div>
      </Spin>
    </Modal>
  );
};

export default SpecificationsModal;
