import React, { useState } from 'react';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Steps
} from '@arco-design/web-react';
import { useHistory } from 'react-router';
import styles from './addApi.module.scss';

export default function AddApi() {
  const Step = Steps.Step;
  const TextArea = Input.TextArea;

  const history = useHistory();
  const [current, setCurrent] = useState(1);
  const [apiScenePath, setApiScenePath] = useState('');

  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validate().then((values) => {
      console.log(values, apiScenePath);
      setCurrent(current + 1);
    });
  };

  return (
    <div className={styles.addApi}>
      <h1 className="text-xl font-medium leading-[30px]">创建API</h1>
      <div className={styles.addApiContent}>
        <div style={{ height: '100%' }}>
          <Steps
            current={current}
            style={{
              maxWidth: 400,
              margin: '20px auto 0',
              justifyContent: 'center'
            }}
          >
            <Step title="基础信息" />
            <Step title="参数配置" />
          </Steps>
          {current === 1 && (
            <Form
              form={form}
              layout="horizontal"
              labelCol={{ span: 2 }}
              wrapperCol={{ span: 10 }}
              className="mt-6"
              onSubmit={handleSubmit}
            >
              <Form.Item
                label="API名称"
                field="apiName"
                required
                rules={[{ required: true, message: '请输入API名称' }]}
              >
                <Input placeholder="输入API名称" />
              </Form.Item>
              <Form.Item
                label="API路径"
                field="apiPath"
                required
                rules={[{ required: true, message: '请输入API路径' }]}
              >
                <Input
                  className={styles.apiPath}
                  placeholder="请输入端路径，以“/”开始"
                  addBefore={
                    <Input
                      placeholder="请输入环境路径"
                      value={apiScenePath}
                      onChange={(value) => setApiScenePath(value)}
                    />
                  }
                />
              </Form.Item>
              <Form.Item
                label="请求方式"
                field="apiRequestMethod"
                required
                rules={[{ required: true, message: '请选择API请求方式' }]}
              >
                <Select
                  options={[
                    { label: 'GET', value: 'GET' },
                    { label: 'POST', value: 'POST' }
                  ]}
                  placeholder="请选择请求方式"
                />
              </Form.Item>
              <Form.Item
                label="请求格式"
                field="apiRequestFormat"
                required
                rules={[{ required: true, message: '请选择API请求格式' }]}
              >
                <Select
                  options={[
                    { label: 'GET', value: 'GET' },
                    { label: 'POST', value: 'POST' }
                  ]}
                  placeholder="请选择请求格式"
                />
              </Form.Item>
              <Form.Item
                label="方法名"
                field="apiMethodName"
                required
                rules={[{ required: true, message: '请输入方法名' }]}
              >
                <Input placeholder="请输入方法名" />
              </Form.Item>
              <Form.Item label="缓存方法" field="apiCacheMethod">
                <Select
                  options={[
                    { label: 'GET', value: 'GET' },
                    { label: 'POST', value: 'POST' }
                  ]}
                  placeholder="请选择缓存方法"
                />
              </Form.Item>
              <Form.Item
                label="缓存过期时长"
                field="apiCacheExpire"
                initialValue={60}
              >
                <InputNumber mode="button" style={{ width: 160 }} />
              </Form.Item>
              <Form.Item label="API描述" field="apiDescription">
                <TextArea
                  placeholder="请输入API描述"
                  style={{ minHeight: 80 }}
                />
              </Form.Item>
            </Form>
          )}
          <div className={styles.stepFooter}>
            <Button
              disabled={current >= 2}
              onClick={() => form.submit()}
              type="primary"
            >
              下一步
            </Button>
            {current === 2 && (
              <Button
                type="secondary"
                disabled={current <= 1}
                onClick={() => setCurrent(current - 1)}
              >
                上一步
              </Button>
            )}
            <Button type="secondary" onClick={() => history.goBack()}>
              取消
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
