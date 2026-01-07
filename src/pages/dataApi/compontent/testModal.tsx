import React, { useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  Form,
  Input,
  Message,
  Modal,
  Spin,
  Table,
  Tabs
} from '@arco-design/web-react';
import styles from './testModal.module.scss';
import { openDataTestApi } from '@/api/dataApi';
import { NoDataCard } from '@ceai-front/arco-material';

export default function TestModal(props: {
  visible: boolean;
  dataSource;
  apiId: number | null;
  onCancel: () => void;
  getStatusCode?: (statusCode: number | null) => void;
}) {
  const { visible, dataSource, apiId, onCancel, getStatusCode } = props;
  const TabPane = Tabs.TabPane;

  const [form] = Form.useForm();
  const [requestBtnDisabled, setRequestBtnDisabled] = useState(false);
  const [result, setResult] = useState<null | Record<string | number, any>>(
    null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dataSource.forEach((item) => {
      form.setFieldValue(`value_${item.name}`, item.defaultValue);
    });
    checkIsAllNotEmpty();
  }, [dataSource]);

  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 80,
      render: (_, record, index) => index + 1
    },
    {
      title: '参数位置',
      dataIndex: 'location',
      width: 140
    },
    {
      title: '参数英文名称',
      dataIndex: 'name',
      width: 200
    },
    {
      title: '值',
      dataIndex: 'value',
      width: 220,
      render: (_value, record) => (
        <Form.Item field={`value_${record.name}`}>
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
      dataIndex: 'paramType',
      width: 140
    },
    {
      title: '数组',
      dataIndex: 'isArray',
      width: 80,
      render: (_value, record) => (
        <Form.Item
          field={`isArray_${record.name}`}
          initialValue={Boolean(record.isArray)}
          disabled
        >
          <Checkbox checked={record.isArray} />
        </Form.Item>
      )
    }
  ];

  const checkIsAllNotEmpty = () => {
    const isAllNotEmpty = dataSource.every((item) => {
      const value = form.getFieldValue(`value_${item.name}`);
      return value && value !== '';
    });
    setRequestBtnDisabled(!isAllNotEmpty);
  };

  const mergeConfigWithArray = (flatConfig, array) => {
    const newArray = array.map((item) => {
      const enName = item.name;
      // 构建要补充的属性（支持扩展更多属性）
      const supplementProperties = {
        [`${enName}`]: flatConfig[`value_${enName}`]
      };
      // 合并原始属性和补充属性
      return { ...supplementProperties };
    });
    return Object.assign({}, ...newArray);
  };

  const handleTest = () => {
    form.validate().then(async (values) => {
      const mergedConfig = mergeConfigWithArray(values, dataSource);
      // 模拟接口调用
      setLoading(true);
      const params = {
        id: apiId,
        testParams: mergedConfig
      };
      const res = await openDataTestApi(params);
      if (res.code === '' && res.status === 200) {
        if (res.data) {
          setResult(res.data);
          getStatusCode?.(
            res.data.statusCode || Number(res.data.statusCode) === 0
              ? Number(res.data.statusCode)
              : null
          );
        }
        setLoading(false);
      } else {
        Message.error(res.message || '测试失败');
        setLoading(false);
      }
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
        setResult(null);
      }}
    >
      <div className={styles.modalContent}>
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
            <Table
              columns={columns}
              data={dataSource}
              pagination={false}
              rowKey="id"
            />
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
                  <span className="text-sm font-normal text-[#6E7B8D]">
                    响应状态:{' '}
                  </span>
                  <span className="text-sm font-normal text-[#0F172A]">
                    {result.statusCode || Number(result.statusCode) === 0
                      ? Number(result.statusCode) === 0
                        ? Number(result.statusCode) + '（成功）'
                        : Number(result.statusCode) + '（失败）'
                      : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-normal text-[#6E7B8D]">
                    响应时间:{' '}
                  </span>
                  <span className="text-sm font-normal text-[#0F172A]">
                    {result?.queryTime ? `${result?.queryTime}ms` : '-'}
                  </span>
                </div>
              </div>
              <Tabs defaultActiveTab="result">
                <TabPane key="result" title="响应结果">
                  <div className={styles.responseBox}>
                    <pre>
                      {result?.result
                        ? JSON.stringify(result?.result, null, 2)
                        : '-'}
                    </pre>
                  </div>
                </TabPane>
                <TabPane key="log" title="响应日志">
                  <div className={styles.responseBox}>
                    <pre>
                      {result?.errorInfo
                        ? JSON.stringify(result?.errorInfo, null, 2)
                        : Number(result.statusCode) === 0 && '成功'}
                    </pre>
                  </div>
                </TabPane>
              </Tabs>
            </>
          ) : (
            <NoDataCard title="暂无数据，请先发送请求" type="block" />
          )}
        </div>
      </div>
    </Modal>
  );
}
