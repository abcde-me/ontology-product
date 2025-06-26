import React, { Children, useEffect, useState } from 'react';
import { Typography, Input, Tree, Tooltip, Popover, Modal, Message } from '@arco-design/web-react';
import { IconPlus, IconCaretDown, IconCaretRight, IconDelete, IconFile, IconFolder, IconStorage, IconSearch, IconCloseCircle, IconArchive, IconEdit } from '@arco-design/web-react/icon';
import { icon } from 'mermaid/dist/rendering-util/rendering-elements/shapes/icon';
import { getCatalogList } from '@/api/dataCatalog';
import useStore from '@/pages/dataCatalog/store';
// 引入树节点相关API（使用时取消注释）
// import { fetchTreeDataAPI, deleteTreeNodeAPI, createTreeNodeAPI, updateTreeNodeAPI } from '@/api/treeApi';

// 原始数据结构接口
interface RawDataNode {
    id: string | number;
    name: string;
    type: string;
    parent_id?: string | number;
    children?: Array<{
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
    }>;
}

// 树节点类型定义（用于Tree组件）
interface TreeNodeType {
    title: string;
    key: string;
    children?: TreeNodeType[];
    isLeaf?: boolean;
    rawData?: any; // 保存原始数据引用
}

// 数据转换函数：将原始数据转换为Tree组件需要的格式
function transformRawDataToTreeData(rawData: RawDataNode[]): TreeNodeType[] {
    const transformNode = (node: RawDataNode, keyPrefix = ''): TreeNodeType => {
        const key = `${keyPrefix}${node.id}`;

        const children: TreeNodeType[] = [];

        if (node.children && node.children.length > 0) {
            // 处理 children 中的 volume 和 db
            node.children.forEach((childGroup, groupIndex) => {
                // 处理数据卷
                if (childGroup.volume && childGroup.volume.length > 0) {
                    const volumeParent: TreeNodeType = {
                        title: '数据卷',
                        key: `${key}-volume`,
                        rawData: { type: 'volume_parent', id: `${node.id}-volume`, name: '数据卷' },
                        children: childGroup.volume.map((vol, volIndex) => ({
                            title: vol.name,
                            key: `${key}-volume-${vol.id}`,
                            isLeaf: true,
                            rawData: { ...vol, type: 'volume' }
                        }))
                    };
                    children.push(volumeParent);
                }

                // 处理数据库
                if (childGroup.db && childGroup.db.length > 0) {
                    const dbParent: TreeNodeType = {
                        title: '数据库',
                        key: `${key}-db`,
                        rawData: { type: 'db_parent', id: `${node.id}-db`, name: '数据库' },
                        children: childGroup.db.map((db, dbIndex) => ({
                            title: db.name,
                            key: `${key}-db-${db.id}`,
                            isLeaf: true,
                            rawData: { ...db, type: 'db' }
                        }))
                    };
                    children.push(dbParent);
                }
            });
        }

        return {
            title: node.name,
            key,
            children: children.length > 0 ? children : undefined,
            isLeaf: children.length === 0,
            rawData: node
        };
    };

    return rawData.map((node, index) => transformNode(node, `${index}-`));
}



// 树数据结构
// const TreeData: TreeNodeType[] = [
//     {
//         title: '目录1录1录1录1录1录6666',
//         key: '0-0',
//         children: [
//             {
//                 title: '数据卷',
//                 key: '0-0-1',
//                 children: [
//                     {
//                         // icon: <IconFile />,
//                         title: '文件16666666666666666666.txt',
//                         key: '0-0-1-1',
//                     },
//                     {
//                         title: 'source-vol3source-vol3',
//                         key: '0-0-1-2',
//                     },
//                     {
//                         title: '文件3.docx',
//                         key: '0-0-1-3',
//                     },
//                 ],
//             },
//             {
//                 title: '数据库',
//                 key: '0-0-2',
//                 children: [
//                     {
//                         title: '数据库1',
//                         key: '0-0-2-1',
//                     },
//                     {
//                         title: '数据库2',
//                         key: '0-0-2-2',
//                     },
//                 ],
//             },
//         ],
//     },
//     {
//         title: '目录2',
//         key: '0-1',
//         children: [
//             {
//                 title: '文件夹1',
//                 key: '0-1-1',
//                 children: [
//                     {
//                         title: '文档1',
//                         key: '0-1-1-0',
//                     },
//                 ],
//             },
//             {
//                 title: '文件夹2',
//                 key: '0-1-2',
//                 children: [
//                     {
//                         title: '文档2',
//                         key: '0-1-2-0',
//                     },
//                 ],
//             },
//         ],
//     },
// ];

