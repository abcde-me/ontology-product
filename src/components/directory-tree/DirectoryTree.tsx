import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Dropdown,
  Input,
  Menu,
  Message,
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
import { PythonItemType, PythonListItem } from '@/types/pythonApi';
import './DirectoryTree.scss';

// 原始数据接口
export interface TreeNodeItem extends PythonListItem {
  children: TreeNodeItem[];
  showInput?: boolean;
  isAdd?: boolean;
}

export interface DirectoryTreeProps {
  data: TreeNodeItem[];
  onSelect?: (
    selectedKeys: string[],
    extra: {
      selected: boolean;
      selectedNodes: NodeInstance[];
      node: NodeInstance;
      e: Event;
    }
  ) => void;
  onCreate?: (
    finalName: string,
    path_id: number,
    node?: NodeProps
  ) => Promise<TreeDataType | void> | TreeDataType | void;
  onRename?: (node: NodeProps, newName: string) => Promise<void> | void;
  onCopy?: (node: NodeProps, newNode: TreeDataType) => Promise<void> | void;
  onDelete?: (node: NodeProps) => Promise<void> | void;
  onFolderClick?: (
    folderId: string,
    folderName: string
  ) => Promise<TreeDataType[]> | TreeDataType[];
  onBackToParent?: (
    parentId?: string
  ) => Promise<TreeDataType[]> | TreeDataType[];
  generateDefaultName?: (
    siblings: TreeDataType[],
    isFolder?: boolean
  ) => string;
  placeholder?: string;
  newButtonText?: string;
  // 数据格式化配置
  formatData?: (rawData: unknown[]) => TreeNodeItem[];
}

// type InnerNode = TreeDataType & {
//     dataRef?: any;
//     showInput?: boolean;
//     isAdd?: boolean;
// };

// interface NodeMeta {
//     id?: string | number;
//     name?: string;
//     type?: string;
//     [key: string]: any;
// }

// type NodeData = InnerNode & { dataRef?: NodeMeta };

const InputSearch = Input.Search;

function defaultNameGenerator(siblings: TreeDataType[], isFolder = true) {
  const base = isFolder ? '新建文件夹' : '新建PySpark';
  const set = new Set(
    siblings.map((s) => (typeof s.title === 'string' ? s.title : ''))
  );
  let i = siblings.length + 1;
  let name = `${base}${i}`;
  while (set.has(name)) {
    i += 1;
    name = `${base}${i}`;
  }
  return name;
}

