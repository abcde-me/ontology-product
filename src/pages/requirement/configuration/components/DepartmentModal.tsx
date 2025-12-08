import React, { useEffect, useState } from 'react';
import {
  Modal,
  Button,
  Tree,
  Input,
  Empty,
  Tooltip,
  Tabs,
  Table,
  Pagination,
  Link
} from '@arco-design/web-react';
import { useDepartmentTree } from '../../hooks/useDepartmentTree';
import noDataElement from '@/components/no-data';
import './DepartmentModal.scss';

interface SelectedDepartment {
  id: string;
  title: string;
}

interface DataSourceModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  getChildTreeSelectData: (data: any) => void;
  type: any;
  onConfirm?: (selectedIds: string[]) => void;
  initialSelected?: string[];
  initialSelectedData?: SelectedDepartment[];
}

const InputSearch = Input.Search;

const DepartmentModal: React.FC<DataSourceModalProps> = ({
  visible,
  onClose,
  title = '数据源',
  getChildTreeSelectData,
  type,
  onConfirm,
  initialSelected = [],
  initialSelectedData = []
}) => {
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const [selectedData, setSelectedData] = useState<SelectedDepartment[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedCurrent, setSelectedCurrent] = useState(1);
  const [selectedPageSize, setSelectedPageSize] = useState(10);
  const { treeData, setSearchValue, fetchTreeData } = useDepartmentTree(false);

  // 从树形数据中查找节点信息
  const findNodeInTree = (
    nodes: any[],
    targetId: string
  ): SelectedDepartment | null => {
    for (const node of nodes) {
      if (node.id === targetId) {
        return { id: node.id, title: node.title };
      }
      if (node.children) {
        const found = findNodeInTree(node.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  // 获取完整路径标题
  const getFullPathTitle = (
    nodes: any[],
    targetId: string,
    path: string[] = []
  ): string => {
    for (const node of nodes) {
      const currentPath = [...path, node.title];
      if (node.id === targetId) {
        return currentPath.join('-');
      }
      if (node.children) {
        const result = getFullPathTitle(node.children, targetId, currentPath);
        if (result) return result;
      }
    }
    return '';
  };

  // 处理初始选中的数据
  useEffect(() => {
    if (visible) {
      setCheckedKeys(initialSelected || []);
      setSelectedData(initialSelectedData || []);
      setActiveTab('all');
      setSelectedCurrent(1);
      fetchTreeData();
    }
  }, [visible, initialSelected]);

  // 当树数据加载完成后，更新已选数据的标题
  useEffect(() => {
    if (treeData.length > 0 && checkedKeys.length > 0) {
      const newSelectedData: SelectedDepartment[] = checkedKeys.map((id) => {
        const existing = selectedData.find((item) => item.id === id);
        if (existing?.title) return existing;
        const fullTitle = getFullPathTitle(treeData, id);
        return { id, title: fullTitle || id };
      });
      setSelectedData(newSelectedData);
    }
  }, [treeData]);

  // 已选部门的表格列定义
  const selectedColumns = [
    {
      title: '部门名称',
      dataIndex: 'title',
      ellipsis: true,
      render: (text: string) => (
        <Tooltip content={text}>
          <div
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {text}
          </div>
        </Tooltip>
      )
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width: 80,
      render: (_: any, record: SelectedDepartment) => (
        <Link onClick={() => handleRemoveSelected(record.id)}>移除</Link>
      )
    }
  ];

  // 移除已选部门
  const handleRemoveSelected = (id: string) => {
    const newCheckedKeys = checkedKeys.filter((key) => key !== id);
    const newSelectedData = selectedData.filter((item) => item.id !== id);
    setCheckedKeys(newCheckedKeys);
    setSelectedData(newSelectedData);
    getChildTreeSelectData(newCheckedKeys);
  };

  // 处理树节点勾选
  const handleTreeCheck = (keys: string[]) => {
    setCheckedKeys(keys);
    // 更新已选数据
    const newSelectedData: SelectedDepartment[] = keys.map((id) => {
      const existing = selectedData.find((item) => item.id === id);
      if (existing) return existing;
      const fullTitle = getFullPathTitle(treeData, id);
      return { id, title: fullTitle || id };
    });
    setSelectedData(newSelectedData);
    getChildTreeSelectData(keys);
  };
  return (
    <Modal
      title={title}
      visible={visible}
      onCancel={onClose}
      alignCenter={true}
      escToExit={false}
      maskClosable={false}
      className="fullscreen-modal"
      style={{ width: '800px', height: '800px', overflow: 'hidden' }}
      closeIcon={null}
      footer={
        <Button
          onClick={() => {
            if (onConfirm) {
              onConfirm(checkedKeys);
            }
            onClose();
          }}
          type="primary"
        >
          确定
        </Button>
      }
    >
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        type="line"
        style={{ marginTop: '-16px' }}
      >
        <Tabs.TabPane title="全部部门" key="all">
          <div className="department-modal-content">
            <div className="search-input">
              <InputSearch
                type="text"
                allowClear
                placeholder="请输入名称搜索"
                onClear={() => {
                  setSearchValue('');
                }}
                onChange={(value) => {
                  setSearchValue(value);
                }}
              />
            </div>
            {treeData && treeData?.length > 0 ? (
              <Tree
                actionOnClick="check"
                checkable
                checkedStrategy="child"
                autoExpandParent={false}
                checkedKeys={checkedKeys}
                renderTitle={({ title }: any) => {
                  return (
                    <Tooltip content={title}>
                      <div
                        style={{
                          width: '700px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {title}
                      </div>
                    </Tooltip>
                  );
                }}
                treeData={treeData}
                onCheck={handleTreeCheck}
              />
            ) : (
              <Empty description="暂无数据" />
            )}
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane
          title={`已选部门 (${selectedData.length})`}
          key="selected"
        >
          <div className="department-modal-content" style={{ border: 'none' }}>
            <div
              className="department-selected-content"
              style={{ width: '100%', paddingLeft: '12px' }}
            >
              <Table
                rowKey="id"
                columns={selectedColumns}
                data={selectedData.slice(
                  (selectedCurrent - 1) * selectedPageSize,
                  selectedCurrent * selectedPageSize
                )}
                pagination={false}
                border={false}
                scroll={{ y: false }}
                noDataElement={noDataElement({
                  description: '暂无已选部门'
                })}
              />
              {selectedData.length > 0 && (
                <Pagination
                  current={selectedCurrent}
                  pageSize={selectedPageSize}
                  onPageSizeChange={(size) => {
                    setSelectedPageSize(size);
                    setSelectedCurrent(1);
                  }}
                  onChange={(page) => {
                    setSelectedCurrent(page);
                  }}
                  selectProps={{
                    getPopupContainer: () => document.body
                  }}
                  sizeOptions={[10, 20, 50, 100]}
                  showTotal
                  total={selectedData.length}
                  showJumper
                  sizeCanChange
                  style={{
                    justifyContent: 'flex-end',
                    marginTop: '10px',
                    marginRight: '12px'
                  }}
                />
              )}
            </div>
          </div>
        </Tabs.TabPane>
      </Tabs>
    </Modal>
  );
};

export { DepartmentModal };
