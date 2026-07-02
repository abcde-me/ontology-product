import React, { useCallback, useMemo } from 'react';
import {
  Alert,
  Button,
  Form,
  Input,
  Radio,
  Select,
  Switch,
  Table,
  TableColumnProps,
  Tooltip
} from '@arco-design/web-react';
import { IconRobot } from '@arco-design/web-react/icon';
import {
  INSTANCE_SYNC_SOURCE_UNCONFIGURED_MESSAGE,
  VECTOR_FIELD_SUFFIX
} from '../../ObjectTypeFormUtils/attributeFields';
import {
  InstanceSyncMappingField,
  SourceTableField
} from '../../ObjectTypeFormUtils/types';

const FormItem = Form.Item;

const groupDividerHeaderCell = {
  className: 'arco-table-th sync-map-sub-col-head sync-map-col-head--divider'
};
const groupDividerBodyCell = { className: 'sync-map-col-body--divider' };

const EllipsisText = ({ value }: { value?: string | number | null }) => (
  <span className="sync-map-cell-text">{value ?? '-'}</span>
);

interface InstanceSyncMappingTableProps {
  form: any;
  mappingFields: InstanceSyncMappingField[];
  setMappingFields: React.Dispatch<
    React.SetStateAction<InstanceSyncMappingField[]>
  >;
  sourceFields: SourceTableField[];
  sourceConfigured: boolean;
  loading: boolean;
  onSmartMatch?: () => void;
  smartMatchLoading?: boolean;
  smartMatchTooltip?: string;
  styles: Record<string, string>;
  readOnly?: boolean;
}

