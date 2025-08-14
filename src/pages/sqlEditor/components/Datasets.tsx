import React, { FC, useEffect, useState } from 'react';
import { useSqlIndexStore, SqlIndexStore } from '../store';
import { Tree } from '@arco-design/web-react';
import { IconFile } from '@arco-design/web-react/icon';

const Datasets: FC = () => {
  const datesetsList = useSqlIndexStore(
    (state: SqlIndexStore) => state.datesetsList
  );

  const [treeData, setTreeData] = useState<any | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  useEffect(() => {
    const data = formatApiData(datesetsList);
    setTreeData(data);
    const keys = datesetsList.map((item: any) => item.id);
    setExpandedKeys(keys);
  }, [datesetsList]);

  return (
    <>
      <div className="flex h-full flex-col overflow-y-hidden">
        <div className="flex-1 overflow-y-auto px-[20px] pt-[10px]">
          <span className="text-[14px] font-[600]">数据集目录</span>
          {treeData && treeData.length > 0 && (
            <>
              <Tree
                blockNode
                treeData={treeData}
                fieldNames={{
                  key: 'id',
                  title: 'name'
                }}
                expandedKeys={expandedKeys}
                selectedKeys={selectedKeys}
                onSelect={(keys, extra) => {
                  console.log(keys, extra);
                  setSelectedKeys(keys);
                }}
                onExpand={(keys) => {
                  setExpandedKeys(keys);
                }}
              ></Tree>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Datasets;

function formatApiData(data: any[]): any[] {
  const addIcon = (item: any): any => {
    const newItem = { ...item };

    // 根据类型设置图标
    switch (item.type) {
      case 'table':
        newItem.icon = <IconFile className="text-gray-500" />;
        break;
      default:
        newItem.icon = <IconFile className="text-gray-500" />;
    }

    // 递归处理子节点
    if (item.children && item.children.length > 0) {
      newItem.children = item.children.map(addIcon);
    }

    return newItem;
  };

  return data.map(addIcon);
}
