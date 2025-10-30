import React, { useState } from 'react';
import {
  Modal,
  Table,
  Checkbox,
  Button,
  Spin,
  Message,
  Input
} from '@arco-design/web-react';
import { IconDelete, IconClose, IconSearch } from '@arco-design/web-react/icon';
import './index.css'; // 确保引入样式文件
// @ts-ignore
import Sortable from 'react-sortablejs';
const SortableAny = Sortable as any;

export interface ColumnField {
  id: string; // 唯一key
  name: string;
  type: string;
  enumChecked: boolean; // 是否勾选枚举
  enumLoading: boolean;
  enumCount: number; // 枚举数
}

export interface ColumnSettingModalProps {
  visible: boolean;
  onOk: (selected: ColumnField[]) => void;
  onCancel: () => void;
}

const mockFields: ColumnField[] = [
  {
    id: '1',
    name: '数据资产名称',
    type: 'string',
    enumChecked: false,
    enumLoading: false,
    enumCount: 0
  },
  {
    id: '2',
    name: '资产标签',
    type: 'number',
    enumChecked: false,
    enumLoading: false,
    enumCount: 0
  },
  {
    id: '3',
    name: '资产来源',
    type: 'string',
    enumChecked: false,
    enumLoading: false,
    enumCount: 0
  },
  {
    id: '4',
    name: '更新时间',
    type: 'number',
    enumChecked: false,
    enumLoading: false,
    enumCount: 0
  },
  {
    id: '5',
    name: '数据血缘',
    type: 'string',
    enumChecked: false,
    enumLoading: false,
    enumCount: 0
  }
];

const defaultSelected = ['1', '2', '3', '4'];

const ColumnSettingModal: React.FC<ColumnSettingModalProps> = ({
  visible,
  onOk,
  onCancel
}) => {
  const [fields, setFields] = useState<ColumnField[]>(mockFields);
  const [selectedIds, setSelectedIds] = useState<string[]>(defaultSelected);
  const [searchKeyword, setSearchKeyword] = useState('');

  const displayFields = searchKeyword
    ? fields.filter(
        (f) =>
          f.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          f.type.toLowerCase().includes(searchKeyword.toLowerCase())
      )
    : fields;
  // 已选的field数据
  const selectedFields = fields.filter((f) => selectedIds.includes(f.id));
  // 拖拽排序
  const handleSort = (orderIds: string[]) => setSelectedIds(orderIds);
  // 枚举复选框 mock
  const handleEnumCheck = (id: string, checked: boolean) => {
    setFields((fields) =>
      fields.map((f) => (f.id === id ? { ...f, enumLoading: true } : f))
    );
    setTimeout(() => {
      if (id === '2' || id === '3') {
        setFields((fields) =>
          fields.map((f) =>
            f.id === id
              ? {
                  ...f,
                  enumChecked: checked,
                  enumCount: checked ? 10 : 0,
                  enumLoading: false
                }
              : f
          )
        );
      } else {
        setFields((fields) =>
          fields.map((f) => (f.id === id ? { ...f, enumLoading: false } : f))
        );
        Message.error('该字段不可勾选为枚举类型');
      }
    }, 1000);
  };
  // 右侧删除按钮
  const handleRemove = (id: string) =>
    setSelectedIds((ids) => ids.filter((_id) => _id !== id));

  return (
    <Modal
      title="列设置"
      visible={visible}
      onOk={() => onOk(selectedFields)}
      onCancel={onCancel}
      className="column-setting-modal"
      style={{ width: 900 }}
    >
      <div className="flex justify-between gap-[16px] rounded-[12px] border-[1px] border-[var(--color-border-2)] pl-[16px]">
        {/* 左侧表格区（带搜索） */}
        <div>
          <div className="mb-[16px] mt-[16px] flex items-center justify-between">
            <span className="font-weight-600 font-size-[14px] text-[var(--color-text-1)]">
              字段列表
            </span>
            <Input.Search
              className="w-[240px]"
              placeholder="输入关键词搜索"
              suffix={<IconSearch />}
              value={searchKeyword}
              onChange={setSearchKeyword}
              allowClear
            />
          </div>
          <Table
            data={displayFields}
            border={false}
            rowKey="id"
            pagination={false}
            style={{ flex: 1 }}
            rowSelection={{
              type: 'checkbox',
              selectedRowKeys: selectedIds,
              onChange: (keys) => setSelectedIds(keys as string[])
            }}
            rowClassName={(_, idx) =>
              idx === displayFields.length - 1 ? 'no-border-bottom' : ''
            }
            columns={[
              { title: '字段名称', dataIndex: 'name', width: 310 },
              { title: '类型', dataIndex: 'type', width: 100 },
              {
                title: '设为枚举类型',
                dataIndex: 'enumChecked',
                width: 126,
                render: (_: any, record: ColumnField) => (
                  <span className="flex flex-col items-center">
                    {record.enumLoading ? (
                      <Spin size={14} />
                    ) : (
                      <Checkbox
                        checked={record.enumChecked}
                        onChange={(val) => handleEnumCheck(record.id, val)}
                      />
                    )}
                    {record.enumChecked && !record.enumLoading && (
                      <span className="text-[var(--color-text-4)]">
                        {record.enumCount}枚举量
                      </span>
                    )}
                  </span>
                )
              }
            ]}
          />
        </div>
        {/* 右侧已选字段区+排序 */}
        <div className="border-l-[1px] border-[var(--color-border-2)] p-[16px]">
          <div className="mb-[16px] flex w-[208px] items-center justify-between text-[var(--color-text-1)]">
            <span className="font-weight-500">
              已选字段 {selectedIds.length}/40
            </span>
            <IconDelete
              className={`size-[16px] ${
                selectedIds.length === 0
                  ? 'pointer-events-none cursor-not-allowed text-[var(--color-text-4)]'
                  : 'cursor-pointer text-[var(--color-icon-1)]'
              }`}
              onClick={() => {
                if (selectedIds.length > 0) setSelectedIds([]);
              }}
            />
          </div>
          {/* <SortableAny
                        tag="div"
                        options={{ animation: 200 }}
                        onChange={order => handleSort(order as string[])}
                        value={selectedIds}
                    > */}
          {selectedFields.map((field) => (
            <div
              key={field.id}
              data-id={field.id}
              className="m-t-[7px] flex h-[22px] items-center"
            >
              <span style={{ flex: 1 }}>{field.name}</span>
              <IconClose
                className="size-[12px] cursor-pointer"
                onClick={() => handleRemove(field.id)}
              />
            </div>
          ))}
          {/* </SortableAny> */}
        </div>
      </div>
    </Modal>
  );
};

export default ColumnSettingModal;
