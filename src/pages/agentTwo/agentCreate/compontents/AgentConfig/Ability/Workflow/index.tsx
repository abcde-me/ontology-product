import React from 'react';
import { Collapse, Tooltip } from '@arco-design/web-react';
import { useAgentEditor } from '../../../AgentProvider/Context';
import { confirm } from '@ccf2e/arco-material';
import AddIcon from '@/assets/add.svg';
import { WORKFLOW_DEFAULT_TEXT } from '../../../../constants';
import AgentProvider from '../../../AgentProvider';
import ModalTable from './ModalTable';
import KnowledgeItem from './KnowledgeItem';
import { useParams } from '@/hooks/useParmas';
import './index.less';

const CollapseItem = Collapse.Item;

function Know() {
  const agent = useAgentEditor();
  const { workflowStore } = agent;
  const { selectedList } = workflowStore.useGetState();
  console.log('selectedList', selectedList);
  const id = useParams('id');

  // 选择工作流
  const handleClick = () => {
    workflowStore.setModalVisible(true);
  };

  return (
    <div className="prologue">
      <Collapse
        bordered={false}
        defaultActiveKey={['1']}
        destroyOnHide
        lazyload
      >
        <CollapseItem
          header="工作流"
          name="1"
          extra={
            <Tooltip content="添加工作流">
              <AddIcon className="cursor-pointer" onClick={handleClick} />
            </Tooltip>
          }
        >
          {selectedList?.length > 0 ? (
            selectedList?.map((item) => (
              <KnowledgeItem
                key={item.id}
                text={item.name}
                onRemove={() => {
                  agent.workflowStore.removeFromKnowList(item.id);
                  agent.infoStore.updateAgentConfigData(id);
                }}
              />
            ))
          ) : (
            <div className="text-gray-500">{WORKFLOW_DEFAULT_TEXT}</div>
          )}
        </CollapseItem>
      </Collapse>
      <ModalTable />
    </div>
  );
}
export default Know;
