import { NodeInstance } from '@arco-design/web-react/es/Tree/interface';
import { Input, Message, Modal, Tooltip, Tree } from '@arco-design/web-react';
import {
  NodeProps,
  TreeDataType
} from '@arco-design/web-react/es/Tree/interface';
import classNames from 'classnames';
import React, { ReactNode, useCallback } from 'react';
import {
  IconPlus,
  IconDelete,
  IconEdit,
  IconStorage,
  IconArchive
} from '@arco-design/web-react/icon';
import { CatalogTypeEnum, RootTypeEnum, subLeafKeys } from '../../consts';
import {
  addCatalog,
  addVolume,
  deleteVolume,
  renameCatalog
} from '@/api/dataCatalog';

export function useEditableTree({ catalogTreeStore }) {
  const {
    activeTab,
    searchValue,
    inputRef,
    inputValue,
    treeData,
    expandedKeys,
    loading
  } = catalogTreeStore.useGetState([
    'activeTab',
    'searchValue',
    'inputRef',
    'inputValue',
    'treeData',
    'expandedKeys',
    'loading'
  ]);

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

  const onSearchChange = (value: string) => {
    const keys: string[] = [];
    const loop = (data: TreeDataType[]) => {
      data.forEach((item) => {
        if (
          typeof item.title === 'string' &&
          item.title?.toLowerCase().indexOf(value.toLowerCase()) > -1
        ) {
          if (item.parentKey) {
            keys.push(item.parentKey);
          }
        } else if (item.children) {
          loop(item.children);
        }
      });
    };
    loop(treeData);

    const newKeys = new Set([...expandedKeys, ...keys]);
    catalogTreeStore.setState({
      searchValue: value,
      expandedKeys: [...newKeys]
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
    const { dataRef } = props;
    if (dataRef?.isLastLeaf && !dataRef?.showInput) {
      catalogTreeStore.setState({
        selectedKey: selectedKeys[0],
        selectedPath: dataRef?.fullPath
      });
    }
  };

  // 重命名目录
  const handleEdit = (node: any) => {
    const { _key, dataRef } = node;
    if (dataRef?.type === CatalogTypeEnum.catalog) {
      catalogTreeStore.setState({
        inputValue: dataRef?.title,
        treeData: treeData.map((item: TreeDataType) => {
          if (item.key === _key) {
            item.showInput = true;
          }
          return item;
        })
      });
      focusAndSelectInput();
    }
  };

  // 操作子资源
  const handleTarget = useCallback(
    (
      pathParentKeys: string[],
      targetFn: (
        target: TreeDataType[] | undefined
      ) => TreeDataType[] | undefined
    ) => {
      return treeData.map((item: TreeDataType) => {
        if (item.key === pathParentKeys[0]) {
          return {
            ...item,
            children: item.children?.map((subItem: TreeDataType) => {
              if (subItem.key === pathParentKeys[1]) {
                return {
                  ...subItem,
                  children: targetFn(subItem.children)
                };
              }
              return subItem;
            })
          };
        }
        return item;
      });
    },
    [treeData]
  );

  // 删除目录 or 卷
  const handleDelete = async (node: NodeProps) => {
    const { _key, dataRef } = node;

    if (!_key || !dataRef?.type) {
      Message.error('删除失败，请稍后重试');
      return;
    }

    let newTreeData: TreeDataType[] = treeData.map((item) => item);

    const res = await deleteVolume(dataRef?.id, {
      root_type: RootTypeEnum[activeTab]
    });
    if (res && res.status === 200) {
      newTreeData = await catalogTreeStore.getRawData();
      catalogTreeStore.setState({ treeData: newTreeData });
      Message.success('删除成功!');
    } else {
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log(res.message);
      Message.error('删除失败，请稍后重试');
    }
  };

  const focusAndSelectInput = () => {
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.dom.select();
    }, 0);
  };

  const onCatalogAdd = () => {
    const name = `目录${Date.now()}`;
    catalogTreeStore.setState({
      inputValue: name,
      treeData: [
        {
          title: name,
          key: `catalog-${Date.now()}`,
          children: [],
          type: 1,
          showInput: true,
          isAdd: true
        },
        ...treeData
      ],
      isEditing: true
    });
    focusAndSelectInput();
  };

  const addSubVolume = (node: NodeProps) => {
    const { dataRef } = node;
    if (dataRef) {
      const name = `source-vol${Date.now()}`;
      const cachTreeData = treeData.map((item: TreeDataType) => {
        if (item.key === node.pathParentKeys?.[0]) {
          item.children?.[0]?.children?.unshift({
            title: name,
            key: `volume-${Date.now()}`,
            type: 2,
            isLastLeaf: true,
            showInput: true,
            parent_id: dataRef.parent_id
          });
        }
        return item;
      });

      catalogTreeStore.setState({
        inputValue: name,
        treeData: cachTreeData,
        expandedKeys: [...new Set([...expandedKeys, dataRef.key])]
      });
      focusAndSelectInput();
    }
  };

  const onEditFinish = async (props: NodeProps) => {
    const { dataRef } = props;

    const fileName = inputValue.trim();
    if (!fileName.length) {
      Message.warning('名称不能为空');
      return;
    }

    const root_type = RootTypeEnum[activeTab];
    let newTreeData: TreeDataType[] = [];
    switch (dataRef?.type) {
      case CatalogTypeEnum.catalog:
        if (dataRef?.isAdd) {
          await addCatalog({ name: fileName, root_type: root_type });
        } else {
          // TODO 编辑目录
          await renameCatalog(dataRef.id, {
            new_name: fileName,
            root_type: root_type
          });
        }
        break;

      case CatalogTypeEnum.volume:
        await addVolume({
          name: fileName,
          parent_id: dataRef.parent_id,
          root_type: root_type
        });
        break;

      default:
        break;
    }

    newTreeData = await catalogTreeStore.getRawData();

    catalogTreeStore.setState({
      treeData: newTreeData,
      inputValue: ''
    });
  };

  const renderExtra = (node: NodeProps) => {
    const { dataRef } = node;
    return (
      !dataRef?.showInput && (
        <div className={'extra-container flex items-center justify-between'}>
          {dataRef?.type === CatalogTypeEnum.catalog && (
            <Tooltip color="white" content="重命名">
              <IconEdit
                className={'extra-icon mr-2 hover:text-[rgb(var(--primary-6))]'}
                onClick={() => handleEdit(node)}
              />
            </Tooltip>
          )}
          {['volume', 'db', CatalogTypeEnum.db].every(
            (key) => dataRef?.type !== key
          ) && (
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
          {dataRef?.type === 'volume' && (
            <Tooltip color="white" content="新建">
              <IconPlus
                className="ml-2 text-xs hover:text-[rgb(var(--primary-6))]"
                onClick={() => addSubVolume(node)}
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
      <div className="mr-2 w-4">
        {[CatalogTypeEnum.db, CatalogTypeEnum.volume].includes(
          dataRef?.type
        ) ? (
          <IconStorage className="text-base" />
        ) : (
          <IconArchive className="text-base" />
        )}
      </div>
    ) : null;

    let TitleText: ReactNode = title;
    if (searchValue.length && typeof title === 'string') {
      const index = title.toLowerCase().indexOf(searchValue.toLowerCase());
      if (index !== -1) {
        const prefix = title.slice(0, index);
        const suffix = title.slice(index + searchValue.length);
        TitleText = (
          <>
            {prefix}
            <span className="text-[rgb(var(--primary-6))]">{searchValue}</span>
            {suffix}
          </>
        );
      }
    }

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
            maxLength={256}
            className={classNames(
              'h-8 focus:border-[rgb(var(--primary-6))]',
              dataRef?.isLastLeaf ? 'last-leaf-input' : ''
            )}
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
                dataRef?.type === CatalogTypeEnum.db ? 'no-operation' : '',
                dataRef?.type === CatalogTypeEnum.catalog
                  ? 'catalog-title-text'
                  : ''
              )}
            >
              {TitleText}
            </div>
          </Tooltip>
        )}
      </div>
    );
  };

  return {
    generatorTreeNodes,
    onSearchChange,
    handleExpand,
    handleSelect,
    onCatalogAdd,
    renderExtra,
    renderTitle,
    loading
  };
}
