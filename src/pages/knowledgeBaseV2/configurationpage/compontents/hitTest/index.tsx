import React, { useEffect, useMemo, useRef, useState } from 'react';
import './index.css';
import { IconDriveFile, IconLeft, IconMore } from '@arco-design/web-react/icon';
import {
  Button,
  Empty,
  Input,
  Modal,
  Radio,
  Table,
  Tooltip
} from '@arco-design/web-react';
import { format } from 'date-fns';
import PolicyForm from '@/components/policyFrom/index';
import { getHitRecord, postHitTest } from '@/api/datasetsV2';
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
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(0); // 默认选中第一行
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [loading3, setLoading3] = useState(false);
  const [pagination, setPagination] = useState<any>({
    page: 1, // 当前页码
    limit: 10 // 每页显示的数据条数
  });
  const submitEditeditPolicy = () => {
    childRef.current.submitEditeditPolicy();
  };
  const clearEditeditPolicy = () => {
    childRef.current.clearEditeditPolicy();
    seteditPolicy(false);
  };
  useEffect(() => {
    init({ ...pagination });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  useEffect(() => {
    if (recordList.length > 0) {
      setsegmentationlist(recordList[0].dataset_query_results || []);
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
    setText(e.target.value);
  };
  const recordColumns: any = [
    {
      title: `测试内容`,
      dataIndex: 'query'
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
      console.log(fromdata, 'fromdata');

      const params = {
        query: text,
        retrieval_model: {
          search_method: fromdata.retrievalV, //      semantic_search（语义检索） full_text_search（全文检索） hybrid_search（混合检索）
          reranking_enable: fromdata.reordering,
          reranking_model: {
            // rerank 模型设置
            reranking_provider_name: '',
            reranking_model_name: ''
          },
          top_k: fromdata.topK, // 召回topk
          weights: fromdata.weightSettings,
          score_threshold_enabled: fromdata.scoreSwitch,
          score_threshold: fromdata.scoreValue // 匹配分
        }
      };
      setLoading1(true);
      await postHitTest(id, params);
      //  const item =
      // const { dataset_query_results = [] } = item.data;
      // setsegmentationlist(dataset_query_results || []);
      init({
        ...pagination,
        page: 1
      });
      setLoading1(false);
    } catch {}
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
    console.log('点击了行:', record);
    setsegmentationlist(record.dataset_query_results || []);
  };
  const rowClassName = (record: any, index: number) => {
    // 如果是选中的行，给该行添加浅蓝色的背景
    return index === selectedRowIndex ? 'selected-row-mz' : '';
  };
  return (
    <div className="PageContentFalse">
      <div className="leftList">
        <div className="test-header">
          <span className="one">命中测试</span>
          <span className="two">根据给定的查询文本测试知识的召回效果。</span>
        </div>
        <div className="test-content">
          <div className="test-content-text">
            <textarea
              className="input-box"
              placeholder="请输入内容..."
              value={text}
              onChange={handleChange} // 更新状态
            ></textarea>
          </div>
          <div className="test-content-button">
            <Button className="cl" type="outline" onClick={oncEditPolicy}>
              策略配置
            </Button>
            <Button
              loading={loading1}
              className="cs"
              type="primary"
              disabled={!text || Object.keys(fromdata).length === 0}
              onClick={Functest}
            >
              测试
            </Button>
          </div>
        </div>
        <div className="history-header">历史记录</div>
        <div className="history-content">
          {recordList.length === 0 ? (
            <Empty />
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
      <div className="rightContent">
        <div className="rightContent-header">
          <div className="header-left">命中分段(100)</div>
          <div className="header-right">
            <InputSearch className="inp" allowClear placeholder="搜索分段" />
          </div>
        </div>
        <div className="rightContent-scoll">
          {/* <Empty /> */}
          {segmentationlist.length > 0 ? (
            segmentationlist.map((e, index) => {
              return (
                <div key={index} className="segmentation-box">
                  <div className="segmentation-header">
                    <div className="s-l">
                      <span>
                        <IconDriveFile />
                      </span>
                      <Tooltip content={e.content_shot}>
                        <span className="nm">{e.content_shot}</span>
                      </Tooltip>
                      <span className="sp">
                        分段数：{index + 1}/{segmentationlist.length}
                      </span>
                    </div>
                    <div className="s-r">
                      <div className="s-r-t">分值：{e.score.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="segmentation-content">{e.content}</div>
                </div>
              );
            })
          ) : (
            <Empty />
          )}
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
    </div>
  );
}
export default PageContentFalse;
