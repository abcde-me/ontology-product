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
  deleteTable,
  renameCatalog,
  addDb
} from '@/api/dataCatalog';
import { validateName } from '@/utils/valiate';
import { DATA_CATALOG_PERMISSIONS } from '@/config/permissions';
import { PermissionWrapper } from '@/components/PermissionGuard';
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
      // 确保数据库类型的节点能正确渲染其子节点
      const hasChildren = children && children.length > 0;
      const isExpandable = hasChildren;

      return (
        <Tree.Node key={key} {...rest} dataRef={item} isLeaf={!isExpandable}>
          {hasChildren ? generatorTreeNodes(children) : null}
        </Tree.Node>
      );
    });
  }, []);

  const generateName = useCallback(
    (data: TreeDataType[], typeText?: string) => {
      const baseName = `${activeTab === 'src' ? '源' : '目标'}${typeText || '目录'}`;
      // const set = new Set(data.map((item) => item.name));
      // let x = data.length + 1;
      const name = `${baseName}_${Date.now()}`;

      // while (set.has(name)) {
      //   x++;
      //   name = `${baseName}${x}`;
      // }

      return name;
    },
    [activeTab]
  );

  const genereteInputNode = useCallback((name: string, node?: NodeProps) => {
    console.log(node, '看看看什么是node');

    // 生成key，避免同级节点key冲突
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const nodeType = node?.dataRef?.type || 'catalog';
    const parentId = node?.dataRef?.parent_id || 'root';

    const newNode: TreeDataType = {
      title: name,
      key: `${nodeType}-${parentId}-${timestamp}-${random}`,
      type: CatalogTypeEnum[nodeType],
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
    if (
      dataRef?.isLastLeaf &&
      !dataRef?.showInput &&
      dataRef?.type_name !== 'db'
    ) {
      catalogTreeStore.setState({
        selectedKey: dataRef?.id ? String(dataRef.id) : selectedKeys[0], // 存储实际的数据ID
        selectedTreeKey: selectedKeys[0], // 存储完整的树节点key用于显示选中样式
        selectedPath: dataRef?.fullPath,
        selectedNodeType: dataRef?.type_name || dataRef?.type || '', // 存储节点类型
        selectedParentId: dataRef?.parent_id ? String(dataRef.parent_id) : '' // 存储父节点ID
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
        // 处理数据卷编辑
        newTreeData = treeData.map((data: TreeDataType) => {
          if (data.id === dataRef?.parent_id) {
            // 找到数据卷类型的子节点
            const volumeChild = data.children?.find(
              (child) => child.type === 'volume'
            );
            volumeChild?.children?.forEach((item: TreeDataType) => {
              if (item.key === _key) {
                item.showInput = true;
              }
            });
          }
          return data;
        });
        break;

      case CatalogTypeEnum.db:
        // 处理数据库编辑
        newTreeData = treeData.map((data: TreeDataType) => {
          if (data.id === dataRef?.parent_id) {
            // 找到数据库类型的子节点
            const dbChild = data.children?.find((child) => child.type === 'db');
            dbChild?.children?.forEach((item: TreeDataType) => {
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

  // 删除目录 or 卷 or 数据库表
  const handleDelete = async (node: NodeProps, type: string) => {
    const { _key, dataRef } = node;

    if (!_key || !dataRef?.type) {
      Message.error('删除失败，请稍后重试');
      return;
    }
    let newTreeData: TreeDataType[] = [...treeData];
    let res: Partial<ApiRes<any>> = {};
    if (type === 'db_item') {
      const params = {
        path_id: dataRef?.parent_id,
        database: dataRef?.name,
        tables: []
      };
      res = await deleteTable(params);
    } else if (type === 'directory') {
      res = await deleteVolume(dataRef?.id, {
        root_type: RootTypeEnum[activeTab]
      });
    }
    if (res && res.status === 200) {
      newTreeData = await catalogTreeStore.getRawData();
      Message.success('删除成功!');

      // 清除表格相关的选中状态，避免显示已删除节点的数据
      catalogTreeStore.setState({
        treeData: newTreeData,
        rawTreeData: newTreeData,
        selectedKey: '', // 清除选中的节点ID
        selectedTreeKey: '', // 清除选中的树节点key
        selectedPath: '', // 清除选中节点的路径
        selectedNodeType: '', // 清除选中节点的类型
        selectedParentId: '' // 清除选中节点的父节点ID
      });
    } else {
      Message.error(res?.message ?? '删除失败，请稍后重试');

      catalogTreeStore.setState({
        treeData: newTreeData,
        rawTreeData: newTreeData
      });
    }
  };

  const focusAndSelectInput = () => {
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.dom.select();
    }, 0);
  };

  const onCatalogAdd = () => {
    const name = generateName(rawTreeData ?? []);
    catalogTreeStore.setState({
      inputValue: name,
      defaultName: name,
      treeData: [genereteInputNode(name), ...treeData],
      isEditing: true
    });
    focusAndSelectInput();
  };

  // 添加子级元素（数据卷或数据库）
  const addSubVolume = (node: NodeProps) => {
    const { dataRef } = node;

    const rawChildrenTreeData = rawTreeData.find(
      (item: TreeDataType) => item.key === node?.pathParentKeys?.[0]
    );

    // 根据当前节点类型找到对应的子数据数组
    // 如果是"数据卷"节点，在数据卷下新增；如果是"数据库"节点，在数据库下新增
    let targetChildrenArray = [];
    if (dataRef?.type === 'volume') {
      // 找到数据卷类型的子数组
      targetChildrenArray =
        rawChildrenTreeData?.children?.find((child) => child.type === 'volume')
          ?.children ?? [];
    } else if (dataRef?.type === 'db') {
      // 找到数据库类型的子数组
      targetChildrenArray =
        rawChildrenTreeData?.children?.find((child) => child.type === 'db')
          ?.children ?? [];
    }

    const name = generateName(
      targetChildrenArray,
      subLeafKeys[dataRef?.type] // 根据类型生成对应的名称
    );

    const cachTreeData = treeData.map((item: TreeDataType) => {
      if (item.key === node.pathParentKeys?.[0]) {
        // 找到对应类型的子节点并在其下添加新元素
        item.children?.forEach((child: TreeDataType) => {
          if (child.type === dataRef?.type) {
            child.children?.unshift(genereteInputNode(name, node));
          }
        });
      }
      return item;
    });

    // 只展开当前操作的节点路径，避免展开同级节点
    const newExpandedKeys = [...expandedKeys];
    if (dataRef?.key && !newExpandedKeys.includes(dataRef.key)) {
      newExpandedKeys.push(dataRef.key);
    }
    // 确保父节点也是展开状态
    if (
      node.pathParentKeys?.[0] &&
      !newExpandedKeys.includes(node.pathParentKeys[0])
    ) {
      newExpandedKeys.push(node.pathParentKeys[0]);
    }

    catalogTreeStore.setState({
      inputValue: name,
      defaultName: name,
      treeData: cachTreeData,
      expandedKeys: newExpandedKeys
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
          // 新建数据卷
          res = await addVolume({
            name: fileName,
            parent_id: dataRef.parent_id,
            root_type: root_type,
            type: CatalogTypeEnum.volume
          });

          if (res.status !== 200) {
            Message.error(res?.message ?? '新建卷失败');
          }

          break;
        case CatalogTypeEnum.db:
          // 新建数据库 - 后面在这里修改逻辑
          res = await addDb({
            name: fileName,
            parent_id: dataRef.parent_id
            // root_type: root_type,
            // type: CatalogTypeEnum.db // 明确指定类型为数据库
          });

          if (res.status !== 200) {
            Message.error(res?.message ?? '新建数据库失败');
          }

          break;
        default:
          break;
      }
    } else {
      // 编辑
      if (fileName !== dataRef?.name) {
        res = await renameCatalog(dataRef?.id, {
          id: dataRef?.id,
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
  let perms: string[] = [];
  const renderExtra = (node: NodeProps) => {
    const { dataRef } = node;
    perms = dataRef?.perms ? dataRef.perms : perms;

    return (
      !dataRef?.showInput && (
        <div className={'extra-container flex items-center justify-between'}>
          {/* db_item 类型只显示删除按钮 */}
          {dataRef?.type === CatalogTypeEnum.db_item ? (
            <>
              {dataRef?.type === CatalogTypeEnum.db_item && (
                <PermissionWrapper
                  permission={DATA_CATALOG_PERMISSIONS.CAN_DELETE_DIRS}
                >
                  <Tooltip color="white" content="删除">
                    <IconDelete
                      onClick={() => {
                        Modal.confirm({
                          title: '确认删除数据库表?',
                          content: '删除后不可恢复',
                          async onOk() {
                            try {
                              await handleDelete(node, 'db_item');
                            } catch (apiError: any) {
                              Message.error(
                                '删除失败: ' +
                                  (apiError.message || '请稍后重试')
                              );
                            }
                          },
                          className: styles['modalWrapper']
                        });
                      }}
                      className="hover:text-[rgb(var(--primary-6))]"
                    />
                  </Tooltip>
                </PermissionWrapper>
              )}
            </>
          ) : (
            <>
              {/* 其他类型的操作按钮 */}
              {['volume', 'db'].every((key) => dataRef?.type !== key) && (
                <>
                  {
                    <PermissionWrapper
                      permission={DATA_CATALOG_PERMISSIONS.CAN_UPDATE_DIRS}
                    >
                      <Tooltip color="white" content="重命名">
                        <IconEdit
                          className={
                            'extra-icon mr-2 hover:text-[rgb(var(--primary-6))]'
                          }
                          onClick={() => handleEdit(node)}
                        />
                      </Tooltip>
                    </PermissionWrapper>
                  }
                  {
                    <PermissionWrapper
                      permission={DATA_CATALOG_PERMISSIONS.CAN_DELETE_DIRS}
                    >
                      <Tooltip color="white" content="删除">
                        <IconDelete
                          onClick={() => {
                            Modal.confirm({
                              title: '确认删除目录?',
                              content:
                                '删除后，该目录下所有内容将被删除，不可恢复',
                              async onOk() {
                                try {
                                  await handleDelete(node, 'directory');
                                } catch (apiError: any) {
                                  Message.error(
                                    '删除失败: ' +
                                      (apiError.message || '请稍后重试')
                                  );
                                }
                              },
                              className: styles['modalWrapper']
                            });
                          }}
                          className="hover:text-[rgb(var(--primary-6))]"
                        />
                      </Tooltip>
                    </PermissionWrapper>
                  }
                </>
              )}
              {/* 为数据卷和数据库都添加新建按钮 */}
              {(dataRef?.type === 'volume' || dataRef?.type === 'db') && (
                <PermissionWrapper
                  permission={DATA_CATALOG_PERMISSIONS.CAN_CREATE_VOLUME}
                >
                  <Tooltip color="white" content="新建">
                    <IconPlus
                      className="ml-2 text-xs hover:text-[rgb(var(--primary-6))]"
                      onClick={() => addSubVolume(node)}
                    />
                  </Tooltip>
                </PermissionWrapper>
              )}
            </>
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
          {/* {!dataRef?.isLastLeaf&&<IconFolder />} */}
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
            {[CatalogTypeEnum.volume].includes(dataRef?.type) ? (
              <IconStorage className="text-base" />
            ) : dataRef?.type === CatalogTypeEnum.db ? null : ( // <IconCaretDown style={{ fontSize: '12px' }} />
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
