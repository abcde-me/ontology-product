import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './index.module.scss';
import { IconDriveFile } from '@arco-design/web-react/icon';
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
import DemoForm from '../../../components/From/index';
import MarkdownBase from '@/components/markdownBase';
import NoDataEmpty from '@/components/NoDataEmpty';
import TagContent from '../tagContent';

function PageContentFalse(props) {
  const { detailsdata, onInit } = props;
  const { id } = detailsdata || {};
  const RadioGroup = Radio.Group;
  const InputSearch = Input.Search;
  const childRef: any = useRef();
  const [editPolicy, seteditPolicy] = useState(false);
  const [text, setText] = useState('');
  const [fromdata, setfromdata] = useState<any>({});
  const [recordList, setRecordList] = useState<any>([]);
  const [segmentationlist, setsegmentationlist] = useState([]);
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
      setsegmentationlist(recordList[0].dataset_query_results || []);
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
  const handleChange = (e) => {
    let updatedText = e.target.value;
    if (updatedText.length > 2000) {
      updatedText = updatedText.slice(0, 2000); // 截取前2000个字符
    }
    setText(updatedText);
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
    setsegmentationlist(record.dataset_query_results || []);

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
            <textarea
              className={styles.inputBox}
              placeholder="请输入内容..."
              value={text}
              onChange={handleChange} // 更新状态
            ></textarea>
          </div>
        </div>

        <div className={styles.testContentButton}>
          {!text ? (
            <Tooltip
              position="top"
              trigger="hover"
              content="请输入命中测试内容"
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
          <Button className={styles.cl} type="outline" onClick={oncEditPolicy}>
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
                      <div className={styles.sl}>
                        <span>
                          <IconDriveFile />
                        </span>
                        <Tooltip content={e.document_name}>
                          <span className={styles.nm}>{e.document_name}</span>
                        </Tooltip>
                        <span className={styles.sp}>
                          分段数：{index + 1}/{segmentationlist.length}
                        </span>
                        <div className="ml-2 w-[220px]">
                          <TagContent tagList={e.tags} />
                        </div>
                      </div>
                      <div className={styles.sr}>
                        <div className={styles.srt}>
                          分值：{e.score.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className={styles.segmentationContent}>
                      <MarkdownBase
                        content={e.content_shot}
                        onChangeSup={onChangeSup}
                      ></MarkdownBase>
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
        title="编辑"
        visible={editChildVisible}
        onOk={() => submitEditChild()}
        onCancel={() => clearEditChild()}
        autoFocus={false}
        focusLock={true}
        style={{
          width: 800
        }}
      >
        <DemoForm
          seteditChildVisible={seteditChildVisible}
          ref={childRef}
          detailsdata={detailsdata}
          FuncEdit={FuncEdit}
          typemodel={'editChild'}
        ></DemoForm>
      </Modal>
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
    </div>
  );
}
export default PageContentFalse;