export default function InstanceSyncMappingTable({
  form,
  mappingFields,
  setMappingFields,
  sourceFields,
  sourceConfigured,
  loading,
  onSmartMatch,
  smartMatchLoading = false,
  smartMatchTooltip = '根据表字段与属性id，字段注释与属性名称的语义进行匹配',
  styles,
  readOnly = false
}: InstanceSyncMappingTableProps) {
  const syncFields = (nextFields: InstanceSyncMappingField[]) => {
    setMappingFields(nextFields);
    form.setFieldValue('syncMappingFields', nextFields);
  };

  const handleFieldChange = (
    index: number,
    updates: Partial<InstanceSyncMappingField>
  ) => {
    const nextFields = mappingFields.map((field, currentIndex) =>
      currentIndex === index ? { ...field, ...updates } : field
    );
    syncFields(nextFields);
  };

  const handleVectorizationChange = useCallback(
    (index: number, enabled: boolean) => {
      setMappingFields((prev) => {
        const nextFields = prev.map((field, i) => {
          if (i !== index) return field;
          if (!enabled) {
            return { ...field, isVector: 0 };
          }
          const commentBase = field.propertyComment ?? '';
          const defaultVecComment = `${commentBase}${VECTOR_FIELD_SUFFIX}`;
          const preserved =
            field._vectorComment != null && field._vectorComment !== ''
              ? field._vectorComment
              : defaultVecComment;
          return {
            ...field,
            isVector: 1,
            _vectorComment: preserved
          };
        });
        form.setFieldValue('syncMappingFields', nextFields);
        return nextFields;
      });
    },
    [form, setMappingFields]
  );

  const handleVectorCommentChange = useCallback(
    (index: number, val: string) => {
      setMappingFields((prev) => {
        const next = prev.map((f, i) =>
          i === index ? { ...f, _vectorComment: val } : f
        );
        form.setFieldValue('syncMappingFields', next);
        return next;
      });
    },
    [form, setMappingFields]
  );

  const sourceFieldOptions = useMemo(
    () =>
      sourceConfigured
        ? sourceFields.map((field) => ({
            label: field.fieldComment
              ? `${field.fieldId} (${field.fieldComment})`
              : field.fieldId,
            value: field.fieldId
          }))
        : [],
    [sourceConfigured, sourceFields]
  );

  const columns = useMemo<TableColumnProps<InstanceSyncMappingField>[]>(
    () => [
      {
        title: '数据源表字段映射',
        onHeaderCell: () => ({
          className: 'sync-map-group-head sync-map-group-head--source'
        }),
        children: [
          {
            title: '表字段',
            dataIndex: 'sourceColumnName',
            width: 240,
            render: (value, _record, index) => (
              <Select
                showSearch
                allowCreate
                value={value}
                placeholder="选择或输入表字段名"
                options={sourceFieldOptions}
                filterOption={(inputValue, option) =>
                  String(option.props?.value ?? '')
                    .toLowerCase()
                    .includes(
                      String(inputValue ?? '')
                        .trim()
                        .toLowerCase()
                    ) ||
                  String(option.props?.children ?? '')
                    .toLowerCase()
                    .includes(
                      String(inputValue ?? '')
                        .trim()
                        .toLowerCase()
                    )
                }
                onChange={(next) => {
                  if (readOnly) return;
                  if (next === undefined || next === null || next === '') {
                    handleFieldChange(index, {
                      sourceColumnName: undefined,
                      sourceCoumnOriginName: undefined,
                      sourceColumnComment: undefined,
                      sourceColumnType: undefined
                    });
                    return;
                  }
                  const str = String(next);
                  const sourceField = sourceFields.find(
                    (field) => field.fieldId === str
                  );
                  if (sourceField) {
                    handleFieldChange(index, {
                      sourceColumnName: str,
                      sourceCoumnOriginName: sourceField.fieldId,
                      sourceColumnComment: sourceField.fieldComment,
                      sourceColumnType: sourceField.fieldType
                    });
                  } else {
                    handleFieldChange(index, { sourceColumnName: str });
                  }
                }}
                allowClear
                disabled={readOnly || !sourceConfigured}
              />
            )
          },
          {
            title: '字段注释',
            dataIndex: 'sourceColumnComment',
            width: 160,
            render: (value) => <EllipsisText value={value} />
          },
          {
            title: '字段类型',
            dataIndex: 'sourceColumnType',
            width: 120,
            render: (value) => <EllipsisText value={value} />
          }
        ]
      },
      {
        title: '对象属性',
        onHeaderCell: () => ({
          className: 'sync-map-group-head sync-map-group-head--attribute'
        }),
        children: [
          {
            title: '属性id',
            dataIndex: 'propertyID',
            width: 160,
            onHeaderCell: () => groupDividerHeaderCell,
            onCell: () => groupDividerBodyCell,
            render: (value) => <EllipsisText value={value} />
          },
          {
            title: '属性名称',
            dataIndex: 'propertyComment',
            width: 180,
            render: (value) => <EllipsisText value={value} />
          },
          {
            title: '属性类型',
            dataIndex: 'propertyType',
            width: 120,
            render: (value) => <EllipsisText value={value} />
          },
          {
            title: '主键',
            dataIndex: 'isPrimary',
            width: 72,
            render: (_, record) => (
              <Radio checked={record.isPrimary === 1} disabled />
            )
          }
        ]
      },
      {
        title: '向量化配置',
        onHeaderCell: () => ({
          className: 'sync-map-group-head sync-map-group-head--vector'
        }),
        children: [
          {
            title: '向量化',
            dataIndex: 'isVector',
            width: 88,
            onHeaderCell: () => groupDividerHeaderCell,
            onCell: () => groupDividerBodyCell,
            render: (_, record, index) => (
              <Switch
                size="small"
                checked={record.isVector === 1}
                disabled={readOnly}
                onChange={(checked) =>
                  handleVectorizationChange(index, Boolean(checked))
                }
              />
            )
          },
          {
            title: '向量属性id',
            dataIndex: 'vectorPropertyID',
            width: 160,
            render: (_, record) =>
              record.isVector === 1 && record.propertyID ? (
                <EllipsisText
                  value={`${record.propertyID}${VECTOR_FIELD_SUFFIX}`}
                />
              ) : (
                '-'
              )
          },
          {
            title: '向量属性名称',
            dataIndex: '_vectorComment',
            width: 180,
            render: (_, record, index) =>
              record.isVector === 1 ? (
                <Input
                  value={record._vectorComment ?? ''}
                  placeholder={
                    record.propertyID ? '请输入向量属性名称' : '请先填写属性id'
                  }
                  disabled={readOnly}
                  onChange={(val) => handleVectorCommentChange(index, val)}
                />
              ) : (
                '-'
              )
          },
          {
            title: '向量属性类型',
            dataIndex: 'vectorPropertyType',
            width: 120,
            render: (_, record) =>
              record.isVector === 1 ? <EllipsisText value="vector" /> : '-'
          }
        ]
      }
    ],
    [
      sourceConfigured,
      sourceFieldOptions,
      sourceFields,
      readOnly,
      handleVectorizationChange,
      handleVectorCommentChange
    ]
  );

  const objectTypeName = Form.useWatch('name', form);

  return (
    <div className={styles['modeling-section']}>
      <div className={styles['modeling-section-header']}>
        <span className={styles['modeling-section-title']}>
          实例同步映射
          <span className={styles['modeling-section-title-meta']}>
            （对象类型名称：
            {String(objectTypeName ?? '').trim() || '—'}）
          </span>
        </span>
        {onSmartMatch ? (
          <Tooltip content={smartMatchTooltip}>
            <Button
              type="outline"
              size="small"
              icon={<IconRobot />}
              loading={smartMatchLoading}
              disabled={!sourceConfigured || readOnly}
              onClick={onSmartMatch}
            >
              智能匹配
            </Button>
          </Tooltip>
        ) : null}
      </div>
      <div className={styles['attribute-fields-form-item']}>
        {!sourceConfigured ? (
          <Alert
            type="warning"
            content={INSTANCE_SYNC_SOURCE_UNCONFIGURED_MESSAGE}
            style={{ marginBottom: 12 }}
          />
        ) : null}
        <FormItem
          field="syncMappingFields"
          noStyle
          rules={[
            {
              required: true,
              validator: (_value, callback) => {
                if (!sourceConfigured) {
                  callback(INSTANCE_SYNC_SOURCE_UNCONFIGURED_MESSAGE);
                  return;
                }
                const hasMappedField = mappingFields.some(
                  (field) => field.sourceColumnName
                );
                const primaryMapped = mappingFields.some(
                  (field) => field.isPrimary === 1 && field.sourceColumnName
                );
                if (!hasMappedField) {
                  callback('实例同步映射至少需要一个有效映射');
                  return;
                }
                if (!primaryMapped) {
                  callback('对象类型主键需要映射到源表字段');
                  return;
                }
                callback();
              }
            }
          ]}
        >
          <div className={styles['attribute-table-wrap']}>
            <Table
              className={`${styles['attribute-mapping-table']} ${styles['instance-sync-mapping-table']}`}
              loading={loading}
              tableLayoutFixed
              scroll={{ x: 1600 }}
              columns={columns}
              data={mappingFields}
              rowKey={(record) => record.key || record.propertyID}
              border={{ wrapper: true, cell: true }}
              pagination={false}
            />
          </div>
        </FormItem>
      </div>
    </div>
  );
}
