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
import { DataSourceType, ApiAuthType, ApiHttpMethod } from '../types';
import type { DataSourceFormData, DataSourceItem } from '../types';
import { addDataSource, updateDataSource } from '../services/api';
import { connectorConfigToFormData } from '../services/connectorTransform';
import {
  DATA_SOURCE_TYPE_META,
  isApiDataSourceType,
  isKafkaDataSourceType,
  isSqlDataSourceType
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
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [originalPassword, setOriginalPassword] = useState<string>('');
  const isEdit = !!editingRecord;

  const dataSourceType = Form.useWatch('dataSourceType', form);
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
      setOriginalPassword(password);
      form.setFieldsValue(formValues);
      setPasswordChanged(false);
    } else if (visible && !editingRecord) {
      form.resetFields();
      form.setFieldsValue({
        dataSourceType: DataSourceType.MYSQL,
        apiMethod: ApiHttpMethod.GET,
        apiAuthType: ApiAuthType.NONE,
        apiKeyHeader: 'X-API-Key',
        securityProtocol: 'PLAINTEXT',
        timeout: 30
      });
      setPasswordChanged(false);
      setOriginalPassword('');
    }
  }, [visible, editingRecord, form]);

  const handlePasswordField = (
    values: DataSourceFormData
  ): DataSourceFormData => {
    if (isEdit && !passwordChanged && values.password === '******') {
      return { ...values, password: originalPassword };
    }
    if (values.password && values.password !== '******') {
      return { ...values, password: encodePassword(values.password) };
    }
    return values;
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validate();
      setSubmitLoading(true);
      const submitData = handlePasswordField(values);

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
      onSuccess();
      onClose();
    } catch (error: any) {
      if (error?.errors) {
        return;
      }
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
        <Input placeholder="host1:9092,host2:9092" />
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
            <Button
              type="primary"
              loading={submitLoading}
              onClick={handleSubmit}
            >
              {isEdit ? '保存' : '测试并创建'}
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
            onChange={() => {
              setPasswordChanged(false);
              setOriginalPassword('');
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
          isSqlDataSourceType(dataSourceType) &&
          renderSqlFields()}
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
