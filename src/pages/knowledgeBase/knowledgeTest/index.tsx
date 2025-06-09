import {
  Button,
  Checkbox,
  Empty,
  Grid,
  Input,
  Progress,
  Space,
  Switch,
  Table,
  Typography
} from '@arco-design/web-react';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { useQueryParams } from '@/utils';
import {
  detailKnowledge,
  fetchTestingRecords,
  hitTesting
} from '@/api/knowledgeBase';
import { get, uniqWith } from 'lodash';
import BreadcrumbCom from '@/components/BreadcrumbCom';
import './index.css';
import { EditDrawer } from '../components/editDrawer';
import HitTestIcon from '@/assets/hittest.svg';
import FilePreviewImg from '@/assets/file-snapshot.png';
import dayjs from 'dayjs';
import EllipsisPopover from '@/components/EllipsisPopoverCom';
import { useHistory } from 'react-router-dom';
import FileIcon from '@/components/file-icon';

function KnowledgeDetailPage() {
  const queryParams = useQueryParams();
  const history = useHistory();
  const knowledgeId = queryParams.get('id');
  const [knowledgeDetail, setKnowledgeDetail] = React.useState<any>({});
  const [visible, setVisible] = React.useState(false);
  const [text, setText] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [recordsData, setRecordsData] = React.useState([]);
  const [hitTestingData, setHitTesting] = React.useState([]);
  // const [hitTestingContent, setHitTestingContent] = React.useState('');
  const [hitTestingLoading, setHitTestingLoading] = React.useState(false);
  const signal = React.useRef(new AbortController());

  const histTestingFiles = React.useMemo(() => {
    return uniqWith(hitTestingData.map(d => get(d, 'segment.document.name', '')))
  }, [hitTestingData])

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

  // const sourceDataMap = {
  //   hit_testing: '命中测试'
  // };

  const columns: any = [
    {
      title: '数据源',
      dataIndex: 'source',
      width: 120,
      render: (col, record) => {
        return <>{record.source}</>;
      }
    },
    {
      title: '文本',
      dataIndex: 'content',
      width: 200,
      render: (col, record) => {
        return (
          <>
            <EllipsisPopover
              value={record.content}
              isEdit={false}
              preferTypography
            />
          </>
        );
      }
    },

    {
      title: '时间',
      dataIndex: 'created_at',
      width: 200,
      render: (col) => !!col && dayjs(col * 1000).format('YYYY-MM-DD  HH:mm:ss')
    }
  ];

  const handleOperat = async (type) => {
    switch (type) {
      case 'edit':
        setVisible(true);
        break;
      case 'add':
        history.push(`/tenant/compute/appforge/addDocument?id=${knowledgeId}`);
        break;
      case 'test':
        await queryHitTesting(signal.current);
        break;
    }
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

  const queryHitTesting = async (signal, queryText?) => {
    try {
      setHitTestingLoading(true);
      // setHitTestingContent(text);
      const params = {
        query: text || queryText,
        retrieval_model: knowledgeDetail.retrieval_model_dict
      };
      const resp = await hitTesting(knowledgeId, params, signal);
      const { records } = resp;
      setHitTesting(records || []);
    } catch (err) {
      return;
    } finally {
      setHitTestingLoading(false);
    }
  };

  const getTestingRecords = async (params) => {
    try {
      setLoading(true);
      const resp = await fetchTestingRecords(knowledgeId, params);
      const { data = [], total = 0 } = resp;
      setRecordsData(data || []);
      setPagination({
        ...pagination,
        total: total || 0
      });
    } catch (err) {
      setRecordsData([]);
      setPagination({
        ...pagination,
        total: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const cardContent = (item, index) => {
    const num = parseFloat((get(item, 'score', 0) || 0).toFixed(2));
    return (
      <Grid.GridItem key={index}>
        <div className="rounded-[8px] bg-[var(--color-bg-3)] p-[12px]">
          <Progress percent={num * 100} formatText={() => num} />
          <Typography.Paragraph ellipsis={{ rows: 4 }}>
            {get(item, 'segment.content', '')}
          </Typography.Paragraph>
          <div>{get(item, 'segment.document.name', '')}</div>
        </div>
      </Grid.GridItem>
    );
  };

  const cardContentPreview = (item, index) => {
    const num = parseFloat((get(item, 'score', 0) || 0).toFixed(2));
    return (
      <Grid.GridItem key={index}>
        <div className='preview-segment-content flex gap-x-[16px] rounded-[8px] p-[8px] bg-[var(--color-bg-3)]'>
          <div className='preview-part'>
            <img src={FilePreviewImg} />
          </div>
          <div className="content-part rounded-[8px] p-[12px]">
            <div className='flex items-center gap-x-[8px]'>
              <HitTestIcon className='size-[16px]'/>
              <Progress percent={num * 100} formatText={() => num} />
              <Switch />
            </div>
            <Typography.Paragraph ellipsis={{ rows: 4 }} style={{flex:1,fontSize:'14px',lineHeight:'22px',color:'#1E293B'}}>
              {get(item, 'segment.content', '')}
            </Typography.Paragraph>
            <div className='flex gap-x-[8px] items-center text-[#1E293B]'>
              <FileIcon name={get(item, 'segment.document.name', '')} className="size-[16px]"/>
              {get(item, 'segment.document.name', '')}
            </div>
          </div>
        </div>
      </Grid.GridItem>
    );
  };

  React.useEffect(() => {
    getTestingRecords({ ...query });
    const loopId = setInterval(() => {
      getTestingRecords({ ...query });
    }, 30000);
    return () => {
      clearInterval(loopId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  React.useEffect(() => {
    knowledgeId && queryDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [knowledgeId]);

  React.useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      signal.current.abort();
    };
  }, []);

  return (
    <div className="h-full pb-[20px] pr-[20px] kb-test-page">
      <BreadcrumbCom list={breadcrumbList} />
      <div className="flex h-full max-h-[calc(100vh-110px)] flex-col overflow-auto rounded-[12px]">
        <div className="flex items-center justify-between rounded-[12px] bg-white px-[24px] py-[20px]">
          <div className="text-[18px] font-[500] leading-[28px] text-[var(--color-text-1)]">
            {get(knowledgeDetail, 'name', '--')}
          </div>
          <Space>
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
        <div className="mt-[16px] flex flex-1 justify-between">
          <div className="max-h-[calc(100vh-198px)] w-[calc(50%-10px)] overflow-auto rounded-[12px] bg-white px-[24px] py-[16px] leading-[24px]">
            <div className="text-[16px] font-[500] text-[var(--color-text-1)]">
              命中测试
            </div>
            <div className="font-[500] text-[var(--color-text-4)]">
              基于给定的查询文本测试知识库的命中效果。
            </div>
            <div className="mt-[12px] flex items-center justify-between text-[14px] font-[500] text-[var(--color-text-1)]">
              <span>源文本</span>
              <Button
                disabled={!text}
                loading={hitTestingLoading}
                type="secondary"
                onClick={() => handleOperat('test')}
              >
                测试
              </Button>
            </div>
            <Input.TextArea
              value={text}
              className="mt-[8px]"
              maxLength={255}
              autoSize={{
                minRows: 6,
                maxRows: 6
              }}
              showWordLimit
              placeholder="请输入文本，建议使用简短的陈述句。"
              onChange={setText}
            />
            <div className="mt-[16px] text-[16px] font-[500] text-[var(--color-text-1)]">
              最近查询
            </div>

            {!!recordsData.length && (
              <Table
                className="mt-[8px]"
                loading={loading}
                scroll={{ x: true }}
                columns={columns}
                rowKey="id"
                data={recordsData}
                pagination={pagination}
                onChange={onChangeTable}
                noDataElement={<>最近无查询结果</>}
                rowClassName={() => "cursor-pointer"}
                onRow={(record) => {
                  return {
                    onClick: () => {
                      setText(record.content);
                      queryHitTesting(signal.current, record.content)
                    }
                  };
                }}
              />
            )}

            {!recordsData.length && (
              <Empty description="最近无查询结果" icon={<></>} />
            )}
          </div>

          <div className="max-h-[calc(100vh-198px)] w-[calc(50%-10px)] overflow-auto rounded-[12px] bg-white px-[24px] py-[16px] leading-[24px]">
            <div className="text-[16px] font-[500] text-[var(--color-text-1)]">
              命中文件&段落
            </div>
            <div className="font-[500] text-[var(--color-text-4)]">
              文件命中的段落
            </div>
            {!!hitTestingData.length &&
              <div className='files-section'>
                { histTestingFiles.map(f => 
                  <div className='file-item' key={f}>
                    <Checkbox />
                    <FileIcon name={f} className="ml-[12px] mr-[4px] size-[16px]"/>
                    <span className='file-name'>{f}</span>
                  </div>
                )}
              </div>
            }
            <Grid
              cols={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 1 }}
              colGap={16}
              rowGap={16}
              className="mb-[20px] mt-[12px]"
            >
              {!!hitTestingData.length &&
                hitTestingData.map((item, index) => {
                  return cardContentPreview(item, index);
                })}
            </Grid>

            {!hitTestingData.length && (
              <Empty description="召回测试结果将展示在这里" icon={<></>} />
            )}
          </div>
        </div>
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
