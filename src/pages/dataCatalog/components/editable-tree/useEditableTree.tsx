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
import { validateName } from '@/utils/valiate';
import styles from '../../modal.module.css';

export function useEditableTree({ catalogTreeStore }) {
  const {
    activeTab,
    searchValue,
    inputRef,
    inputValue,
    treeData,
    rawTreeData,
    expandedKeys,
    defaultName
  } = catalogTreeStore.useGetState([
    'activeTab',
    'searchValue',
    'inputRef',
    'inputValue',
    'treeData',
    'rawTreeData',
    'expandedKeys',
    'defaultName'
  ]);

  const generatorTreeNodes = useCallback((treeData: TreeDataType[]) => {
    return treeData?.map?.((item) => {
      const { children, key, ...rest } = item;
      return (
        <Tree.Node key={key} {...rest} dataRef={item}>
          {children ? generatorTreeNodes(children) : null}
        </Tree.Node>
      );
    });
  }, []);

  const generateName = useCallback(
    (data: TreeDataType[], rawData: TreeDataType[], typeText?: string) => {
      const baseName = `${activeTab === 'src' ? '源' : '目标'}${typeText || '目录'}`;
      const set = new Set(rawData.map((item) => item.name));
      let x = rawData.length + 1;
      let name = `${baseName}${x}`;

      while (set.has(name)) {
        x++;
        name = `${baseName}${x}`;
      }

      return name;
    },
    [activeTab]
  );

  const genereteInputNode = useCallback((name: string, node?: NodeProps) => {
    const newNode: TreeDataType = {
      title: name,
      key: `${node?.dataRef?.type || 'catalog'}-${Date.now()}`,
      type: CatalogTypeEnum[node?.dataRef?.type || 'catalog'],
      isLastLeaf: node ? true : false,
      showInput: true,
      isAdd: true
    };
    if (node) {
      newNode.parent_id = node.dataRef?.parent_id;
    } else {
      newNode.children = [];
    }
    return newNode;
  }, []);

  const onSearchChange = (value: string) => {
    const keys: string[] = [];
    const loop = (data: TreeDataType[]) => {
      data?.forEach?.((item) => {
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

  const handleEdit = (node: any) => {
    const { name, _key, dataRef } = node;

    let newTreeData: TreeDataType[] = [];
    switch (dataRef?.type) {
      case CatalogTypeEnum.catalog:
        newTreeData = treeData.map((item: TreeDataType) => {
          if (item.key === _key) {
            item.showInput = true;
          }
          return item;
        });
        break;

      case CatalogTypeEnum.volume:
        newTreeData = treeData.map((data: TreeDataType) => {
          if (data.id === dataRef?.parent_id) {
            data.children?.[0]?.children?.forEach((item: TreeDataType) => {
              if (item.key === _key) {
                item.showInput = true;
              }
            });
          }
          return data;
        });
        break;

      default:
        break;
    }

    catalogTreeStore.setState({
      inputValue: name,
      defaultName: name,
      treeData: newTreeData
    });
    focusAndSelectInput();
  };

  // 删除目录 or 卷
  const handleDelete = async (node: NodeProps) => {
    const { _key, dataRef } = node;

    if (!_key || !dataRef?.type) {
      Message.error('删除失败，请稍后重试');
      return;
    }

    let newTreeData: TreeDataType[] = [...treeData];

    const res = await deleteVolume(dataRef?.id, {
      root_type: RootTypeEnum[activeTab]
    });
    if (res && res.status === 200) {
      newTreeData = await catalogTreeStore.getRawData();
      Message.success('删除成功!');
    } else {
      Message.error(res?.message ?? '删除失败，请稍后重试');
    }

    catalogTreeStore.setState({
      treeData: newTreeData,
      rawTreeData: newTreeData
    });
  };

  const focusAndSelectInput = () => {
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.dom.select();
    }, 0);
  };

  const onCatalogAdd = () => {
    const name = generateName(treeData, rawTreeData ?? []);
    catalogTreeStore.setState({
      inputValue: name,
      defaultName: name,
      treeData: [genereteInputNode(name), ...treeData],
      isEditing: true
    });
    focusAndSelectInput();
  };

  const addSubVolume = (node: NodeProps) => {
    const { dataRef } = node;
    const name = generateName(
      dataRef?.children || [],
      rawTreeData ?? [],
      subLeafKeys[dataRef?.type]
    );
    const cachTreeData = treeData.map((item: TreeDataType) => {
      if (item.key === node.pathParentKeys?.[0]) {
        item.children?.[0]?.children?.unshift(genereteInputNode(name, node));
      }
      return item;
    });

    catalogTreeStore.setState({
      inputValue: name,
      defaultName: name,
      treeData: cachTreeData,
      expandedKeys: [...new Set([...expandedKeys, dataRef?.key])]
    });
    focusAndSelectInput();
  };

  const onEditFinish = async (props: NodeProps) => {
    const { dataRef } = props;

    const fileName = inputValue.trim() || defaultName;
    const validateResult = validateName(fileName);
    if (!validateResult.isValid && validateResult.errorMessage) {
      Message.error(validateResult.errorMessage);
      return;
    }

    const updateFn = async () => {
      newTreeData = await catalogTreeStore.getRawData();
      catalogTreeStore.setState({
        treeData: newTreeData,
        rawTreeData: newTreeData,
        inputValue: '',
        defaultName: ''
      });
    };

    const root_type = RootTypeEnum[activeTab];
    let newTreeData: TreeDataType[] = [];
    let res: Partial<ApiRes<any>> = {};

    if (dataRef?.isAdd) {
      switch (dataRef?.type) {
        case CatalogTypeEnum.catalog:
          res = await addCatalog({ name: fileName, root_type: root_type });

          if (res.status !== 200) {
            Message.error(res?.message ?? '新增目录失败');
          }

          break;
        case CatalogTypeEnum.volume:
          res = await addVolume({
            name: fileName,
            parent_id: dataRef.parent_id,
            root_type: root_type
          });

          if (res.status !== 200) {
            Message.error(res?.message ?? '新建卷失败');
          }

          break;
        default:
          break;
      }
    } else {
      // 编辑
      if (fileName !== dataRef?.name) {
        res = await renameCatalog(dataRef?.id, {
          new_name: fileName,
          root_type: root_type,
          type: dataRef?.type,
          parent_id: dataRef?.parent_id
        });

        if (res.status !== 200) {
          Message.error(res?.message ?? '重命名目录失败');
        }
      }
    }

    await updateFn();
  };

  const renderExtra = (node: NodeProps) => {
    const { dataRef } = node;
    return (
      !dataRef?.showInput && (
        <div className={'extra-container flex items-center justify-between'}>
          {['volume', 'db', CatalogTypeEnum.db].every(
            (key) => dataRef?.type !== key
          ) && (
            <>
              <Tooltip color="white" content="重命名">
                <IconEdit
                  className={
                    'extra-icon mr-2 hover:text-[rgb(var(--primary-6))]'
                  }
                  onClick={() => handleEdit(node)}
                />
              </Tooltip>
              <Tooltip color="white" content="删除">
                <IconDelete
                  onClick={() => {
                    Modal.confirm({
                      title: '确认删除目录?',
                      content: '删除后，该目录下所有内容将被删除，不可恢复',
                      async onOk() {
                        try {
                          await handleDelete(node);
                        } catch (apiError: any) {
                          Message.error(
                            '删除失败: ' + (apiError.message || '请稍后重试')
                          );
                        }
                      },
                      className: styles['modalWrapper']
                    });
                  }}
                  className="hover:text-[rgb(var(--primary-6))]"
                />
              </Tooltip>
            </>
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

  const renderTitleText = (props: NodeProps) => {
    const { dataRef, title } = props;

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
      <Tooltip color="white" content={!subLeafKeys[dataRef?.type] ? title : ''}>
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
    );
  };

  const renderTitle = (props: NodeProps) => {
    const { dataRef } = props;

    return (
      <div className={classNames('flex items-center overflow-hidden')}>
        {dataRef?.isLastLeaf && (
          <div className="tree-icon mr-2 w-4">
            {[CatalogTypeEnum.db, CatalogTypeEnum.volume].includes(
              dataRef?.type
            ) ? (
              <IconStorage className="text-base" />
            ) : (
              <IconArchive className="text-base" />
            )}
          </div>
        )}
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
            maxLength={255}
            className={classNames(
              'h-8 px-[6px] py-[2px] focus:border-[rgb(var(--primary-6))]',
              dataRef?.isLastLeaf ? 'last-leaf-input' : ''
            )}
          />
        ) : (
          renderTitleText(props)
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
    renderTitle
  };
}
