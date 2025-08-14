import { Typography } from '@arco-design/web-react';
import React, { FC } from 'react';

interface SqlResultProps {
  initialState?: string;
}

const SqlResult: FC<SqlResultProps> = (props) => {
  const { initialState } = props;

  return (
    <div>
      <Typography.Title heading={6}>SQL 查询结果</Typography.Title>
      {initialState}
    </div>
  );
};

export default SqlResult;
