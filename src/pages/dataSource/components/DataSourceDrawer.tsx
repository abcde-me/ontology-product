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
import { DataSourceType } from '../types';
import type { DataSourceFormData, DataSourceItem } from '../types';
import {
  testConnection,
  addDataSource,
  updateDataSource
} from '../services/api';

const FormItem = Form.Item;

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
  const [form] = Form.useForm<DataSourceFormData>();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const isEdit = !!editingRecord;

  useEffect(() => {
    if (visible && editingRecord) {
      // 编辑模式：直接使用传入的记录数据
      // 从连接信息中解析出主机、端口、数据库名
      const connectionInfo = editingRecord.connectionInfo;
      let host = '';
      let port = 3306;
      let database = '';

      // 简单解析连接字符串
      try {
        const match = connectionInfo.match(/\/\/([^:]+):(\d+)(?:\/(.+))?/);
        if (match) {
          host = match[1];
          port = parseInt(match[2]);
          database = match[3] || '';
        }
      } catch (e) {
        console.error('解析连接信息失败', e);
      }

      form.setFieldsValue({
        name: editingRecord.name,
        description: editingRecord.description || '',
        dataSourceType: editingRecord.dataSourceType,
        host: host || 'localhost',
        port: port || 3306,
        database: database || '',
        username: 'admin',
        password: '******'
      });
    } else if (visible && !editingRecord) {
      // 新增模式：重置表单
      form.resetFields();
    }
  }, [visible, editingRecord, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validate();
      setSubmitLoading(true);

      if (isEdit && editingRecord) {
        await updateDataSource(editingRecord.id, values);
        Message.success('更新成功');
      } else {
        await addDataSource(values);
        Message.success('新增成功');
      }

      form.resetFields();
      onSuccess();
      onClose();
    } catch (error: any) {
      if (error?.errors) {
        // 表单验证错误，不需要提示
        return;
      }
      Message.error(isEdit ? '更新失败' : '新增失败');
      console.error(error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const handleTestConnection = async () => {
    try {
      // 如果是编辑模式，直接使用 id 测试
      if (isEdit && editingRecord) {
        setTestLoading(true);
        const result = await testConnection(editingRecord.id);

        if (result.success) {
          Message.success(result.message);
        } else {
          Message.error(result.message);
        }
      } else {
        // 新增模式暂不支持测试（需要先保存）
        Message.warning('请先保存数据源后再进行连接测试');
      }
    } catch (error: any) {
      Message.error('连接测试失败');
      console.error(error);
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <Drawer
      width={600}
      title={isEdit ? '编辑数据源' : '新增数据源'}
      visible={visible}
      onCancel={handleCancel}
      footer={
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <Button
              type="outline"
              loading={testLoading}
              onClick={handleTestConnection}
            >
              连接测试
            </Button>
          </div>
          <Space>
            <Button onClick={handleCancel}>取消</Button>
            <Button
              type="primary"
              loading={submitLoading}
              onClick={handleSubmit}
            >
              确定
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
          rules={[{ required: true, message: '请输入数据源名称' }]}
        >
          <Input placeholder="请输入数据源名称" />
        </FormItem>
        <FormItem label="描述" field="description">
          <Input.TextArea
            placeholder="请输入描述信息"
            rows={3}
            maxLength={200}
            showWordLimit
          />
        </FormItem>
        <FormItem
          label="数据源类型"
          field="dataSourceType"
          required
          rules={[{ required: true, message: '请选择数据源类型' }]}
        >
          <Select placeholder="请选择数据源类型">
            <Select.Option value={DataSourceType.MYSQL}>MySQL</Select.Option>
            <Select.Option value={DataSourceType.DAMENG}>
              达梦数据库
            </Select.Option>
            <Select.Option value={DataSourceType.POSTGRESQL}>
              PostgreSQL
            </Select.Option>
          </Select>
        </FormItem>
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
        <FormItem label="数据库名" field="database">
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
        <FormItem
          label="密码"
          field="password"
          required
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password placeholder="请输入密码" />
        </FormItem>
      </Form>
    </Drawer>
  );
};
