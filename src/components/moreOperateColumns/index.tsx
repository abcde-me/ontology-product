import { Button, Dropdown, Menu } from '@arco-design/web-react';
import { IconDown } from '@arco-design/web-react/icon';
import React, { useState } from 'react';

export default function MoreOperateColumns(props: {
  columnsConfigList: {
    title: string;
    method: () => void;
    disabled?: boolean;
    permission?: boolean;
  }[];
}) {
  const { columnsConfigList } = props;
  const moreColumnsConfigList = columnsConfigList.slice(2);
  return (
    <div className="flex items-center">
      <Button
        key={columnsConfigList[0]?.title}
        type="text"
        className="pl-0"
        onClick={() => columnsConfigList[0].method()}
        disabled={columnsConfigList[0]?.disabled}
      >
        {columnsConfigList[0]?.title}
      </Button>
      <Button
        key={columnsConfigList[1]?.title}
        type="text"
        className="pl-0"
        onClick={() => columnsConfigList[1].method()}
        disabled={columnsConfigList[1]?.disabled}
      >
        {columnsConfigList[1]?.title}
      </Button>
      {moreColumnsConfigList.length > 0 && (
        <Dropdown
          droplist={
            <Menu>
              {moreColumnsConfigList.map((item, index) => (
                <Menu.Item key={item.title}>
                  <Button
                    type="text"
                    style={{
                      padding: '0 8px 0 5px',
                      height: '100%',
                      borderTop: 'none',
                      borderBottom: 'none'
                    }}
                    disabled={item.disabled}
                    onClick={() => item.method()}
                  >
                    {item.title}
                  </Button>
                </Menu.Item>
              ))}
            </Menu>
          }
          trigger="hover"
          position="bl"
        >
          <Button type="text" className="px-0">
            更多
            <IconDown />
          </Button>
        </Dropdown>
      )}
    </div>
  );
}
