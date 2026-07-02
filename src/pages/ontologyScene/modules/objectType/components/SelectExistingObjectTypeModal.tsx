import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Message,
  Modal,
  Pagination,
  Select,
  Table
} from '@arco-design/web-react';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import { GlobalTooltip } from '@ceai-front/arco-material';
import {
  INSTANCE_SYNC_CONFIG_OPTIONS,
  SCENE_QUERY_ALL_VALUE
} from '@/pages/exploreAnalysis/ontologyQuery/constants';
import { SceneQuerySelect } from '@/pages/exploreAnalysis/ontologyQuery/components/SceneQuerySelect';
import {
  loadObjectTypeQueryCache,
  queryObjectTypes
} from '@/pages/exploreAnalysis/ontologyQuery/services/objectTypeQuery';
import type {
  ObjectTypeQueryFormValues,
  ObjectTypeQueryRow
} from '@/pages/exploreAnalysis/ontologyQuery/types';
import styles from './SelectExistingObjectTypeModal.module.scss';

const Option = Select.Option;

const defaultFormValues: ObjectTypeQueryFormValues = {
  objectTypeId: '',
  objectTypeName: '',
  sceneName: SCENE_QUERY_ALL_VALUE,
  description: '',
  instanceSyncConfig: 'all'
};

export interface SelectExistingObjectTypeModalProps {
  visible: boolean;
  currentSceneId: number;
  excludedCodes?: Set<string>;
  confirmLoading?: boolean;
  onCancel: () => void;
  onConfirm: (record: ObjectTypeQueryRow) => void;
}

export const SelectExistingObjectTypeModal: React.FC<
  SelectExistingObjectTypeModalProps
