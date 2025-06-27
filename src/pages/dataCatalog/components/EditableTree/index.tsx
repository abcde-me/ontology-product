import React, { useState } from 'react';
import { Tree } from '@arco-design/web-react';
import {
  IconCaretDown,
  IconCaretRight,
  IconPlus
} from '@arco-design/web-react/icon';
import ClearableInput from '../SearchInput';

const TreeNode = Tree.Node; // 从treedata 生成 treenode

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

const TreeData = [
  {
    title: 'Trunk',
    key: '0-0',
    children: [
      {
        title: 'Leaf',
        key: '0-0-1'
      },
      {
        title: 'Branch',
        key: '0-0-2',
        children: [
          {
            title: 'Leaf',
            key: '0-0-2-1'
          }
        ]
      }
    ]
  },
  {
    title: 'Trunk',
    key: '0-1',
    children: [
      {
        title: 'Branch',
        key: '0-1-1',
        children: [
          {
            title: 'Leaf',
            key: '0-1-1-1'
          },
          {
            title: 'Leaf',
            key: '0-1-1-2'
          }
        ]
      },
      {
        title: 'Leaf',
        key: '0-1-2'
      }
    ]
  }
];

type Props = {
  onChanges?: (data: any) => void;
};

export default function EditableTree(props: Props) {
  const { onChanges } = props;

  const [treeData, setTreeData] = useState(TreeData);
  const [expandedKeys, setExpandedKeys] = useState([
    '0-1',
    '0-1-volume',
    '0-1-db'
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isInputHovered, setIsInputHovered] = useState(false);

  // 设置默认选中的节点key（卷下的第一个文件）
  const [selectedKey, setSelectedKey] = useState('0-1-volume-10');

  const handleExpand = (expandedKeys) => {
    setExpandedKeys(expandedKeys);
  };

  const handleSelect = (selectedKeys) => {
    setSelectedKey(selectedKeys[0]);
    if (onChanges) {
      onChanges(selectedKeys[0]);
    }
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
        <ClearableInput value={inputValue} onChange={setInputValue} />
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
        renderExtra={(node) => {
          return (
            <IconPlus
              style={{
                position: 'absolute',
                right: 8,
                fontSize: 12,
                top: 10,
                color: '#3370ff'
              }}
              onClick={() => {
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
          );
        }}
      >
        {generatorTreeNodes(treeData)}
      </Tree>
    </div>
  );
}
