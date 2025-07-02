import React, { FC } from 'react';
import { Space, Typography } from '@arco-design/web-react';
import NoDataEmptySvg from '@/assets/emptyicon.svg';

type NoDataEmptyProps = {
  text?: string;
};

const NoDataEmpty: FC<NoDataEmptyProps> = (props) => {
  const { text = '暂无数据' } = props;

  return (
    <div
      className="flex flex-col justify-center"
      style={{ paddingTop: '100px' }}
    >
      <Space direction="vertical" align="center">
        <NoDataEmptySvg />
        <Typography.Text type="secondary">{text}</Typography.Text>
      </Space>
    </div>
  );
};

export default NoDataEmpty;
