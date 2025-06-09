import React from 'react';
import { Collapse, Input } from '@arco-design/web-react';
import { IconMoreVertical } from '@arco-design/web-react/icon';
import { useAgentEditor } from '../../../AgentProvider/Context';
import AutoGenerateIcon from '@/assets/autoGenerate.svg';
import './index.less';
import { useParams } from '@/hooks/useParmas';
const CollapseItem = Collapse.Item;
function Prologue() {
  const id = useParams('id');
  const agent = useAgentEditor();
  const { prologueStatus, prologue } = agent.abilityStore.useGetState();
  const handleClick = () => {
    agent.abilityStore.generatePrologue();
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
          header="开场白"
          name="1"
          extra={<AutoGenerateIcon onClick={handleClick} />}
        >
          <Input.TextArea
            value={prologue}
            onChange={(value) => {
              agent.abilityStore.setPrologue(value);
              agent.infoStore.updateAgentConfigData(id);
            }}
            placeholder="请输入开场白"
            disabled={prologueStatus}
          />
        </CollapseItem>
      </Collapse>
    </div>
  );
}

export default Prologue;
