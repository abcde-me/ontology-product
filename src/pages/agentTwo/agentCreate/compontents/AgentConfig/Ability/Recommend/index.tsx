import React from 'react';
import { Collapse } from '@arco-design/web-react';
import DynamicInputList from './DynamicInputList';
import AutoGenerateIcon from '@/assets/autoGenerate.svg';
import { useAgentEditor } from '../../../AgentProvider/Context';
import './index.less';

const CollapseItem = Collapse.Item;

function Recommend() {
  const agent = useAgentEditor();
  const handleClick = () => {
    agent.abilityStore.generateRecommend();
  };
  return (
    <div className="recommend">
      <Collapse
        bordered={false}
        defaultActiveKey={['recommend']}
        destroyOnHide
        lazyload
      >
        <CollapseItem
          header="推荐问"
          name="recommend"
          extra={<AutoGenerateIcon onClick={handleClick} />}
        >
          <DynamicInputList />
        </CollapseItem>
      </Collapse>
    </div>
  );
}

export default Recommend;
