import AddSvg from '@/assets/add.svg';
import { Input, Menu, Popconfirm, Popover, Tree, Button } from '@arco-design/web-react';
import React, { useCallback, useEffect, useState } from 'react';
import AddOrgForm from '../AddOrgForm';
import EditOrgForm from '../EditOrgForm';
import { useOrgEditor } from '../OrgProvider/Context';
import AddParentOrgForm from '../AddParentOrgForm'

export default function OrgTree() {
  const org = useOrgEditor();
  const { orgStore } = org;
  const { orgData } = orgStore.useGetState([
    'orgData',
  ]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [popoverVisible, setPopoverVisible] = useState<boolean>(false); // 控制 Popover 显示与隐藏

  const [treeData, setTreeData] = useState(orgData);
  const [inputValue, setInputValue] = useState('');
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

    return loop(orgData);
  }

  useEffect(() => {
    if (!inputValue) {
      setTreeData(orgData);
    } else {
      const result = searchData(inputValue);
      setTreeData(result);
    }
  }, [inputValue, orgData]);

  const handleMouseEnter = useCallback((key: string) => {
    setPopoverVisible(false);
    setHoveredNode(key);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!popoverVisible) {
      setHoveredNode(null);
      //  orgStore.setHoveredOrg(null)
    }
  }, [popoverVisible]);
  return (
    <div>
      <div className="mb-2 text-lg font-bold">组织树</div>

      <div className="mb-4 flex items-center gap-2">
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
              orgStore.setParentOrgModalVisible(true)
            }}
          />
        </div>
      </div>
      <Tree
        defaultSelectedKeys={['1']}
        // defaultSelectedKeys={currentOrg ? [currentOrg.id] : []}
        treeData={treeData}
        renderTitle={({ title }) => {
          if (inputValue) {
            const index = title
              ?.toString()
              .toLowerCase()
              .indexOf(inputValue.toLowerCase());

            if (index === -1) {
              return title;
            }

            const prefix = title?.toString().substr(0, index);
            const suffix = title?.toString().substr(index + inputValue.length);
            return (
              <span>
                {prefix}
                <span style={{ color: 'var(--color-primary-light-4)' }}>
                  {title?.toString().substr(index, inputValue.length)}
                </span>
                {suffix}
              </span>
            );
          }

          return title;
        }}
        onSelect={(value, info) => {
          orgStore.setCurrentOrg(info.selectedNodes[0].props);
        }}
        renderExtra={(node: any) => {
           const { perms } = node;
           // 是否可以创建， 如果perms包括 "can_create"
           const canCreate = perms?.includes('can_create');
           // 是否可以编辑， 如果perms包括 "can_edit"
            const canEdit = perms?.includes('can_update');
            // 是否可以删除， 如果perms包括 "can_delete"
            const canDelete = perms?.includes('can_delete');

          return (
            <div
              onMouseEnter={() => {
                handleMouseEnter(node.id)
                orgStore.setHoveredOrg(node)
              }}
              onMouseLeave={handleMouseLeave}
              style={{
                position: 'absolute', // 使用 relative 让元素相对节点进行定位
                fontSize: 12,
                color: '#7F8C9F',
                fontWeight: 400,
                right: 8,
                padding: '5px' // 添加适当的间距
              }}
            >
              {/* && children.length > 0 */}
              {hoveredNode === node.id ? (
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
                        onClick={() => {
                          console.log('111', node);
                          orgStore.setOrgModalVisible(true);
                          orgStore.setCurrentOrg(node);
                        }}
                      >
                        创建子部门
                      </Menu.Item>
                      <Menu.Item
                      disabled={!canEdit}
                        key="2"
                        onClick={() => {
                          orgStore.setEditOrgModalVisible(true);
                          orgStore.setCurrentOrg(node);
                        }}
                      >
                        编辑部门
                      </Menu.Item>
                      <Popconfirm
                        title="确定删除该部门吗？"
                        onOk={() => {
                          orgStore.deleteOrg(node.id);
                        }}
                        focusLock
                        content="删除部门将无法撤销，部门下的成员和资源不会被删除。"
                        okText="删除"
                        cancelText="取消"
                      >
                        <Menu.Item key="3" disabled={!canDelete}>
                          {' '}
                          <div style={{ color:'red' }}>删除部门</div>
                        </Menu.Item>
                      </Popconfirm>
                    </Menu>
                  }
                >
                  <div className="text-black">...</div>
                </Popover>
              ) : (
                <div style={{ opacity: 0}}>{node.value}</div>
              )}
            </div>
          );
        }}
      ></Tree>
      <AddOrgForm />
      <EditOrgForm />
      <AddParentOrgForm />
    </div>
  );
}
