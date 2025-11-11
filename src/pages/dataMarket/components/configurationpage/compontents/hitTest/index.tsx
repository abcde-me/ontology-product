import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './index.module.scss';
import {
  IconDriveFile,
  IconMindMapping,
  IconSettings,
  IconStorage
} from '@arco-design/web-react/icon';
import {
  Button,
  Input,
  Message,
  Modal,
  Radio,
  Tooltip
} from '@arco-design/web-react';
import { Table } from '@ccf2e/arco-material';
import { format } from 'date-fns';
import PolicyForm from '@/components/policy-from/index';
import {
  getHitRecord,
  postHitTest,
  putknowledgeBaseList
} from '@/api/datasetsV2';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import brother from '../brother';
import MarkdownBase from '@/components/markdownBase';
import NoDataEmpty from '@/components/NoDataEmpty';
import TagContent from '../tagContent';
import SegmentDrawer from '@/pages/ragDetail/components/drawers/SegmentDrawer';
import { useRagDetailStore } from '@/pages/ragDetail/store/ragDetailStore';

function PageContentFalse(props) {
  const { detailsdata, onInit } = props;
  const { id } = detailsdata || {};
  const { segmentDrawerTab, segmentDrawerSegmentId, segments } =
    useRagDetailStore();
  const RadioGroup = Radio.Group;
  const InputSearch = Input.Search;
  const TextArea = Input.TextArea;
  const childRef: any = useRef();
  const [editPolicy, seteditPolicy] = useState(false);
  const [text, setText] = useState('');
  const [fromdata, setfromdata] = useState<any>({});
  const [showDrawer, setShowDrawer] = useState(false);
  const [defaultTab, setDefaultTab] = useState(segmentDrawerTab);
  const [recordList, setRecordList] = useState<any>([
    {
      id: 1,
      query: '蜂巢工厂',
      dataset_query_results: [],
      retrieval_model: {
        search_method: 'hybrid_search',
        reranking_enable: true,
        reranking_model: {
          reranking_provider_name: '智源',
          reranking_model_name: 'bge-rerank-base'
        },
        top_k: 6,
        weights: 0.6,
        score_threshold_enabled: true,
        score_threshold: 0.6
      },
      created_at: '2025-09-29T17:19:10.131+08:00'
    },
    {
      id: 2,
      query: '蜂巢工厂',
      dataset_query_results: [],
      retrieval_model: {
        search_method: 'hybrid_search',
        reranking_enable: true,
        reranking_model: {
          reranking_provider_name: '智源',
          reranking_model_name: 'bge-rerank-base'
        },
        top_k: 6,
        weights: 0.6,
        score_threshold_enabled: true,
        score_threshold: 0.6
      },
      created_at: '2025-09-29T17:18:58.506+08:00'
    }
  ]);
  const [segmentationlist, setsegmentationlist] = useState([
    {
      chunk_id: 'segment-ac91be00-d773-45be-add0-89b423975605',
      document_id: 'document-fb5ccf73-232c-4714-933e-e22e4eed4d5c',
      document_name: '工作簿8.xlsx',
      dataset_id: 'dataset-d9e0699d-d99d-44d3-98d0-142faee124b9',
      content:
        '{"企业全称":"中国经济信息社有限公司","简称或别名":"中国经济信息社.CIN.中国经济信息中心.中国经信社.经济信息社.中国经信","company_id":"58037e49939bef870af94d2402afdf03","股票代码":"（非上市企业）"}',
      content_shot:
        '{"企业全称":"中国经济信息社有限公司","简称或别名":"中国经济信息社.CIN.中国经济信息中心.中国经信社.经济信息社.中国经信","company_id":"58037e49939bef870af94d2402afdf03","股票代码":"（非上市企业）"}',
      score: 0.17382812,
      bbox: {},
      extra_expr: ''
    },
    {
      chunk_id: 'segment-5d5016a7-7a57-47e5-8e5f-81a6022320f3',
      document_id: 'document-fb5ccf73-232c-4714-933e-e22e4eed4d5c',
      document_name: '工作簿8.xlsx',
      dataset_id: 'dataset-d9e0699d-d99d-44d3-98d0-142faee124b9',
      content:
        '{"企业全称":"中电云计算技术有限","简称或别名":"CEC·中电云·中电云技术·中电云技术有限公司·中电云计算·中电云计算技术公司","company_id":"8e4dc3b4413990fe30556bc9b9b79f34","股票代码":"（非上市企业）"}',
      content_shot:
        '{"企业全称":"中电云计算技术有限","简称或别名":"CEC·中电云·中电云技术·中电云技术有限公司·中电云计算·中电云计算技术公司","company_id":"8e4dc3b4413990fe30556bc9b9b79f34","股票代码":"（非上市企业）"}',
      score: 0.14648438,
      bbox: {},
      extra_expr: ''
    }
  ]);
  const [segmentationlistFilter, setsegmentationlistFilter] = useState([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(0); // 默认选中第一行
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [editChildVisible, seteditChildVisible] = useState(false);
  const [value, setValue] = useState('');
  const [pagination, setPagination] = useState<any>({
    page: 1, // 当前页码
    limit: 10 // 每页显示的数据条数
  });
  brother.on('editFuncFrom', () => {
    seteditChildVisible(true);
  });
  // 获取当前打开 drawer 的分段信息
  const currentSegment = segments.find(
    (seg) => seg.id === segmentDrawerSegmentId
  );
  const mocktest = {
    reordering: true,
    retrievalV: 'hybrid_search',
    scoreSwitch: true,
    scoreValue: 0.6,
    topK: 6,
    weightSettings: 0.6
  };
  const submitEditeditPolicy = () => {
    childRef.current.submitEditeditPolicy();
  };
  const clearEditeditPolicy = () => {
    childRef.current.clearEditeditPolicy();
    seteditPolicy(false);
  };
  useEffect(() => {
    init({ ...pagination });
  }, [id]);
  useEffect(() => {
    if (recordList.length > 0) {
      // setsegmentationlist(recordList[0].dataset_query_results || []);
      setsegmentationlistFilter(recordList[0].dataset_query_results || []);
    }
  }, [recordList]);
  const init = async (params) => {
    if (!id) return;
    try {
      setLoading2(true);
      const documentList = await getHitRecord(id, params);
      const { data: dataList = [], total = '' } = documentList.data;
      setRecordList(dataList || []);
      setPagination((prevPagination) => ({
        ...prevPagination,
        total: total
      }));
      setLoading2(false);
    } catch {}
  };
  const oncEditPolicy = () => {
    seteditPolicy(true);
  };
  const recordColumns: any = [
    {
      title: `测试内容`,
      dataIndex: 'query',
      render: (query, record) => (
        <EllipsisPopover
          value={query}
          isEdit={false}
          preferTypography
          className="ml-[16px]"
        />
      )
    },
    {
      title: `更新时间`,
      dataIndex: 'created_at',
      width: 182,
      render(i, app) {
        const date = new Date(i);
        const formattedDate = format(date, 'YYYY-MM-DD HH:mm:ss');

        return formattedDate;
      }
    }
  ];
  const FuncChildFrom = (e) => {
    setfromdata(e);
  };
  const Functest = async () => {
    try {
      let datatp: any = {};
      if (Object.keys(fromdata).length === 0) {
        datatp = mocktest;
      } else {
        datatp = fromdata;
      }
      const params = {
        query: text,
        retrieval_model: {
          search_method: datatp.retrievalV, //      semantic_search（语义检索） full_text_search（全文检索） hybrid_search（混合检索）
          reranking_enable: datatp.reordering,
          reranking_model: {
            // rerank 模型设置
            reranking_provider_name: '',
            reranking_model_name: ''
          },
          top_k: datatp.topK, // 召回topk
          weights: datatp.weightSettings,
          score_threshold_enabled: datatp.scoreSwitch,
          score_threshold: datatp.scoreValue, // 匹配分
          tag_mode: datatp.tag_mode //  doc_tag（文档标签） segment_tag（分段标签）
        }
      };
      setLoading1(true);
      await postHitTest(id, params);
      init({
        ...pagination,
        page: 1
      });
      setLoading1(false);
    } catch {
      setLoading1(false);
    }
  };
  const onChangeTable = (value) => {
    setPagination((prevPagination) => ({
      ...prevPagination,
      page: value.current,
      limit: value.pageSize
    }));
    init({
      ...pagination,
      page: value.current,
      limit: value.pageSize
    });
  };
  const onRowClick = (record: any, index: number) => {
    setSelectedRowIndex(index); // 设置选中的行
    setText(record.query);
    // setsegmentationlist(record.dataset_query_results || []);

    setsegmentationlistFilter(recordList[index].dataset_query_results || []);
  };
  const rowClassName = (record: any, index: number) => {
    // 如果是选中的行，给该行添加浅蓝色的背景
    return index === selectedRowIndex ? styles.selectedRowMz : '';
  };
  const handleSearch = () => {
    const filterlist = value
      ? segmentationlistFilter.filter((e: { content_shot: string }) =>
          e.content_shot.includes(value)
        )
      : segmentationlistFilter;

    setsegmentationlist(filterlist);
  };
  const submitEditChild = () => {
    childRef.current.submitEditFromOnc();
  };
  const clearEditChild = () => {
    childRef.current.clearEditFromOnc();
  };
  const FuncEdit = async (e) => {
    try {
      const params = {
        name: e.name,
        description: e.description,
        datasetContentId: e.selectedOptionV[e.selectedOptionV.length - 1]
      };
      await putknowledgeBaseList(id, params);
      onInit();
      Message.success(`编辑成功`);
    } catch {
      Message.error(`编辑失败`);
    }
  };
  const onChangeSup = useCallback((con: string) => {
    console.log(con);
  }, []);
  return (
    <div className={styles.PageContentFalse}>
      <div className={styles.leftList}>
        <div className={styles.testHeader}>
          <span className={styles.one}>测试内容</span>
          {/* <span className={styles.two}>根据给定的查询文本测试知识的召回效果。</span> */}
        </div>
        <div className={styles.testContent}>
          <div className={styles.testContentText}>
            <TextArea
              className={styles.inputBox}
              placeholder="请输入文本进行召回测试"
              value={text}
              autoSize={{ minRows: 13 }}
              allowClear
              maxLength={2000}
              onChange={(value) => setText(value)} // 更新状态
            ></TextArea>
          </div>
        </div>

        <div className={styles.testContentButton}>
          {!text ? (
            <Tooltip position="top" trigger="hover" content="请先输入测试文本">
              <Button
                loading={loading1}
                className={styles.cs}
                type="primary"
                disabled={!text}
                onClick={Functest}
              >
                开始测试
              </Button>
            </Tooltip>
          ) : (
            <Button
              loading={loading1}
              className={styles.cs}
              type="primary"
              onClick={Functest}
            >
              开始测试
            </Button>
          )}
          <Button
            className={styles.cl}
            type="outline"
            icon={<IconSettings />}
            onClick={oncEditPolicy}
          >
            检索设置
          </Button>
        </div>
        <div className={styles.historyHeader}>历史记录</div>
        <div className={styles.historyContent}>
          {recordList.length === 0 ? (
            <NoDataEmpty />
          ) : (
            <Table
              loading={loading2}
              pagination={{
                current: pagination.page,
                pageSize: pagination.limit,
                total: pagination.total
              }}
              onChange={onChangeTable}
              columns={recordColumns}
              data={recordList}
              scroll={{ x: true }}
              rowKey="id"
              rowClassName={rowClassName} // 设置行的样式
              onRow={(record: any, index) => {
                return {
                  onClick: () => onRowClick(record, index)
                };
              }}
            />
          )}
        </div>
      </div>
      <div className={styles.rightContent}>
        <div className={styles.rightContentHit}>
          <div className={styles.rightContentHeader}>
            <div className={styles.headerLeft}>
              命中结果 ({segmentationlist.length})
            </div>
            {/* <div className={styles.headerRight}>
              <InputSearch
                className={styles.inp}
                onSearch={handleSearch}
                value={value}
                onChange={(value: string, e) => setValue(value)}
                allowClear
                placeholder="搜索分段"
              />
            </div> */}
          </div>

          <div className={styles.rightContentScoll}>
            {/* <Empty /> */}
            {segmentationlist.length > 0 ? (
              segmentationlist.map((e: any, index) => {
                return (
                  <div key={index} className={styles.segmentationBox}>
                    <div className={styles.segmentationHeader}>
                      <div className={styles.sr}>
                        <div className={styles.srt}>
                          分值：{e.score.toFixed(2)}
                        </div>
                        <span className="ml-[8px] text-[12px] leading-5">
                          字符数：{e.content_shot.length}
                        </span>
                      </div>
                      <div className={styles.operateBtn}>
                        <Button
                          type="outline"
                          icon={<IconStorage />}
                          onClick={() => {
                            setShowDrawer(true);
                            setDefaultTab('detail');
                          }}
                        >
                          分段详情
                        </Button>
                        <Button
                          type="outline"
                          icon={<IconMindMapping />}
                          onClick={() => {
                            setShowDrawer(true);
                            setDefaultTab('trace');
                          }}
                        >
                          溯源日志
                        </Button>
                      </div>
                    </div>
                    <div className={styles.segmentationContent}>
                      <MarkdownBase
                        content={e.content_shot}
                        onChangeSup={onChangeSup}
                      ></MarkdownBase>
                    </div>
                    <div className={styles.sl}>
                      <span>
                        <IconDriveFile />
                      </span>
                      <Tooltip content={e.document_name}>
                        <span className={styles.nm}>{e.document_name}</span>
                      </Tooltip>
                      {/* <span className={styles.sp}>
                          分段数：{index + 1}/{segmentationlist.length}
                        </span> */}
                      <div className="ml-2 w-[220px]">
                        <TagContent tagList={e.tags} />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <NoDataEmpty />
            )}
          </div>
        </div>
      </div>
      <Modal
        title="策略配置"
        visible={editPolicy}
        onOk={() => submitEditeditPolicy()}
        onCancel={() => clearEditeditPolicy()}
        autoFocus={false}
        focusLock={true}
        style={{
          width: 800
        }}
      >
        <PolicyForm
          FuncChildFrom={FuncChildFrom}
          ref={childRef}
          seteditPolicy={seteditPolicy}
        ></PolicyForm>
      </Modal>
      <SegmentDrawer
        visible={showDrawer}
        onClose={() => setShowDrawer(false)}
        defaultActiveTab={defaultTab}
        currentSegmentIndex={currentSegment?.segmentIndex}
        totalSegments={segments.length}
      />
    </div>
  );
}
export default PageContentFalse;
