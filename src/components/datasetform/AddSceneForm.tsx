import React from 'react';
import { Form, Input, Modal, Select } from '@arco-design/web-react';
import styles from '@/pages/datasetManagement/index.module.scss';

export default function AddSceneFormModal({
  addSceneTypeVisible,
  sceneTypeForm,
  setAddSceneTypeVisible,
  handleAddSceneTypeSubmit,
  newTagList
}) {
  return (
    <Modal
      className={styles.addSceneTypeModal}
      visible={addSceneTypeVisible}
      onOk={() => sceneTypeForm.submit()}
      onCancel={() => {
        sceneTypeForm.resetFields();
        setAddSceneTypeVisible(false);
      }}
      title="新增场景类型"
    >
      <Form form={sceneTypeForm} onSubmit={handleAddSceneTypeSubmit}>
        <Form.Item
          label="场景分类名称："
          field="sceneTypeName"
          rules={[{ required: true, message: '请输入场景类型名称' }]}
        >
          <Input placeholder="请输入名称" />
        </Form.Item>
        <Form.Item label="场景分类标签：" field="sceneTypeTag">
          <Select
            mode="multiple"
            placeholder="请选择标签"
            allowCreate
            allowClear
            options={newTagList.map((item) => ({
              label: item.name,
              value: item.name
            }))}
          />
        </Form.Item>
        <Form.Item
          label="描述说明："
          field="sceneTypeDesc"
          rules={[{ required: true, message: '请输入描述说明' }]}
        >
          <Input.TextArea placeholder="可以描述数据集的用途、特点或其他相关信息" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