//获取树数据
//模拟获取树数据
const FlaseTreeData = {
    "src": [
        {
            "type": "catalog",
            "id": "1",
            "name": "catalog1",
            "children": [
                {
                    "volume": [
                        {
                            "id": 10,
                            "name": "source-vol1",
                            "parent_id": 1,
                        },
                        {
                            "id": 11,
                            "name": "source-vol2",
                            "parent_id": 1,
                        },
                        {
                            "id": 12,
                            "name": "source-vol3",
                            "parent_id": 1,
                        }
                    ],
                    "db": [
                        {
                            "id": 20,
                            "name": "source-db1",
                            "parent_id": 1,
                        },
                        {
                            "id": 21,
                            "name": "source-db2",
                            "parent_id": 1,
                        }
                    ]
                }
            ]
        }
    ],
    "dst": [
        {
            "type": "catalog",
            "id": "1",
            "name": "catalog666",
            "children": [
                {
                    "volume": [
                        {
                            "id": 10,
                            "name": "source-vol1",
                            "parent_id": 1,
                        },
                        {
                            "id": 11,
                            "name": "source-vol2",
                            "parent_id": 1,
                        },
                        {
                            "id": 12,
                            "name": "source-vol3",
                            "parent_id": 1,
                        }
                    ],
                    "db": [
                        {
                            "id": 20,
                            "name": "source-db1",
                            "parent_id": 1,
                        },
                        {
                            "id": 21,
                            "name": "source-db2",
                            "parent_id": 1,
                        }
                    ]
                }
            ]
        }
    ]
}

// 转换原始数据为Tree组件格式
const rawTreeData = FlaseTreeData.src;
const TreeData = transformRawDataToTreeData(rawTreeData);

//树组件自带的
function searchData(inputValue: string, treeData: TreeNodeType[]): TreeNodeType[] {
    const loop = (data: TreeNodeType[]): TreeNodeType[] => {
        const result: TreeNodeType[] = [];
        data.forEach((item) => {
            if (item.title.toLowerCase().indexOf(inputValue.toLowerCase()) > -1) {
                result.push({ ...item });
            } else if (item.children) {
                const filterData = loop(item.children);

                if (filterData.length) {
                    result.push({ ...item, children: filterData });
                }
            }
        });
        return result;
    };

    return loop(treeData);
}

interface SourceDataTreeProps {
    onChanges?: (value: string) => void;
}

