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
  visible: boolean;
  tagOptions: BaseTag[];
  initialTags?: TagValueItem[];
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
  const [form] = Form.useForm();
  const tagTreeData = useMemo(
    () =>
      tagOptions.map((tag) => ({
        key: tag.id,
        value: tag.id,
        title: tag.name,
        selectable: false,
        checkable: false,
        disableCheckbox: true,
        children: (tag.valueList || []).map((item) => ({
          key: item.id,
          value: item.id,
          title: item.tagValue,
          parentId: tag.id
        }))
      })),
    [tagOptions]
  );

  useEffect(() => {
    if (visible) {
      form.resetFields();
      form.setFieldsValue({
        tags: initialTags
      });
    }
  }, [visible, initialTags, form]);

  const handleConfirm = async () => {
    try {
      const values = await form.validate();
      onConfirm(values.tags || []);
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
        <Form.Item
          label="选择标签"
          field="tags"
          rules={[{ required: true, message: '请选择标签' }]}
        >
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
            // value={recordTags}
            // options={tagOptions}
            // dropdownMenuClassName="data-asset-dropdown-select"
            // renderTag={tagRender}
            // popupVisible={selectVisible[record.id] || false}
            // onVisibleChange={(visible) => {
            //   setSelectVisible((prev) => ({
            //     ...prev,
            //     [record.id]: visible
            //   }));
            //   if (visible) {
            //     setEditingTagRecordId(record.id);
            //   }
            // }}
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
                            // className={classNames(styles['tag'])}
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
            // onChange={(values) => handleTagChange(record.id, values)}
          ></TreeSelect>
          {/* <Select
            mode="multiple"
            placeholder="请选择标签"
            style={{ width: '100%' }}
            maxTagCount={2}
            options={tagOptions}
            allowCreate
          /> */}
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
