import {
  Button,
  Space,
  Link,
  Message,
  Switch,
  Descriptions
} from '@arco-design/web-react';
import { IconRefresh } from '@arco-design/web-react/icon';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { useQueryParams } from '@/utils';
import { useHistory } from 'react-router-dom';
import {
  detailKnowledge,
  getDocumentsList,
  documentEnabled,
  delDocument
} from '@/api/knowledgeBase';
import { SearchBox, Table, confirm } from '@ccf2e/arco-material';
import dayjs from 'dayjs';
import EllipsisPopover from '@/components/EllipsisPopoverCom';
import { get } from 'lodash';
import BreadcrumbCom from '@/components/BreadcrumbCom';
import './index.css';
import { EditDrawer } from '../components/editDrawer';
import { formatNumber } from '@/utils/format';

function KnowledgeDetailPage() {
  const queryParams = useQueryParams();
  const history = useHistory();
  const knowledgeId = queryParams.get('id');
  const [knowledgeDetail, setKnowledgeDetail] = React.useState<any>({});

  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [searchResult, setSearchResult] = React.useState({});
  const [visible, setVisible] = React.useState(false);

  const breadcrumbList = [
    {
      name: 'AppForge'
    },
    {
      name: '个人空间'
    },
    {
      name: '知识库',
      href: '/tenant/compute/appforge/knowledgeBase'
    },
    { name: '文档' }
  ];

  const [pagination, setPagination] = React.useState({
    sizeCanChange: true,
    showTotal: true,
    total: 0,
    pageSize: 10,
    sizeOptions: [10, 20, 30, 40, 50],
    current: 1,
    pageSizeChangeResetCurrent: true
  });

  const [query, setQuery] = React.useState<any>({
    page: pagination.current,
    limit: pagination.pageSize
  });

  const statusMap = {
    queuing: '排队中',
    indexing: '索引中',
    paused: '已暂停',
    error: '错误',
    available: '可用',
    enabled: '已启用',
    disabled: '已禁用',
    archived: '已归档'
  };

  const searchConfig: any = [
    {
      key: 'name',
      label: '文档名称',
      type: 'input',
      placeholder: '请输入文档名称以模糊查询'
    }
  ];

  const baseData: any = React.useMemo(() => {
    const word_count = get(knowledgeDetail, 'word_count', 0);
    const data = [
      {
        label: '文件数',
        value: get(knowledgeDetail, 'document_count', 0)
      },
      {
        label: '知识库大小',
        value:
          word_count > 1000
            ? `${formatNumber((word_count / 1000).toFixed(1))}k`
            : word_count
      },
      {
        label: '关联应用',
        value: get(knowledgeDetail, 'app_count', 0)
      }
    ];
    return data;
  }, [knowledgeDetail]);

  const columns: any = [
    {
      title: '文档名称',
      dataIndex: 'name',
      width: 350,
      render: (col, record) => {
        return (
          <>
            <EllipsisPopover value={record.name} isEdit={false} />
            <EllipsisPopover
              value={record.id}
              isEdit={false}
              isLink={true}
              handleLink={() => {
                if (!record.id) return;
                history.push(
                  `/tenant/compute/appforge/documentDetail?id=${knowledgeId}&documentId=${record.id}`
                );
              }}
            />
          </>
        );
      }
    },
    {
      title: `字符数`,
      dataIndex: 'word_count',
      width: 200,
      render: (col, record) => {
        if (!record.word_count) return '--';
        if (record.word_count < 1000) return record.word_count;
        return `${formatNumber((record.word_count / 1000).toFixed(1))}k`;
      }
    },
    {
      title: '状态',
      dataIndex: 'archived',
      width: 140,
      render: (col, record) => {
        return <>{statusMap[record.display_status] || '--'}</>;
      }
    },
    {
      title: '上传时间',
      dataIndex: 'created_at',
      width: 200,
      render: (col) => !!col && dayjs(col * 1000).format('YYYY-MM-DD  HH:mm:ss')
    },

    {
      title: '是否启用',
      dataIndex: 'enabled',
      width: 140,
      render: (col, record) => {
        return (
          <>
            <Switch
              checked={record.enabled}
              onChange={(val) => handleOperat('switch', record, val)}
            />
          </>
        );
      }
    },

    {
      title: '操作',
      dataIndex: 'operation',
      align: 'right',
      fixed: 'right',
      width: 140,
      render: (col, record) => {
        return (
          <Space>
            <Link onClick={() => handleOperat('test', record)}>命中测试</Link>
            <Link onClick={() => handleOperat('detail', record)}>查看</Link>
            <Link onClick={() => handleOperat('delete', record)}>删除</Link>
          </Space>
        );
      }
    }
  ];

  const handleOperat = async (type, record?, val?) => {
    switch (type) {
      case 'edit':
        setVisible(true);
        break;
      case 'delete':
        confirm({
          title: '删除',
          tip: '确认删除文档?',
          extra: '删除文档将无法撤销，请谨慎操作！',
          async onOk() {
            try {
              await delDocument(knowledgeId, record.id);
              Message.success('删除文档成功');
              queryDocumentList({ ...query });
            } catch (err) {
              return;
            }
          }
        });
        break;
      case 'switch':
        try {
          const status = val ? 'status/enable' : 'status/disable';
          await documentEnabled(knowledgeId, record.id, status);
          await queryDocumentList({ ...query });
        } catch (err) {
          return;
        }
        break;
      case 'add':
        history.push(`/tenant/compute/appforge/addDocument?id=${knowledgeId}`);
        break;
      case 'test':
        history.push(`/tenant/compute/appforge/knowledgeTest?id=${knowledgeId}&documentId=${record.id}`);
        break;
      case 'detail':
        history.push(
          `/tenant/compute/appforge/documentDetail?id=${knowledgeId}&documentId=${record.id}`
        );
        break;
    }
  };

  // 查询处理
  const onSearch = (val: any) => {
    if (Object.hasOwn(val, 'name')) {
    }

    setPagination({
      ...pagination,
      current: 1
    });
    const param = {
      ...query,
      page: 1
    };
    setQuery({ ...param });
    setSearchResult(val);
  };

  // 切换页码
  const onChangeTable = (pagination, sorter: any, filters, extra) => {
    if (extra.action === 'paginate') {
      const { current, pageSize } = pagination;
      setPagination((page) => ({
        ...page,
        pageSize,
        current: current
      }));
      setQuery({
        ...query,
        page: current,
        limit: pageSize
      });
    }
  };

  const queryDetail = async () => {
    try {
      const resp = await detailKnowledge(knowledgeId);
      setKnowledgeDetail(resp);
    } catch (err) {
      return;
    }
  };

  const queryDocumentList = async (params) => {
    try {
      setLoading(true);
      const resp = await getDocumentsList(knowledgeId, params);
      const { data = [], total = 0 } = resp;
      setData(data || []);
      setPagination({
        ...pagination,
        total: total || 0
      });
    } catch (err) {
      setData([]);
      setPagination({
        ...pagination,
        total: 0
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    knowledgeId && queryDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [knowledgeId]);

  React.useEffect(() => {
    knowledgeId && queryDocumentList({ ...query });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [knowledgeId, query]);

  return (
    <div className="h-full pb-[20px] pr-[20px] kb-detail-page">
      <BreadcrumbCom list={breadcrumbList} />
      <div className="h-full max-h-[calc(100vh-110px)] overflow-auto rounded-[12px] bg-white px-[24px] py-[20px]">
        <div className="mb-[20px] flex items-center justify-between">
          <div className="text-[18px] font-[500] leading-[28px] text-[var(--color-text-1)]">
            {get(knowledgeDetail, 'name', '--')}
          </div>
          <Space>
            <div className='tag-visible'>部门可见</div>
            <Button
              type="secondary"
              disabled={!get(knowledgeDetail, 'name', false)}
              onClick={() => handleOperat('edit')}
            >
              设置
            </Button>
            <Button
              type="primary"
              disabled={!get(knowledgeDetail, 'name', false)}
              onClick={() => handleOperat('add')}
            >
              添加文件
            </Button>
          </Space>
        </div>
        <div className="mb-[24px]">
          <div className="mb-[8px] text-[14px] font-[500] leading-[24px]">
            基本信息
          </div>
          <Descriptions
            column={3}
            data={baseData}
            colon=" :"
            layout="inline-horizontal"
            className="mb-[20px] mt-[8px]"
          />
        </div>
        <div className="mb-[20px] flex justify-between">
          <SearchBox
            className="pb-[0px]"
            searchResult={searchResult}
            searchConfig={searchConfig}
            onSearch={onSearch}
          />
          <Space>
            <Button
              type="outline"
              icon={<IconRefresh />}
              onClick={() => queryDocumentList({ ...query })}
            />
          </Space>
        </div>

        <Table
          loading={loading}
          scroll={{ x: true }}
          columns={columns}
          rowKey="id"
          data={data}
          pagination={pagination}
          border={false}
          onChange={onChangeTable}
        />
      </div>

      {visible && (
        <EditDrawer
          record={knowledgeDetail}
          visible={visible}
          setVisible={setVisible}
          submit={() => queryDetail()}
        />
      )}
    </div>
  );
}

export default observer(KnowledgeDetailPage);
