import {
  Empty,
  Link,
  Modal,
  Input,
  Space,
  Spin,
  Tag,
  Message,
  Button,
  Alert,
  Form
} from '@arco-design/web-react';
import { format } from 'date-fns';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import {
  IconCheck,
  IconCheckCircle,
  IconClockCircle,
  IconClose,
  IconCloseCircle,
  IconCopy,
  IconEdit,
  IconExclamationCircle
} from '@arco-design/web-react/icon';
import { observer } from 'mobx-react-lite';
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef
} from 'react';
import { useHistory } from 'react-router-dom';
import { Table } from '@ccf2e/arco-material';
import Header from '@/components/list-header';
import { deleteApp, getAppsList } from '@/api/appsV2';
import {
  deleteApiKeyList,
  getApiKeyList,
  postApiKeyList,
  putApiKeyList
} from '@/api/apiKey';
function ApiKey(props) {
  const [form] = Form.useForm();
  const [editPublishing, seteditPublishing] = useState(false);
  const [typedescriptionkey, setdescriptionkey] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [initFromValue, setinitFromValue] = useState({
    description: ''
  });
  const [pagination, setPagination] = useState<any>({
    page: 1, // 当前页码
    limit: 10, // 每页显示的数据条数
    name: ''
  });
  const history = useHistory();
  const formItemLayout = {
    labelCol: {
      span: 2
    },
    wrapperCol: {
      span: 22
    }
  };
  useEffect(() => {
    funcApiList({ ...pagination });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  //apikey应用列表
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const funcApiList = async (params) => {
    try {
      setLoading(true);
      const item = await getApiKeyList('', params);
      const { data = [], total = '', page = '', limit = '' } = item.data;
      setData(data || []);
      setPagination((prevPagination) => ({
        ...prevPagination,
        total: total
      }));
      // 其他处理逻辑
    } catch (error) {
      setData([]);
    } finally {
      setLoading(false);
    }
  };
  //
  //创建APIKey
  const handleButtonClick = () => {
    seteditPublishing(true);
  };
  //删除
  const doDelete = useCallback((app) => {
    Modal.confirm({
      title: '删除API Key',
      content:
        '确认删除该 API Key 吗？删除后API Key将无法请求服务，且无法恢复。',
      async onOk() {
        await deleteApiKeyList(app.id);
        await funcApiList({ ...pagination, page: 1, limit: 10 });
        Message.success('删除API Key成功！');
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  //查询
  const onChildQuery = (value) => {
    setPagination((prevPagination) => ({
      ...prevPagination,
      page: 1,
      name: value
    }));
    funcApiList({
      ...pagination,
      page: 1,
      name: value
    });
  };
  //重置
  const onChildReset = () => {
    setPagination((prevPagination) => ({
      ...prevPagination,
      page: 1,
      limit: 10,
      name: ''
    }));
    funcApiList({
      page: 1,
      limit: 10,
      name: ''
    });
  };
  const submitEditPublishing = async () => {
    try {
      const values = await form.validate();

      await postApiKeyList('', values);
      await funcApiList({ ...pagination, page: 1, limit: 10 });
      form.resetFields();
      Message.success('创建API Key成功');
    } catch {
      Message.error('创建API Key失败');
    }
    seteditPublishing(false);
  };
  const clearEditPublishing = () => {
    seteditPublishing(false);
  };
  const funcEditTrue = (record) => {
    setdescriptionkey(record.key);
    setInputValue(record.description);
  };
  const funEditApiKeyno = () => {
    setdescriptionkey('');
    setInputValue('');
  };
  const funEditApiKeyyes = useCallback(
    async (id) => {
      try {
        await putApiKeyList(id, {
          description: inputValue
        });
        await funcApiList({ ...pagination, page: 1, limit: 10 });
        setdescriptionkey('');
        setInputValue('');
        Message.success('操作成功');
      } catch {
        setdescriptionkey('');
        setInputValue('');
        Message.error('操作失败，请稍后重试');
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inputValue]
  );
  const columns: any = useMemo(() => {
    return [
      {
        title: 'API Key',
        dataIndex: 'key',
        width: 220,
        render: (text, record) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{text.slice(0, 4) + '**********' + text.slice(-3)}</span>
            <IconCopy
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation(); // 阻止事件冒泡
                navigator.clipboard
                  .writeText(text)
                  .then(() => Message.success('复制成功'))
                  .catch(() => Message.error('复制失败'));
              }}
            />
          </div>
        )
      },
      {
        title: '描述',
        dataIndex: 'description',
        width: 412,
        render: (text, record) =>
          typedescriptionkey !== record.key ? (
            <div>
              <span>{text}</span>
              <span className="ml-[8px] cursor-pointer ">
                <IconEdit onClick={() => funcEditTrue(record)} />
              </span>
            </div>
          ) : (
            <div className="flex">
              <Input
                style={{ width: 300 }}
                value={inputValue}
                onChange={(e) => setInputValue(e)}
              />
              <div
                className="ml-[8px] flex h-[32px] w-[32px] cursor-pointer items-center justify-center bg-[#F2F3F5]"
                onClick={funEditApiKeyno}
              >
                <IconClose />
              </div>
              <div
                className="ml-[8px]  flex h-[32px] w-[32px] cursor-pointer items-center justify-center bg-[#F2F3F5]"
                onClick={() => funEditApiKeyyes(record.id)}
              >
                <IconCheck />
              </div>
            </div>
          )
      },
      {
        title: '创建时间',
        dataIndex: 'created_at',
        width: 150,
        ellipsis: true,
        render(i, app) {
          const date = new Date(i);
          const formattedDate = format(date, 'YYYY-MM-DD HH:mm:ss');

          return formattedDate;
        }
      },
      {
        title: '上次使用时间',
        dataIndex: 'last_used_at',
        width: 150,
        render(i, app) {
          if (i) {
            const date = new Date(i);
            const formattedDate = format(date, 'YYYY-MM-DD HH:mm:ss');

            return formattedDate;
          } else {
            return null;
          }
        }
      },
      {
        title: '操作',
        dataIndex: 'oper',
        // align: 'right',
        fixed: 'right',
        width: 77,
        render(_, app) {
          return (
            <Space>
              <Link onClick={() => doDelete(app)}>删除</Link>
            </Space>
          );
        }
      }
    ];
  }, [doDelete, funEditApiKeyyes, inputValue, typedescriptionkey]);
  //分页
  const onChangeTable = (value) => {
    setPagination((prevPagination) => ({
      ...prevPagination,
      page: value.current,
      limit: value.pageSize
    }));
    funcApiList({
      ...pagination,
      page: value.current,
      limit: value.pageSize
    });
  };
  const onValuesChange = (changeValue, values) => {
    console.log('onValuesChange: ', changeValue, values);
    // setformvalues(values);
  };
  return (
    <div className="appforge-spin">
      <div className="h-full overflow-auto py-[20px] pr-[20px]">
        <div className="min-h-full rounded-[12px] bg-white px-[24px] py-[20px]">
          <div className="mb-[20px] flex items-center justify-between">
            <div className="text-[20px] font-[500] leading-[32px] text-[var(--color-text-1)]">
              API Key管理
            </div>
          </div>

          <Header
            onButtonClick={handleButtonClick}
            onChildQuery={(value) => onChildQuery(value)}
            onChildReset={onChildReset}
            placeholder="搜索API Key"
            rightname="创建API Key"
          ></Header>

          <Spin loading={loading}>
            <Table
              pagination={{
                current: pagination.page,
                pageSize: pagination.limit,
                total: pagination.total
              }}
              onChange={onChangeTable}
              columns={columns}
              data={data}
              scroll={{ x: true }}
              rowKey="id"
            />
          </Spin>
        </div>
      </div>
      <Modal
        title="创建API Key"
        visible={editPublishing}
        onOk={() => submitEditPublishing()}
        onCancel={() => clearEditPublishing()}
        autoFocus={false}
        focusLock={true}
        style={{
          width: 616
        }}
      >
        <Alert
          closable
          type="info"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20
          }}
          content="API Key是用于身份验证的一串唯一代码，允许应用程序或用户访问特定API服务，需保密防泄露。"
        />
        <Form
          className="fromstyle"
          form={form}
          {...formItemLayout}
          onValuesChange={onValuesChange}
          initialValues={initFromValue}
        >
          <Form.Item
            label="描述："
            field="description"
            // wrapperCol={{
            //   span: 12
            // }}
          >
            <Input.TextArea
              showWordLimit
              maxLength={{ length: 100, errorOnly: true }}
              placeholder="API Key是用于身份验证的一串唯一代码，允许应用程序或用户访问特定API服务，需保密防泄露。"
              rows={4}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default observer(ApiKey);
