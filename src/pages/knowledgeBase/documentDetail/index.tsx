import {
  Button,
  Descriptions,
  List,
  Progress,
  Space,
  Switch,
  Tooltip
} from '@arco-design/web-react';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { useQueryParams } from '@/utils';
import {
  delDocument,
  detailDocument,
  detailKnowledge,
  documentEnabled,
  fetchDocIndexingStatus,
  fileDocument
} from '@/api/knowledgeBase';
import { get, last } from 'lodash';
import { useHistory } from 'react-router-dom';
import BreadcrumbCom from '@/components/BreadcrumbCom';
import dayjs from 'dayjs';
import prettyBytes from 'pretty-bytes';
import { formatNumber, formatTime } from '@/utils/format';
import { EditDrawer } from './editDrawer';
import { confirm } from '@ccf2e/arco-material';
import { IconArrowLeft } from '@arco-design/web-react/icon';
import FileIcon from '@/components/file-icon';

import './index.css';

function DocumentDetailPage() {
  const queryParams = useQueryParams();
  const history = useHistory();

  const knowledgeId = queryParams.get('id');
  const documentId = queryParams.get('documentId');
  const [data, setData] = React.useState([]);
  const [documentDetail, setDocumentDetail] = React.useState<any>({});
  const [knowledgeDetail, setKnowledgeDetail] = React.useState<any>({});

  const [hasMore, setHasMore] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const [indexingStatusDetail, setIndexingStatusDetail] = React.useState<any>(
    {}
  );
  const signal = React.useRef(new AbortController());

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
    {
      name: '文档',
      href: `/tenant/compute/appforge/knowledgeDetail?id=${knowledgeId}`
    },
    {
      name: '文档查看'
    }
  ];

  const queryDetail = async () => {
    try {
      const resp = await detailDocument(knowledgeId, documentId);
      setDocumentDetail(resp);
    } catch (err) {
      return;
    }
  };

  const queryKnowledgeDetail = async () => {
    try {
      const resp = await detailKnowledge(knowledgeId);
      setKnowledgeDetail(resp);
    } catch (err) {
      return;
    }
  };

  const getFileDetail = async (params) => {
    try {
      const resp = await fileDocument(knowledgeId, documentId, params);
      const { data, has_more } = resp;
      setData((prev) => prev.concat(...data));
      setHasMore(has_more);
    } catch (err) {}
  };

  const fetchData = (hasMore, data) => {
    const last_id = get(last(data), 'id', '');
    if (hasMore) {
      const params = {
        last_id,
        limit: 10,
        enabled: 'all'
      };
      getFileDetail(params);
    }
  };

  const getIndexingStatus = async (signal) => {
    try {
      const resp = await fetchDocIndexingStatus(
        knowledgeId,
        documentId,
        'indexing-status',
        signal
      );
      setIndexingStatusDetail(resp);
    } catch (err) {
      return;
    }
  };

  const metadataData: any = React.useMemo(() => {
    const name = get(documentDetail, 'name', '--');
    const size = get(documentDetail, 'data_source_info.upload_file.size', 0);
    const created_at = get(documentDetail, 'created_at', '');
    const completed_at = get(documentDetail, 'completed_at', '');
    const data_source_type = get(documentDetail, 'data_source_type', '--');
    const data_source_type_map = {
      upload_file: '文件上传',
      notion: '从 Notion 同步的文档',
      github: '从 Github 同步的代码'
    };
    const data = [
      {
        label: '原始文件名称',
        value: name
      },
      {
        label: '原始文件大小',
        value: prettyBytes(size, {
          maximumFractionDigits: 2,
          binary: true
        })
      },
      {
        label: '上传日期',
        value: created_at
          ? dayjs(created_at * 1000).format('YYYY-MM-DD  HH:mm')
          : '--'
      },
      {
        label: '最后更新日期',
        value: completed_at
          ? dayjs(completed_at * 1000).format('YYYY-MM-DD  HH:mm')
          : '--'
      },
      {
        label: '来源',
        value: data_source_type_map[data_source_type] || '--'
      }
    ];

    return data;
  }, [documentDetail]);

  const technicalData: any = React.useMemo(() => {
    const mode = get(documentDetail, 'dataset_process_rule.mode', false);
    const max_tokens = get(
      documentDetail,
      'dataset_process_rule.rules.segmentation.max_tokens',
      false
    );
    const average_segment_length = get(
      documentDetail,
      'average_segment_length',
      false
    );
    const segment_count = get(documentDetail, 'segment_count', false);
    const hit_count = get(documentDetail, 'hit_count', false);
    const indexing_latency = get(documentDetail, 'indexing_latency', false);
    const tokens = get(documentDetail, 'tokens', false) || 0;

    const data = [
      {
        label: '分段规则',
        value: mode ? (mode === 'automatic' ? '自动' : '手动') : '--'
      },
      {
        label: '段落长度',
        value: max_tokens ? formatNumber(max_tokens) : '--'
      },
      {
        label: '平均段落长度',
        value: average_segment_length
          ? formatNumber(average_segment_length) + ' characters'
          : '0 characters'
      },
      {
        label: '段落数量',
        value: segment_count
          ? formatNumber(segment_count) + ' paragraphs'
          : '0 paragraphs'
      },
      {
        label: '命中次数',
        value:
          segment_count && hit_count
            ? `${!segment_count ? 0 : ((hit_count / segment_count) * 100).toFixed(2)}% (${hit_count}/${segment_count})`
            : '0.00% (0/0)'
      },
      {
        label: '嵌入时间',
        value: indexing_latency ? formatTime(indexing_latency) : '--'
      },
      {
        label: '嵌入花费',
        value: tokens ? formatNumber(tokens) + ' tokens' : '--'
      }
    ];
    return data;
  }, [documentDetail]);

  const isSourceEmbedding: boolean = React.useMemo(() => {
    const indexing_status = get(documentDetail, 'indexing_status', '');
    return ['indexing', 'splitting', 'parsing', 'cleaning', 'waiting'].includes(
      indexing_status
    );
  }, [documentDetail]);

  const isCompleted = React.useMemo(() => {
    return ['completed', 'error'].includes(
      indexingStatusDetail?.indexing_status
    );
  }, [indexingStatusDetail]);

  const handleOperat = async (type, val?) => {
    switch (type) {
      case 'edit':
        setVisible(true);
        break;
      case 'switch':
        try {
          const status = val ? 'status/enable' : 'status/disable';
          await documentEnabled(knowledgeId, documentDetail.id, status);
          await queryDetail();
        } catch (err) {
          return;
        }
        break;
      case 'delete':
        confirm({
          title: '删除',
          tip: '确认删除文档?',
          extra: '删除文档将无法撤销，请谨慎操作！',
          async onOk() {
            try {
              await delDocument(knowledgeId, documentId);
              history.push(
                `/tenant/compute/appforge/knowledgeDetail?id=${knowledgeId}`
              );
            } catch (err) {
              return;
            }
          }
        });
        break;
    }
  };

  const getRuleName = (key: string) => {
    if (key === 'remove_extra_spaces')
      return '替换掉连续的空格、换行符和制表符';
    if (key === 'remove_urls_emails') return '删除所有 URL 和电子邮件地址';

    if (key === 'remove_stopwords')
      return '去除停用词，例如 “a”，“an”，“the” 等';
  };

  const getPercent = (item) => {
    const completedCount = item?.completed_segments || 0;
    const totalCount = item?.total_segments || 0;
    if (totalCount === 0) return 0;
    const percent = Math.round((completedCount * 100) / totalCount);
    return percent > 100 ? 100 : percent;
  };

  React.useEffect(() => {
    const params = {
      limit: 20,
      enabled: 'all'
    };
    getFileDetail(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (isSourceEmbedding) {
      getIndexingStatus(signal.current);
      const loopId = setInterval(() => {
        if (isCompleted) {
          clearInterval(loopId);
          return;
        }
        getIndexingStatus(signal.current);
      }, 2500);
      return () => clearInterval(loopId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSourceEmbedding, isCompleted]);

  React.useEffect(() => {
    knowledgeId && documentId && queryDetail();
    knowledgeId && queryKnowledgeDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [knowledgeId, documentId]);

  React.useEffect(() => {
    isCompleted && queryDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompleted]);

  React.useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      signal.current.abort();
    };
  }, []);

  return (
    <div className="h-full pb-[20px] pr-[20px]">
      <BreadcrumbCom list={breadcrumbList} />
      <div className="flex h-full max-h-[calc(100vh-110px)] flex-col overflow-auto rounded-[12px]">
        <div className="flex items-center justify-between rounded-[12px] bg-white px-[24px] py-[20px]">
          <div className='flex'>
            <div
              className='size-[24px] flex items-center justify-center mr-[8px] cursor-pointer shadow-lg rounded-full'
              onClick={() => history.goBack()}
            >
              <IconArrowLeft className='size-[16px] text-[#1E293B]'/>
            </div>
            <FileIcon filename={get(documentDetail, 'name', '--')} className="size-[22px]"/>
            <div className="text-[18px] font-[500] leading-[28px] text-[var(--color-text-1)]">
              {get(documentDetail, 'name', '--')}
            </div>
          </div>
          <Space>
            <Tooltip content="是否启用">
              <Switch
                checked={documentDetail.enabled}
                onChange={(val) => handleOperat('switch', val)}
              />
            </Tooltip>

            <Button type="secondary" onClick={() => handleOperat('edit')}>
              设置
            </Button>
            <Button type="primary" onClick={() => handleOperat('delete')}>
              删除
            </Button>
          </Space>
        </div>
        <div className="mt-[16px] flex flex-1 justify-between">
          <div className="mr-[20px] max-h-[calc(100vh-200px)] flex-[2] overflow-auto rounded-[12px] bg-white px-[24px] py-[16px] leading-[24px]">
            {!isSourceEmbedding && (
              <>
                <div className="text-[16px] font-[500] text-[var(--color-text-1)]">
                  内容视图
                </div>
                <List
                  className="mt-[16px] max-h-[calc(100vh-280px)] w-full border-none"
                  bordered={false}
                  grid={{
                    md: 24
                  }}
                  onReachBottom={() => fetchData(hasMore, data)}
                  dataSource={data}
                  render={(item, index) => (
                    <List.Item key={index}>
                      <List.Item.Meta
                        description={
                          <div className="px-[16px] py-[10px]">
                            {item.content}
                          </div>
                        }
                        className={`rounded-[12px] ${index % 2 === 0 ? 'bg-[rgb(var(--link-1))]' : 'bg-[rgb(var(--danger-1))]'}`}
                      />
                    </List.Item>
                  )}
                />
              </>
            )}
            {isSourceEmbedding && (
              <>
                <div className="mb-[16px] rounded-[8px] bg-[rgb(var(--primary-1))] px-[36px] py-[16px]">
                  <div className="mt-[32px] text-[14px] font-[500] leading-[22px] text-[var(--color-text-1)]">
                    {isCompleted ? '嵌入已完成' : '嵌入处理中...'}
                  </div>
                  <div>
                    {[indexingStatusDetail].map((item, index) => {
                      return (
                        <div key={index}>
                          <Progress percent={getPercent(item)} />
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-[16px] rounded-[6px] border border-[var(--color-border-2)] bg-white">
                    <div className="border-b border-[var(--color-border-2)] px-[16px] py-[13px]">
                      <span className="inline-block w-[140px] text-[var(--color-text-4)]">
                        预处理文档
                      </span>
                      <span className="text-[var(--color-text-1)]">
                        {get(documentDetail, 'name', '--')}
                      </span>
                    </div>
                    <div className="border-b border-[var(--color-border-2)] px-[16px] py-[13px]">
                      <span className="inline-block w-[140px] text-[var(--color-text-4)]">
                        分段规则
                      </span>
                      <span className="text-[var(--color-text-1)]">
                        {documentDetail?.dataset_process_rule?.mode ===
                        'automatic'
                          ? '自动'
                          : '手动'}
                      </span>
                    </div>
                    <div className="border-b border-[var(--color-border-2)] px-[16px] py-[13px]">
                      <span className="inline-block w-[140px] text-[var(--color-text-4)]">
                        分段长度
                      </span>
                      <span className="text-[var(--color-text-1)]">
                        {get(
                          documentDetail,
                          'dataset_process_rule.rules.segmentation.max_tokens',
                          0
                        )}
                      </span>
                    </div>
                    <div className="px-[16px] py-[13px]">
                      <span className="inline-block w-[140px] text-[var(--color-text-4)]">
                        文本预定义与清洗
                      </span>
                      <span className="text-[var(--color-text-1)]">
                        {documentDetail?.dataset_process_rule?.mode ===
                        'automatic'
                          ? '自动'
                          : documentDetail?.dataset_process_rule?.rules?.pre_processing_rules
                              ?.map((rule) => {
                                if (rule.enabled) return getRuleName(rule.id);
                              })
                              .filter(Boolean)
                              .join('；')}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="max-h-[calc(100vh-200px)] flex-[1] overflow-auto rounded-[12px] bg-white px-[24px] py-[16px] leading-[24px]">
            <div className="text-[16px] font-[500] text-[var(--color-text-1)]">
              元数据
            </div>
            <div className="font-[500] text-[var(--color-text-4)]">
              标记文档的元数据允许
            </div>
            <Descriptions
              border
              column={1}
              data={metadataData}
              className="mb-[20px] mt-[8px]"
            />
            <div className="text-[16px] font-[500] text-[var(--color-text-1)]">
              技术参数
            </div>
            <Descriptions
              border
              column={1}
              data={technicalData}
              className="mb-[20px] mt-[8px]"
            />
          </div>
        </div>
      </div>

      {visible && (
        <EditDrawer
          record={documentDetail}
          visible={visible}
          setVisible={setVisible}
          submit={() => {
            setIndexingStatusDetail({});
            queryKnowledgeDetail();
            queryDetail();
          }}
          knowledgeDetail={knowledgeDetail}
        />
      )}
    </div>
  );
}

export default observer(DocumentDetailPage);
