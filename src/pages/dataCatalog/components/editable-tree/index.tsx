import React, { useState } from 'react';
import { Tooltip, Tree } from '@arco-design/web-react';
import {
  IconCaretDown,
  IconCaretRight,
  IconPlus,
  IconDelete
} from '@arco-design/web-react/icon';
import SearchInput from '../search-input';
import {
  NodeInstance,
  TreeDataType
} from '@arco-design/web-react/es/Tree/interface';
import classNames from 'classnames';

const TreeNode = Tree.Node; // 从treedata 生成 treenode

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
          name: 'source-vol-2',
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
              return {
                title: item.name,
                key: `${type}-${item.id}`,
                isLeaf: true
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

  const renderExtra = (node) => {
    const { type, isLeaf } = node;

    return (
      <div className={classNames('mr-1 flex h-9 items-center justify-between')}>
        <Tooltip color="white" content="删除">
          <IconDelete
          // 删除目录 or 卷 or 数据库
          // onClick={() => handDelete(node._key, node)}
          />
        </Tooltip>
        {type && subLeafKeys[type] && (
          <IconPlus
            className="ml-2"
            style={{
              fontSize: 12
            }}
            onClick={() => {
              // 新增卷 or 数据库
              if (node.dataRef) {
                const dataChildren = node.dataRef.children || [];
                dataChildren.push({
                  title: 'new tree node',
                  key: node._key + '-' + (dataChildren.length + 1)
                });
                node.dataRef.children = dataChildren;
                setTreeData([...treeData]);
              }
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div className="pl-3 pr-3 pt-2">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          marginTop: '-8px',
          marginBottom: 8
        }}
      >
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
            ) : null,
          dragIcon: <IconCaretRight />
        })}
        onExpand={handleExpand}
        onSelect={handleSelect}
        renderExtra={renderExtra}
      >
        {generatorTreeNodes(treeData)}
      </Tree>
    </div>
  );
}
