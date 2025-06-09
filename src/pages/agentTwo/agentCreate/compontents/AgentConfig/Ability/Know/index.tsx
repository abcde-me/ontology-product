import React from 'react';
import { Collapse, Tooltip } from '@arco-design/web-react';
import { useAgentEditor } from '../../../AgentProvider/Context';
import { confirm } from '@ccf2e/arco-material';
import AgentProvider from '../../../AgentProvider';
import { KNOW_DEFAULT_TEXT } from '../../../../constants';
import ConfigIcon from '@/assets/config.svg';
import AddIcon from '@/assets/add.svg';
import { useHistory } from 'react-router-dom'
import ModalTable from './ModalTable';
import KnowledgeItem from './KnowledgeItem';
import './index.less';
import PolicyForm from './PolicyForm';
import { useParams } from '@/hooks/useParmas';
const CollapseItem = Collapse.Item;

function Know() {
  const history = useHistory(); 
  const agent = useAgentEditor();
  const { knowStore } = agent;
  const { selectedList } = knowStore.useGetState();
  const id = useParams('id');
  console.log('selectedLis222t', selectedList);

  // 弹窗
  const handleClick = () => {
    knowStore.setModalVisible(true);
    // confirm({
    //   style: {
    //     width: 800
    //   },
    //   title: '选择知识库',
    //   subContent: (
    //     <AgentProvider agentStore={agent}>
    //       <ModalTable history={history} />
    //     </AgentProvider>
    //   ),
    //   tipIcon: '',
    //   footer: null
    // });
  };

  // 策略配置
  const handleConfig = () => {
    knowStore.setPolicyFormVisible(true);
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
          header="知识库"
          name="1"
          extra={
            <div className="relative ml-2 mr-2 flex items-center">
              <Tooltip content="策略配置">
                          <div
                            className="mr-1 flex h-6 w-6 cursor-pointer items-center justify-center   transition hover:text-blue-700"
                            onClick={() => handleConfig()}
                          >
                            <ConfigIcon />
                          </div>
                        </Tooltip>
            <Tooltip content="添加知识库">
              <AddIcon
                className="cursor-pointer text-gray-500 transition-colors hover:text-blue-700"
                onClick={handleClick}
              />
            </Tooltip>
            </div>
          }
        >
          {selectedList?.length > 0 ? (
            selectedList?.map((item) => (
              <KnowledgeItem
                key={item.id}
                text={item.name}
                onRemove={() => {
                  agent.knowStore.removeFromKnowList(item.id);
                  agent.infoStore.updateAgentConfigData(id);
                }}
                // onClickConfig={() => handleConfig(item)}
              />
            ))
          ) : (
            <div className="text-gray-500">{KNOW_DEFAULT_TEXT}</div>
          )}
          <PolicyForm />
        </CollapseItem>
      </Collapse>
      <ModalTable />
    </div>
  );
}
export default Know;
