import React, { useEffect, useState } from 'react';
import {
  Modal,
  Button,
  Tree,
  Input,
  Empty,
  Tooltip
} from '@arco-design/web-react';
import { useDepartmentTree } from '../../hooks/useDepartmentTree';
import './DepartmentModal.scss';

interface DataSourceModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  getChildTreeSelectData: (data: any) => void;
  type: any;
  onConfirm?: (selectedIds: string[]) => void; // 新增：确认回调
  initialSelected?: string[]; // 新增：初始选中的部门ID列表
}
const InputSearch = Input.Search;
const DepartmentModal: React.FC<DataSourceModalProps> = ({
  visible,
  onClose,
  title = '数据源',
  getChildTreeSelectData,
  type,
  onConfirm,
  initialSelected = []
}) => {
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const { treeData, setSearchValue, fetchTreeData } = useDepartmentTree(false);

  // 处理初始选中的数据 - 当弹窗打开或初始选中数据变化时同步
  useEffect(() => {
    if (visible) {
      setCheckedKeys(initialSelected || []);
      fetchTreeData();
    }
  }, [visible, initialSelected]);
  return (
    <Modal
      title={title}
      visible={visible}
      onCancel={onClose}
      alignCenter={true}
      escToExit={false}
      maskClosable={false}
      className="dataSource-modal"
      style={{ width: '800px', height: '800px' }}
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
      <div className="department-modal-content">
        <div className="department-modal-search">
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
            // selectable={false}
            actionOnClick="check"
            checkable
            checkedStrategy="child"
            autoExpandParent={false}
            checkedKeys={checkedKeys}
            style={{
              width: '300px',
              height: '592px',
              overflowY: 'auto',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            renderTitle={({ title }: any) => {
              return (
                <span>
                  <span style={{ width: '300px', whiteSpace: 'nowrap' }}>
                    <Tooltip content={title}>{title}</Tooltip>
                  </span>
                </span>
              );
            }}
            treeData={treeData}
            onCheck={(key) => {
              setCheckedKeys(key);
              getChildTreeSelectData(key);
            }}
          />
        ) : (
          <Empty description="暂无数据" />
        )}
      </div>
    </Modal>
  );
};

export { DepartmentModal };
