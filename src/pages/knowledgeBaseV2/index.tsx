import {
  Empty,
  Space,
  Link,
  Spin,
  Message,
  Modal
} from '@arco-design/web-react';
import { IconStar } from '@arco-design/web-react/icon';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { Table } from '@ccf2e/arco-material';
import dayjs from 'dayjs';
import EllipsisPopover from '@/components/EllipsisPopoverCom';
import './index.css';
import { format } from 'date-fns';
import { formatNumber } from '@/utils/format';
import Header from '@/components/list-header';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  deleteknowledgeBaseList,
  getknowledgeBaseRootList,
  getknowledgeBaseRootTree,
  getknowledgeBaseRootTreeChild,
  postknowledgeBaseCreate
} from '@/api/datasetsV2';
import Tree from './components/Tree/index';
import { useLocation } from 'react-router-dom';
function KnowledgeTwo() {
  const history = useHistory();
  const location = useLocation();
  const childTreeRef: any = useRef();
  // const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [treedata, setTreeData] = useState([]); //知识库目录
  const [listData, setlistData] = useState([]); //列表
  const [getid, setgetid] = useState('');
  const [pagination, setPagination] = useState<any>({
    page: 1,
    limit: 10,
    name: ''
  });
  useEffect(() => {
    // setLoading1(true);
    funcTreeList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  //接受from知识库创建成功操作
  useEffect(() => {
    const historyData: any = location.state || {};
    console.log(location.state, 2222222);
    if (Object.keys(historyData).length > 0) {
      const {
        name,
        description,
        parseTacticsV,
        selectedOptionV,
        sliceOverlapLengthV,
        sublevelTacticsV,
        sliceLengthV,
        uploadfileV,
        logotypeV,
        uploadiconV,
        expressionV,
        regularPositionV
      } = historyData.values;

      const fetchData = async () => {
        try {
          const params = {
            name: name,
            datasetContentId: selectedOptionV
              ? selectedOptionV[selectedOptionV.length - 1]
              : '', // 知识库目录id
            description: description,
            data_source: {
              type: 'upload_file', // 固定写死，表明通过文件上传
              info_list: {
                data_source_type: 'upload_file', // 固定写死，表明通过文件上传
                file_info_list: {
                  file_ids: uploadfileV.map((w) => {
                    return w.response.data.id;
                  })
                }
              }
            },
            indexing_technique: 'economy', // 固定写死，ued未设计索引配置
            process_rule: {
              rules: {
                parsing_strategy: parseTacticsV,
                pre_processing_rules: [
                  {
                    id: 'remove_extra_spaces',
                    enabled: true
                  },
                  {
                    id: 'remove_urls_emails',
                    enabled: false
                  }
                ],
                segmentation: {
                  // 标识符待定
                  separator: expressionV,
                  separators: logotypeV,
                  max_tokens: Number(sliceLengthV), // 切片最大长度
                  chunk_overlap: Number(sliceOverlapLengthV), // 切片重叠长度
                  matchstrategy: regularPositionV
                }
              },
              mode: sublevelTacticsV // 分段策略： custom(自定义切分)、automatic(自动切分)
            },
            doc_form: 'text_model', // 固定写死
            doc_language: 'Chinese', // 固定写死
            retrieval_model: {
              // 固定写死，ued未设计召回配置
              search_method: 'semantic_search',
              reranking_enable: false,
              reranking_model: {
                reranking_provider_name: '',
                reranking_model_name: ''
              },
              top_k: 3,
              score_threshold_enabled: false,
              score_threshold: 0.5
            },
            embedding_model: '',
            embedding_model_provider: ''
          };
          // console.log(params, 'params');

          await postknowledgeBaseCreate(params);
          Message.success('创建知识库成功');
        } catch (error) {}
      };

      fetchData();
    }
  }, [location.state]);
  const funcTreeList = async () => {
    try {
      const itemtree = await getknowledgeBaseRootTree();
      const { data: treed = [] } = itemtree.data;
      // const treed = [];
      if (treed.length > 0) {
        const treeData = treed.map((e) => ({
          title: e.name,
          key: e.name,
          level: e.level,
          id: e.id,
          value: e.dataset_count,
          icon: <IconStar />
        }));

        setTreeData(treeData);

        setgetid(treeData[0].id);
        tableFunc(treeData[0].id, { ...pagination });
      } else {
        tableFunc('', { ...pagination });
      }
    } catch (error) {
      setTreeData([]);
      setlistData([]);
      // setLoading1(false);
    }
  };
  const tableFunc = async (id, params) => {
    if (id) {
      try {
        setLoading2(true);
        const itemtree = await getknowledgeBaseRootTreeChild(id, params);
        const {
          datasetContents: datasetContents = [],
          datasets: datasets = [],
          total = ''
        } = itemtree.data;

        const newnode = Array.isArray(datasetContents)
          ? datasetContents.map((it, index) => {
              return {
                title: it.name,
                key: it.id,
                id: it.id,
                level: it.level,
                value: it.dataset_count,
                icon: <IconStar />,
                parent_id: it.parent_id
              };
            })
          : [];

        const updateTreeData = (
          treeData: any,
          id: string,
          newChildren: any
        ): any => {
          return treeData.map((node) => {
            // 当前节点匹配
            if (node.id === id) {
              return {
                ...node,
                children: newChildren
              };
            }

            // 递归处理子节点
            if (node.children && node.children.length > 0) {
              return {
                ...node,
                children: updateTreeData(node.children, id, newChildren)
              };
            }

            return node;
          });
        };

        // 使用示例
        setTreeData((prev) => updateTreeData(prev, id, newnode));
        //更新列表
        setlistData(Array.isArray(datasets) ? datasets : []);
        setPagination((prevPagination) => ({
          ...prevPagination,
          total: total
        }));

        // setLoading1(false);
        setLoading2(false);
      } catch {
        // setLoading1(false);
        setLoading2(false);
      }
    } else {
      try {
        const item = await getknowledgeBaseRootList(params);
        const { data = [], total = '', page = '', limit = '' } = item.data;
        setlistData(data || []);
        setPagination((prevPagination) => ({
          ...prevPagination,
          total: total
        }));
        // setLoading1(false);
        setLoading2(false);
      } catch {
        // setLoading1(false);
        setLoading2(false);
      }
    }
  };

  const setredirect = () => {
    funcTreeList();
  };
  //列表字段
  const columns: any = [
    {
      title: '知识库名称',
      dataIndex: 'name',
      width: 200,
      render: (col, record) => {
        return (
          <>
            <EllipsisPopover
              value={record.name}
              isEdit={false}
              preferTypography
            />
          </>
        );
      }
    },
    {
      title: `文件总数`,
      dataIndex: 'document_count',
      width: 100,
      render: (col, record) => {
        return <>{record.document_count || '--'}</>;
      }
    },
    {
      title: '字符总数',
      dataIndex: 'word_count',
      width: 100,
      render: (col, record) => {
        return (
          <>
            {record.word_count
              ? record.word_count > 1000
                ? `${formatNumber((record.word_count / 1000).toFixed(1))}K`
                : `${record.word_count}KB`
              : '--'}
          </>
        );
      }
    },
    // {
    //   title: '关联应用',
    //   dataIndex: 'app_count',
    //   width: 140,
    //   render: (col, record) => {
    //     return <>{record.app_count || '--'}</>;
    //   }
    // },

    {
      title: '描述',
      dataIndex: 'description',
      width: 240,
      ellipsis: true,
      render: (col, record) => {
        return (
          <>
            <EllipsisPopover
              value={record.description}
              isEdit={false}
              preferTypography
            />
          </>
        );
      }
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      width: 200,
      render(i, app) {
        const date = new Date(i);
        const formattedDate = format(date, 'YYYY-MM-DD HH:mm:ss');

        return formattedDate;
      }
    },
    {
      title: '操作',
      dataIndex: 'operation',
      align: 'right',
      fixed: 'right',
      width: 100,
      render: (col, record) => {
        return (
          <Space>
            <Link onClick={() => editKnowledgeClick(record)}>配置</Link>
            <Link onClick={() => doDelete(record)}>删除</Link>
          </Space>
        );
      }
    }
  ];
  //删除
  const doDelete = useCallback(
    (app) => {
      Modal.confirm({
        title: '确认删除知识库吗?',
        content:
          '删除知识库将无法撤销。用户将不能访问你的应用，所有 配置内容将一并被删除。',
        async onOk() {
          await deleteknowledgeBaseList(app.id);

          await tableFunc(getid, {
            page: 1,
            limit: 10,
            name: ''
          });
          Message.success('删除知识库成功！');
        }
      });
    },
    [getid]
  );
  //查询
  const onChildQuery = (value) => {
    setPagination({
      ...pagination,
      page: 1,
      name: value
    });
    tableFunc(getid, {
      page: 1,
      name: value
    });
  };
  //重置
  const onChildReset = () => {
    setPagination({
      page: 1,
      limit: 10,
      name: ''
    });
    tableFunc(getid, {
      page: 1,
      limit: 10,
      name: ''
    });
  };
  //分页
  const onChangeTable = (value) => {
    setPagination({
      ...pagination,
      page: value.current,
      limit: value.pageSize
    });
    tableFunc(getid, {
      ...pagination,
      page: value.current,
      limit: value.pageSize
    });
  };
  //新建知识库跳转
  const handleOperat = () => {
    const path = `/tenant/compute/appforge/createKnowledge?getid=${getid}`;
    history.push(path);
  };
  //配置
  const editKnowledgeClick = (record) => {
    const path = `/tenant/compute/appforge/configurationpage?id=${record.id}`;
    history.push(path);
  };

  //funcTreeHangdle
  const funcTreeHangdle = async (treeNode) => {
    const newId = treeNode.node.props.dataRef.id;
    setgetid(newId);
    tableFunc(newId, {
      page: 1,
      limit: 10,
      name: ''
    });
    setPagination((prevPagination) => ({
      page: 1,
      limit: 10,
      name: ''
    }));
  };

  return (
    <Spin className="appforge-spin" block>
      <div className="knowledgeList h-full py-[20px] pr-[20px]">
        <div className="h-full max-h-[calc(100vh-90px)] overflow-auto rounded-[12px] bg-white px-[24px] py-[20px]">
          <div className="List-content">
            {treedata.length > 0 ? (
              <div className="List-content-left">
                <div className="mb-[20px] text-[20px] font-[500] leading-[32px] text-[var(--color-text-1)]">
                  知识库群组
                </div>
                <Tree
                  ref={childTreeRef}
                  treedata={treedata}
                  funcTreeHangdle={funcTreeHangdle}
                  treeredirect={setredirect}
                />
              </div>
            ) : null}

            <div className="List-content-right">
              <div className="mb-[20px] text-[20px] font-[500] leading-[32px] text-[var(--color-text-1)]">
                知识库
              </div>
              <Header
                onButtonClick={() => handleOperat()}
                onChildQuery={(value) => onChildQuery(value)}
                onChildReset={onChildReset}
                placeholder="搜索知识库名称"
                rightname="创建知识库"
              ></Header>
              <Table
                loading={loading2}
                pagination={{
                  current: pagination.page,
                  pageSize: pagination.limit,
                  total: pagination.total
                }}
                onChange={onChangeTable}
                columns={columns}
                data={listData}
                scroll={{ x: true }}
                rowKey="id"
              />
            </div>
          </div>
        </div>
      </div>
    </Spin>
  );
}

export default observer(KnowledgeTwo);
