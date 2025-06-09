import React, { useState } from 'react';
import { Table, Input, Button, Modal } from '@arco-design/web-react';
import RefreshIcon from '@/assets/refresh.svg';
import { useHistory } from 'react-router-dom'
import { useAgentEditor } from '../../../AgentProvider/Context'
import { useTable } from './hooks/useTable';
import { useColumns } from './hooks/useColumns';
import './index.less';

const InputSearch = Input.Search;

const ModalTable = () => {
  const agent = useAgentEditor();
  const { knowStore } = agent;
  const { modalVisible } = knowStore.useGetState(['modalVisible'])
  const history = useHistory();
  const [name, setKeyword] = useState('');
  const { tableProps, refresh } = useTable({ name });

  const columns = useColumns();

 

  const handleCreate = () => {
    history.push('/tenant/compute/appforge/createKnowledge');
  };

  return (
    <Modal
      title="选择知识库"
      visible={modalVisible}
      footer={null}
      onCancel={() => knowStore.setModalVisible(false)}
      style={{
        width: 800
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <InputSearch
            placeholder="搜索知识库名称"
            style={{ width: 240 }}
            value={name}
            onChange={setKeyword}
          />
          <button
            className="ml-1 flex h-8 cursor-pointer items-center rounded border border-gray-200 bg-white px-2 text-gray-700 hover:bg-gray-100"
            onClick={refresh}
            type="button"
          >
            <RefreshIcon />
          </button>
        </div>
        <Button className="" type="primary" onClick={handleCreate}>
          创建知识库
        </Button>
      </div>
      <Table
        className="modal-table"
        border={false}
        key="id"
        {...tableProps}
        columns={columns}
        rowKey="id"
      />
    </Modal>
  );
};

export default ModalTable;
