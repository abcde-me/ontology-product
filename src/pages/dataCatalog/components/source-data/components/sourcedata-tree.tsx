import React, { Children, useEffect, useState } from 'react';
import { Typography, Input, Tree, Tooltip, Popover, Modal, Message } from '@arco-design/web-react';
import { IconPlus, IconCaretDown, IconCaretRight, IconDelete, IconFile, IconFolder, IconStorage, IconSearch, IconCloseCircle } from '@arco-design/web-react/icon';
import { icon } from 'mermaid/dist/rendering-util/rendering-elements/shapes/icon';
// 引入树节点相关API（使用时取消注释）
// import { fetchTreeDataAPI, deleteTreeNodeAPI, createTreeNodeAPI, updateTreeNodeAPI } from '@/api/treeApi';

// 树数据结构
const TreeData = [
    {
        title: '目录1录1录1录1录1录6666',
        key: '0-0',
        children: [
            {
                title: '数据卷',
                key: '0-0-1',
                children: [
                    {
                        // icon: <IconFile />,
                        title: '文件16666666666666666666.txt',
                        key: '0-0-1-1',
                    },
                    {
                        title: 'source-vol3source-vol3',
                        key: '0-0-1-2',
                    },
                    {
                        title: '文件3.docx',
                        key: '0-0-1-3',
                    },
                ],
            },
            {
                title: '数据库',
                key: '0-0-2',
                children: [
                    {
                        title: '数据库1',
                        key: '0-0-2-1',
                    },
                    {
                        title: '数据库2',
                        key: '0-0-2-2',
                    },
                ],
            },
        ],
    },
    {
        title: '目录2',
        key: '0-1',
        children: [
            {
                title: '文件夹1',
                key: '0-1-1',
                children: [
                    {
                        title: '文档1',
                        key: '0-1-1-0',
                    },
                ],
            },
            {
                title: '文件夹2',
                key: '0-1-2',
                children: [
                    {
                        title: '文档2',
                        key: '0-1-2-0',
                    },
                ],
            },
        ],
    },
];

