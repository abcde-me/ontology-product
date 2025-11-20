import React, { useState, useEffect } from 'react';
import {
  Modal,
  Table,
  Checkbox,
  Button,
  Spin,
  Message,
  Input,
  Tooltip
} from '@arco-design/web-react';
import { IconDelete, IconClose, IconSearch } from '@arco-design/web-react/icon';
import './index.module.scss'; // 确保引入样式文件
// @ts-ignore
import { ReactSortable } from 'react-sortablejs';
import DragIcon from '../../assets/drag-icon.svg';
import styles from './index.module.scss';
import { isTagsField, RESERVED_FIELD_ENS } from '../../utils/const';
import { getDataAssetTableDistinctFieldCount } from '@/api/dataAsset';
import { BaseTag } from '@/types/dataAssetApi';
// const SortableAny = ReactSortable as any;

export interface ColumnField {
  id: string; // 唯一标识
  nameEn: string; // 唯一标识
  nameZh: string;
  type: string;
  isEnumAble: boolean; // 是否勾选枚举
  isEnumAbleForColumn: boolean; // 列设置弹窗中是否可勾选为枚举类型
  enumLoading: boolean;
  distinctCount: number; // 枚举数
  displaySort: number;
  values: Array<string | number | BaseTag>;
}

export interface ColumnSettingModalProps {
  visible: boolean;
  fields?: ColumnField[]; // 外部传入的字段列表
  onOk: (selectedIds: string[], displayFields: ColumnField[]) => void;
  onCancel: () => void;
  onChange: (list: ColumnField[]) => void;
}

const defaultSelected = ['1', '2', '3', '4'];
const MAX_ENUM_COUNT = 1000;