export default function DirectoryTree(props: DirectoryTreeProps) {
  const {
    data = [],
    onSelect,
    onCreate,
    onRename,
    onCopy,
    onDelete,
    onFolderClick,
    onBackToParent,
    generateDefaultName = defaultNameGenerator,
    placeholder = '搜索当前文件夹',
    newButtonText = '新建',
    formatData
  } = props;

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

  const inputRef = useRef<any>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [defaultName, setDefaultName] = useState<string>('');

  // 格式化数据
  const formatTreeData = (inputData: unknown[]): TreeNodeItem[] => {
    if (Array.isArray(inputData) && inputData.length > 0) {
      return formatData ? formatData(inputData) : (inputData as TreeNodeItem[]);
    }
    return inputData as TreeNodeItem[];
  };

  useEffect(() => {
    const formattedData = formatTreeData(data);
    console.log('formattedData', formattedData);
    setTreeData(formattedData);
  }, [data, formatData]);

  // 处理文件夹点击下钻
  const handleFolderClick = async (node: NodeInstance) => {
    // Arco Tree 会把节点对象挂到 node.props.dataRef，这里优先读 props.dataRef；
    // 如果业务层已将字段打平到节点顶层（如 formatData 中），也兼容直接读取 props
    const meta = node.props.dataRef;
    const hasChildren = Array.isArray(meta?.children) && meta?.children?.length;
    const isFolder = meta?.type === PythonItemType.Directory || hasChildren;

    if (isFolder && onFolderClick) {
      try {
        const np = props as NodeProps;
        const folderId: string = meta?.id
          ? String(meta.id)
          : String(np._key ?? '');
        const folderName: string = meta?.name ?? String(np.title ?? '');

        // 更新文件夹栈
        const newStack = [
          ...folderStack,
          { id: currentFolderId, name: currentFolderName }
        ];
        setFolderStack(newStack);

        // 设置当前文件夹信息
        setCurrentFolderId(folderId);
        setCurrentFolderName(folderName);

        // 请求新数据
        const newData = await onFolderClick(folderId, folderName);
        const formattedData = formatTreeData(newData as any[]);
        setTreeData(formattedData);

        // 重置选择状态
        setSelectedKeys([]);
        setExpandedKeys([]);
      } catch (error) {
        Message.error('进入文件夹失败');
      }
    }
  };

  // 处理返回上级目录
  const handleBackToParent = async () => {
    if (folderStack.length === 0) return;

    try {
      const parentFolder = folderStack[folderStack.length - 1];
      const newStack = folderStack.slice(0, -1);

      setFolderStack(newStack);
      setCurrentFolderId(parentFolder.id);
      setCurrentFolderName(parentFolder.name);

      if (onBackToParent) {
        const newData = await onBackToParent(parentFolder.id);
        const formattedData = formatTreeData(newData as any[]);
        setTreeData(formattedData);
      }

      setSelectedKeys([]);
      setExpandedKeys([]);
    } catch (error) {
      Message.error('返回上级目录失败');
    }
  };

  const focusAndSelect = () => {
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.dom?.select?.();
    }, 0);
  };

  const startRootCreate = (isFolder = true) => {
    const name = generateDefaultName(treeData, isFolder);
    setDefaultName(name);
    setInputValue(name);
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
    focusAndSelect();
  };

  const handleEdit = (node: NodeProps) => {
    const currentName = node.dataRef?.name;
    console.log('node', node);
    console.log('treeData', treeData);
    const newTree = treeData.map((n) => {
      if (String(n.id) === String(node.dataRef?.id)) {
        return { ...n, showInput: true };
      }
      return n;
    });
    setTreeData(newTree);
    setInputValue(currentName);
    setDefaultName(currentName);
    focusAndSelect();
  };

  const updateNodeTitle = (nodes: NodeProps[], key: string, title: string) => {
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
    const finalName = inputValue.trim() || defaultName;

    if (node.dataRef?.isAdd) {
      try {
        const created = await onCreate?.(
          finalName,
          Number(currentFolderId),
          node
        );

        if (!created) {
          Message.error('创建失败');
          return;
        }

        // 重新获取当前文件夹数据
        const newData = await onFolderClick?.(
          currentFolderId,
          currentFolderName
        );
        const formattedData = formatTreeData(newData ?? []);
        setTreeData(formattedData);
      } catch (e) {
        Message.error('创建失败');
        // setTreeData((prev) => removeNodeByKey(prev, node._key!));
      }
    } else {
      try {
        await onRename?.(node, finalName);
        // setTreeData((prev) => updateNodeTitle(prev, node._key!, finalName));
      } catch (e) {
        Message.error('重命名失败');
        // setTreeData((prev) => updateNodeTitle(prev, node._key!, defaultName));
      }
    }
    setInputValue('');
    setDefaultName('');
  };

  const handleCopy = async (node: NodeProps) => {
    // const nodeData = (node as unknown as { dataRef?: NodeData }).dataRef;
    // const title = String(node.title || nodeData?.dataRef?.name || '');
    // const newNode: PannerNode = {
    //     title: `${title} 副本`,
    //     key: `copy-${Date.now()}`,
    //     isLeaf: Boolean((node as unknown as NodeProps).isLeaf),
    //     dataRef: { ...nodeData?.dataRef }
    // };
    // try {
    //     await onCopy?.(node, newNode);
    //     setTreeData((prev) => [newNode, ...prev]);
    // } catch (e) {
    //     Message.error('复制失败');
    // }
  };

  const handleDelete = async (node: NodeProps) => {
    // try {
    //     await onDelete?.(node);
    //     setTreeData((prev) => removeNodeByKey(prev, node._key!));
    // } catch (e) {
    //     Message.error('删除失败');
    // }
  };

  // const filteredTreeData = useMemo(() => {
  //     if (!searchValue) return treeData;

  //     const match = (nodes: PannerNode[]): PannerNode[] => {
  //         const result: InnerNode[] = [];
  //         nodes.forEach((n) => {
  //             const title = typeof n.title === 'string' ? n.title : '';
  //             if (title.toLowerCase().includes(searchValue.toLowerCase())) {
  //                 result.push({ ...n });
  //             } else if (n.children) {
  //                 const children = match(n.children as InnerNode[]);
  //                 if (children.length) result.push({ ...n, children });
  //             }
  //         });
  //         return result;
  //     };
  //     return match(treeData);
  // }, [treeData, searchValue]);

  return (
    <div>
      {/* 导航栏 */}
      {(currentFolderId || currentFolderName) && (
        <div className="mb-2 flex items-center">
          <div
            className="mr-2 cursor-pointer text-[#2563EB] hover:text-[#165dff]"
            onClick={handleBackToParent}
          >
            ← {currentFolderName}
          </div>
        </div>
      )}

      <div className="mb-2 mt-[-8px] flex items-center justify-between">
        <InputSearch
          placeholder={placeholder}
          value={searchValue}
          onChange={setSearchValue}
          allowClear
          style={{ height: '32px', width: '130px' }}
        />
        <Dropdown
          trigger="click"
          position="br"
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
              <Menu.Item key="folder">新建文件夹</Menu.Item>
              <Menu.Item key="file">新建PySpark</Menu.Item>
            </Menu>
          }
        >
          <Button type="text" size="small" icon={<IconPlus />}>
            {newButtonText}
          </Button>
        </Dropdown>
      </div>

      <Tree
        className="directory-tree"
        blockNode
        treeData={treeData}
        selectable
        expandedKeys={expandedKeys}
        selectedKeys={selectedKeys}
        onExpand={setExpandedKeys}
        onSelect={(keys, extra) => {
          setSelectedKeys(keys);
          onSelect?.(keys, extra);

          // 如果是文件夹，触发下钻逻辑
          if (extra.node && onFolderClick) {
            handleFolderClick(extra.node);
          }
        }}
        renderExtra={(node) => {
          const isEditing = node.dataRef?.showInput;
          if (isEditing) return null;
          return (
            <div className="directory-tree-extra">
              <Tooltip color="white" content="重命名">
                <IconEdit
                  className="mr-2 hover:text-[rgb(var(--primary-6))]"
                  onClick={() => handleEdit(node)}
                />
              </Tooltip>
              <Tooltip color="white" content="复制">
                <IconCopy
                  className="mr-2 hover:text-[rgb(var(--primary-6))]"
                  onClick={() => handleCopy(node as unknown as NodeProps)}
                />
              </Tooltip>
              <Tooltip color="white" content="删除">
                <IconDelete
                  className="hover:text-[rgb(var(--primary-6))]"
                  onClick={() => handleDelete(node as unknown as NodeProps)}
                />
              </Tooltip>
            </div>
          );
        }}
        renderTitle={(props: NodeProps) => {
          const isInput = Boolean(props?.dataRef?.showInput);
          const isFolder = props?.dataRef?.type === PythonItemType.Directory;

          // 根据节点类型选择图标
          const icon = isFolder ? (
            <FolderIcon className="mr-2 h-4 w-4" />
          ) : (
            <FileIcon className="mr-2 h-4 w-4" />
          );

          if (isInput) {
            return (
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={setInputValue}
                onBlur={() => handleEditFinish(props)}
                onPressEnter={() => handleEditFinish(props)}
                maxLength={255}
                className="h-8 px-[6px] py-[2px] focus:border-[rgb(var(--primary-6))]"
              />
            );
          }

          const titleText = props.dataRef?.name;
          let display: React.ReactNode = titleText;
          if (searchValue && typeof titleText === 'string') {
            const idx = titleText
              .toLowerCase()
              .indexOf(searchValue.toLowerCase());
            if (idx !== -1) {
              const pre = titleText.slice(0, idx);
              const suf = titleText.slice(idx + searchValue.length);
              display = (
                <>
                  {pre}
                  <span className="text-[rgb(var(--primary-6))]">
                    {searchValue}
                  </span>
                  {suf}
                </>
              );
            }
          }
          return (
            <div className="flex items-center overflow-hidden">
              <span className="mr-2">{icon}</span>
              <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                {display}
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