function searchData(inputValue) {
    const loop = (data) => {
        const result = [];
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

    return loop(TreeData);
}

interface SourceDataTreeProps {
    onChanges?: (value: string) => void;
}

export default function SourceDataTree(props: SourceDataTreeProps) {
    const { onChanges } = props;

    // 设置默认展开的节点key（目录1、卷、数据库）
    const [expandedKeys, setExpandedKeys] = useState(['0-0', '0-0-1', '0-0-2']);

    // 设置默认选中的节点key（卷下的第一个文件）
    const [selectedKey, setSelectedKey] = useState('0-0-1-1');

    // 搜索树相关状态
    const [inputValue, setInputValue] = useState('');
    const [isInputHovered, setIsInputHovered] = useState(false);
    const [hoveredKey, setHoveredKey] = useState(null);
    const [hoverDeleteKey, setHoverDeleteKey] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newNodeValue, setNewNodeValue] = useState('');
    const [treeData, setTreeData] = useState(TreeData);
    const [addingToParentInfo, setAddingToParentInfo] = useState(null);

    // 处理树节点展开/收起事件
    const handleExpand = (expandedKeys) => {
        setExpandedKeys(expandedKeys);
    };

    // 处理树节点选择事件
    const handleSelect = (selectedKeys) => {
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
            const result = searchData(inputValue);
            setTreeData(result);
        }
    }, [inputValue]);

    // 组件初始化时设置默认展开和选中状态
    useEffect(() => {
        // 确保默认展开目录1、卷、数据库
        setExpandedKeys(['0-0', '0-0-1', '0-0-2']);
        // 确保默认选中卷下的第一个文件
        setSelectedKey('0-0-1-1');

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
                    } catch (apiError) {
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

    const addInputNode = (nodes, parentKey) => {
        return nodes.map(node => {
            if (node.key === parentKey) {
                const children = node.children ? [...node.children] : [];
                children.unshift({
                    title: '',
                    key: `__input_child__${parentKey}`,
                    isLeaf: true,
                });
                return { ...node, children, isLeaf: false };
            }
            if (node.children) {
                return { ...node, children: addInputNode(node.children, parentKey) };
            }
            return node;
        });
    };

    const addNodeToParent = (nodes, parentKey, newNode) => {
        return nodes.map(n => {
            if (n.key === parentKey) {
                const children = n.children ? [...n.children] : [];
                const filteredChildren = children.filter(c => c.key !== `__input_child__${parentKey}`);
                filteredChildren.unshift(newNode);
                return { ...n, children: filteredChildren, isLeaf: false };
            }
            if (n.children) {
                return { ...n, children: addNodeToParent(n.children, parentKey, newNode) };
            }
            return n;
        });
    };

    const removeInputFromParent = (nodes, parentKey) => {
        return nodes.map(n => {
            if (n.key === parentKey) {
                const children = n.children ? n.children.filter(c => c.key !== `__input_child__${parentKey}`) : [];
                return { ...n, children };
            }
            if (n.children) {
                return { ...n, children: removeInputFromParent(n.children, parentKey) };
            }
            return n;
        });
    };

    const renderChildInput = (props) => {
        const parentKey = props._key.substring('__input_child__'.length);
        return (
            <Input
                autoFocus
                allowClear={true}
                size="small"
                style={{ width: '100%', height: '24px', marginRight: '17px' }}
                value={newNodeValue}
                onChange={v => setNewNodeValue(v)}
                onPressEnter={async () => {
                    // 如果输入为空，使用默认名称
                    const finalName = newNodeValue.trim() || `新建文件${Date.now()}`;

                    try {
                        // 方法1：调用真实API创建子节点
                        // const newNode = await createTreeNodeAPI({
                        //     title: finalName,
                        //     type: 'file', // 子节点通常是文件类型
                        //     parentId: parentKey // 父节点ID
                        // });
                        // // 重新加载树数据
                        // await loadTreeData();

                        // 方法2：前端模拟创建（当前使用）
                        const newNode = { title: finalName, key: Date.now().toString(), isLeaf: true };
                        setTreeData(addNodeToParent(treeData, parentKey, newNode));
                    } catch (error) {
                        Message.error('创建子节点失败');
                        console.error('创建子节点失败:', error);
                        setTreeData(removeInputFromParent(treeData, parentKey));
                    }

                    setAddingToParentInfo(null);
                    setNewNodeValue('');
                }}
                onBlur={async () => {
                    // 如果输入为空，使用默认名称
                    const finalName = newNodeValue.trim() || `新建文件${Date.now()}`;

                    try {
                        // 方法1：调用真实API创建子节点
                        // const newNode = await createTreeNodeAPI({
                        //     title: finalName,
                        //     type: 'file',
                        //     parentId: parentKey
                        // });
                        // // 重新加载树数据
                        // await loadTreeData();

                        // 方法2：前端模拟创建（当前使用）
                        const newNode = { title: finalName, key: Date.now().toString(), isLeaf: true };
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
                        switcherIcon: (node._key === '__input__' || node.childrenData.length > 0) ? <IconCaretDown /> : null,
                        dragIcon: <IconCaretRight />,
                    })}
                    treeData={(() => {
                        let data = isAdding ? [{ title: '', key: '__input__', children: [] }, ...treeData] : treeData;
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
                                onMouseEnter={() => { setHoveredKey(node._key) }
                                } //移入时修改key值
                                onMouseLeave={() => setHoveredKey(null)} //移除时将key改为空
                            >
                                {(hoveredKey === node._key) && (
                                    <>
                                        {(node.title == '数据库' || node.title == '数据卷') ?
                                            <>
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
                                                        onMouseEnter={() => setHoverDeleteKey(node._key)}
                                                        onMouseLeave={() => setHoverDeleteKey(null)}
                                                    />
                                                </Tooltip>
                                                {(node.title == '数据库' || node.title == '数据卷') && <IconPlus style={{
                                                    // color: hoverDeleteKey === node._key ? '#2563EB' : '#C0C4CC',
                                                    cursor: 'pointer',
                                                    position: 'absolute',
                                                    right: 8,
                                                    fontSize: 12,
                                                    top: 10,
                                                }} onClick={() => {
                                                    setAddingToParentInfo(node._key);
                                                    if (!expandedKeys.includes(node._key)) {
                                                        setExpandedKeys([...expandedKeys, node._key]);
                                                    }
                                                }} />
                                                }</> :
                                            <Tooltip color='white' content='删除'>
                                                <IconDelete
                                                    style={{
                                                        color: hoverDeleteKey === node._key ? '#2563EB' : '#1E293B',
                                                        cursor: 'pointer',
                                                        position: 'absolute',
                                                        right: 8,
                                                        fontSize: 12,
                                                        top: 10,
                                                    }}
                                                    onClick={() => handDelete(node._key, node)}
                                                    onMouseEnter={() => setHoverDeleteKey(node._key)}
                                                    onMouseLeave={() => setHoverDeleteKey(null)}
                                                />
                                            </Tooltip>
                                        }
                                    </>
                                )}
                            </div>
                        );
                    }}
                    renderTitle={(props) => {
                        const hasChildren = props.dataRef && props.dataRef.children !== undefined;
                        // 动态图标：有子节点用文件夹图标，否则用文件图标  
                        const icon = hasChildren ? '' : <IconStorage />;
                        if (props._key === '__input__') {
                            return (
                                <Input
                                    autoFocus
                                    size="small"
                                    style={{ width: '100%', height: '24px', marginRight: '17px' }}
                                    value={newNodeValue}
                                    onChange={v => setNewNodeValue(v)}
                                    onPressEnter={async () => {
                                        // 如果输入为空，使用默认名称
                                        const finalName = newNodeValue.trim() || `新建目录${Date.now()}`;

                                        try {
                                            // 方法1：调用真实API创建节点
                                            // const newNode = await createTreeNodeAPI({
                                            //     title: finalName,
                                            //     type: 'directory'
                                            // });
                                            // // 重新加载树数据
                                            // await loadTreeData();

                                            // 方法2：前端模拟创建（当前使用）
                                            const newNode = {
                                                title: finalName,
                                                key: Date.now().toString(),
                                                children: []
                                            };
                                            console.log('Adding new directory:', newNode);
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
                                    onBlur={async () => {
                                        // 如果输入为空，使用默认名称
                                        const finalName = newNodeValue.trim() || `新建目录${Date.now()}`;

                                        try {
                                            // 方法1：调用真实API创建根目录
                                            // const newNode = await createTreeNodeAPI({
                                            //     title: finalName,
                                            //     type: 'directory',
                                            //     parentId: null // 根目录没有父节点
                                            // });
                                            // // 重新加载树数据
                                            // await loadTreeData();

                                            // 方法2：前端模拟创建（当前使用）
                                            const newNode = {
                                                title: finalName,
                                                key: Date.now().toString(),
                                                children: []
                                            };
                                            console.log('Adding new directory:', newNode);
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

                        if (props._key.startsWith('__input_child__')) {
                            return renderChildInput(props);
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
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                                    onMouseEnter={() => setHoveredKey(key)} //移入时修改key值
                                    onMouseLeave={() => setHoveredKey(null)} //移除时将key改为空
                                >
                                    <span
                                        style={{
                                            flex: 1,
                                            maxWidth: '100px',
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
                                onMouseEnter={() => setHoveredKey(key)}
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