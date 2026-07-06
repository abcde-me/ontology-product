import React, { useEffect, useState } from 'react';
import {
  Drawer,
  Form,
  Input,
  Select,
  InputNumber,
  Message,
  Button,
  Space
} from '@arco-design/web-react';
import {
  DataSourceType,
  ApiAuthType,
  ApiHttpMethod,
  OAuth2GrantType,
  IcebergWarehouseType
} from '../types';
import type { DataSourceFormData, DataSourceItem } from '../types';
import {
  addDataSource,
  testConnectionByForm,
  updateDataSource
} from '../services/api';
import { connectorConfigToFormData } from '../services/connectorTransform';
import {
  DATA_SOURCE_TYPE_META,
  isApiDataSourceType,
  isIcebergDataSourceType,
  isKafkaDataSourceType,
  isRelationalSqlDataSourceType
} from '../constants';

const FormItem = Form.Item;
const TextArea = Input.TextArea;

interface DataSourceDrawerProps {
  visible: boolean;
  editingRecord: DataSourceItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const DataSourceDrawer: React.FC<DataSourceDrawerProps> = ({
  visible,
  editingRecord,
  onClose,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [originalPassword, setOriginalPassword] = useState<string>('');
  const [oauth2ClientSecretChanged, setOauth2ClientSecretChanged] =
    useState(false);
  const [originalOauth2ClientSecret, setOriginalOauth2ClientSecret] =
    useState<string>('');
  const [s3AccessKeyChanged, setS3AccessKeyChanged] = useState(false);
  const [originalS3AccessKey, setOriginalS3AccessKey] = useState<string>('');
  const [s3SecretKeyChanged, setS3SecretKeyChanged] = useState(false);
  const [originalS3SecretKey, setOriginalS3SecretKey] = useState<string>('');
  const isEdit = !!editingRecord;

  const dataSourceType = Form.useWatch('dataSourceType', form);
  const warehouseType = Form.useWatch('warehouseType', form);
  const apiAuthType = Form.useWatch('apiAuthType', form);
  const apiMethod = Form.useWatch('apiMethod', form);
  const securityProtocol = Form.useWatch('securityProtocol', form);

  const encodePassword = (password: string): string => {
    try {
      return btoa(password);
    } catch (error) {
      console.error('密码编码失败', error);
      return password;
    }
  };

  useEffect(() => {
    if (visible && editingRecord) {
      const formValues = connectorConfigToFormData(editingRecord);
      const password = formValues.password || '';
      const oauth2ClientSecret = formValues.oauth2ClientSecret || '';
      const s3AccessKey = formValues.s3AccessKey || '';
      const s3SecretKey = formValues.s3SecretKey || '';
      setOriginalPassword(password);
      setOriginalOauth2ClientSecret(oauth2ClientSecret);
      setOriginalS3AccessKey(s3AccessKey);
      setOriginalS3SecretKey(s3SecretKey);
      form.setFieldsValue(formValues);
      setPasswordChanged(false);
      setOauth2ClientSecretChanged(false);
      setS3AccessKeyChanged(false);
      setS3SecretKeyChanged(false);
    } else if (visible && !editingRecord) {
      form.resetFields();
      form.setFieldsValue({
        dataSourceType: DataSourceType.MYSQL,
        warehouseType: IcebergWarehouseType.HDFS,
        apiMethod: ApiHttpMethod.GET,
        apiAuthType: ApiAuthType.NONE,
        apiKeyHeader: 'X-API-Key',
        oauth2GrantType: OAuth2GrantType.CLIENT_CREDENTIALS,
        securityProtocol: 'PLAINTEXT',
        timeout: 30
      });
      setPasswordChanged(false);
      setOriginalPassword('');
      setOauth2ClientSecretChanged(false);
      setOriginalOauth2ClientSecret('');
      setS3AccessKeyChanged(false);
      setOriginalS3AccessKey('');
      setS3SecretKeyChanged(false);
      setOriginalS3SecretKey('');
    }
  }, [visible, editingRecord, form]);

  const handlePasswordField = (
    values: DataSourceFormData
  ): DataSourceFormData => {
    let result = { ...values };

    if (isEdit && !passwordChanged && values.password === '******') {
      result = { ...result, password: originalPassword };
    } else if (values.password && values.password !== '******') {
      result = { ...result, password: encodePassword(values.password) };
    }

    if (
      isEdit &&
      !oauth2ClientSecretChanged &&
      values.oauth2ClientSecret === '******'
    ) {
      result = { ...result, oauth2ClientSecret: originalOauth2ClientSecret };
    } else if (
      values.oauth2ClientSecret &&
      values.oauth2ClientSecret !== '******'
    ) {
      result = {
        ...result,
        oauth2ClientSecret: encodePassword(values.oauth2ClientSecret)
      };
    }

    if (isEdit && !s3AccessKeyChanged && values.s3AccessKey === '******') {
      result = { ...result, s3AccessKey: originalS3AccessKey };
    } else if (values.s3AccessKey && values.s3AccessKey !== '******') {
      result = { ...result, s3AccessKey: encodePassword(values.s3AccessKey) };
    }

    if (isEdit && !s3SecretKeyChanged && values.s3SecretKey === '******') {
      result = { ...result, s3SecretKey: originalS3SecretKey };
    } else if (values.s3SecretKey && values.s3SecretKey !== '******') {
      result = {
        ...result,
        s3SecretKey: encodePassword(values.s3SecretKey)
      };
    }

    return result;
  };

  const getValidatedFormData = async (): Promise<DataSourceFormData | null> => {
    try {
      const values = await form.validate();
      return handlePasswordField(values);
    } catch (error: any) {
      if (error?.errors) {
        return null;
      }
      throw error;
    }
  };

  const handleTest = async () => {
    try {
      const submitData = await getValidatedFormData();
      if (!submitData) {
        return;
      }

      setTestLoading(true);
      const result = await testConnectionByForm(submitData);
      if (result.success) {
        Message.success(result.message);
      } else {
        Message.error(result.message);
      }
    } catch (error: any) {
      const errorMessage = error?.message || '连接测试失败';
      Message.error(errorMessage);
      console.error(error);
    } finally {
      setTestLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const submitData = await getValidatedFormData();
      if (!submitData) {
        return;
      }

      setSubmitLoading(true);

      if (isEdit && editingRecord) {
        await updateDataSource(editingRecord.id, submitData);
        Message.success('数据源更新成功');
      } else {
        await addDataSource(submitData);
        Message.success('数据源创建成功');
      }

      form.resetFields();
      setPasswordChanged(false);
      setOriginalPassword('');
      setOauth2ClientSecretChanged(false);
      setOriginalOauth2ClientSecret('');
      setS3AccessKeyChanged(false);
      setOriginalS3AccessKey('');
      setS3SecretKeyChanged(false);
      setOriginalS3SecretKey('');
      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMessage = error?.message || (isEdit ? '更新失败' : '新增失败');
      Message.error(errorMessage);
      console.error(error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setPasswordChanged(false);
    setOriginalPassword('');
    setOauth2ClientSecretChanged(false);
    setOriginalOauth2ClientSecret('');
    setS3AccessKeyChanged(false);
    setOriginalS3AccessKey('');
    setS3SecretKeyChanged(false);
    setOriginalS3SecretKey('');
    onClose();
  };

  const renderPasswordInput = (label = '密码', field = 'password') => (
    <FormItem
      label={label}
      field={field}
      required
      rules={[
        { required: true, message: `请输入${label}` },
        {
          validator: (value, callback) => {
            if (isEdit && value === '******' && !passwordChanged) {
              return callback();
            }
            if (!value) {
              return callback(`请输入${label}`);
            }
            return callback();
          }
        }
      ]}
    >
      <Input.Password
        placeholder={isEdit ? '不修改请保持 ****** 不变' : `请输入${label}`}
        onChange={(value) => {
          if (isEdit && value !== '******') {
            setPasswordChanged(true);
          }
        }}
      />
    </FormItem>
  );

  const renderSecretInput = (
    label: string,
    field: 's3AccessKey' | 's3SecretKey',
    setChanged: (value: boolean) => void,
    options?: { required?: boolean; changed?: boolean; placeholder?: string }
  ) => {
    const {
      required = false,
      changed = false,
      placeholder = '请输入'
    } = options || {};

    return (
      <FormItem
        label={label}
        field={field}
        required={required}
        rules={
          required
            ? [
                { required: true, message: `请输入${label}` },
                {
                  validator: (value, callback) => {
                    if (isEdit && value === '******' && !changed) {
                      return callback();
                    }
                    if (!value) {
                      return callback(`请输入${label}`);
                    }
                    return callback();
                  }
                }
              ]
            : undefined
        }
      >
        <Input.Password
          placeholder={isEdit ? '不修改请保持 ****** 不变' : placeholder}
          onChange={(value) => {
            if (isEdit && value !== '******') {
              setChanged(true);
            }
          }}
        />
      </FormItem>
    );
  };

  const renderIcebergFields = () => (
    <>
      <FormItem
        label="Metastore URI"
        field="metastoreUri"
        required
        rules={[{ required: true, message: '请输入 Hive Metastore URI' }]}
      >
        <Input placeholder="如：thrift://hms-host:9083" />
      </FormItem>
      <FormItem
        label="仓库类型"
        field="warehouseType"
        required
        rules={[{ required: true, message: '请选择仓库类型' }]}
      >
        <Select placeholder="请选择仓库类型">
          <Select.Option value={IcebergWarehouseType.MINIO}>
            MinIO
          </Select.Option>
          <Select.Option value={IcebergWarehouseType.HDFS}>HDFS</Select.Option>
        </Select>
      </FormItem>
      <FormItem
        label="Warehouse URI"
        field="warehouseUri"
        required
        rules={[{ required: true, message: '请输入 Warehouse 路径' }]}
      >
        <Input
          placeholder={
            warehouseType === IcebergWarehouseType.HDFS
              ? '如：hdfs://nameservice1/warehouse'
              : '如：s3a://bucket/warehouse'
          }
        />
      </FormItem>
      {warehouseType === IcebergWarehouseType.MINIO && (
        <>
          <FormItem label="region" field="s3Region">
            <Input placeholder="如：cn-north-1，可选，不填则使用默认地域" />
          </FormItem>
          <FormItem
            label="Endpoint"
            field="s3Endpoint"
            required
            rules={[{ required: true, message: '请输入 MinIO 服务地址' }]}
          >
            <Input placeholder="如：http://minio-host:9000" />
          </FormItem>
          {renderSecretInput(
            'Access Key',
            's3AccessKey',
            setS3AccessKeyChanged,
            {
              required: true,
              changed: s3AccessKeyChanged,
              placeholder: '如：minioadmin'
            }
          )}
          {renderSecretInput(
            'Secret Access Key',
            's3SecretKey',
            setS3SecretKeyChanged,
            {
              required: true,
              changed: s3SecretKeyChanged,
              placeholder: '如：minioadmin'
            }
          )}
        </>
      )}
      {warehouseType === IcebergWarehouseType.HDFS && (
        <FormItem label="NameNode 地址" field="hdfsNameNode">
          <Input placeholder="如：hdfs://namenode-host:8020" />
        </FormItem>
      )}
    </>
  );

  const renderSqlFields = () => (
    <>
      <FormItem
        label="服务地址"
        field="host"
        required
        rules={[{ required: true, message: '请输入服务地址' }]}
      >
        <Input placeholder="请输入服务地址，如：localhost" />
      </FormItem>
      <FormItem
        label="端口"
        field="port"
        required
        rules={[{ required: true, message: '请输入端口' }]}
      >
        <InputNumber
          placeholder="请输入端口"
          style={{ width: '100%' }}
          min={1}
          max={65535}
        />
      </FormItem>
      <FormItem
        label="数据库名"
        field="database"
        required
        rules={[{ required: true, message: '请输入数据库名' }]}
      >
        <Input placeholder="请输入数据库名" />
      </FormItem>
      <FormItem
        label="用户名"
        field="username"
        required
        rules={[{ required: true, message: '请输入用户名' }]}
      >
        <Input placeholder="请输入用户名" />
      </FormItem>
      {renderPasswordInput()}
    </>
  );

  const renderApiFields = () => (
    <>
      <FormItem
        label="API 地址"
        field="apiUrl"
        required
        rules={[
          { required: true, message: '请输入 API 地址' },
          { type: 'url', message: '请输入有效的 URL 地址' }
        ]}
      >
        <Input placeholder="https://api.example.com/v1/data" />
      </FormItem>
      <FormItem
        label="请求方法"
        field="apiMethod"
        required
        rules={[{ required: true, message: '请选择请求方法' }]}
      >
        <Select placeholder="请选择请求方法">
          <Select.Option value={ApiHttpMethod.GET}>GET</Select.Option>
          <Select.Option value={ApiHttpMethod.POST}>POST</Select.Option>
          <Select.Option value={ApiHttpMethod.PUT}>PUT</Select.Option>
          <Select.Option value={ApiHttpMethod.DELETE}>DELETE</Select.Option>
        </Select>
      </FormItem>
      <FormItem label="请求头" field="apiHeaders">
        <TextArea
          placeholder='可选，JSON 格式，如：{"Content-Type":"application/json"}'
          autoSize={{ minRows: 2, maxRows: 4 }}
        />
      </FormItem>
      <FormItem
        label="鉴权方式"
        field="apiAuthType"
        required
        rules={[{ required: true, message: '请选择鉴权方式' }]}
      >
        <Select placeholder="请选择鉴权方式">
          <Select.Option value={ApiAuthType.NONE}>无鉴权</Select.Option>
          <Select.Option value={ApiAuthType.API_KEY}>API Key</Select.Option>
          <Select.Option value={ApiAuthType.BEARER}>Bearer Token</Select.Option>
          <Select.Option value={ApiAuthType.BASIC}>Basic Auth</Select.Option>
          <Select.Option value={ApiAuthType.OAUTH2}>OAuth2</Select.Option>
        </Select>
      </FormItem>
      {apiAuthType === ApiAuthType.API_KEY && (
        <>
          <FormItem label="Key 请求头" field="apiKeyHeader">
            <Input placeholder="默认 X-API-Key" />
          </FormItem>
          <FormItem
            label="API Key"
            field="apiKey"
            required
            rules={[{ required: true, message: '请输入 API Key' }]}
          >
            <Input.Password placeholder="请输入 API Key" />
          </FormItem>
        </>
      )}
      {apiAuthType === ApiAuthType.BEARER && (
        <FormItem
          label="Bearer Token"
          field="bearerToken"
          required
          rules={[{ required: true, message: '请输入 Bearer Token' }]}
        >
          <Input.Password placeholder="请输入 Bearer Token" />
        </FormItem>
      )}
      {apiAuthType === ApiAuthType.BASIC && (
        <>
          <FormItem
            label="用户名"
            field="username"
            required
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </FormItem>
          {renderPasswordInput()}
        </>
      )}
      {apiAuthType === ApiAuthType.OAUTH2 && (
        <>
          <FormItem
            label="Token URL"
            field="oauth2TokenUrl"
            required
            rules={[
              { required: true, message: '请输入 Token URL' },
              { type: 'url', message: '请输入有效的 URL 地址' }
            ]}
          >
            <Input placeholder="https://auth.example.com/oauth/token" />
          </FormItem>
          <FormItem
            label="Client ID"
            field="oauth2ClientId"
            required
            rules={[{ required: true, message: '请输入 Client ID' }]}
          >
            <Input placeholder="请输入 Client ID" />
          </FormItem>
          <FormItem
            label="Client Secret"
            field="oauth2ClientSecret"
            required
            rules={[
              { required: true, message: '请输入 Client Secret' },
              {
                validator: (value, callback) => {
                  if (
                    isEdit &&
                    value === '******' &&
                    !oauth2ClientSecretChanged
                  ) {
                    return callback();
                  }
                  if (!value) {
                    return callback('请输入 Client Secret');
                  }
                  return callback();
                }
              }
            ]}
          >
            <Input.Password
              placeholder={
                isEdit ? '不修改请保持 ****** 不变' : '请输入 Client Secret'
              }
              onChange={(value) => {
                if (isEdit && value !== '******') {
                  setOauth2ClientSecretChanged(true);
                }
              }}
            />
          </FormItem>
          <FormItem label="Scope" field="oauth2Scope">
            <Input placeholder="可选，如：read write" />
          </FormItem>
        </>
      )}
      {(apiMethod === ApiHttpMethod.POST ||
        apiMethod === ApiHttpMethod.PUT) && (
        <FormItem label="请求体" field="requestBody">
          <TextArea
            placeholder="可选，JSON 格式请求体"
            autoSize={{ minRows: 3, maxRows: 6 }}
          />
        </FormItem>
      )}
      <FormItem label="数据路径" field="dataPath">
        <Input placeholder="可选，JSONPath，如：$.data.items" />
      </FormItem>
      <FormItem label="超时时间" field="timeout">
        <InputNumber
          placeholder="秒"
          style={{ width: '100%' }}
          min={1}
          max={300}
          suffix="秒"
        />
      </FormItem>
    </>
  );

  const renderKafkaFields = () => (
    <>
      <FormItem
        label="Broker 地址"
        field="brokers"
        required
        rules={[{ required: true, message: '请输入 Broker 地址' }]}
      >
        <Input placeholder="host1:9092,host2:9092，多个地址用英文逗号分隔" />
      </FormItem>
      <FormItem
        label="消费组"
        field="consumerGroup"
        required
        rules={[{ required: true, message: '请输入消费组 ID' }]}
      >
        <Input placeholder="请输入 Consumer Group ID" />
      </FormItem>
      <FormItem label="安全协议" field="securityProtocol">
        <Select placeholder="请选择安全协议">
          <Select.Option value="PLAINTEXT">PLAINTEXT</Select.Option>
          <Select.Option value="SASL_PLAINTEXT">SASL_PLAINTEXT</Select.Option>
          <Select.Option value="SASL_SSL">SASL_SSL</Select.Option>
          <Select.Option value="SSL">SSL</Select.Option>
        </Select>
      </FormItem>
      {securityProtocol && securityProtocol !== 'PLAINTEXT' && (
        <>
          <FormItem label="SASL 机制" field="saslMechanism">
            <Select placeholder="请选择 SASL 机制" allowClear>
              <Select.Option value="PLAIN">PLAIN</Select.Option>
              <Select.Option value="SCRAM-SHA-256">SCRAM-SHA-256</Select.Option>
              <Select.Option value="SCRAM-SHA-512">SCRAM-SHA-512</Select.Option>
            </Select>
          </FormItem>
          <FormItem label="用户名" field="username">
            <Input placeholder="SASL 用户名" />
          </FormItem>
          {renderPasswordInput('SASL 密码')}
        </>
      )}
    </>
  );

  return (
    <Drawer
      width={640}
      title={isEdit ? '编辑数据源' : '新增数据源'}
      visible={visible}
      onCancel={handleCancel}
      footer={
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center'
          }}
        >
          <Space>
            <Button onClick={handleCancel}>取消</Button>
            <Button loading={testLoading} onClick={handleTest}>
              测试
            </Button>
            <Button
              type="primary"
              loading={submitLoading}
              onClick={handleSubmit}
            >
              保存
            </Button>
          </Space>
        </div>
      }
    >
      <Form
        form={form}
        layout="horizontal"
        autoComplete="off"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        labelAlign="left"
      >
        <FormItem
          label="数据源名称"
          field="name"
          required
          rules={[
            { required: true, message: '请输入数据源名称' },
            { maxLength: 100, message: '数据源名称不能超过100个字符' }
          ]}
        >
          <Input placeholder="请输入数据源名称" showWordLimit maxLength={100} />
        </FormItem>
        <FormItem
          label="数据源类型"
          field="dataSourceType"
          required
          rules={[{ required: true, message: '请选择数据源类型' }]}
        >
          <Select
            placeholder="请选择数据源类型"
            disabled={isEdit}
            onChange={(value) => {
              setPasswordChanged(false);
              setOriginalPassword('');
              setOauth2ClientSecretChanged(false);
              setOriginalOauth2ClientSecret('');
              setS3AccessKeyChanged(false);
              setOriginalS3AccessKey('');
              setS3SecretKeyChanged(false);
              setOriginalS3SecretKey('');
              if (value === DataSourceType.ICEBERG) {
                form.setFieldValue('warehouseType', IcebergWarehouseType.HDFS);
              }
            }}
          >
            {Object.entries(DATA_SOURCE_TYPE_META).map(([value, meta]) => (
              <Select.Option key={value} value={value}>
                {meta.label}
              </Select.Option>
            ))}
          </Select>
        </FormItem>

        {dataSourceType &&
          isRelationalSqlDataSourceType(dataSourceType) &&
          renderSqlFields()}
        {dataSourceType &&
          isIcebergDataSourceType(dataSourceType) &&
          renderIcebergFields()}
        {dataSourceType &&
          isApiDataSourceType(dataSourceType) &&
          renderApiFields()}
        {dataSourceType &&
          isKafkaDataSourceType(dataSourceType) &&
          renderKafkaFields()}
      </Form>
    </Drawer>
  );
};
