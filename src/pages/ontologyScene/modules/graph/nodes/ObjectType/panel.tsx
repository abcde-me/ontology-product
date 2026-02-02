import type { FC } from 'react';
import React from 'react';

const Panel: FC<any> = ({ id, data }) => {
  console.log('panel', id, data);
  return (
    <div className="mt-2">
      <div className="space-y-4 px-4 pb-2">my node panel</div>
    </div>
  );
};

export default React.memo(Panel);
