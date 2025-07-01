import AddSvg from '@/assets/add.svg';
import {
  Input,
  Menu,
  Popover,
  Tree,
  Modal,
  Tooltip,
  Button,
  Message
} from '@arco-design/web-react';
import { IconMore } from '@arco-design/web-react/icon';
import React, { useCallback, useEffect, useState } from 'react';
import AddOrgForm from '../AddOrgForm';
import EditOrgForm from '../EditOrgForm';
import './index.less';
import { useOrgEditor } from '../OrgProvider/Context';
import AddParentOrgForm from '../AddParentOrgForm';
import PreDelModal from '../PreDelModal';
import { useUserInfo } from '@/store/userInfoStore';

export default function OrgTree() {
  const org = useOrgEditor();
  const { orgStore } = org;
  const { orgData, currentOrg } = orgStore.useGetState([
    'orgData',
    'currentOrg'
  ]);

  // 获取用户信息
  const userInfo = useUserInfo();

  const [popoverVisible, setPopoverVisible] = useState<boolean>(false); // 控制 Popover 显示与隐藏
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false); // 标记是否已经初始化

  const [treeData, setTreeData] = useState(orgData);
  const [inputValue, setInputValue] = useState('');

  // 根据组织ID查找节点
  const findNodeById = (nodes: any[], targetId: string): any => {
    for (const node of nodes) {
      if (node.id === targetId || node.key === targetId) {
        return node;
      }
      if (node.children && node.children.length > 0) {
        const found = findNodeById(node.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  // 获取节点到根节点的路径（用于展开）
  const getPathToRoot = (
    nodes: any[],
    targetId: string,
    path: string[] = []
  ): string[] => {
    for (const node of nodes) {
      const currentPath = [...path, node.key || node.id];
      if (node.id === targetId || node.key === targetId) {
        return currentPath;
      }
      if (node.children && node.children.length > 0) {
        const found = getPathToRoot(node.children, targetId, currentPath);
        if (found.length > 0) return found;
      }
    }
    return [];
  };

  // 获取所有需要展开的节点key
  const getAllExpandedKeys = (data: any[]): string[] => {
    const keys: string[] = [];
    const traverse = (nodes: any[]) => {
      nodes.forEach((node) => {
        if (node.children && node.children.length > 0) {
          keys.push(node.key || node.id);
          traverse(node.children);
        }
      });
    };
    traverse(data);
    return keys;
  };

  function searchData(inputValue: any) {
    const loop = (data) => {
      const result = [];
      data.forEach((item) => {
        if (item.title.toLowerCase().indexOf(inputValue.toLowerCase()) > -1) {
          // TODO: ts错误
          // @ts-expect-error
          result.push({ ...item });
        } else if (item.children) {
          const filterData = loop(item.children);

          if (filterData.length) {
            // TODO: ts错误
            // @ts-expect-error
            result.push({ ...item, children: filterData });
          }
        }
      });
      return result;
    };

    return loop(orgData);
  }

  useEffect(() => {
    if (!inputValue) {
      setTreeData(orgData);
      // 如果没有搜索，恢复之前的展开状态（如果有初始化的展开状态）
      // 这里不重置 expandedKeys，保持用户的展开状态
    } else {
      const result = searchData(inputValue);
      setTreeData(result);
      // 搜索时自动展开所有包含搜索结果的节点
      const allExpandedKeys = getAllExpandedKeys(result);
      setExpandedKeys(allExpandedKeys);
    }
  }, [inputValue, orgData]);

  // 基于用户信息初始化树的选中和展开状态
  useEffect(() => {
    // TODO: ts错误
    // @ts-expect-error
    if (treeData.length > 0 && !hasInitialized) {
      let targetNode = null;
      let targetKey = '';
      let pathToExpand: string[] = [];

      // 优先使用用户的 organization_id
      if (userInfo?.organization_id) {
        console.log('Finding user organization:', userInfo.organization_id);
        // TODO: ts错误
        // @ts-expect-error
        targetNode = findNodeById(treeData, userInfo.organization_id);
        if (targetNode) {
          // TODO: ts错误
          // @ts-expect-error
          targetKey = String(targetNode.key || targetNode.id);
          // TODO: ts错误
          // @ts-expect-error
          pathToExpand = getPathToRoot(treeData, userInfo.organization_id);
          console.log('Found user organization node:', targetNode);
          console.log('Path to expand:', pathToExpand);
        }
      }

      // 如果没有找到用户组织或用户是超级管理员，使用第一个节点
      // TODO: ts错误
      // @ts-expect-error
      if (!targetNode && treeData.length > 0) {
        // TODO: ts错误
        // @ts-expect-error
        targetNode = treeData[0];
        // TODO: ts错误
        // @ts-expect-error
        targetKey = String(targetNode.key || targetNode.id);
        console.log('Using first node as default:', targetNode);
      }

      if (targetNode && targetKey) {
        // 设置展开的节点（除了目标节点本身）
        const keysToExpand = pathToExpand.slice(0, -1);
        setExpandedKeys(keysToExpand);

        // 设置选中的节点
        setSelectedKeys([targetKey]);

        // 设置当前组织
        orgStore.setCurrentOrg(targetNode);

        console.log('Initialized tree with:', {
          selectedKey: targetKey,
          expandedKeys: keysToExpand,
          targetNode
        });

        setHasInitialized(true);
      }
    }
  }, [treeData, userInfo, hasInitialized]);

  // 同步 selectedKeys 和 currentOrg（只在初始化完成后生效）
  useEffect(() => {
    console.log(
      'currentOrg changed:',
      currentOrg,
      'hasInitialized:',
      hasInitialized
    );
    if (hasInitialized && currentOrg && (currentOrg.key || currentOrg.id)) {
      // 优先使用 key，如果没有 key 则使用 id
      const keyToSelect = String(currentOrg.key || currentOrg.id);
      console.log('Setting selectedKeys to:', [keyToSelect]);
      setSelectedKeys([keyToSelect]);
    }
  }, [currentOrg, hasInitialized]);

  console.log('selectedKeys', selectedKeys);
  return (
    <div>
      <PreDelModal />
      <div className="mb-5 px-[24px] text-[20px] font-[500]">组织架构</div>

      <div className="mb-4 flex items-center gap-2 px-[24px]">
        <Input.Search
          style={{
            maxWidth: 240
          }}
          onChange={setInputValue}
          placeholder="搜索组织名称"
        />
        <div className="border-primary-light-4 flex h-[32px] w-[36px] cursor-pointer items-center justify-center rounded-[6px] border">
          <AddSvg
            onClick={() => {
              orgStore.setParentOrgModalVisible(true);
            }}
          />
        </div>
      </div>
      <div
        className="org-tree-container overflow-auto rounded-md bg-white px-[24px] pb-[20px]"
        style={{
          minHeight: '400px',
          maxHeight: 'calc(100vh - 200px)' // 动态计算高度，留出顶部和底部空间
        }}
      >
        <Tree
          selectedKeys={selectedKeys}
          expandedKeys={expandedKeys}
          onExpand={setExpandedKeys}
          treeData={treeData}
          fieldNames={{
            key: 'key',
            title: 'title',
            children: 'children'
          }}
          renderTitle={(nodeProps) => {
            const titleStr = nodeProps.title?.toString() || '';
            // 从节点数据中获取层级信息
            const nodeLevel = (nodeProps as any).level || 1;

            // 创建标题内容（包含搜索高亮）
            const renderTitleContent = () => {
              if (inputValue) {
                const index = titleStr
                  .toLowerCase()
                  .indexOf(inputValue.toLowerCase());

                if (index === -1) {
                  return titleStr;
                }

                const prefix = titleStr.substring(0, index);
                const matchedText = titleStr.substring(
                  index,
                  index + inputValue.length
                );
                const suffix = titleStr.substring(index + inputValue.length);

                return (
                  <span>
                    {prefix}
                    <span style={{ color: 'var(--color-primary-light-4)' }}>
                      {matchedText}
                    </span>
                    {suffix}
                  </span>
                );
              }

              return titleStr;
            };

            const content = renderTitleContent();

            // 根据层级动态计算可用宽度
            // 基础宽度调整为更合理的值，确保为操作按钮留出足够空间
            const baseWidth = 260;
            const indentPerLevel = 20;
            const operationButtonSpace = 60; // 减少操作按钮预留空间，确保按钮能正常显示
            const dynamicMaxWidth = Math.max(
              baseWidth -
                (nodeLevel - 1) * indentPerLevel -
                operationButtonSpace,
              80 // 增加最小宽度
            );

            return (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  minHeight: '32px'
                }}
                onMouseEnter={() => {
                  // 当鼠标移动到节点时，设置悬停的组织
                  orgStore.setHoveredOrg(nodeProps);
                }}
              >
                <Tooltip content={titleStr} position="top">
                  <span
                    className="truncate"
                    style={{
                      maxWidth: `${dynamicMaxWidth}px`,
                      minWidth: '80px',
                      lineHeight: '32px',
                      display: 'inline-block',
                      height: '32px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {content}
                  </span>
                </Tooltip>
              </div>
            );
          }}
          onSelect={(selectedKeys, info) => {
            console.log('onSelect triggered:', selectedKeys, info);
            setSelectedKeys(selectedKeys);
            if (info.selectedNodes[0]) {
              console.log(
                'Setting currentOrg from onSelect:',
                info.selectedNodes[0].props
              );
              orgStore.setCurrentOrg(info.selectedNodes[0].props);
            }
          }}
          renderExtra={(node: any) => {
            const { perms, level } = node;
            console.log('node', node);
            // 是否可以创建， 如果perms包括 "can_create"
            const canCreate = perms?.includes('can_create') && level < 7;
            // 是否可以编辑， 如果perms包括 "can_edit"
            const canEdit = perms?.includes('can_update');
            // 是否可以删除， 如果perms包括 "can_delete"
            const canDelete = perms?.includes('can_delete');

            return (
              <div
                className="org-tree-operation-area"
                onClick={(e) => {
                  // 阻止点击操作按钮时触发节点选中
                  e.stopPropagation();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px', // 固定宽度确保显示
                  height: '32px', // 与节点高度一致
                  fontSize: 12,
                  color: '#7F8C9F',
                  fontWeight: 400,
                  flexShrink: 0, // 防止被压缩
                  zIndex: 2, // 确保在合适的层级
                  pointerEvents: 'auto' // 始终可点击
                }}
              >
                <Popover
                  onVisibleChange={(visible) => {
                    setPopoverVisible(visible);
                  }}
                  position="right"
                  content={
                    <Menu>
                      <Menu.Item
                        disabled={!canCreate}
                        key="1"
                        onClick={(e) => {
                          e.stopPropagation();
                          orgStore.setOrgModalVisible(true);
                          orgStore.setCurrentOrg(node);
                        }}
                      >
                        创建子部门
                      </Menu.Item>
                      <Menu.Item
                        disabled={!canEdit}
                        key="2"
                        onClick={(e) => {
                          e.stopPropagation();
                          orgStore.setEditOrgModalVisible(true);
                          orgStore.setCurrentOrg(node);
                          orgStore.setHoveredOrg(node);
                        }}
                      >
                        编辑部门
                      </Menu.Item>
                      <Menu.Item
                        key="3"
                        disabled={!canDelete}
                        onClick={async (e) => {
                          e.stopPropagation();
                          orgStore.setHoveredOrg(node);
                          if (!canDelete) return;
                          const res = await orgStore.preDelOrgOperate();
                          if (!res.data.access) {
                            orgStore.setPreDeleteVisible(true);
                            return;
                          }
                          // 使用 Modal.confirm 替代 Popconfirm
                          Modal.confirm({
                            title: '确定删除该部门吗？',
                            content:
                              '删除部门将无法撤销，部门下的成员和资源不会被删除。',
                            okText: '删除',
                            cancelText: '取消',
                            onOk: async () => {
                              const res = await orgStore.deleteOrg(node.id);
                              if (res.success) {
                                Message.success('删除成功');
                              }
                            }
                          });
                        }}
                      >
                        <div style={{ color: 'red' }}>删除部门</div>
                      </Menu.Item>
                    </Menu>
                  }
                >
                  <div
                    style={{
                      cursor: 'pointer',
                      padding: '4px 6px',
                      borderRadius: '4px',
                      transition: 'background-color 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '24px',
                      height: '24px',
                      color: '#666'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0f0f0';
                      // 当鼠标悬停在操作按钮上时，也设置悬停的组织
                      orgStore.setHoveredOrg(node);
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <IconMore />
                  </div>
                </Popover>
              </div>
            );
          }}
        ></Tree>
      </div>
      <AddOrgForm />
      <EditOrgForm />
      <AddParentOrgForm />
    </div>
  );
}