export default function SourceDataTree(props: SourceDataTreeProps) {
    const { onChanges } = props;
    // 设置默认展开的节点key（根据新的数据结构生成的key）
    const [expandedKeys, setExpandedKeys] = useState(['0-1', '0-1-volume', '0-1-db']);

    // 设置默认选中的节点key（卷下的第一个文件）
    const [selectedKey, setSelectedKey] = useState('0-1-volume-10');

    // 搜索树相关状态
    const [inputValue, setInputValue] = useState('');
    const [isInputHovered, setIsInputHovered] = useState(false);
    const [hoveredKey, setHoveredKey] = useState<string | null>(null);
    const [hoverDeleteKey, setHoverDeleteKey] = useState<string | null>(null);
    const [hoverEditKey, setHoverEditKey] = useState<string | null>(null);

    // 【添加子节点相关状态】
    const [isAdding, setIsAdding] = useState(false); // 是否正在添加根节点（顶级目录）
    const [newNodeValue, setNewNodeValue] = useState(''); // 新节点的输入值
    const [treeData, setTreeData] = useState(TreeData); // 树数据状态
    const [addingToParentInfo, setAddingToParentInfo] = useState<string | null>(null); // 记录正在为哪个父节点添加子节点（存储父节点的key）

    // 【编辑节点相关状态】
    const [editingNodeKey, setEditingNodeKey] = useState<string | null>(null); // 记录正在编辑的节点key
    const [editingNodeValue, setEditingNodeValue] = useState(''); // 编辑节点时的输入值

    // 处理树节点展开/收起事件
    const handleExpand = (expandedKeys) => {
        setExpandedKeys(expandedKeys);
    };

    // 获取默认选中节点信息的函数
    const getDefaultSelectedNodeInfo = () => {
        if (TreeData && TreeData.length > 0 &&
            TreeData[0].children && TreeData[0].children.length > 0 &&
            TreeData[0].children[0].children && TreeData[0].children[0].children.length > 0) {

            const defaultNode = TreeData[0].children[0].children[0];
            const rawData = defaultNode.rawData;

            if (rawData) {
                return {
                    nodeKey: '0-1-volume-10',         // 节点Key
                    nodeId: rawData.id,               // 节点ID
                    nodeName: rawData.name,           // 节点名称
                    nodeType: rawData.type,           // 节点类型
                    parentId: rawData.parent_id,      // 父节点ID
                };
            }
        }
        return null;
    };

    // 根据nodeKey获取当前选中节点信息的函数
    // const getCurrentSelectedNodeInfo = (nodeKey: string = selectedKey) => {
    //     if (!nodeKey || !treeData) return null;

    //     // 递归查找节点
    //     const findNodeByKey = (nodes: TreeNodeType[], targetKey: string): TreeNodeType | null => {
    //         for (const node of nodes) {
    //             if (node.key === targetKey) {
    //                 return node;
    //             }
    //             if (node.children) {
    //                 const found = findNodeByKey(node.children, targetKey);
    //                 if (found) return found;
    //             }
    //         }
    //         return null;
    //     };

    //     const foundNode = findNodeByKey(treeData, nodeKey);
    //     if (foundNode && foundNode.rawData) {
    //         return {
    //             nodeKey: foundNode.key,
    //             nodeId: foundNode.rawData.id,
    //             nodeName: foundNode.rawData.name,
    //             nodeType: foundNode.rawData.type,
    //             parentId: foundNode.rawData.parent_id,
    //         };
    //     }
    //     return null;
    // };

    // 处理树节点选择事件
    const handleSelect = (selectedKeys, nodeData) => {
        console.log('选中节点', selectedKeys);
        console.log('选中节点信息', nodeData.node);

        // 获取当前选中节点的详细信息
        if (nodeData.node) {
            const currentNode = nodeData.node;
            console.log('当前选中节点信息666', currentNode.props?.rawData || currentNode.rawData);

            // 获取原始数据信息（包含ID、类型等重要信息）
            const rawData = currentNode.props?.rawData || currentNode.rawData;
            if (rawData) {
                console.log('当前选中节点的详细信息999998888:', currentNode);
                // 获取爷爷级目录名称
                const grandparentName = getGrandparentCatalogName(selectedKeys[0]);
                console.log('爷爷级目录名称:', grandparentName);
                // 获取完整的层级信息
                const hierarchyInfo = getNodeHierarchyInfo(selectedKeys[0]);
                if (hierarchyInfo) {
                    // 更新store中的选中路径，使用完整路径
                    useStore.setState({ selectedPath: hierarchyInfo.fullPath });
                } else {
                    // 如果获取层级信息失败，使用原有逻辑
                    Message.error('获取层级信息失败');
                }
            }
        }
        setSelectedKey(selectedKeys[0]);
        if (onChanges) {
            onChanges(selectedKeys[0]);
        }
    };

    // 搜索功能：根据输入值过滤树数据
    useEffect(() => {
        if (!inputValue) {
            setTreeData(TreeData);
        } else {
            const result = searchData(inputValue, TreeData);
            setTreeData(result);
        }
    }, [inputValue]);

    // 组件初始化时设置默认展开和选中状态
    useEffect(() => {
        // 确保默认展开目录1、卷、数据库
        setExpandedKeys(['0-1', '0-1-volume', '0-1-db']);
        // 确保默认选中卷下的第一个文件
        setSelectedKey('0-1-volume-10');

        // 获取并处理默认选中节点的信息
        const defaultNodeInfo = getDefaultSelectedNodeInfo();
        if (defaultNodeInfo) {
            console.log('默认选中节点信息:', defaultNodeInfo);

            // 模拟handleSelect的调用，直接处理默认节点信息
            const simulatedNodeData = {
                node: {
                    rawData: {
                        id: defaultNodeInfo.nodeId,
                        name: defaultNodeInfo.nodeName,
                        type: defaultNodeInfo.nodeType,
                        parent_id: defaultNodeInfo.parentId
                    }
                }
            };

            handleSelect(['0-1-volume-10'], simulatedNodeData);
        }

        // 如果使用真实API，在这里初始化加载树数据
        // loadTreeData();
    }, []);

    // 加载树数据的函数（使用真实API时启用）
    // const loadTreeData = async () => {
    //     try {
    //         const data = await fetchTreeDataAPI();
    //         setTreeData(data);
    //     } catch (error) {
    //         Message.error('加载数据失败');
    //     }
    // };

    // 递归删除树节点的函数
    const deleteNodeFromTree = (nodes, targetKey) => {
        return nodes.filter(node => {
            if (node.key === targetKey) {
                return false; // 删除匹配的节点
            }
            if (node.children) {
                node.children = deleteNodeFromTree(node.children, targetKey);
            }
            return true;
        });
    };

    // 删除树节点
    const handDelete = (nodeKey, nodeData) => {
        const id = nodeData.rawData.id;
        console.log('删除节点id', id);
        //调用删除接口传入ID直接删除
        try {
            Modal.confirm({
                title: '确认删除文件?',
                content: '删除后，该目录下所有内容将被删除，不可恢复',
                async onOk() {
                    try {
                        // 方法2：删除后重新获取整个树数据（推荐）
                        // const response = await deleteTreeNodeAPI(nodeData.id || nodeKey);
                        // if (response.success) {
                        //     // 重新获取树数据
                        //     const newTreeData = await fetchTreeDataAPI();
                        //     setTreeData(newTreeData);
                        // }

                        // 临时保留前端模拟逻辑，替换为真实API调用
                        console.log('准备删除节点:', { nodeKey, nodeData });

                        // 模拟API调用延迟
                        await new Promise(resolve => setTimeout(resolve, 500));

                        // 从树数据中删除节点（前端更新）
                        const newTreeData = deleteNodeFromTree(treeData, nodeKey);
                        setTreeData(newTreeData);

                        // 如果删除的是当前选中的节点，清除选中状态
                        if (selectedKey === nodeKey) {
                            setSelectedKey('');
                        }

                        // 从展开的节点中移除被删除的节点
                        const newExpandedKeys = expandedKeys.filter(key => key !== nodeKey);
                        setExpandedKeys(newExpandedKeys);

                        Message.success('删除成功!');
                    } catch (apiError: any) {
                        console.error('删除节点失败:', apiError);
                        Message.error('删除失败: ' + (apiError.message || '请稍后重试'));
                    }
                }
            });
        } catch (error) {
            console.error('删除操作错误:', error);
            Message.error('删除失败，请稍后重试');
        }
    }

    /**
     * 在指定父节点下添加一个输入框节点
     * nodes 当前的树节点数组
     * parentKey 父节点的key，用于确定在哪个节点下添加输入框
     * returns 返回更新后的树节点数组
     */
    const addInputNode = (nodes, parentKey) => {
        return nodes.map(node => {
            // 如果当前节点就是目标父节点
            if (node.key === parentKey) {
                // 获取现有的子节点数组，如果没有则创建空数组
                const children = node.children ? [...node.children] : [];

                // 在子节点数组的开头插入一个特殊的输入框节点
                // 使用特殊的key标识这是一个临时的输入框节点
                children.unshift({
                    title: '', // 空标题，将由输入框渲染
                    key: `__input_child__${parentKey}`, // 特殊key格式，包含父节点信息
                    isLeaf: true, // 输入框节点是叶子节点
                });

                // 返回更新后的父节点，确保它有子节点且不是叶子节点
                return { ...node, children, isLeaf: false };
            }

            // 如果当前节点不是目标父节点，但有子节点，则递归查找
            if (node.children) {
                return { ...node, children: addInputNode(node.children, parentKey) };
            }

            // 如果当前节点既不是目标父节点也没有子节点，直接返回
            return node;
        });
    };

    /**
     * 将新创建的节点添加到指定父节点下，并移除临时输入框
     * nodes 当前的树节点数组
     * parentKey 父节点的key
     * newNode 新创建的节点对象
     * 返回更新后的树节点数组
     */
    const addNodeToParent = (nodes, parentKey, newNode) => {
        return nodes.map(n => {
            // 找到目标父节点
            if (n.key === parentKey) {
                // 获取现有子节点
                const children = n.children ? [...n.children] : [];

                // 过滤掉临时的输入框节点（清理临时节点）
                const filteredChildren = children.filter(c => c.key !== `__input_child__${parentKey}`);

                // 将新节点添加到开头
                filteredChildren.unshift(newNode);

                // 返回更新后的父节点
                return { ...n, children: filteredChildren, isLeaf: false };
            }

            // 递归处理子节点
            if (n.children) {
                return { ...n, children: addNodeToParent(n.children, parentKey, newNode) };
            }
            return n;
        });
    };

    /**
     * 从指定父节点中移除临时输入框节点（用于取消添加操作）
     * nodes 当前的树节点数组
     * parentKey 父节点的key
     * 返回更新后的树节点数组
     */
    const removeInputFromParent = (nodes, parentKey) => {
        return nodes.map(n => {
            // 找到目标父节点
            if (n.key === parentKey) {
                // 过滤掉临时输入框节点
                const children = n.children ? n.children.filter(c => c.key !== `__input_child__${parentKey}`) : [];
                return { ...n, children };
            }

            // 递归处理子节点
            if (n.children) {
                return { ...n, children: removeInputFromParent(n.children, parentKey) };
            }
            return n;
        });
    };

    /**
     * 渲染子节点输入框的组件
     * props 包含节点信息的props，特别是_key属性
     */
    const renderChildInput = (props) => {
        // 从特殊key中提取父节点的key
        // 例如：从"__input_child__0-1-volume"中提取"0-1-volume"
        const parentKey = props._key.substring('__input_child__'.length);

        return (
            <Input
                autoFocus // 自动聚焦到输入框
                allowClear={true}
                size="small"
                style={{ width: '100%', height: '24px', marginRight: '17px' }}
                value={newNodeValue}
                onChange={v => setNewNodeValue(v)}

                // 【回车确认添加】
                onPressEnter={() => {
                    // 如果输入为空，使用默认名称（带时间戳确保唯一性）
                    const finalName = newNodeValue.trim() || `新建文件${Date.now()}`;

                    try {
                        // 【方法1：调用真实API创建子节点（注释掉的代码）】
                        // const newNode = await createTreeNodeAPI({
                        //     name: finalName,
                        //     type: 'catalog', // 子节点通常是文件类型
                        //     parent_id: parentKey // 父节点ID
                        // });
                        // // 重新加载树数据
                        // await loadTreeData();

                        // 【方法2：前端模拟创建（当前使用）】
                        const newNode: TreeNodeType = {
                            title: finalName,
                            key: Date.now().toString(), // 使用时间戳作为临时key
                            isLeaf: true, // 新建的文件节点是叶子节点
                            rawData: {
                                id: Date.now().toString(),
                                name: finalName,
                                type: 'file' // 标记为文件类型
                            }
                        };
                        console.log('父节点信息', parentKey, '新节点名称', finalName, '新节点类型', newNode);

                        // 将新节点添加到父节点下，并更新树数据
                        setTreeData(addNodeToParent(treeData, parentKey, newNode));
                    } catch (error) {
                        Message.error('创建子节点失败');
                        console.error('创建子节点失败:', error);
                        // 出错时移除输入框
                        setTreeData(removeInputFromParent(treeData, parentKey));
                    }

                    // 重置添加状态
                    setAddingToParentInfo(null);
                    setNewNodeValue('');
                }}

                // 【失去焦点时确认添加】
                onBlur={() => {
                    // 逻辑与onPressEnter相同
                    const finalName = newNodeValue.trim() || `新建文件${Date.now()}`;

                    try {
                        const newNode: TreeNodeType = {
                            title: finalName,
                            key: Date.now().toString(),
                            isLeaf: true,
                            rawData: {
                                id: Date.now().toString(),
                                name: finalName,
                                type: 'file'
                            }
                        };
                        setTreeData(addNodeToParent(treeData, parentKey, newNode));
                    } catch (error) {
                        Message.error('创建子节点失败');
                        console.error('创建子节点失败:', error);
                        setTreeData(removeInputFromParent(treeData, parentKey));
                    }

                    setAddingToParentInfo(null);
                    setNewNodeValue('');
                }}
                placeholder="请输入名称"
            />
        );
    }

    //真实添加函数
    const handAddCatalog = () => {
        console.log('添加目录名称', newNodeValue, '类型', 'catalog');
    }

    // 【编辑节点相关函数】
    /**
     * 开始编辑节点 - 点击编辑图标时调用
     *  nodeKey 节点的key
     *  currentName 节点的当前名称
     */
    const startEditNode = (nodeKey: string, currentName: string) => {
        setEditingNodeKey(nodeKey); // 设置正在编辑的节点
        setEditingNodeValue(currentName); // 回显当前名称到输入框
        console.log('开始编辑节点:', nodeKey, '当前名称:', currentName);
    };

    /**
     * 保存编辑的节点 - 按回车或失去焦点时调用
     *  nodeKey 节点的key
     *  newName 新的节点名称
     */
    const saveEditNode = (nodeKey: string, newName: string) => {
        if (!newName.trim()) {
            Message.warning('节点名称不能为空'); // 名称不能为空提示
            return;
        }
        const getInfo = getNodeHierarchyInfo(nodeKey)
        console.log('完整路径:', getInfo?.fullPath);
        try {
            // 调用真实API更新节点名称（
            // const response = await updateTreeNodeAPI({
            //     full_path: nodeKey,
            //     newName: newName.trim()
            // });
            // if (response.success) {
            //     // 重新获取树数据
            //     await loadTreeData();
            //     Message.success('修改成功!');
            // }

            // 前端模拟更新
            console.log('保存编辑节点:', nodeKey, '新名称:', newName.trim());

            // 递归更新树数据中的节点名称
            const updateNodeName = (nodes: TreeNodeType[], targetKey: string, newName: string): TreeNodeType[] => {
                return nodes.map(node => {
                    if (node.key === targetKey) {
                        // 找到目标节点，更新其标题和原始数据
                        return {
                            ...node,
                            title: newName,
                            rawData: node.rawData ? { ...node.rawData, name: newName } : node.rawData
                        };
                    }
                    // 递归处理子节点
                    if (node.children) {
                        return { ...node, children: updateNodeName(node.children, targetKey, newName) };
                    }
                    return node;
                });
            };

            // 更新树数据
            const updatedTreeData = updateNodeName(treeData, nodeKey, newName.trim());
            setTreeData(updatedTreeData);

            Message.success('修改成功!'); // 成功提示
        } catch (error) {
            console.error('保存编辑失败:', error);
            Message.error('修改失败，请稍后重试'); // 错误提示
        } finally {
            // 无论成功还是失败，都要重置编辑状态
            setEditingNodeKey(null);
            setEditingNodeValue('');
        }
    };

    /**
     * 取消编辑节点 - ESC键或其他取消操作时调用
     */
    const cancelEditNode = () => {
        setEditingNodeKey(null); // 清除正在编辑的节点
        setEditingNodeValue(''); // 清除编辑输入值
        console.log('取消编辑节点');
    };

    /**
     * 根据节点key获取爷爷级目录名称
     */
    const getGrandparentCatalogName = (nodeKey: string): string | null => {
        if (!nodeKey) return null;

        // 递归查找指定key的节点及其路径
        const findNodePath = (nodes: TreeNodeType[], targetKey: string, path: TreeNodeType[] = []): TreeNodeType[] | null => {
            for (const node of nodes) {
                const currentPath = [...path, node];

                if (node.key === targetKey) {
                    return currentPath; // 找到目标节点，返回路径
                }

                if (node.children) {
                    const found = findNodePath(node.children, targetKey, currentPath);
                    if (found) return found;
                }
            }
            return null;
        };

        // 获取节点路径
        const nodePath = findNodePath(treeData, nodeKey);
        if (!nodePath || nodePath.length < 3) {
            // 路径长度小于3表示没有爷爷级节点
            console.log('节点路径长度不足，没有爷爷级目录:', nodePath?.length || 0);
            return null;
        }

        // 路径结构: [爷爷级catalog, 父级volume_parent/db_parent, 当前节点]
        const grandparentNode = nodePath[0]; // 爷爷级节点（catalog）

        // 验证爷爷级节点是否为catalog类型
        if (grandparentNode.rawData?.type === 'catalog') {
            console.log('找到爷爷级目录:', grandparentNode.rawData.name);
            return grandparentNode.rawData.name;
        }

        console.log('爷爷级节点不是catalog类型:', grandparentNode.rawData?.type);
        return null;
    };

    /**
     * 根据节点key获取完整的层级路径信息
     *  nodeKey 当前节点的key  
     */
    const getNodeHierarchyInfo = (nodeKey: string) => {
        if (!nodeKey) return null;
        // 递归查找指定key的节点及其路径
        const findNodePath = (nodes: TreeNodeType[], targetKey: string, path: TreeNodeType[] = []): TreeNodeType[] | null => {
            for (const node of nodes) {
                const currentPath = [...path, node];

                if (node.key === targetKey) {
                    return currentPath;
                }

                if (node.children) {
                    const found = findNodePath(node.children, targetKey, currentPath);
                    if (found) return found;
                }
            }
            return null;
        };

        const nodePath = findNodePath(treeData, nodeKey);
        if (!nodePath) return null;

        const result = {
            currentNode: null as any,           // 当前节点
            parentNode: null as any,            // 父级节点 
            grandparentNode: null as any,       // 爷爷级节点
            fullPath: '',                       // 完整路径字符串
        };
        // 根据路径长度提取各级节点信息
        const pathLength = nodePath.length;

        if (pathLength >= 1) {
            result.currentNode = nodePath[pathLength - 1]; // 最后一个是当前节点
        }

        if (pathLength >= 2) {
            result.parentNode = nodePath[pathLength - 2];  // 倒数第二个是父级节点
        }

        if (pathLength >= 3) {
            result.grandparentNode = nodePath[0];          // 第一个是爷爷级节点（catalog）
        }
        // 构建完整路径字符串 例如: /src/catalog1/volume/source-vol1
        const pathNames = nodePath.map(node => {
            const rawData = node.rawData;
            const nodeName = rawData?.name || node.title;
            // 将中文分组名称转换为对应的英文类型名称
            if (rawData?.type === 'volume_parent') {
                return 'volume'; // "数据卷" → "volume"
            } else if (rawData?.type === 'db_parent') {
                return 'db';     // "数据库" → "db"
            } else {
                return nodeName; // 其他节点保持原名称
            }
        }).filter(name => name);
        result.fullPath = '/src/' + pathNames.join('/');
        return result;
    };

    return (
        <Typography.Paragraph>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginTop: '-8px', marginBottom: 8 }}>
                <div
                    onMouseEnter={() => setIsInputHovered(true)}
                    onMouseLeave={() => setIsInputHovered(false)}
                >
                    <Input
                        value={inputValue}
                        style={{
                            width: '130px', height: '32px'
                        }}
                        onChange={(value) => {
                            setInputValue(value);
                        }}
                        placeholder='输入搜索目录'
                        suffix={
                            inputValue && isInputHovered ? (
                                <IconCloseCircle
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setInputValue('')}
                                />
                            ) : (
                                <IconSearch />
                            )
                        }
                    />
                </div>
                <span
                    style={{ color: '#2563EB', fontSize: '12px', cursor: 'pointer' }}
                    onClick={() => setIsAdding(true)}
                >
                    <IconPlus />&nbsp;&nbsp;新建&nbsp;&nbsp;
                </span>
            </div>
            <div style={{ padding: '0px 12px' }}>
                {treeData && treeData.length > 0 ? <Tree
                    showLine
                    blockNode
                    selectable
                    // 设置默认展开的节点
                    expandedKeys={expandedKeys}
                    // 设置默认选中的节点
                    selectedKeys={[selectedKey]}
                    icons={(node) => ({
                        switcherIcon: (node._key === '__input__' || (node.childrenData && node.childrenData.length > 0)) ? <IconCaretDown /> : null,
                        dragIcon: <IconCaretRight />,
                    })}

                    // 【动态构建树数据：根据添加状态决定是否插入输入框节点】
                    treeData={(() => {
                        // 1. 如果正在添加根节点，在树的开头插入根节点输入框
                        let data = isAdding ? [{ title: '', key: '__input__', children: [] }, ...treeData] : treeData;

                        // 2. 如果正在为某个父节点添加子节点，插入子节点输入框
                        if (addingToParentInfo) {
                            data = addInputNode(data, addingToParentInfo);
                        }
                        return data;
                    })()}

                    // 处理节点展开/收起事件
                    onExpand={handleExpand}
                    // 处理节点选择事件
                    onSelect={handleSelect}
                    renderExtra={(node) => {
                        return (
                            <div
                                onMouseEnter={() => { setHoveredKey(node._key || null) }
                                } //移入时修改key值
                                onMouseLeave={() => setHoveredKey(null)} //移除时将key改为空
                            >
                                {(hoveredKey === node._key) && (
                                    <>
                                        {/* 【针对"数据库"和"数据卷"节点的特殊处理】 */}
                                        {(node.title == '数据库' || node.title == '数据卷') ?
                                            <>
                                                {/* 删除按钮 */}
                                                <Tooltip color='white' content='删除'>
                                                    <IconDelete
                                                        style={{
                                                            color: hoverDeleteKey === node._key ? '#2563EB' : '#1E293B',
                                                            cursor: 'pointer',
                                                            position: 'absolute',
                                                            right: 30,
                                                            fontSize: 12,
                                                            top: 10,
                                                        }}
                                                        onClick={() => handDelete(node._key, node)}
                                                        onMouseEnter={() => setHoverDeleteKey(node._key || null)}
                                                        onMouseLeave={() => setHoverDeleteKey(null)}
                                                    />
                                                </Tooltip>

                                                {/* 【添加子节点按钮】- 只在"数据库"和"数据卷"节点显示 */}
                                                {(node.title == '数据库' || node.title == '数据卷') &&
                                                    <IconPlus
                                                        style={{
                                                            cursor: 'pointer',
                                                            position: 'absolute',
                                                            right: 8,
                                                            fontSize: 12,
                                                            top: 10,
                                                        }}
                                                        onClick={() => {
                                                            console.log('准备为节点添加子节点:', node._key, '查询所有信息', node);
                                                            // 设置当前正在为哪个节点添加子节点
                                                            setAddingToParentInfo(node._key || null);
                                                            // 如果父节点当前是收起状态，自动展开它
                                                            // 这样用户可以看到新添加的输入框
                                                            if (node._key && !expandedKeys.includes(node._key)) {
                                                                setExpandedKeys([...expandedKeys, node._key]);
                                                            }
                                                        }}
                                                    />
                                                }
                                            </> :
                                            /* 【其他节点根据类型显示相应按钮】 */
                                            <>
                                                {/* 只有目录类型(catalog)的节点才显示编辑图标 */}
                                                {node.dataRef?.rawData?.type === 'catalog' && (
                                                    <Tooltip color='white' content='编辑'>
                                                        <IconEdit
                                                            style={{
                                                                color: hoverEditKey === node._key ? '#2563EB' : '#1E293B',
                                                                cursor: 'pointer',
                                                                position: 'absolute',
                                                                right: 30, // 如果有编辑图标，删除图标位置向右偏移
                                                                fontSize: 12,
                                                                top: 10,
                                                            }}
                                                            onMouseEnter={() => setHoverEditKey(node._key || null)}
                                                            onMouseLeave={() => setHoverEditKey(null)}
                                                            onClick={() => {
                                                                // 点击编辑图标时开始编辑节点
                                                                const nodeName = node.dataRef?.rawData?.name || node.title || '';
                                                                startEditNode(node._key || '', nodeName);
                                                                console.log('点击编辑按钮:', node._key, '节点信息:', node.dataRef?.rawData);
                                                            }}
                                                        />
                                                    </Tooltip>
                                                )}
                                                <Tooltip color='white' content='删除'>
                                                    <IconDelete
                                                        style={{
                                                            color: hoverDeleteKey === node._key ? '#2563EB' : '#1E293B',
                                                            cursor: 'pointer',
                                                            position: 'absolute',
                                                            // 如果是目录类型节点(有编辑图标)，删除图标位置向右偏移；否则保持原位置
                                                            right: node.dataRef?.rawData?.type === 'catalog' ? 8 : 8,
                                                            fontSize: 12,
                                                            top: 10,
                                                        }}
                                                        onClick={() => handDelete(node._key, node)}
                                                        onMouseEnter={() => setHoverDeleteKey(node._key || null)}
                                                        onMouseLeave={() => setHoverDeleteKey(null)}
                                                    />
                                                </Tooltip>
                                            </>
                                        }
                                    </>
                                )}
                            </div>
                        );
                    }}
                    renderTitle={(props) => {
                        // console.log(props.dataRef);

                        const hasChildren = props.dataRef && props.dataRef.children !== undefined;
                        // 动态图标：有子节点用文件夹图标，否则用文件图标  
                        const icon = hasChildren ? '' : (props.dataRef?.rawData?.type == 'volume' ? <IconStorage /> : <IconArchive />);

                        // 【处理根节点输入框的渲染】
                        if (props._key === '__input__') {
                            return (
                                <Input
                                    autoFocus
                                    size="small"
                                    style={{ width: '100%', height: '24px', marginRight: '17px' }}
                                    value={newNodeValue}
                                    onChange={v => setNewNodeValue(v)}
                                    onPressEnter={() => {
                                        //真实添加函数
                                        handAddCatalog();
                                        // 如果输入为空，使用默认名称
                                        const finalName = newNodeValue.trim() || `新建目录${Date.now()}`;

                                        try {
                                            // 【创建新的根目录节点】
                                            const newNode: TreeNodeType = {
                                                title: finalName,
                                                key: Date.now().toString(),
                                                children: [],
                                                rawData: {
                                                    id: Date.now().toString(),
                                                    name: finalName,
                                                    type: 'catalog'
                                                }
                                            };
                                            console.log('添加新目录:', newNode);
                                            // 将新节点添加到树的开头
                                            setTreeData([
                                                newNode,
                                                ...treeData,
                                            ]);
                                        } catch (error) {
                                            Message.error('创建目录失败');
                                            console.error('创建节点失败:', error);
                                        }

                                        // 重置添加状态
                                        setIsAdding(false);
                                        setNewNodeValue('');
                                    }}
                                    onBlur={() => {
                                        // 失去焦点时的处理逻辑与回车相同
                                        const finalName = newNodeValue.trim() || `新建目录${Date.now()}`;

                                        try {
                                            const newNode: TreeNodeType = {
                                                title: finalName,
                                                key: Date.now().toString(),
                                                children: [],
                                                rawData: {
                                                    id: Date.now().toString(),
                                                    name: finalName,
                                                    type: 'catalog'
                                                }
                                            };
                                            console.log('添加新目录:', newNode);
                                            setTreeData([
                                                newNode,
                                                ...treeData,
                                            ]);
                                        } catch (error) {
                                            Message.error('创建目录失败');
                                            console.error('创建节点失败:', error);
                                        }

                                        setIsAdding(false);
                                        setNewNodeValue('');
                                    }}
                                    placeholder="请输入新目录名"
                                />
                            );
                        }

                        // 【处理子节点输入框的渲染】
                        if (props._key?.startsWith('__input_child__')) {
                            return renderChildInput(props);
                        }

                        // 【处理编辑状态的渲染】
                        if (editingNodeKey === props._key) {
                            return (
                                <Input
                                    autoFocus // 自动聚焦到编辑输入框
                                    size="small"
                                    style={{ width: '100%', height: '24px', marginRight: '17px' }}
                                    value={editingNodeValue}
                                    onChange={v => setEditingNodeValue(v)}
                                    onPressEnter={() => {
                                        // 按回车键保存编辑
                                        saveEditNode(props._key || '', editingNodeValue);
                                    }}
                                    onBlur={() => {
                                        // 失去焦点时保存编辑
                                        saveEditNode(props._key || '', editingNodeValue);
                                    }}
                                    onKeyDown={(e) => {
                                        // 按ESC键取消编辑
                                        if (e.key === 'Escape') {
                                            cancelEditNode();
                                        }
                                    }}
                                    placeholder="请输入节点名称"
                                />
                            );
                        }
                        const key = props._key;
                        const title = props.title;
                        const titleStr = typeof title === 'string' ? title : String(title);
                        if (inputValue && typeof title === 'string') {
                            const index = title.toLowerCase().indexOf(inputValue.toLowerCase());
                            if (index === -1) {
                                return title;
                            }
                            const prefix = title.slice(0, index);
                            const suffix = title.slice(index + inputValue.length);
                            return (
                                <div
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
                                    onMouseEnter={() => setHoveredKey(key || null)} //移入时修改key值
                                    onMouseLeave={() => setHoveredKey(null)} //移除时将key改为空
                                >
                                    <span style={{ marginRight: '6px' }}>
                                        {icon}
                                    </span>
                                    <span
                                        style={{
                                            flex: 1,
                                            maxWidth: '80px',
                                            minWidth: '80px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            display: 'block'
                                        }}
                                    >
                                        <Popover content={<span>{title}</span>} position="top">
                                            {prefix}
                                            <span style={{ color: 'var(--color-primary-light-4)' }}>
                                                {title.substr(index, inputValue.length)}
                                            </span>
                                            {suffix}
                                        </Popover>
                                    </span>
                                </div>
                            );
                        }
                        return (
                            <div
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
                                onMouseEnter={() => setHoveredKey(key || null)}
                                onMouseLeave={() => setHoveredKey(null)}
                            >
                                <span style={{ marginRight: '6px' }}>
                                    {icon}
                                </span>
                                <span
                                    style={{
                                        flex: 1,
                                        maxWidth: '80px',
                                        minWidth: '80px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        display: 'block'
                                    }}
                                >

                                    <Popover content={<span>{titleStr}</span>} position="top">
                                        <span>{titleStr}</span>
                                    </Popover>
                                </span>
                            </div>
                        );
                    }}
                ></Tree> : (<p style={{ textAlign: 'center', marginTop: '16px' }}>暂无数据</p>)}
            </div>
        </Typography.Paragraph>
    );
} 