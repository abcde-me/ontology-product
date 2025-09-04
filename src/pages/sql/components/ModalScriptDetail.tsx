import React from 'react';
import { Modal } from '@arco-design/web-react';
import CodeMirror from '@uiw/react-codemirror';
import { SCRIPT_CODE } from '../constant';
import { SqlIndexStore, useSqlIndexStore } from '../store';

const defaultCodeValue = SCRIPT_CODE;

/** 数据库详情 弹框 */
const ModalScriptDetail = () => {
  const scriptDetailVisible = useSqlIndexStore(
    (state: SqlIndexStore) => state.scriptDetailVisible
  );

  const closeScriptDetail = useSqlIndexStore(
    (state: SqlIndexStore) => state.closeScriptDetail
  );

  const codeValue = defaultCodeValue;

  return (
    <Modal
      title="SQL脚本详情"
      style={{ width: 960 }}
      visible={scriptDetailVisible}
      footer={null}
      onCancel={closeScriptDetail}
    >
      <div className="pb-[16px]">
        <CodeMirror value={codeValue} editable={false} height="500px" />
      </div>
    </Modal>
  );
};

export default ModalScriptDetail;
