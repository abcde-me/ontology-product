import { NodeInstance } from '@arco-design/web-react/es/Tree/interface';
import { useDataCatalog } from '../DataCatalogProvider/Context';
import { Input, Message, Modal, Tooltip, Tree } from '@arco-design/web-react';
import {
  NodeProps,
  TreeDataType
} from '@arco-design/web-react/es/Tree/interface';
import classNames from 'classnames';
import React, { useEffect } from 'react';
import {
  IconPlus,
  IconDelete,
  IconEdit,
  IconStorage,
  IconArchive
} from '@arco-design/web-react/icon';

const subLeafKeys: { [prop: string]: string } = {
  volume: '数据卷',
  db: '数据库'
};

export function useEditableTree({ catalogTreeStore }) {
  const { inputRef, inputValue, treeData } = catalogTreeStore.useGetState([
    'inputRef',
    'inputValue',
    'treeData'
  ]);

  useEffect(() => {
    catalogTreeStore.getEffect('fetchData')();
  }, []);

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

  const handleExpand = (expandedKeys: string[]) => {
    catalogTreeStore.setState({
      expandedKeys: expandedKeys
    });
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
      catalogTreeStore.setState({
        selectedKeys: selectedKeys
      });
    }
  };

  // 重命名目录
  const handleEdit = (node: any) => {
    const { _key, dataRef } = node;
    if (dataRef?.type === 'catalog') {
      catalogTreeStore.setState({
        inputValue: dataRef?.title,
        treeData: treeData.map((item) => {
          if (item.key === _key) {
            item.showInput = true;
          }
          return item;
        })
      });
      catalogTreeStore.focusAndSelectInput();
    }

    Message.success('修改成功!'); // 成功提示
  };

  // 删除目录 or 卷
  const handleDelete = async (node: NodeProps) => {
    const { _key, dataRef } = node;

    let newTreeData: TreeDataType[] = [];
    if (dataRef?.type === 'catalog') {
      // 删除目录
      newTreeData = treeData.filter((item) => item.key !== _key);
    } else if (dataRef?.type === 'volume') {
      // 删除卷
      newTreeData = treeData.map((item) => {
        if (item.key === node.pathParentKeys?.[0]) {
          item.children?.forEach((child) => {
            if (child.key === _key) {
              child.children = [];
            }
          });
        }
        return item;
      });
    } else if (dataRef?.type === 'volume-child') {
      // 删除子资源
      newTreeData = treeData.map((item) => {
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
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
    catalogTreeStore.setState({
      treeData: newTreeData
    });
    Message.success('删除成功!');
  };

  const addCatalog = () => {
    const name = `目录${Date.now()}`;
    catalogTreeStore.setState({
      inputValue: name,
      treeData: [
        {
          title: name,
          key: `catalog-${Date.now()}`,
          children: [],
          type: 'catalog',
          showInput: true
        },
        ...treeData
      ]
    });
    catalogTreeStore.focusAndSelectInput();
  };

  const addSubVolumeOrDb = (node: NodeProps) => {
    if (node.dataRef) {
      const name = `source-vol${Date.now()}`;

      const cachTreeData = treeData.map((item) => {
        if (item.key === node.pathParentKeys?.[0]) {
          item.children?.forEach((child) => {
            if (child.key === node.pathParentKeys?.[1]) {
              child.children?.unshift({
                title: name,
                key: `volume-${Date.now()}`,
                type: `volume-child`,
                isLastLeaf: true,
                showInput: true
              });
            }
          });
        }
        return item;
      });

      catalogTreeStore.setState({ inputValue: name, treeData: cachTreeData });
      catalogTreeStore.focusAndSelectInput();
    }
  };

  const onEditFinish = (props: NodeProps) => {
    const { dataRef } = props;

    const fileName =
      inputValue.trim() ||
      `${dataRef?.type === 'catalog' ? '目录' : 'source-vol'}${Date.now()}`;

    let newTreeData: TreeDataType[] = [];

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
      newTreeData = [newNode, ...treeData.slice(1)];
    } else if (dataRef?.type === 'volume-child') {
      const { pathParentKeys } = props;

      if (pathParentKeys) {
        const newNode = {
          ...dataRef,
          title: fileName,
          showInput: false
        };
        newTreeData = treeData.map((item) => {
          if (item.key === pathParentKeys[0]) {
            item.children?.forEach((subItem) => {
              if (subItem.key === pathParentKeys[1]) {
                subItem.children?.splice(0, 1, newNode);
              }
            });
          }
          return item;
        });
      }
    }

    catalogTreeStore.setState({ treeData: newTreeData, inputValue: '' });
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
                    async onOk() {
                      try {
                        await handleDelete(node);
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
                onClick={() => addSubVolumeOrDb(node)}
              />
            </Tooltip>
          )}
        </div>
      )
    );
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
            onChange={(value) => {
              catalogTreeStore.setInputValue(value);
            }}
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

  return {
    generatorTreeNodes,
    handleExpand,
    handleSelect,
    addCatalog,
    renderExtra,
    renderTitle
  };
}
