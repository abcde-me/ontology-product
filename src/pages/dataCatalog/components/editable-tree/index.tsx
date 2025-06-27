import React, { useState } from 'react';
import { Tooltip, Tree } from '@arco-design/web-react';
import {
  IconCaretDown,
  IconPlus,
  IconDelete,
  IconEdit,
  IconStorage,
  IconArchive
} from '@arco-design/web-react/icon';
import SearchInput from '../search-input';
import {
  NodeInstance,
  TreeDataType
} from '@arco-design/web-react/es/Tree/interface';
import classNames from 'classnames';
import './index.css';

interface ITreeData {
  id: string | number;
  name: string;
  type: string;
  parent_id?: string | number;
  children?: {
    volume?: Array<{
      id: number;
      name: string;
      parent_id: number;
    }>;
    db?: Array<{
      id: number;
      name: string;
      parent_id: number;
    }>;
  };
}

const fakeData: ITreeData[] = [
  {
    type: 'catalog',
    id: 1,
    name: '目录1',
    children: {
      volume: [
        {
          id: 10,
          name: 'source-vol',
          parent_id: 1
        },
        {
          id: 11,
          name: 'source-vol-22222',
          parent_id: 1
        }
      ],
      db: [
        {
          id: 20,
          name: 'source-db-1',
          parent_id: 1
        },
        {
          id: 21,
          name: 'source-db-2',
          parent_id: 1
        }
      ]
    }
  }
];

const generatorTreeNodes = (treeData) => {
  return treeData.map((item) => {
    const { children, key, ...rest } = item;
    return (
      <Tree.Node key={key} {...rest} dataRef={item}>
        {children ? generatorTreeNodes(item.children) : null}
      </Tree.Node>
    );
  });
};

type Props = {
  onChanges?: (data: any) => void;
};

const subLeafKeys = {
  volume: '数据卷',
  db: '数据库'
};

function convertRawDataToTreeData(fakeData: ITreeData[]) {
  if (!Array.isArray(fakeData)) return [];

  const cache = fakeData.map((catalog) => {
    const childrenArr: TreeDataType[] = [];
    if (catalog.children) {
      Object.entries(catalog.children).forEach(([type, arr]) => {
        const subChildren = {
          title: subLeafKeys[type],
          key: type,
          type: type,
          children:
            arr?.map((item) => {
              const itemTitle = (
                <div className="last-leaf-title flex items-center overflow-hidden">
                  {type === 'volume' ? (
                    <IconStorage className="mr-2" />
                  ) : (
                    <IconArchive className="mr-2" />
                  )}
                  <div
                    className={classNames(
                      'last-leaf-text overflow-hidden text-ellipsis whitespace-nowrap',
                      type === 'db' ? 'no-operation' : ''
                    )}
                  >
                    {item.name}
                  </div>
                </div>
              );

              return {
                title: itemTitle,
                key: `${type}-${item.id}`,
                isLeaf: true,
                type: type
              };
            }) || []
        };
        childrenArr.push(subChildren);
      });
    }
    return {
      title: catalog.name,
      key: `catalog-${catalog.id}`,
      type: catalog.type,
      children: childrenArr
    };
  });

  return cache;
}

const tmpData = convertRawDataToTreeData(fakeData);

export default function EditableTree(props: Props) {
  const { onChanges } = props;

  const [treeData, setTreeData] = useState(tmpData);
  const [expandedKeys, setExpandedKeys] = useState([
    tmpData?.[0]?.key || '',
    tmpData?.[0]?.children?.[0]?.key || '',
    tmpData?.[0]?.children?.[1]?.key || ''
  ]);
  const [searchValue, setSearchValue] = useState('');

  // 默认选中第一个目录的数据卷卷下的第一个文件
  const [selectedKey, setSelectedKey] = useState(
    tmpData?.[0]?.children?.[0]?.children?.[0]?.key || ''
  );

  const handleExpand = (expandedKeys) => {
    setExpandedKeys(expandedKeys);
  };

  const handleSelect = (
    selectedKeys: string[],
    extra: {
      selected: boolean;
      selectedNodes: NodeInstance[];
      node: NodeInstance;
      e: Event;
    }
  ) => {
    const { props } = extra.node;
    if (props.isLeaf) {
      setSelectedKey(selectedKeys[0]);
      if (onChanges) {
        onChanges(selectedKeys[0]);
      }
    }
  };

  // 重命名目录
  const handleEdit = (node) => {};

  // 删除目录 or 卷
  const handDelete = (node) => {};

  const addVolume = (node) => {
    if (node.dataRef) {
      const dataChildren = node.dataRef.children || [];
      dataChildren.push({
        title: 'new tree node',
        key: node._key + '-' + (dataChildren.length + 1)
      });
      node.dataRef.children = dataChildren;
      setTreeData([...treeData]);
    }
  };

  const renderExtra = (node) => {
    const { type, isLeaf } = node;

    return (
      <div
        className={classNames(
          'mr-1 flex h-9 items-center justify-between opacity-0',
          'extra-container'
        )}
      >
        {type === 'catalog' && (
          <Tooltip color="white" content="重命名">
            <IconEdit
              className={'extra-icon mr-2 hover:text-[rgb(var(--primary-6))]'}
              onClick={() => handleEdit(node)}
            />
          </Tooltip>
        )}
        {type !== 'db' && (
          <Tooltip color="white" content="删除">
            <IconDelete
              onClick={() => handDelete(node)}
              className="hover:text-[rgb(var(--primary-6))]"
            />
          </Tooltip>
        )}
        {!isLeaf && type === 'volume' && (
          <Tooltip color="white" content="新建">
            <IconPlus
              className="ml-2 text-xs hover:text-[rgb(var(--primary-6))]"
              onClick={() => addVolume(node)}
            />
          </Tooltip>
        )}
      </div>
    );
  };

  return (
    <div className={classNames('pl-3 pr-3 pt-2')}>
      <div className="mb-2 mt-[-8px] flex items-center justify-between">
        <SearchInput
          value={searchValue}
          onChange={setSearchValue}
          placeholder="输入搜索目录"
          className="h-8 w-[130px]"
        />
        <div
          className="cursor-pointer text-xs text-[#2563EB]"
          // onClick={() => setIsAdding(true)}
        >
          <IconPlus className="mr-2" />
          新建
        </div>
      </div>
      <Tree
        showLine
        blockNode
        selectable
        expandedKeys={expandedKeys}
        selectedKeys={[selectedKey]}
        icons={(node) => ({
          switcherIcon:
            node._key === '__input__' ||
            (node.childrenData && node.childrenData.length > 0) ? (
              <IconCaretDown />
            ) : null
        })}
        onExpand={handleExpand}
        onSelect={handleSelect}
        renderExtra={renderExtra}
        className="tree-container"
      >
        {generatorTreeNodes(treeData)}
      </Tree>
    </div>
  );
}
