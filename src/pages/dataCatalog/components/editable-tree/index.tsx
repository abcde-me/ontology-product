import React, { useEffect, useRef, useState } from 'react';
import { Input, Message, Modal, Tooltip, Tree } from '@arco-design/web-react';
import {
  IconCaretDown,
  IconPlus,
  IconDelete,
  IconEdit,
  IconStorage,
  IconArchive
} from '@arco-design/web-react/icon';
import {
  NodeInstance,
  NodeProps,
  TreeDataType
} from '@arco-design/web-react/es/Tree/interface';
import classNames from 'classnames';
import './index.css';
import { RefInputType } from '@arco-design/web-react/es/Input/interface';
import SearchInput from '../search-input';

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

const generatorTreeNodes = (treeData: TreeDataType[]) => {
  return treeData.map((item) => {
    const { children, key, ...rest } = item;
    return (
      <Tree.Node key={key} {...rest} dataRef={item}>
        {children ? generatorTreeNodes(children) : null}
      </Tree.Node>
    );
  });
};

type Props = {
  onChange?: (data: any) => void;
};

const subLeafKeys: { [prop: string]: string } = {
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
          key: `${catalog.id}-${type}`,
          type: type,
          children:
            arr?.map((item) => {
              return {
                title: item.name,
                key: `${type}-${item.id}`,
                isLeaf: true,
                isLastLeaf: true,
                type: `${type}-child`
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
  const { onChange } = props;

  const [treeData, setTreeData] = useState<TreeDataType[]>(tmpData);
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

  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<RefInputType>(null);

  const handleExpand = (expandedKeys: string[]) => {
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
    if (props.dataRef?.isLastLeaf) {
      setSelectedKey(selectedKeys[0]);
      if (onChange) {
        onChange(selectedKeys[0]);
      }
    }
  };

  const focusAndSelectInput = () => {
    // 选中输入框中的所有文本
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.dom.select();
    }, 0);
  };

  // 重命名目录
  const handleEdit = (node: any) => {
    const { _key, dataRef } = node;
    if (dataRef?.type === 'catalog') {
      setInputValue(dataRef?.title);
      setTreeData((prev) => {
        return prev.map((item) => {
          if (item.key === _key) {
            item.showInput = true;
          }
          return item;
        });
      });
      focusAndSelectInput();
    }
  };

  // 删除目录 or 卷
  const handleDelete = (node: NodeProps) => {
    const { _key, dataRef } = node;
    if (dataRef?.type === 'catalog') {
      setTreeData((prev) => {
        return prev.filter((item) => item.key !== _key);
      });
    } else if (dataRef?.type === 'volume') {
      setTreeData((prev) => {
        return prev.map((item) => {
          if (item.key === node.pathParentKeys?.[0]) {
            item.children?.forEach((child) => {
              if (child.key === _key) {
                child.children = [];
              }
            });
          }
          return item;
        });
      });
    } else if (dataRef?.type === 'volume-child') {
      setTreeData((prev) => {
        return prev.map((item) => {
          if (item.key === node.pathParentKeys?.[0]) {
            item.children?.forEach((child) => {
              if (child.key === node.pathParentKeys?.[1]) {
                child.children = child.children?.filter(
                  (subChild) => subChild.key !== _key
                );
              }
            });
          }
          return item;
        });
      });
    }
  };

  const addCatalog = () => {
    const name = `目录${Date.now()}`;
    setInputValue(name);
    setTreeData((prev) => {
      return [
        {
          title: name,
          key: `catalog-${Date.now()}`,
          children: [],
          type: 'catalog',
          showInput: true
        },
        ...prev
      ];
    });
    focusAndSelectInput();
  };

  const addVolumeOrDb = (node: NodeProps) => {
    if (node.dataRef) {
      const dataChildren = node.dataRef.children || [];
      const name = `source-vol${Date.now()}`;
      setInputValue(name);
      dataChildren.unshift({
        title: name,
        key: `volume-${Date.now()}`,
        type: `volume-child`,
        isLastLeaf: true,
        showInput: true
      });
      node.dataRef.children = dataChildren;
      setTreeData([...treeData]);
      focusAndSelectInput();
    }
  };

  const renderExtra = (node: NodeProps) => {
    const { dataRef } = node;

    return (
      !dataRef?.showInput && (
        <div
          className={classNames(
            'flex items-center justify-between',
            'extra-container'
          )}
        >
          {dataRef?.type === 'catalog' && (
            <Tooltip color="white" content="重命名">
              <IconEdit
                className={'extra-icon mr-2 hover:text-[rgb(var(--primary-6))]'}
                onClick={() => handleEdit(node)}
              />
            </Tooltip>
          )}
          {!dataRef?.type.includes('db') && (
            <Tooltip color="white" content="删除">
              <IconDelete
                onClick={() => {
                  Modal.confirm({
                    title: '确认删除文件?',
                    content: '删除后，该目录下所有内容将被删除，不可恢复',
                    onOk() {
                      try {
                        handleDelete(node);

                        Message.success('删除成功!');
                      } catch (apiError: any) {
                        console.error('删除节点失败:', apiError);
                        Message.error(
                          '删除失败: ' + (apiError.message || '请稍后重试')
                        );
                      }
                    }
                  });
                }}
                className="hover:text-[rgb(var(--primary-6))]"
              />
            </Tooltip>
          )}
          {!dataRef?.isLastLeaf && dataRef?.type === 'volume' && (
            <Tooltip color="white" content="新建">
              <IconPlus
                className="ml-2 text-xs hover:text-[rgb(var(--primary-6))]"
                onClick={() => addVolumeOrDb(node)}
              />
            </Tooltip>
          )}
        </div>
      )
    );
  };

  const onEditFinish = (props: NodeProps) => {
    const { dataRef } = props;

    const fileName =
      inputValue.trim() ||
      `${dataRef?.type === 'catalog' ? '目录' : 'source-vol'}${Date.now()}`;

    if (dataRef?.type === 'catalog') {
      const newNode = {
        ...dataRef,
        title: fileName,
        showInput: false,
        children: dataRef?.children?.length
          ? dataRef?.children
          : [
              {
                title: '数据卷',
                key: `catalog-${fileName}-volume`,
                type: 'volume',
                children: []
              }
            ]
      };
      setTreeData([newNode, ...treeData.slice(1)]);
    } else if (dataRef?.type === 'volume-child') {
      const { pathParentKeys } = props;

      if (pathParentKeys) {
        const newNode = {
          ...dataRef,
          title: fileName,
          showInput: false
        };

        setTreeData((prev) => {
          return prev.map((item) => {
            if (item.key === pathParentKeys[0]) {
              item.children?.forEach((subItem) => {
                if (subItem.key === pathParentKeys[1]) {
                  subItem.children?.splice(0, 1, newNode);
                }
              });
            }
            return item;
          });
        });
      }
    }

    setInputValue('');
  };

  const renderTitle = (props: NodeProps) => {
    const { dataRef, title } = props;

    const IconComponent = dataRef?.isLastLeaf ? (
      dataRef?.type === 'volume-child' ? (
        <IconStorage className="mr-2 text-base" />
      ) : (
        <IconArchive className="mr-2 text-base" />
      )
    ) : null;

    return (
      <div className={classNames('flex items-center overflow-hidden')}>
        {IconComponent}
        {dataRef?.showInput ? (
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={setInputValue}
            onBlur={() => {
              onEditFinish(props);
            }}
            onPressEnter={() => {
              onEditFinish(props);
            }}
          />
        ) : (
          <Tooltip
            color="white"
            content={!subLeafKeys[dataRef?.type] ? title : ''}
          >
            <div
              className={classNames(
                'overflow-hidden text-ellipsis whitespace-nowrap',
                dataRef?.isLastLeaf ? 'last-leaf-text' : '',
                dataRef?.type === 'db' ? 'no-operation' : '',
                dataRef?.type === 'catalog' ? 'catalog-title-text' : ''
              )}
            >
              {title}
            </div>
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
          style={{ height: '32px', width: '130px' }}
        />
        <div
          className="flex w-16 cursor-pointer items-center justify-center text-xs text-[#2563EB]"
          onClick={addCatalog}
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
          switcherIcon: !node.dataRef?.isLastLeaf ? <IconCaretDown /> : null
        })}
        onExpand={handleExpand}
        onSelect={handleSelect}
        renderExtra={renderExtra}
        renderTitle={renderTitle}
        className="tree-container"
      >
        {generatorTreeNodes(treeData)}
      </Tree>
    </div>
  );
}
