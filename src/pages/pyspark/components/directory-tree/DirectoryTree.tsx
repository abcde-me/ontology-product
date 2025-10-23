import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  Button,
  Dropdown,
  Empty,
  Input,
  Menu,
  Message,
  Modal,
  Spin,
  Tooltip,
  Tree
} from '@arco-design/web-react';
import type {
  NodeInstance,
  NodeProps,
  TreeDataType
} from '@arco-design/web-react/es/Tree/interface';
import {
  IconPlus,
  IconEdit,
  IconDelete,
  IconCopy,
  IconFolder,
  IconFile
} from '@arco-design/web-react/icon';
import FolderIcon from '@/assets/python/folder.svg';
import FileIcon from '@/assets/python/file.svg';
import AddAfterIcon from '@/assets/python/add-after.svg';
import {
  CopyPythonItemRes,
  CreatePythonItemRes,
  PythonItemType,
  PythonListItem,
  RenamePythonItemRes
} from '@/types/pythonApi';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import MultiLevelPathNavigation from './MultiLevelPathNavigation';
import timeFormattig from '@/utils/timeFormatting';
import { PYSPARK_PERMISSIONS, SQL_PERMISSIONS } from '@/config/permissions';
import { now } from 'lodash-es';
import { PermissionWrapper } from '@/components/PermissionGuard';
import { debounce } from 'lodash-es';
import SQLFileIcon from '@/assets/sql/sql-file-icon.svg';
import styles from './DirectoryTree.module.scss';
import { createPythonItem } from '@/api/pyspark';
import { validateName } from '@/utils/valiate';
import { is } from 'immer/dist/internal';

// 原始数据接口
export type TreeNodeItem = Partial<PythonListItem> & {
  dataRef?: any;
  showInput?: boolean;
  isAdd?: boolean;
  children?: TreeNodeItem[];
  title?: string;
  key?: string;
};

// 暴露给父组件的方法接口
export interface DirectoryTreeRef {
  startRootCreate: (
    isFolder?: boolean,
    node?: NodeProps,
    isIcon?: boolean
  ) => void;
  refresh: () => Promise<void>; // 刷新目录列表
  selectFile: (fileId: string) => void; // 选中指定文件
}

export enum DirectoryTreeFrom {
  SQL = 'sql',
  PYTHON = 'python'
}

export interface DirectoryTreeProps {
  from?: DirectoryTreeFrom;
  data: TreeNodeItem[];
  isCanCreate?: boolean;
  selectedKeys?: string[]; // 添加外部控制的选中状态
  onSelect?: (
    selectedKeys: string[],
    extra: {
      selected: boolean;
      selectedNodes: NodeInstance[];
      node: NodeInstance;
      e: Event;
    }
  ) => void;
  onCreate?: (finalName: string, node?: NodeProps) => Promise<any>;
  onRename?: (newName: string, node: NodeProps) => Promise<any>;
  onCopy?: (newName: string, node: NodeProps) => Promise<any>;
  onDelete?: (node: NodeProps) => Promise<boolean>;
  onFolderClick?: (
    folderId: string
  ) => Promise<TreeDataType[]> | TreeDataType[];
  onBackToParent?: (
    parentId?: string
  ) => Promise<TreeDataType[]> | TreeDataType[];
  onSearch?: (path_id: string, searchValue: string) => Promise<any>;
  generateDefaultName?: (
    siblings: TreeDataType[],
    isFolder?: boolean
  ) => string;
  placeholder?: string;
  newButtonText?: string;
  // 数据格式化配置
  formatData?: (rawData: any) => TreeNodeItem[];
}

const InputSearch = Input.Search;

function defaultNameGenerator(siblings: TreeDataType[], isFolder = true) {
  return isFolder ? `新建文件夹_${now()}` : `新建PySpark_${now()}`;
}

