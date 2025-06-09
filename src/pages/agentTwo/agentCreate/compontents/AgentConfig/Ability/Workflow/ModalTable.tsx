import React, { useState } from 'react';
import { Table, Input, Button, Modal } from '@arco-design/web-react';
import { useAgentEditor } from '../../../AgentProvider/Context'
import RefreshIcon from '@/assets/refresh.svg';
import { useHistory} from 'react-router-dom'
import { useTable } from './hooks/useTable';
import { useColumns } from './hooks/useColumns';
import './index.less';

const InputSearch = Input.Search;

/**
 * A modal component for selecting workflows with search and refresh functionality.
 * 
 * @remarks
 * - Displays a table of workflows that can be filtered by name
 * - Includes search input and refresh button for workflow list
 * - Provides a button to create new workflows
 * 
 * @returns A modal dialog containing workflow selection UI
 */
const ModalTable = () => {
  const history = useHistory();
  const   agent = useAgentEditor();
  const { workflowStore } = agent;
  const { modalVisible } = workflowStore.useGetState(['modalVisible'])
  const [name, setKeyword] = useState('');
  const { tableProps, refresh } = useTable({ name });
  const columns = useColumns();

  return (
    <Modal
      title="选择工作流"
      visible={modalVisible}
      footer={null}
      onCancel={() => workflowStore.setModalVisible(false)}
      
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <InputSearch
            placeholder="搜索工作流名称"
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
        <Button className="" type="primary" onClick={() => {
          history.push(`/tenant/compute/appforge/workflowConfig`);
        }}>
          创建工作流
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
