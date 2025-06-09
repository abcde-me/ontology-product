import React from 'react';
import Prologue from './Prologue';
import Recommend from './Recommend';
import Know from './Know';
import Workflow from './Workflow';
import PublicConfig from './PublicConfig';
import { Divider } from '@arco-design/web-react';

const Ability = () => {
  return (
    <div className="w-full  p-1">
      <div>能力</div>
      <Know />
      <Divider />
      <Workflow />
      <Divider />
      <div>对话</div>
      <Prologue />
      <Divider />
      <Recommend />
      <Divider />
      <div>发布配置</div>
      <PublicConfig />
    </div>
  );
};

export default Ability;
