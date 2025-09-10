import React from 'react';
import { Modal } from '@arco-design/web-react';
import CodeMirror from '@uiw/react-codemirror';

/** 数据库详情 弹框 */
const ModalScriptDetail = (props) => {
  const { formOrigin, visible, onCancel } = props;

  const codeValue = formOrigin.sql_content;

  return (
    <Modal
      title="SQL脚本详情"
      style={{ width: 960 }}
      visible={visible}
      footer={null}
      onCancel={onCancel}
    >
      <div className="pb-[16px]">
        <CodeMirror value={codeValue} editable={false} height="500px" />
      </div>
    </Modal>
  );
};

export default ModalScriptDetail;
