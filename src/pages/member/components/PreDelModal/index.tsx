import React from 'react';
import { Modal, Button } from '@arco-design/web-react';
import { useMemberEditor } from '../MemberProvider/Context';

const PreDelModal = () => {
  const member = useMemberEditor();
  const { memberStore } = member;
  const { preDeleteVisible } = memberStore.useGetState(['preDeleteVisible']);
  const handleCancel = () => {
    memberStore.setPreDeleteVisible(false);
  };
  return (
    <Modal
      visible={preDeleteVisible}
      title="删除用户失败"
      footer={<Button onClick={handleCancel}>知道了</Button>}
      onCancel={handleCancel}
    >
      当前用户仍有资源（智能体、知识库、工作流），请先删除该用户资源后再删除用户；或禁用该用户以控制其登录系统。
    </Modal>
  );
};
export default PreDelModal;
