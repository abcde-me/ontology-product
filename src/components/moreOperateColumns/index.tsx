import React from 'react';
import { Button, Dropdown, Menu } from '@arco-design/web-react';
import { IconDown } from '@arco-design/web-react/icon';

/**
 * 更多操作列组件
 * 用于展示更多操作列，如删除、测试等操作。
 * 操作列配置列表中，前两个操作列会展示为按钮，后续操作列会展示为下拉菜单。
 * 使用场景:
 * 1. 表格中需要展示更多操作列，如删除、测试等操作。
 * 2. 前两个操作列无权限时，需要将更多内的操作列提出。
 *
 * @param props 组件属性
 * @param props.columnsConfigList 操作列配置列表
 * @returns
 */

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
      {moreColumnsConfigList.length === 1 ? (
        <Button
          key={moreColumnsConfigList[0]?.title}
          type="text"
          className="pl-0"
          onClick={() => moreColumnsConfigList[0].method()}
          disabled={moreColumnsConfigList[0]?.disabled}
        >
          {moreColumnsConfigList[0]?.title}
        </Button>
      ) : (
        moreColumnsConfigList.length > 1 && (
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
        )
      )}
    </div>
  );
}
