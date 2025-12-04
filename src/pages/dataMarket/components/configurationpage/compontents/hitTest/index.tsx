import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './index.module.scss';
import { IconMindMapping, IconSettings } from '@arco-design/web-react/icon';
import { Button, Input, Message, Modal, Tooltip } from '@arco-design/web-react';
import { Table } from '@ccf2e/arco-material';
import { format } from 'date-fns';
import PolicyForm from '@/components/policy-from/index';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import brother from '../brother';
import MarkdownBase from '@/components/markdownBase';
import NoDataEmpty from '@/components/no-data';
import TagContent from '../tagContent';
import SegmentDrawer from '@/pages/ragDetail/components/drawers/SegmentDrawer';
import { useRagDetailStore } from '@/pages/ragDetail/store/ragDetailStore';
import CopyNormalIconSvg from '@/assets/rag/copy-normal.svg';
import CopyHighIconSvg from '@/assets/rag/copy-high.svg';
import JumpToHighIconSvg from '@/assets/rag/jump-to-high.svg';
import JumpToNormalIconSvg from '@/assets/rag/jump-to-normal.svg';
import SegmentDetailsIconSvg from '@/assets/rag/segment-details.svg';
import ImageModal from '@/pages/ragDetail/components/common/ImageModal';
import copy from 'copy-to-clipboard';
import {
  RunKnowledgeHitTesting,
  ListKnowledgeHitTestingRecords,
  getKnowledgeDocument
} from '@/api/modules/rag';
import { useHistory, useParams } from 'react-router-dom';
import { useUserInfo } from '@/store/userInfoStore';
import getFileIcon from '@/components/file-icon';
import { PermissionWrapper } from '@/components/PermissionGuard';
import { DATA_MANAGEMENT_PERMISSIONS } from '@/config/permissions';

