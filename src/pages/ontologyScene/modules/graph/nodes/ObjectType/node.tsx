import { Button } from '@arco-design/web-react';
import type { FC } from 'react';
import React from 'react';

const Node = ({ id }) => {
  return (
    <div className="wk-node-content mb-1 px-3 py-1">
      <div className="space-y-[6px]">
        My Node
        {/* <Button type='primary'>
          Click me
       </Button> */}
      </div>
    </div>
  );
};

export default React.memo(Node);
