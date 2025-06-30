import React from 'react';
import { Modal, Button } from '@arco-design/web-react';
import { useOrgEditor } from '../OrgProvider/Context';

const PreDelModal = () => {
  const org = useOrgEditor();
  const { orgStore } = org;
  const { preDeleteVisible } = orgStore.useGetState(['preDeleteVisible']);
  const handleCancel = () => {
    orgStore.setPreDeleteVisible(false);
  };
  return (
    <Modal
      visible={preDeleteVisible}
      title="请先移除子部门以及全部部门成员后再操作"
      footer={<Button onClick={handleCancel}>知道了</Button>}
      onCancel={handleCancel}
    >
      删除操作仅对空组织/部门生效
    </Modal>
  );
};
export default PreDelModal;