const ColumnSettingModal: React.FC<ColumnSettingModalProps> = ({
  visible,
  fields: externalFields,
  onOk,
  onCancel,
  onChange = () => {}
}) => {
  // 使用外部传入的 fields 或默认的 mockFields
  const initialFields = externalFields ?? [];
  const [fields, setFields] = useState<ColumnField[]>(initialFields);
  // 初始化选中的字段（外部传入时选择所有字段，否则使用默认）
  const initialSelectedIds = externalFields
    ? externalFields.map((f) => f.nameEn).filter(Boolean)
    : defaultSelected;
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [searchKeyword, setSearchKeyword] = useState('');

  // 当外部 fields 变化时更新内部状态
  useEffect(() => {
    if (externalFields) {
      setFields(externalFields);
      // 更新选中的字段ID列表
      const allIds = externalFields
        .filter((f) => f.displaySort > 0)
        .sort((a, b) => Number(a?.displaySort) - Number(b?.displaySort))
        .map((f) => f.nameEn);
      if (allIds.length > 0) {
        setSelectedIds(allIds);
      }
    }
  }, [externalFields]);

  const displayFields = searchKeyword
    ? fields.filter(
        (f) =>
          f.nameZh.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          f.type.toLowerCase().includes(searchKeyword.toLowerCase())
      )
    : fields;
  // 已选的field数据，按照selectedIds的顺序
  const selectedFields = selectedIds
    .map((nameEn) => fields.find((f) => f.nameEn === nameEn))
    .filter(Boolean) as ColumnField[];
  // 枚举复选框 mock
  const handleEnumCheck = async (nameEn: string, checked: boolean) => {
    if (!checked) {
      setFields((fields) =>
        fields.map((f) =>
          f.nameEn === nameEn
            ? { ...f, distinctCount: 0, isEnumAble: checked }
            : f
        )
      );
      return;
    }

    try {
      setFields((fields) =>
        fields.map((f) =>
          f.nameEn === nameEn ? { ...f, enumLoading: true } : f
        )
      );

      const res = await getDataAssetTableDistinctFieldCount({
        fieldEnName: nameEn
      });

      if (
        res?.code !== '' ||
        res?.status !== 200 ||
        res?.data > MAX_ENUM_COUNT
      ) {
        if (res?.data > MAX_ENUM_COUNT) {
          Message.error('枚举量过大，不可设为枚举类型');
          // 保存枚举量信息，用于禁用复选框
          setFields((fields) =>
            fields.map((f) =>
              f.nameEn === nameEn
                ? { ...f, distinctCount: res.data, enumLoading: false }
                : f
            )
          );
        } else {
          Message.error(res?.message ?? '该字段不可勾选为枚举类型');
          setFields((fields) =>
            fields.map((f) =>
              f.nameEn === nameEn ? { ...f, enumLoading: false } : f
            )
          );
        }
        return;
      }

      setFields((fields) =>
        fields.map((f) =>
          f.nameEn === nameEn
            ? {
                ...f,
                distinctCount: res.data,
                isEnumAble: checked,
                enumLoading: false
              }
            : f
        )
      );
    } catch {
      setFields((fields) =>
        fields.map((f) =>
          f.nameEn === nameEn ? { ...f, enumLoading: false } : f
        )
      );
    }
  };
  // 右侧删除按钮
  const handleRemove = (nameEn: string) =>
    setSelectedIds((ids) => ids.filter((_id) => _id !== nameEn));

  return (
    <Modal
      title="列设置"
      visible={visible}
      onOk={() => onOk(selectedIds, fields)}
      onCancel={onCancel}
      className={styles['column-setting-modal']}
      style={{ width: 900, height: 800 }}
    >
      <div className="flex h-full justify-between gap-[16px] rounded-[12px] border-[1px] border-[var(--color-border-2)] pl-[16px]">
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
            rowKey="nameEn"
            pagination={false}
            style={{ flex: 1 }}
            rowSelection={{
              type: 'checkbox',
              selectedRowKeys: selectedIds,
              onChange: (keys) => {
                // 过滤掉系统字段，保留当前已选中的系统字段
                const filteredKeys = (keys as string[]).filter(
                  (key) => !RESERVED_FIELD_ENS.has(key)
                );
                const systemFields = selectedIds.filter((key) =>
                  RESERVED_FIELD_ENS.has(key)
                );
                setSelectedIds([...systemFields, ...filteredKeys]);
              },
              checkboxProps: (record: ColumnField) => ({
                disabled: RESERVED_FIELD_ENS.has(record.nameEn)
              })
            }}
            rowClassName={(_, idx) =>
              idx === displayFields.length - 1
                ? 'column-setting-modal-table no-border-bottom'
                : ''
            }
            columns={[
              { title: '字段名称', dataIndex: 'nameZh', width: 310 },
              { title: '类型', dataIndex: 'type', width: 100 },
              {
                title: '设为枚举类型',
                dataIndex: 'isEnumAble',
                width: 126,
                render: (_: any, record: ColumnField) => {
                  const isEnumCountTooLarge =
                    record.distinctCount != null &&
                    record.distinctCount > MAX_ENUM_COUNT;
                  const isDisabled =
                    !record.isEnumAbleForColumn || isEnumCountTooLarge;

                  return (
                    <span className="flex flex-col items-center">
                      {record.enumLoading ? (
                        <Spin size={14} />
                      ) : (
                        <Tooltip
                          content={
                            isEnumCountTooLarge
                              ? '枚举量过大，不可设为枚举类型'
                              : ''
                          }
                          disabled={!isEnumCountTooLarge}
                        >
                          <Checkbox
                            checked={
                              record.isEnumAbleForColumn
                                ? record.isEnumAble
                                : false
                            }
                            disabled={isDisabled}
                            onChange={(val) =>
                              handleEnumCheck(record.nameEn, val)
                            }
                            style={{
                              cursor: isDisabled ? 'not-allowed' : 'pointer',
                              opacity: isDisabled ? 0.5 : 1
                            }}
                          />
                        </Tooltip>
                      )}
                      {record.isEnumAble &&
                        record.isEnumAbleForColumn &&
                        !record.enumLoading && (
                          <span className="text-[var(--color-text-4)]">
                            {record.distinctCount}枚举量
                          </span>
                        )}
                    </span>
                  );
                }
              }
            ]}
          />
        </div>
        {/* 右侧已选字段区+排序 */}
        <div className="border-l-[1px] border-[var(--color-border-2)] p-[16px]">
          <div className="mb-[16px] flex w-[208px] items-center justify-between text-[var(--color-text-1)]">
            <span className="font-weight-500">
              已选字段 {selectedIds.length}/{fields.length}
            </span>
            {/* <IconDelete
              className={`size-[16px] ${
                selectedIds.length === 0
                  ? 'pointer-events-none cursor-not-allowed text-[var(--color-text-4)]'
                  : 'cursor-pointer text-[var(--color-icon-1)]'
              }`}
              onClick={() => {
                if (selectedIds.length > 0) setSelectedIds([]);
              }}
            /> */}
          </div>
          <ReactSortable
            tag="div"
            animation={150}
            list={selectedFields}
            setList={(list) => {
              // 从新的列表顺序中提取id数组，更新selectedIds状态
              const newOrderIds = list.map((item) => item.nameEn);
              setSelectedIds(newOrderIds);
              // 通知父组件顺序变化
              onChange(list);
            }}
          >
            {selectedFields.map((field) => {
              const isReserved = RESERVED_FIELD_ENS.has(field.nameEn);
              return (
                <div
                  key={field.nameEn}
                  data-nameEn={field.nameEn}
                  className="m-t-[7px] flex h-[40px] items-center"
                >
                  <DragIcon className="mr-[8px] h-[14px] w-[14px]"></DragIcon>
                  {/* <div className='w-[14px] h-[14px] mr-[8px]'>
                    
                  </div> */}
                  <span className="line-height-[40px] flex-1">
                    {field.nameZh}
                  </span>
                  <IconClose
                    className={`size-[12px] ${
                      isReserved
                        ? 'cursor-not-allowed text-[var(--color-text-4)]'
                        : 'cursor-pointer'
                    }`}
                    onClick={() => {
                      if (isReserved) return;
                      handleRemove(field.nameEn);
                    }}
                  />
                </div>
              );
            })}
          </ReactSortable>
        </div>
      </div>
    </Modal>
  );
};

export default ColumnSettingModal;