export default React.forwardRef<DirectoryTreeRef, DirectoryTreeProps>(
  function DirectoryTree(props, ref) {
    const {
      from = DirectoryTreeFrom.PYTHON,
      data,
      isCanCreate,
      selectedKeys: externalSelectedKeys,
      onSelect,
      onCreate,
      onRename,
      onCopy,
      onDelete,
      onFolderClick,
      onBackToParent,
      onSearch,
      generateDefaultName = defaultNameGenerator,
      placeholder = '搜索文件或文件夹',
      newButtonText = '新建'
    } = props;
    console.log(data, 'data pythonList');
    const [treeData, setTreeData] = useState<TreeNodeItem[]>(data);
    const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [searchValue, setSearchValue] = useState<string>('');

    // 下钻相关状态
    const [currentFolderId, setCurrentFolderId] = useState<string>('');
    const [currentFolderName, setCurrentFolderName] = useState<string>('');
    const [folderStack, setFolderStack] = useState<
      Array<{ id: string; name: string }>
    >([]);
    const [loading, setLoading] = useState<boolean>(false);

    // 搜索相关状态
    const [isSearchMode, setIsSearchMode] = useState<boolean>(false);

    // 同步外部传入的选中状态
    useEffect(() => {
      if (externalSelectedKeys && externalSelectedKeys.length > 0) {
        setSelectedKeys(externalSelectedKeys);
      }
    }, [externalSelectedKeys]);

    const [searchResults, setSearchResults] = useState<TreeNodeItem[]>([]);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const inputRef = useRef<any>(null);
    const [inputValue, setInputValue] = useState<string>('');
    const [defaultName, setDefaultName] = useState<string>('');

    // 格式化数据
    const formatTreeData = (inputData: unknown[]): TreeNodeItem[] => {
      if (typeof props.formatData === 'function') {
        return props.formatData(inputData);
      }
      return inputData as TreeNodeItem[];
    };

    useEffect(() => {
      setTreeData(data);
      setLoading(false);
    }, [data]);

    useEffect(() => {
      setLoading(false);
    }, []);

    // 刷新当前目录
    const refreshCurrentDirectory = useCallback(async () => {
      setLoading(true);
      try {
        if (currentFolderId && onFolderClick) {
          const newData = await onFolderClick(currentFolderId);
          const formattedData = formatTreeData(newData as any[]);
          setTreeData(formattedData);
        } else if (onBackToParent) {
          // 如果在根目录，使用 onBackToParent 刷新
          const newData = await onBackToParent('0');
          const formattedData = formatTreeData(newData as any[]);
          setTreeData(formattedData);
        }
      } catch (error) {
        console.error('刷新目录失败:', error);
      } finally {
        setLoading(false);
      }
    }, [currentFolderId, onFolderClick, onBackToParent, formatTreeData]);

    // 选中指定文件
    const selectFileById = useCallback((fileId: string) => {
      setSelectedKeys([fileId]);
    }, []);

    // 暴露方法给父组件
    // useImperativeHandle(
    //   ref,
    //   () => ({
    //     startRootCreate: (isFolder = true) => {
    //       startRootCreate(isFolder);
    //     },
    //     refresh: refreshCurrentDirectory,
    //     selectFile: selectFileById
    //   }),
    //   [refreshCurrentDirectory, selectFileById]
    // );

    // 处理从多级路径导航跳转到指定文件夹

    const focusAndSelect = () => {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.dom?.select?.();
      }, 0);
    };

    // 处理搜索
    const handleSearch = async (value: string) => {
      if (!value.trim()) {
        setIsSearchMode(false);
        setSearchResults([]);
        // 恢复原始树数据
        const formattedData = formatTreeData(data);
        setTreeData(formattedData);
        return;
      }

      if (!props.onSearch) {
        Message.error('搜索功能未实现');
        return;
      }

      setIsSearching(true);
      try {
        const results = await props.onSearch(currentFolderId, value);
        setSearchResults(results);
        setIsSearchMode(true);

        // 将搜索结果转换为树形数据
        const formattedResults = formatTreeData(results);
        setTreeData(formattedResults);
      } catch (error) {
        Message.error('搜索失败');
      } finally {
        setIsSearching(false);
      }
    };

    // 处理搜索框回车
    const handleSearchEnter = (value: string) => {
      handleSearch(value);
    };

    // 使用防抖处理输入事件
    const debouncedSearch = useCallback(debounce(handleSearch, 500), [
      handleSearch
    ]);

    // 处理搜索框清空
    const handleSearchClear = () => {
      setSearchValue('');
      setIsSearchMode(false);
      setSearchResults([]);
    };
    const handleCreate = useCallback(
      async (finalName: string, node: any, isFolder) => {
        try {
          if (!validateName(finalName).isValid) {
            Message.error(
              validateName(finalName)?.errorMessage ?? '命名不符合规则'
            );
            return null;
          }

          const createRes = await createPythonItem({
            path_id: Number(node?.dataRef?.id),
            type: node?.dataRef?.type,
            name: finalName
          });

          if (createRes.status !== 200) {
            Message.error(createRes?.message ?? '创建失败');
            return null;
          }

          Message.success('创建成功');

          return createRes.data;
        } catch (error) {
          console.error('创建失败:', error);
          Message.error('创建失败');
          return null;
        }
      },
      [currentFolderId]
    );
    const startRootCreate = (isFolder = true, node?, isIcon?: boolean) => {
      const name = generateDefaultName(treeData, isFolder);
      setDefaultName(name);
      setInputValue(name);
      // isFolder = true 表示创建文件夹，false 表示创建 notebook
      if (isIcon) {
        const newNodeChildren = [
          ...node?.dataRef?.children,
          {
            name,
            showInput: true,
            isAdd: true,
            type: isFolder ? PythonItemType.Directory : PythonItemType.Notebook,
            children: [],
            id: 0,
            path: '',
            created: '',
            last_modified: ''
          }
        ];
        const newNode = treeData.map((n) => {
          if (String(n?.id) === String(node?.dataRef?.id)) {
            console.log(n, '123 n', newNodeChildren, {
              ...n,
              children: newNodeChildren
            });
            return { ...n, children: newNodeChildren };
          }
          return n;
        });

        setTreeData(newNode);
        console.log(newNode, '123 node');
      } else {
        setTreeData([
          {
            name,
            showInput: true,
            isAdd: true,
            type: isFolder ? PythonItemType.Directory : PythonItemType.Notebook,
            children: [],
            id: 0,
            path: '',
            created: '',
            last_modified: ''
          },
          ...treeData
        ]);
      }
      focusAndSelect();
    };

    const handleEdit = (node: NodeProps) => {
      const currentName = node.dataRef?.name;
      const newTree = treeData?.map((n) => {
        if (String(n?.id) === String(node.dataRef?.id)) {
          return { ...n, dataRef: { ...n.dataRef, showInput: true } };
        }
        return n;
      });
      setTreeData(newTree);
      setInputValue(currentName);
      setDefaultName(currentName);
      focusAndSelect();
    };

    const updateNodeTitle = (
      nodes: NodeProps[],
      key: string,
      title: string
    ) => {
      return nodes.map((n) => {
        if (String(n._key) === key) {
          const dataRef = n.dataRef ? { ...n.dataRef, name: title } : n.dataRef;
          return { ...n, title, showInput: false, isAdd: false, dataRef };
        }
        if (n.dataRef?.children) {
          return {
            ...n,
            children: updateNodeTitle(n.dataRef?.children, key, title)
          };
        }
        return n;
      });
    };

    const removeNodeByKey = (nodes: NodeProps[], key: string): NodeProps[] => {
      return nodes
        .filter((n) => n._key !== key)
        .map((n) =>
          n.dataRef?.children
            ? { ...n, children: removeNodeByKey(n.dataRef?.children, key) }
            : n
        );
    };

    const handleEditFinish = async (node) => {
      if (node.dataRef?.isAdd) {
        const finalName = inputValue.trim() || defaultName;
        try {
          const created = await onCreate?.(finalName, node);

          if (!created) {
            // 创建失败，移除临时添加的节点
            const newTreeData = treeData?.filter(
              (item) =>
                !item.isAdd &&
                !item.showInput &&
                !item.dataRef?.isAdd &&
                !item.dataRef?.showInput
            );
            setTreeData(newTreeData);
            setInputValue('');
            setDefaultName('');
            return;
          }

          // 如果是自动创建的文件且是Python文件，调用回调打开文件
          if (node.dataRef?.type === PythonItemType.Notebook && created?.id) {
            console.log('自动创建文件成功:', created.name);
          }
        } catch (e) {
          Message.error('创建失败');
          // 创建失败，移除临时添加的节点
          const newTreeData = treeData?.filter(
            (item) =>
              !item.isAdd &&
              !item.showInput &&
              !item.dataRef.isAdd &&
              !item.dataRef.showInput
          );
          setTreeData(newTreeData);
        }
      } else {
        const finalName = inputValue.trim();
        if (finalName === '') {
          Message.error('重命名名称不能为空');
          return;
        }

        try {
          const rename = await onRename?.(finalName, node);

          if (!rename) {
            // 重命名失败，重置输入框状态
            const newTreeData = treeData?.map((item) => {
              if (String(item?.id) === String(node.dataRef?.id)) {
                return {
                  ...item,
                  showInput: false,
                  isAdd: false,
                  dataRef: { ...item.dataRef, showInput: false, isAdd: false }
                };
              }
              return item;
            });
            setTreeData(newTreeData);
            setInputValue('');
            setDefaultName('');
            return;
          }
        } catch (e) {
          Message.error('重命名失败');
          // 重命名失败，重置输入框状态
          const newTreeData = treeData?.map((item) => {
            if (String(item?.id) === String(node.dataRef?.id)) {
              return {
                ...item,
                showInput: false,
                isAdd: false,
                dataRef: { ...item.dataRef, showInput: false, isAdd: false }
              };
            }
            return item;
          });
          setTreeData(newTreeData);
          setInputValue('');
          setDefaultName('');
        }
      }

      setInputValue('');
      setDefaultName('');
    };

    const handleDelete = (node: NodeProps) => {
      const nodeType =
        node.dataRef?.type === PythonItemType.Directory ? '文件夹' : '文件';

      Modal.confirm({
        title: `确定删除${nodeType}?`,
        content:
          node.dataRef?.type === PythonItemType.Directory
            ? `删除后，该文件夹下所有内容将被删除，不可恢复`
            : `删除后，该文件不可恢复`,
        okText: '确定',
        cancelText: '取消',
        onOk: async () => {
          try {
            const result = await onDelete?.(node);
            // 如果删除失败，不关闭对话框
            if (result === false) {
              return false;
            }
            // 删除成功后重新加载文件列表
            // handleSearchClear();
          } catch (e) {
            Message.error('删除失败');
            return false;
          }
        }
      });
    };

    return (
      <div
        className={styles['directory-pySpark-tree-container']}
        style={
          currentFolderName
            ? ({
                ['--directory-nav-height' as any]: '69px'
              } as React.CSSProperties)
            : undefined
        }
      >
        <div
          className={
            styles['directory-tree-header'] +
            'mb-2 flex items-center justify-between'
          }
        >
          <InputSearch
            className={styles['directory-tree-header-search']}
            placeholder={placeholder}
            value={searchValue}
            onChange={(value) => setSearchValue(value)}
            onSearch={handleSearchEnter}
            onClear={() => {
              handleSearchClear();
              refreshCurrentDirectory();
            }}
            allowClear
            style={{ height: '32px' }}
          />
          {from === DirectoryTreeFrom.SQL ? (
            <PermissionWrapper permission={SQL_PERMISSIONS.CAN_CREATE}>
              {/* <Button
                type="text"
                size="small"
                icon={<IconPlus />}
                onClick={() => startRootCreate(false)}
              >
                新建
              </Button> */}
              <div
                className="ml-1 flex w-16 cursor-pointer items-center justify-center text-xs text-[#2563EB]"
                onClick={() => startRootCreate(false)}
              >
                <IconPlus className="mr-1" />
                新建
              </div>
            </PermissionWrapper>
          ) : (
            <Dropdown
              trigger="click"
              position="bl"
              droplist={
                <Menu
                  onClickMenuItem={(key) => {
                    if (key === 'folder') {
                      startRootCreate(true);
                    } else if (key === 'file') {
                      startRootCreate(false);
                    }
                  }}
                >
                  <Menu.Item key="file">新建PySpark</Menu.Item>
                  <Menu.Item key="folder">新建文件夹</Menu.Item>
                </Menu>
              }
            >
              {isCanCreate && (
                <Button type="text" size="small" icon={<IconPlus />}>
                  {newButtonText}
                </Button>
              )}
            </Dropdown>
          )}
        </div>

        {loading ? (
          <div className="mt-[110px] flex flex-col items-center">
            <Spin size={26} />
            <div className="text-[rgba(15, 23, 42, 1)] text-[14px]">加载中</div>
          </div>
        ) : treeData?.length === 0 ? (
          <Empty />
        ) : (
          <Tree
            className={styles['directory-pySpark-tree-container']}
            blockNode
            treeData={treeData}
            selectable
            autoExpandParent={false}
            actionOnClick={['expand', 'select']}
            // expandedKeys={expandedKeys}
            selectedKeys={selectedKeys}
            // onExpand={setExpandedKeys}
            onSelect={(keys, extra) => {
              console.log(keys, extra, 'top--');
              const dataRef = extra?.node?.props?.dataRef ?? null;
              if (dataRef?.actionOnClick === 'select') {
                setSelectedKeys(keys);
                onSelect?.(keys, extra);
              }
            }}
            renderExtra={(node: any) => {
              const isEditing = node.dataRef?.showInput;
              const nowPermissions =
                from === DirectoryTreeFrom.SQL
                  ? SQL_PERMISSIONS
                  : PYSPARK_PERMISSIONS;

              if (isEditing) return null;

              return (
                <div className={styles['directory-tree-extra']}>
                  {node?.type === 'directory' && (
                    <Tooltip color="white" content="新建">
                      <Dropdown
                        trigger="click"
                        position="bl"
                        droplist={
                          <Menu
                            onClickMenuItem={(key) => {
                              if (key === 'folder') {
                                startRootCreate(true, node, true);
                              } else if (key === 'file') {
                                startRootCreate(false, node, true);
                              }
                            }}
                          >
                            <Menu.Item key="file">新建PySpark</Menu.Item>
                            <Menu.Item key="folder">新建文件夹</Menu.Item>
                          </Menu>
                        }
                      >
                        <IconPlus className="mr-1 text-[14px] hover:text-[rgb(var(--primary-6))]" />
                      </Dropdown>
                    </Tooltip>
                  )}
                  <Tooltip color="white" content="重命名">
                    <IconEdit
                      className="mr-1 text-[14px] hover:text-[rgb(var(--primary-6))]"
                      onClick={() => handleEdit(node)}
                    />
                  </Tooltip>
                  {/* )} */}
                  {/* {node.dataRef?.type !== PythonItemType.Directory && */}
                  {/* node.dataRef?.perms?.includes(nowPermissions.CAN_COPY) && ( */}
                  {/* )} */}
                  {/* {node.dataRef?.perms?.includes(nowPermissions.CAN_DELETE) && ( */}
                  <Tooltip color="white" content="删除">
                    <IconDelete
                      className="text-[14px] hover:text-[rgb(var(--primary-6))]"
                      onClick={() => handleDelete(node as unknown as NodeProps)}
                    />
                  </Tooltip>
                  {/* )} */}
                </div>
              );
            }}
            renderTitle={(props: NodeProps) => {
              console.log(props, 'showInput ----');
              const isInput = Boolean(props?.dataRef?.showInput);
              const isFolder =
                props?.dataRef?.type === PythonItemType.Directory;

              // 根据节点类型选择图标
              const icon = isFolder ? (
                <FolderIcon className="mr-2 h-4 w-4" />
              ) : from === DirectoryTreeFrom.SQL ? (
                <SQLFileIcon className="mr-2 h-4 w-4" />
              ) : (
                <FileIcon className="mr-2 h-4 w-4" />
              );

              if (isInput) {
                return (
                  <div className="flex items-center">
                    {icon}
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={setInputValue}
                      onBlur={() => handleEditFinish(props)}
                      onPressEnter={() => handleEditFinish(props)}
                      maxLength={255}
                      className="h-8 px-[6px] py-[2px] focus:border-[rgb(var(--primary-6))]"
                    />
                  </div>
                );
              }

              const titleText = props.dataRef?.name;
              return (
                <div className="flex items-center overflow-hidden">
                  {icon}
                  <div className="flex flex-1 flex-col overflow-hidden">
                    <div className="file-name">
                      <EllipsisPopover value={titleText} />
                    </div>
                    {/* 只在搜索结果中显示路径 */}
                    {isSearchMode &&
                      from !== DirectoryTreeFrom.SQL &&
                      props.dataRef?.path && (
                        <div className="search-result-path">
                          <EllipsisPopover value={props.dataRef.path} />
                        </div>
                      )}
                  </div>
                </div>
              );
            }}
          />
        )}
      </div>
    );
  }
);
