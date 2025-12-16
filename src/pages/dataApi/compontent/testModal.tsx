import React, { useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  Empty,
  Form,
  Input,
  Modal,
  Spin,
  Table,
  Tabs
} from '@arco-design/web-react';
import styles from './testModal.module.scss';

export default function TestModal({ visible, dataSource, onCancel }) {
  const TabPane = Tabs.TabPane;

  const [form] = Form.useForm();
  const [requestBtnDisabled, setRequestBtnDisabled] = useState(false);
  const [result, setResult] = useState('');
  const [log, setLog] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dataSource.forEach((item) => {
      form.setFieldValue(`value_${item.englishName}`, item.defaultValue);
    });
    checkIsAllNotEmpty();
  }, [dataSource]);

  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 80
    },
    {
      title: '参数位置',
      dataIndex: 'position',
      width: 140
    },
    {
      title: '参数英文名称',
      dataIndex: 'englishName',
      width: 200
    },
    {
      title: '值',
      dataIndex: 'value',
      width: 220,
      render: (_value, record) => (
        <Form.Item field={`value_${record.englishName}`}>
          <Input
            placeholder="请输入值"
            onChange={() => {
              checkIsAllNotEmpty();
            }}
          />
        </Form.Item>
      )
    },
    {
      title: '参数类型',
      dataIndex: 'type',
      width: 140
    },
    {
      title: '数组',
      dataIndex: 'isArray',
      width: 80,
      render: (_value, record) => (
        <Form.Item
          field={`isArray_${record.englishName}`}
          initialValue={Boolean(record.isArray)}
          disabled
        >
          <Checkbox checked={record.isArray} />
        </Form.Item>
      )
    },
    {
      title: '必填',
      dataIndex: 'isRequired',
      width: 80,
      render: (_value, record) => (
        <Form.Item
          field={`isRequired_${record.englishName}`}
          initialValue={Boolean(record.isRequired)}
          disabled
        >
          <Checkbox checked={record.isRequired} />
        </Form.Item>
      )
    }
  ];

  const checkIsAllNotEmpty = () => {
    const isAllNotEmpty = dataSource.every((item) => {
      const value = form.getFieldValue(`value_${item.englishName}`);
      return value && value !== '';
    });
    setRequestBtnDisabled(!isAllNotEmpty);
  };

  const mergeConfigWithArray = (flatConfig, array) => {
    return array.map((item) => {
      const enName = item.englishName;
      // 构建要补充的属性（支持扩展更多属性）
      const supplementProperties = {
        value: flatConfig[`value_${enName}`],
        // 可选属性：存在则添加，不存在则忽略
        ...(flatConfig[`isArray_${enName}`] !== undefined && {
          isArray: flatConfig[`isArray_${enName}`]
        }),
        ...(flatConfig[`isRequired_${enName}`] !== undefined && {
          isRequired: flatConfig[`isRequired_${enName}`]
        })
      };
      // 合并原始属性和补充属性
      return { ...item, ...supplementProperties };
    });
  };

  const handleTest = () => {
    form.validate().then((values) => {
      const mergedConfig = mergeConfigWithArray(values, dataSource);
      console.log(mergedConfig, 'mergedConfig');
      // 模拟接口调用
      setLoading(true);
      new Promise<void>((resolve) => {
        setTimeout(() => {
          setResult(
            JSON.stringify({
              code: 200,
              message: 'success',
              data: {
                id: 123456,
                name: '张三',
                age: 30,
                email: 'zhangsan@example.com'
              }
            })
          );
          setLog(
            JSON.stringify({
              code: 200,
              message: 'success',
              data: {
                id: 123456,
                name: '张三',
                age: 30,
                email: 'zhangsan@example.com'
              }
            })
          );
          resolve();
        }, 3000);
      }).then(() => {
        setLoading(false);
      });
    });
  };

  return (
    <Modal
      className={styles.testModal}
      visible={visible}
      footer={null}
      title="测试"
      onOk={() => {}}
      onCancel={() => {
        onCancel();
        form.resetFields();
        setResult('');
        setLog('');
      }}
    >
      <div className="flex gap-6">
        <div className={styles.lfetBox}>
          <div className="mb-6 flex w-full items-center justify-between">
            <span className="text-sm font-medium text-[#0F172A]">请求参数</span>
            <Button
              type="primary"
              disabled={requestBtnDisabled}
              onClick={form.submit}
            >
              发送请求
            </Button>
          </div>
          <Form form={form} onSubmit={handleTest}>
            <Table columns={columns} data={dataSource} pagination={false} />
          </Form>
        </div>
        <div className={styles.rightBox}>
          <span className="text-sm font-medium text-[#0F172A]">API响应</span>
          {loading ? (
            <Spin tip="响应中" />
          ) : result ? (
            <>
              <div className="mt-4 flex items-center gap-6">
                <div>
                  <span className="text-sm font-medium text-[#0F172A]">
                    状态码:{' '}
                  </span>
                  <span className="text-sm font-medium text-[#0F172A]">
                    200
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-[#0F172A]">
                    响应时间:{' '}
                  </span>
                  <span className="text-sm font-medium text-[#0F172A]">
                    20s
                  </span>
                </div>
              </div>
              <Tabs defaultActiveTab="result">
                <TabPane key="result" title="响应结果(已脱敏)">
                  <div className={styles.responseBox}>{result}</div>
                </TabPane>
                <TabPane key="log" title="响应日志">
                  <div className={styles.responseBox}>{log}</div>
                </TabPane>
              </Tabs>
            </>
          ) : (
            <Empty description="暂无数据，请先发送请求" />
          )}
        </div>
      </div>
    </Modal>
  );
}
