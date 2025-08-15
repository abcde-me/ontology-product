import React, { FC, useRef } from 'react';
import { Link, Space, Table, Button } from '@arco-design/web-react';
import { FullscreenContainer } from '../components/Fullscreen';
import { TableInstance } from '@arco-design/web-react/es/Table/table';

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    width: 140,
    fixed: 'left' as const
  },
  {
    title: 'Salary',
    dataIndex: 'salary',
    width: 100
  },
  {
    title: 'Address',
    dataIndex: 'address'
  },
  {
    title: 'Email',
    dataIndex: 'email'
  }
];

const data = Array(5)
  .fill('')
  .map((_, index) => ({
    key: `${index}`,
    name: `Kevin ${index}`,
    salary: 22000,
    address: `${index} Park Road, London`,
    email: `kevin.sandra_${index}@example.com`
  }));

interface SqlResultProps {
  initialState?: string;
}

const SqlResult: FC<SqlResultProps> = (props) => {
  const { initialState } = props;

  const table = useRef<TableInstance>(null);

  function handleSave() {}

  return (
    <FullscreenContainer
      className="h-full"
      onEnter={() => console.log('进入全屏')}
      onExit={() => console.log('退出全屏')}
    >
      {({ isFullscreen, toggleFullscreen }) => {
        return (
          <div className="flex h-full flex-col overflow-hidden">
            <div className="flex shrink-0 items-center justify-between bg-blue-50 px-[12px]">
              <span className="text-[16px] font-[600] leading-[40px] text-[rgb(var(--blue-6))]">
                查询结果
              </span>
              <Space size={10}>
                <Link href="#" onClick={handleSave}>
                  <span className="font-[600]">保存到数据集</span>
                </Link>
                <Link href="#" onClick={toggleFullscreen}>
                  <span className="font-[600]">
                    {isFullscreen ? '退出全屏' : '全屏'}
                  </span>
                </Link>
              </Space>
            </div>

            <div className="flex-1 overflow-auto">
              <Table
                ref={table}
                border
                columns={columns}
                data={data}
                pagination={false}
                rowSelection={{}}
              />
            </div>
          </div>
        );
      }}
    </FullscreenContainer>
  );
};

export default SqlResult;
