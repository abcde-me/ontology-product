import React from 'react';
import Basic from './Basic';
import Role from './Role';
import { Divider } from '@arco-design/web-react';
const Left = () => {
  return (
    <div className="m-2 h-full p-2">
      <Basic />
      <Divider />
      <Role />
    </div>
  );
};

export default Left;
