import React, { useEffect, useMemo, useState } from 'react';
import {
  Cascader,
  Form,
  Input,
  Message,
  Radio,
  Select
} from '@arco-design/web-react';
import {
  listOntologyConnectors,
  listSqlConnectorDBAndTables
} from '@/api/ontologySceneLibrary/objectType';
import { SqlConnectorDatabaseItem, SqlConnectorItem } from '@/types/objectType';
import { SqlSourceDataInfo } from '../../ObjectTypeFormUtils/types';

const FormItem = Form.Item;
const { TextArea } = Input;

interface CascaderOption {
  label: string;
  value: string;
  children?: Array<{ label: string; value: string; isLeaf?: boolean }>;
  isLeaf?: boolean;
}

interface SqlSourceSelectorProps {
  form: any;
  value: SqlSourceDataInfo;
  onChange: (value: SqlSourceDataInfo) => void;
  onTableSelected?: (
    value: Required<
      Pick<SqlSourceDataInfo, 'connectorId' | 'databaseName' | 'tableName'>
    >
  ) => void;
  fieldPrefix: string;
  styles: Record<string, string>;
}

function isSuccessResponse(response: any): boolean {
  return (
    response &&
    (response.status === 200 || response.stat === 0 || response.status === 0) &&
    (response.code === '' || response.code === undefined || response.code === 0)
  );
}

function filterCascaderOption(
  input: string,
  option: { label?: unknown; value?: unknown }
) {
  const q = String(input ?? '')
    .trim()
    .toLowerCase();
  if (!q) return true;
  return [option.label, option.value]
    .filter((item) => item != null)
    .some((item) => String(item).toLowerCase().includes(q));
}

export default function SqlSourceSelector({
  form,
  value,
  onChange,
  onTableSelected,
  fieldPrefix,
  styles
}: SqlSourceSelectorProps) {
  const [connectors, setConnectors] = useState<SqlConnectorItem[]>([]);
  const [connectorsLoading, setConnectorsLoading] = useState(false);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [databases, setDatabases] = useState<SqlConnectorDatabaseItem[]>([]);

  useEffect(() => {
    const loadConnectors = async () => {
      setConnectorsLoading(true);
      try {
        const response = await listOntologyConnectors({
          page: '1',
          page_size: '1000',
          type: 'sql',
          subtype: ['mysql', 'dameng', 'postgresql'],
          status: ['succeed'],
          sort: 'desc',
          sort_by: 'create_time'
        });
        if (isSuccessResponse(response)) {
          setConnectors(response.data || []);
        } else {
          Message.error(response.message || '加载连接器列表失败');
        }
      } catch (error) {
        console.error('加载连接器列表失败:', error);
        Message.error('加载连接器列表失败');
      } finally {
        setConnectorsLoading(false);
      }
    };

    loadConnectors();
  }, []);

  useEffect(() => {
    if (!value.connectorId) {
      setDatabases([]);
      return;
    }

    const loadDatabases = async () => {
      setTablesLoading(true);
      try {
        const response = await listSqlConnectorDBAndTables({
          id: value.connectorId!
        });
        if (isSuccessResponse(response)) {
          setDatabases(response.data || []);
        } else {
          Message.error(response.message || '加载数据库表失败');
        }
      } catch (error) {
        console.error('加载数据库表失败:', error);
        Message.error('加载数据库表失败');
      } finally {
        setTablesLoading(false);
      }
    };

    loadDatabases();
  }, [value.connectorId]);

  const tableOptions = useMemo<CascaderOption[]>(
    () =>
      databases.map((database) => ({
        label: database.database_name,
        value: database.database_name,
        isLeaf: false,
        children: (database.tables || []).map((table) => ({
          label: table.name,
          value: table.name,
          isLeaf: true
        }))
      })),
    [databases]
  );

  const cascaderValue =
    value.databaseName && value.tableName
      ? [value.databaseName, value.tableName]
      : undefined;

  const handleConnectorChange = (connectorId?: number | string) => {
    const normalizedConnectorId =
      connectorId === undefined || connectorId === null
        ? undefined
        : Number(connectorId);
    const connector = connectors.find(
      (item) => Number(item.id) === normalizedConnectorId
    );
    const nextValue: SqlSourceDataInfo = {
      ...value,
      connectorId: normalizedConnectorId,
      connectorName: connector?.name,
      connectorSubtype: connector?.subtype,
      databaseName: undefined,
      tableName: undefined
    };
    onChange(nextValue);
    form.setFieldsValue({
      [`${fieldPrefix}Connector`]: normalizedConnectorId,
      [`${fieldPrefix}DatabaseTable`]: undefined
    });
  };

  const handleDatabaseTableChange = (selected?: string[]) => {
    const databaseName = selected?.[0];
    const tableName = selected?.[1];
    const nextValue = {
      ...value,
      databaseName,
      tableName
    };
    onChange(nextValue);
    form.setFieldValue(
      `${fieldPrefix}DatabaseTable`,
      databaseName && tableName ? `${databaseName}/${tableName}` : undefined
    );
    if (value.connectorId && databaseName && tableName) {
      onTableSelected?.({
        connectorId: value.connectorId,
        databaseName,
        tableName
      });
    }
  };

  return (
    <>
      <FormItem
        label="数据源链接"
        field={`${fieldPrefix}Connector`}
        rules={[{ required: true, message: '请选择数据源链接' }]}
      >
        <Select
          placeholder="请选择数据源链接"
          loading={connectorsLoading}
          value={value.connectorId}
          onChange={handleConnectorChange}
          options={connectors.map((connector) => ({
            label: connector.subtype
              ? `${connector.name} (${connector.subtype})`
              : connector.name,
            value: connector.id
          }))}
          allowClear
        />
      </FormItem>

      <FormItem label="数据表" field={`${fieldPrefix}QueryMode`}>
        <Radio.Group
          value={value.queryMode}
          onChange={(queryMode) =>
            onChange({
              ...value,
              queryMode,
              databaseName:
                queryMode === 'sql' ? undefined : value.databaseName,
              tableName: queryMode === 'sql' ? undefined : value.tableName
            })
          }
        >
          <Radio value="selected">选择数据表</Radio>
          <Radio value="sql">自定义SQL</Radio>
        </Radio.Group>
      </FormItem>

      {value.queryMode === 'sql' ? (
        <FormItem field={`${fieldPrefix}Sql`}>
          <TextArea
            placeholder="请输入自定义SQL"
            value={value.sql}
            autoSize={{ minRows: 6 }}
            onChange={(sql) => onChange({ ...value, sql })}
          />
        </FormItem>
      ) : (
        <FormItem
          field={`${fieldPrefix}DatabaseTable`}
          rules={[{ required: true, message: '请选择数据表' }]}
        >
          <Cascader
            placeholder="请选择数据表"
            loading={tablesLoading}
            value={cascaderValue}
            options={tableOptions}
            onChange={(selected) =>
              handleDatabaseTableChange(selected as string[] | undefined)
            }
            filterOption={filterCascaderOption}
            allowClear
            showSearch
            dropdownMenuClassName={styles['object-type-cascader-dropdown']}
            renderFormat={(valueShow) => valueShow.join('/')}
          />
        </FormItem>
      )}
    </>
  );
}