> = ({
  visible,
  currentSceneId,
  excludedCodes,
  confirmLoading = false,
  onCancel,
  onConfirm
}) => {
  const filterSelectableRows = useCallback(
    (rows: ObjectTypeQueryRow[]) =>
      rows.filter((row) => {
        if (row.sceneId === currentSceneId) {
          return false;
        }

        const code = row.code?.trim();
        if (code && excludedCodes?.has(code)) {
          return false;
        }

        return true;
      }),
    [currentSceneId, excludedCodes]
  );
  const [form] = Form.useForm<ObjectTypeQueryFormValues>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ObjectTypeQueryRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRow, setSelectedRow] = useState<ObjectTypeQueryRow | null>(
    null
  );

  const fetchList = useCallback(
    async (page = pageNo, size = pageSize) => {
      setLoading(true);
      try {
        const values = form.getFieldsValue();
        const result = await queryObjectTypes({
          ...values,
          pageNo: 1,
          pageSize: -1
        });
        const filtered = filterSelectableRows(result.items);
        const totalCount = filtered.length;
        const start = (page - 1) * size;
        setData(filtered.slice(start, start + size));
        setTotal(totalCount);
        setPageNo(page);
        setPageSize(size);
      } catch (error) {
        console.error('查询对象类型失败:', error);
        Message.error('查询对象类型失败');
        setData([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [filterSelectableRows, form, pageNo, pageSize]
  );

  useEffect(() => {
    if (!visible) {
      return;
    }

    const init = async () => {
      setLoading(true);
      setSelectedRow(null);
      try {
        await loadObjectTypeQueryCache(true);
        form.setFieldsValue(defaultFormValues);
        await fetchList(1, 10);
      } catch (error) {
        console.error('加载对象类型数据失败:', error);
        Message.error('加载对象类型数据失败');
      } finally {
        setLoading(false);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, currentSceneId]);

  const handleSearch = () => {
    setPageNo(1);
    setSelectedRow(null);
    fetchList(1, pageSize);
  };

  const handleReset = () => {
    form.setFieldsValue(defaultFormValues);
    setPageNo(1);
    setSelectedRow(null);
    fetchList(1, pageSize);
  };

  const handleOk = () => {
    if (!selectedRow?.id) {
      Message.warning('请选择对象类型');
      return;
    }
    onConfirm(selectedRow);
  };

  const columns: ColumnProps<ObjectTypeQueryRow>[] = useMemo(
    () => [
      {
        title: '对象类型id',
        dataIndex: 'code',
        width: 160,
        ellipsis: true,
        render: (value) => <GlobalTooltip.Ellipsis text={value || '-'} />
      },
      {
        title: '对象类型名称',
        dataIndex: 'name',
        width: 200,
        ellipsis: true,
        render: (value) => <GlobalTooltip.Ellipsis text={value || '-'} />
      },
      {
        title: '本体场景库',
        dataIndex: 'sceneName',
        width: 200,
        ellipsis: true,
        render: (value) => <GlobalTooltip.Ellipsis text={value || '-'} />
      },
      {
        title: '描述说明',
        dataIndex: 'description',
        width: 160,
        ellipsis: true,
        render: (value) => <GlobalTooltip.Ellipsis text={value || '-'} />
      },
      {
        title: '实例同步配置',
        dataIndex: 'enableSyncSourceData',
        width: 120,
        render: (value: boolean | undefined) => (
          <GlobalTooltip.Ellipsis text={value ? '是' : '否'} />
        )
      }
    ],
    []
  );

  return (
    <Modal
      title="选择已有对象类型"
      okText="绑定"
      visible={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      cancelText="取消"
      style={{ width: 960 }}
      unmountOnExit
      maskClosable={false}
    >
      <div className={styles.toolbar}>
        <Form
          form={form}
          layout="inline"
          className={styles.form}
          initialValues={defaultFormValues}
        >
          <Form.Item
            field="objectTypeId"
            className={`${styles.field} ${styles.fieldId}`}
          >
            <Input allowClear placeholder="对象类型 ID" size="small" />
          </Form.Item>
          <Form.Item
            field="objectTypeName"
            className={`${styles.field} ${styles.fieldName}`}
          >
            <Input allowClear placeholder="对象类型名称" size="small" />
          </Form.Item>
          <Form.Item
            field="sceneName"
            className={`${styles.field} ${styles.fieldScene}`}
          >
            <SceneQuerySelect loading={loading} size="small" />
          </Form.Item>
          <Form.Item
            field="description"
            className={`${styles.field} ${styles.fieldDesc}`}
          >
            <Input allowClear placeholder="描述说明" size="small" />
          </Form.Item>
          <Form.Item
            field="instanceSyncConfig"
            className={`${styles.field} ${styles.fieldSync}`}
          >
            <Select placeholder="实例同步" size="small">
              {INSTANCE_SYNC_CONFIG_OPTIONS.map((item) => (
                <Option key={item.value} value={item.value}>
                  {item.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <div className={styles.actions}>
            <Button type="primary" size="small" onClick={handleSearch}>
              查询
            </Button>
            <Button type="secondary" size="small" onClick={handleReset}>
              重置
            </Button>
          </div>
        </Form>
      </div>

      <Table
        columns={columns}
        data={data}
        loading={loading}
        rowKey={(record) => `${record.sceneId}-${record.id}`}
        border={false}
        pagination={false}
        scroll={{ x: 840, y: 360 }}
        rowSelection={{
          type: 'radio',
          selectedRowKeys: selectedRow
            ? [`${selectedRow.sceneId}-${selectedRow.id}`]
            : [],
          onChange: (_, selectedRows) => {
            setSelectedRow(selectedRows[0] || null);
          }
        }}
        onRow={(record) => ({
          onClick: () => setSelectedRow(record)
        })}
      />

      {total > 0 && (
        <div className={styles.pagination}>
          <Pagination
            current={pageNo}
            pageSize={pageSize}
            total={total}
            showTotal
            showJumper
            sizeCanChange
            onChange={(page, size) => {
              setPageNo(page);
              setPageSize(size);
              setSelectedRow(null);
              fetchList(page, size);
            }}
          />
        </div>
      )}
    </Modal>
  );
};
