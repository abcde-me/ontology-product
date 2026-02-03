import {
  Node,
  useNodeDataUpdate,
  useNodesInteractions,
  useNodesReadOnly,
  useNodesSyncDraft
} from '@ceai-front/workflow';
import { Message, Modal } from '@arco-design/web-react';
import React, { useState } from 'react';

export default function ControlPanel(props: {
  id: string;
  data: Node['data'];
  onClosePopup: () => void;
}) {
  const { id, data, onClosePopup } = props;
  const {
    handleNodeDelete,
    handleNodesDuplicate,
    handleNodeSelect,
    handleNodesCopy
  } = useNodesInteractions();
  const { handleNodeDataUpdate } = useNodeDataUpdate();
  const { handleSyncWorkflowDraft } = useNodesSyncDraft();
  const { nodesReadOnly } = useNodesReadOnly();

  const [visible, setVisible] = useState(false);

  function confirm() {
    Modal.confirm({
      title: 'Confirm deletion',
      content:
        'Are you sure you want to delete the 3 selected items? Once you press the delete button, the items will be deleted immediately. You can’t undo this action.',
      okButtonProps: {
        status: 'danger'
      },
      onOk: () => {
        return new Promise((resolve, reject) => {
          setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
        }).catch((e) => {
          Message.error({
            content: 'Error occurs!'
          });
          throw e;
        });
      }
    });
  }

  console.log('render', data);

  return (
    <>
      <div className="pt-[4px]">
        <div
          className="flex h-[32px] cursor-pointer items-center justify-between rounded-none px-[12px] pb-[7px] pt-[5px] text-[14px]/[20px] text-[#151B26] hover:bg-[#D9EAFF]"
          onClick={() => {
            onClosePopup();
            handleNodesCopy(id);
          }}
        >
          拷贝1
        </div>
        <div
          className="flex h-[32px] cursor-pointer items-center justify-between rounded-none px-[12px] pb-[7px] pt-[5px] text-[14px]/[20px] text-[#151B26] hover:bg-[#D9EAFF]"
          onClick={() => {
            onClosePopup();
            handleNodesDuplicate(id);
          }}
        >
          复制2
        </div>
      </div>
      <div className="h-[1px] bg-gray-100"></div>
      <div className="pb-[4px]">
        <div
          className={`
          flex h-[32px] cursor-pointer items-center justify-between rounded-none px-[12px] pb-[7px] pt-[5px] text-[14px]/[20px] text-[#151B26]
          hover:bg-rose-50 hover:text-red-500
          `}
          onClick={() => handleNodeDelete(id)}
        >
          删除3
        </div>
      </div>
      <div className="h-[1px] bg-gray-100"></div>
      <div className="pb-[4px]">
        <div
          className={`
          flex h-[32px] cursor-pointer items-center justify-between rounded-none px-[12px] pb-[7px] pt-[5px] text-[14px]/[20px] text-[#151B26]
          hover:bg-rose-50 hover:text-red-500
          `}
          onClick={() => setVisible(true)}
        >
          弹窗
        </div>
        <div
          className={`
          flex h-[32px] cursor-pointer items-center justify-between rounded-none px-[12px] pb-[7px] pt-[5px] text-[14px]/[20px] text-[#151B26]
          hover:bg-rose-50 hover:text-red-500
          `}
          onClick={confirm}
        >
          弹窗2
        </div>
      </div>
      <Modal
        title="Modal Title"
        visible={visible}
        onOk={() => setVisible(false)}
        onCancel={() => setVisible(false)}
        autoFocus={false}
        focusLock={true}
      >
        <p>
          You can customize modal body text by the current situation. This modal
          will be closed immediately once you press the OK button.
        </p>
      </Modal>
    </>
  );
}