function HitTest(props: { datasetName: string }) {
  const { datasetName } = props;
  const history = useHistory();
  const { id } = useParams<{ id: string }>(); //数据集id
  const { segmentDrawerTab } = useRagDetailStore();
  const userInfo = useUserInfo();
  const TextArea = Input.TextArea;
  const childRef: any = useRef();
  const [editPolicy, seteditPolicy] = useState(false);
  const [text, setText] = useState('');
  const [fromdata, setfromdata] = useState<any>({});
  const [showDrawer, setShowDrawer] = useState(false);
  const [defaultTab, setDefaultTab] = useState(segmentDrawerTab);
  const [chunkId, setChunkId] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [hoveredCopyButton, setHoveredCopyButton] = useState<boolean>(false);
  const [hoveredCopyResult, setHoveredCopyResult] = useState<number | null>(
    null
  );
  const [hoveredJumpResult, setHoveredJumpResult] = useState<number | null>(
    null
  );
  const [recordList, setRecordList] = useState<any>([]);
  const [segmentationlist, setsegmentationlist] = useState([]);
  const [segmentationlistFilter, setsegmentationlistFilter] = useState([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(0); // 默认选中第一行
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [editChildVisible, seteditChildVisible] = useState(false);
  const [value, setValue] = useState('');
  const [segmentList, setSegmentList] = useState([]);
  const [pagination, setPagination] = useState<any>({
    page: 1, // 当前页码
    limit: 10 // 每页显示的数据条数
  });
  const hasTriggered = useRef(false);
  brother.on('editFuncFrom', () => {
    seteditChildVisible(true);
  });

  const mocktest = {
    reranking_enable: false,
    search_method: 'Vector',
    score_threshold_enabled: true,
    score_threshold: 0.1,
    top_k: 5,
    weights: 0
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
    if (recordList.length > 0 && !hasTriggered.current) {
      setsegmentationlist(recordList[0].retrieve_datas || []);
      setsegmentationlistFilter(recordList[0].retrieve_datas || []);
      hasTriggered.current = true;
    }
  }, [recordList]);
  const init = async (value) => {
    if (!id) return;
    const params = {
      dataset_id: Number(id),
      user_id: userInfo?.id,
      ...value
    };
    try {
      setLoading2(true);
      const documentList = await ListKnowledgeHitTestingRecords(params);
      if (documentList.code === '' && documentList.status === 200) {
        const { list: dataList = [], total = '' } = documentList.data;
        setRecordList(dataList || []);
        const newSegmentList = dataList
          .flatMap((item) => item.retrieve_datas || [])
          .map((item) => ({
            id: item.chunk_id,
            ...item
          }));
        setSegmentList(newSegmentList || []);
        setPagination((prevPagination) => ({
          ...prevPagination,
          total: total
        }));
      } else {
        Message.error(documentList.message || '接口调用失败');
      }
      setLoading2(false);
    } catch {}
  };
  const oncEditPolicy = () => {
    seteditPolicy(true);
  };
  const handleCopy = (data, text) => {
    copy(data);
    Message.success(`复制${text}成功`);
  };
  const recordColumns: any = [
    {
      title: `测试内容`,
      dataIndex: 'query',
      render: (query, record) => (
        <div className={styles.historyTestContent}>
          <EllipsisPopover value={query} isEdit={false} preferTypography />
          <Tooltip content="复制">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(record.query, '历史测试内容');
              }}
              onMouseEnter={() => setHoveredCopyButton(true)}
              onMouseLeave={() => setHoveredCopyButton(false)}
              className={styles.copy}
            >
              {hoveredCopyButton ? (
                <CopyHighIconSvg className="h-4 w-4" />
              ) : (
                <CopyNormalIconSvg className="h-4 w-4" />
              )}
            </button>
          </Tooltip>
        </div>
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
        dataset_id: Number(id),
        query: text,
        user_id: userInfo?.id,
        retrieval_model: {
          search_method: datatp.search_method, //      semantic_search（语义检索） full_text_search（全文检索） hybrid_search（混合检索）
          reranking_enable: datatp.reranking_enable,
          reranking_model: datatp.reranking_model,
          top_k: datatp.top_k, // 召回topk
          weights: datatp.weights,
          score_threshold_enabled: datatp.score_threshold_enabled,
          score_threshold: datatp.score_threshold // 匹配分
          // tag_mode: datatp.tag_mode //  doc_tag（文档标签） segment_tag（分段标签）
        }
      };
      setLoading1(true);
      setLoading2(true);
      const res = await RunKnowledgeHitTesting(params);
      if (res.code === '' && res.status === 200) {
        if (res?.data?.length === 0)
          Message.error('未检索到相关内容，请更换测试内容或调整检索设置');
        setsegmentationlist(res.data || []);
        setsegmentationlistFilter(res.data || []);
        init({
          ...pagination,
          page: 1
        });
      } else {
        Message.error(res.message || '接口调用失败');
      }
      setLoading1(false);
      setLoading2(false);
    } catch {
      setLoading1(false);
      setLoading2(false);
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
    setsegmentationlist(record.retrieve_datas || []);
    setsegmentationlistFilter(recordList[index].retrieve_datas || []);
  };
  const rowClassName = (record: any, index: number) => {
    // 如果是选中的行，给该行添加浅蓝色的背景
    return index === selectedRowIndex ? styles.selectedRowMz : '';
  };
  const handleSearch = () => {
    const filterlist = value
      ? segmentationlistFilter.filter((e: { content: string }) =>
          e.content.includes(value)
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
  const onChangeSup = useCallback((con: string) => {
    console.log(con);
  }, []);
  const handleToParagraph = async (
    document_id: string,
    chunk_id: string,
    position: string,
    parent_title_id: string
  ) => {
    console.log(position, 'sssss');
    const res = await getKnowledgeDocument({
      document_id
    });
    if (res.code === '' && res.status === 200) {
      history.push(
        `/tenant/compute/modaforge/ragDetail?datasetId=${id}&documentId=${document_id}&bucketName=${res.data.bucket_name}&path=${res.data.path}&datasetName=${datasetName}&chunkId=${chunk_id}&position=${position}&parentTitleId=${parent_title_id}`
      );
    } else {
      Message.error(res.message || '接口调用失败');
    }
  };
  const getFileExtension = (fileName) => {
    if (typeof fileName !== 'string' || !fileName.includes('.')) {
      return ''; // 非字符串/无扩展名返回空
    }
    // 找到最后一个.的位置，截取后面的字符
    return fileName.slice(fileName.lastIndexOf('.') + 1);
  };
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
              placeholder="请输入文本进行命中测试"
              value={text}
              autoSize={{ minRows: 13 }}
              allowClear
              maxLength={2000}
              disabled={loading1}
              onChange={(value) => setText(value)} // 更新状态
            ></TextArea>
          </div>
        </div>

        <div className={styles.testContentButton}>
          <PermissionWrapper permission={DATA_MANAGEMENT_PERMISSIONS.CAN_RUN}>
            <Tooltip
              position="top"
              trigger="hover"
              content={!text ? '请先输入测试文本' : ''}
            >
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
          </PermissionWrapper>
          <Button
            className={styles.cl}
            type="outline"
            icon={<IconSettings />}
            onClick={oncEditPolicy}
            disabled
          >
            检索设置
          </Button>
        </div>
        <div className={styles.historyHeader}>历史记录</div>
        <div className={styles.historyContent}>
          {recordList.length === 0 ? (
            <NoDataEmpty description="暂无数据" />
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
                        <span className="ml-[8px] text-[12px] leading-5 text-[#6E7B8D]">
                          字符数：{e?.content.length}
                        </span>
                        <span
                          className={`${styles.hoverShow} ml-[8px] text-[12px] leading-5 text-[#6E7B8D]`}
                        >
                          |
                        </span>
                        <span
                          className={`${styles.hoverShow} ml-[8px] text-[12px] leading-5 text-[#6E7B8D]`}
                        >
                          分段编号：{e.chunk_id}
                        </span>
                        <Tooltip content="复制">
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleCopy(e.content, '分段编号');
                            }}
                            onMouseEnter={() => setHoveredCopyResult(index)}
                            onMouseLeave={() => setHoveredCopyResult(null)}
                            className={`${styles.hoverShow} ml-[8px]`}
                          >
                            {hoveredCopyResult === index ? (
                              <CopyHighIconSvg className="h-3 w-3" />
                            ) : (
                              <CopyNormalIconSvg className="h-3 w-3 text-[#6E7B8D]" />
                            )}
                          </button>
                        </Tooltip>
                        <Tooltip content="跳转至分段位置">
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleToParagraph(
                                e.document_id,
                                e.chunk_id,
                                JSON.stringify(
                                  e.positions ? e.positions[0] : {}
                                ),
                                e.parent_title_id
                              );
                            }}
                            onMouseEnter={() => setHoveredJumpResult(index)}
                            onMouseLeave={() => setHoveredJumpResult(null)}
                            className={`${styles.hoverShow} ml-[8px]`}
                          >
                            {hoveredJumpResult === index ? (
                              <JumpToHighIconSvg className="h-3 w-3" />
                            ) : (
                              <JumpToNormalIconSvg className="h-3 w-3" />
                            )}
                          </button>
                        </Tooltip>
                      </div>
                      <div className={styles.operateBtn}>
                        <Button
                          type="outline"
                          icon={<SegmentDetailsIconSvg />}
                          onClick={() => {
                            setShowDrawer(true);
                            setDefaultTab('detail');
                            setChunkId(e.chunk_id);
                            setDocumentId(e.document_id);
                          }}
                        >
                          分段详情
                        </Button>
                        <Button
                          type="outline"
                          icon={<IconMindMapping className="text-[#1E293B]" />}
                          onClick={() => {
                            setShowDrawer(true);
                            setDefaultTab('trace');
                            setChunkId(e.chunk_id);
                            setDocumentId(e.document_id);
                          }}
                        >
                          溯源日志
                        </Button>
                      </div>
                    </div>
                    <div className={styles.segmentationContent}>
                      <MarkdownBase
                        content={e.content}
                        onChangeSup={onChangeSup}
                      ></MarkdownBase>
                    </div>
                    <div className={styles.sl}>
                      <span>
                        {/* <IconDriveFile /> */}
                        {getFileIcon(getFileExtension(e.document_name))}
                      </span>
                      {/* <Tooltip content={e.document_name}>
                        <div
                          className={styles.nm}

                        >
                          <div className="mt-[3px] ml-[4px] text-[#6E7B8D]">
                            {e?.positions
                              ? `${e.document_name} - 第${e?.positions[0]?.page_id}页`
                              : e.document_name}
                          </div>
                        </div>
                      </Tooltip> */}
                      <EllipsisPopover
                        value={
                          e?.positions
                            ? `${e.document_name} - 第${e?.positions[0]?.page_id}页`
                            : e.document_name
                        }
                        className={styles.nm}
                        isLink
                        handleLink={() =>
                          handleToParagraph(
                            e.document_id,
                            e.chunk_id,
                            JSON.stringify(e.positions ? e.positions[0] : {}),
                            e.parent_title_id
                          )
                        }
                      />
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
              <NoDataEmpty description="暂无结果" />
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
      {/* 图片放大弹窗 */}
      <ImageModal />

      <SegmentDrawer
        visible={showDrawer}
        onClose={() => setShowDrawer(false)}
        defaultActiveTab={defaultTab}
        datasetId={id ? Number(id) : undefined}
        chunkId={chunkId}
        segments={segmentList}
        totalSegments={segmentList.length}
      />
    </div>
  );
}
export default HitTest;
