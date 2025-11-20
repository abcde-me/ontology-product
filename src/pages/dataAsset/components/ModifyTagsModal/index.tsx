import React, { useEffect, useMemo } from 'react';
import {
  Modal,
  Button,
  Select,
  Form,
  Tooltip,
  Tag,
  TreeSelect
} from '@arco-design/web-react';
import { BaseTag, TagValueItem } from '@/types/dataAssetApi';

interface ModifyTagsModalProps {
  selectedRowKeys: string[];
  visible: boolean;
  tagOptions: BaseTag[];
  initialTags?: TagValueItem[];
  onCancel: () => void;
  onConfirm: (
    tags: { label: string; value: string }[],
    selectedRowKeys: string[]
  ) => void;
}

const ModifyTagsModal: React.FC<ModifyTagsModalProps> = ({
  selectedRowKeys,
  visible,
  tagOptions,
  initialTags = [],
  onCancel,
  onConfirm
}) => {
  const [form] = Form.useForm();
  const tagTreeData = useMemo(() => {
    return tagOptions.map((tag) => ({
      key: tag.id,
      value: tag.id,
      id: tag.id,
      title: tag.name,
      selectable: false,
      checkable: false,
      disableCheckbox: true,
      children: (tag.valueList || []).map((item) => ({
        key: item.id,
        id: item.id,
        value: item.id,
        title: item.tagValue,
        parentId: tag.id
      }))
    }));
  }, [tagOptions]);

  useEffect(() => {
    if (visible) {
      form.resetFields();
      form.setFieldsValue({
        tags: initialTags.map((item) => ({
          label: item.tagValue,
          value: item.id
        }))
      });
    }
  }, [visible, initialTags, form]);

  const handleConfirm = async () => {
    try {
      const values = await form.validate();
      onConfirm(values.tags || [], selectedRowKeys);
    } catch (error) {
      // 验证失败，不做任何操作
    }
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
      <Form form={form} autoComplete="off">
        {/* 选择标签 */}
        <Form.Item label="选择标签" field="tags">
          <TreeSelect
            placeholder="请选择标签"
            value={initialTags.map((item) => {
              return {
                label: item.tagValue,
                value: item.id
              };
            })}
            multiple
            treeCheckable
            treeCheckStrictly
            labelInValue
            treeData={tagTreeData}
            maxTagCount={{
              count: 2,
              render: (invisibleTagCount) => {
                const allTags = form.getFieldValue('tags') || [];
                const remainingTags = allTags.slice(2);
                return (
                  <Tooltip
                    content={
                      <div className="ml-[-4px] flex max-w-[300px] flex-wrap gap-1">
                        {remainingTags.map((item, i) => (
                          <Tag
                            key={i}
                            className="bg-[#E7ECF0] text-[14px] text-[#0F172A]"
                          >
                            {item}
                          </Tag>
                        ))}
                      </div>
                    }
                  >
                    +{invisibleTagCount}
                  </Tooltip>
                );
              }
            }}
          ></TreeSelect>
        </Form.Item>

        {/* 按钮 */}
        <div className="mb-[20px] flex justify-end gap-[8px]">
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={handleConfirm}>
            确定
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ModifyTagsModal;
