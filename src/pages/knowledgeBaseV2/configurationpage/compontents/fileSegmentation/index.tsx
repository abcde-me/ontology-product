import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import './index.css';
import {
  IconCheckCircle,
  IconDelete,
  IconDownload,
  IconDriveFile,
  IconEdit,
  IconLeft,
  IconMore
} from '@arco-design/web-react/icon';
import DocDisplay from '../docDisplay/index';
import DemoForm from '../../../components/From/index';
import {
  Button,
  Empty,
  Input,
  Message,
  Modal,
  Pagination,
  Radio,
  Spin,
  Switch,
  Tooltip,
  Upload
} from '@arco-design/web-react';
import { get } from 'lodash';
import { useLocation } from 'react-router-dom';
import {
  AddDocsublevel,
  deletedocEditList,
  deletedocsublevel,
  editDocsublevel,
  getDocContent,
  getdocDetail,
  getdocIndex,
  getdocSegmentation,
  getdocumentList,
  patchknowledgeBasePolicy,
  postdocEditList,
  putdocSwitch,
  putdocSwitchSegmentation,
  putknowledgeBaseList
} from '@/api/datasetsV2';
import Iconpdf from '@/assets/file/pdf.svg';
import brother from '../brother';
import { PrefixV2 } from '@/api/endpoints'
const uploadUrl =`${PrefixV2}/files/upload`

function PageContentTrue(props) {
  const location = useLocation();
  const RadioGroup = Radio.Group;
  const [contentloading, setcontentloading] = useState(false);
  const InputSearch = Input.Search;
  const childRef: any = useRef();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [checkedManage, setCheckedManage] = useState(null);
  const [checkedChild, setcheckedChild] = useState(true);
  const [editManageVisible, seteditManageVisible] = useState(false); //分段配置
  const [editChildVisible, seteditChildVisible] = useState(false); //分段编辑
  const [addChildVisible, setaddChildVisible] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [docOperation, setdocOperation] = useState<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const latestQuery = useRef(searchQuery);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [segmentationlist, setsegmentationlist] = useState([]);
  const { detailsdata, onInit } = props;
  const { id, process_rule, app_count } = detailsdata || {};
  const [text, setText] = useState('');
  const [typeSublevel, settypeSublevel] = useState<any>({});
  const [valueSublevel, setvalueSublevel] = useState('');
  const [documentid, setdocumentid] = useState('');
  const [segmentationlistId, setsegmentationlistId] = useState('');
  const [pagination, setPagination] = useState<any>({
    page: 1, // 当前页码
    limit: 10, // 每页显示的数据条数
    keyword: '',
    total: 0
  });
  const [positionbox, setpositionbox] = useState({});
  const [divWH, setdivWH] = useState({});
  const submitEditChild = () => {
    childRef.current.submitEditFromOnc();
  };
  const clearEditChild = () => {
    childRef.current.clearEditFromOnc();
  };
  brother.on('editFuncFrom', () => {
    editheader();
  });
  useEffect(() => {
    latestQuery.current = searchQuery;
  }, [searchQuery]);
  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (latestQuery.current === searchQuery) {
        init();
      }
    }, 500);

    return () => clearTimeout(timer); // 清理定时器
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  useEffect(() => {
    if (selectedFileId && fileList.length > 0) {
      const apirequst = async () => {
        setcontentloading(true);
        const listdata = fileList.find((obj) => obj.uid === selectedFileId);
        setdocOperation(listdata);

        await funcgetdocDetail(); //文档详情
        await funcdocSegmentation({ ...pagination }); //分段列表

        setcontentloading(false);
      };
      apirequst();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFileId]);

  const init = async () => {
    if (!id) return;
    try {
      const params = {
        page: 1,
        limit: 999,
        name: searchQuery
      };
      const documentList = await getdocumentList(id, params);
      const { data: dataList = [] } = documentList.data;

      if (dataList) {
        const initialFiles = dataList.map((e) => {
          return {
            uid: e.id,
            name: e.name,
            status: 'done',
            enabled: e.enabled
          };
        });

        setFileList(initialFiles); // 设置初始文件列表
        setSelectedFileId(initialFiles[0].uid);
      } else {
        setFileList([]); // 设置初始文件列表
      }
    } catch {}
  };
  const funcgetdocDetail = async () => {
    try {
      const dataset_id = id;
      const documentList = await getdocDetail(dataset_id, selectedFileId);
      const { data: data = [] } = documentList;
      setdocumentid(data.id);
      setCheckedManage(data.enabled);
    } catch {}
  };
  const funcdocSegmentation = async (params) => {
    if (!id) return;
    try {
      const dataset_id = id;
      const documentList = await getdocSegmentation(
        dataset_id,
        selectedFileId,
        params
      );
      const { data: data = [], total = '' } = documentList.data;

      setsegmentationlistId(data[0].id);
      setpositionbox(data[0].position_bbox);
      setsegmentationlist(data || []);

      setPagination((prevPagination) => ({
        ...prevPagination,
        total: total
      }));
    } catch {}
  };
  //处理switch管理

  const handleChangeManage = async (checked: boolean) => {
    try {
      const dataset_id = id;
      const indexdata = await getdocIndex(dataset_id, selectedFileId);
      const { data: indexing_status = '' } = indexdata;

      if (indexing_status.indexing_status === 'completed') {
        console.log('索引完成，停止请求');
        let ty = '';
        if (checkedManage !== true) {
          ty = 'enable';
        } else {
          ty = 'disable';
        }
        await putdocSwitch(dataset_id, selectedFileId, ty);
        setCheckedManage(checked);

        Message.success(`${ty == 'enable' ? '启用' : '禁用'}成功`);
      } else {
        console.log('请求继续');
        Message.warning('文档索引未完成!');
      }
    } catch {}
  };
  const handleChangeChild = async (e) => {
    try {
      const dataset_id = id;
      let ty = '';
      if (e.enabled !== true) {
        ty = 'enable';
      } else {
        ty = 'disable';
      }
      await putdocSwitchSegmentation(dataset_id, selectedFileId, ty, e.id);
      Message.success(`${ty == 'enable' ? '启用' : '禁用'}成功`);
      await funcdocSegmentation({ ...pagination });
    } catch {}
  };
  //分段操作
  const handleModalAction = async (e, actionType) => {
    if (actionType === 'confirm') {
      console.log('确定删除');
      // 执行删除操作
      const dataset_id = id;
      await deletedocsublevel(dataset_id, selectedFileId, e.id);
      await funcdocSegmentation({ ...pagination });
      await onInit();
      Message.success('删除分段成功！');
    } else {
      console.log('取消删除');
      // 可以执行其他操作或只是关闭模态框
    }
  };
  const segmentationOperation = async (e, type) => {
    if (type === 'edit') {
      seteditChildVisible(true);
      return; // 提前返回，避免继续执行后续代码
    }
    Modal.confirm({
      title: '确定要删除分段吗',
      okText: '确定',
      cancelText: '取消',
      onOk() {
        handleModalAction(e, 'confirm');
      },
      onCancel() {
        handleModalAction(e, 'cancel');
      }
    });
  };
  const editheader = () => {
    seteditChildVisible(true);
  };
  const submitaddChild = async () => {
    const dataset_id = id;
    const params = {
      content: text,
      keywords: [],
      answer: ''
    };
    if (typeSublevel.typestats == 'add') {
      try {
        await AddDocsublevel(dataset_id, selectedFileId, params);
        await funcdocSegmentation({ ...pagination });
        await onInit();
        setText('');
        setaddChildVisible(false);
        Message.success('新增分段成功！');
      } catch {}
    } else {
      try {
        await editDocsublevel(
          dataset_id,
          selectedFileId,
          typeSublevel.id,
          params
        );
        setText('');
        setaddChildVisible(false);
        await funcdocSegmentation({ ...pagination });
        Message.success('编辑分段成功！');
      } catch {}
    }
  };
  const clearaddChild = () => {
    setText('');
    setaddChildVisible(false);
  };
  const addModelOpenManage = (type, e?) => {
    if (type == 'add') {
      settypeSublevel({
        ...e,
        typestats: type
      });
    } else {
      settypeSublevel({
        ...e,
        typestats: type
      });
      setText(e.content);
    }
    setaddChildVisible(true);
  };
  const editSegmentationManage = () => {
    seteditManageVisible(true);
  };
  const submitEditManage = () => {
    childRef.current.submitEditFromOnM();
    // seteditManageVisible(false);
  };
  const clearEditManage = () => {
    childRef.current.clearEditFromOnM();
  };
  //文件上传
  const uploadFileList = useMemo(() => {
    // 根据搜索框内容过滤文件列表
    return fileList.map((x) => {
      return x.status === 'error'
        ? {
            ...x,
            response: get(x, 'response.message', '网络错误')
          }
        : x;
    });
  }, [fileList]);
  const checkFile = (file, list) => {
    if (file.size > 100 * 1024 * 1024 * 1024) {
      Message.error('单文件大小不能超过100GB');
      return false;
    }
    return true;
  };
  const onSearchChange = (e) => {
    setSearchQuery(e);
  };
  // 上传成功时调用的接口函数
  const onUploadChange = async (fileList, file) => {
    // 处理不同状态
    switch (file.status) {
      case 'done':
        if (file.response?.code === 'Success') {
          try {
            const params = {
              data_source: {
                type: 'upload_file', // 固定写死，表明通过文件上传
                info_list: {
                  data_source_type: 'upload_file', // 固定写死，表明通过文件上传
                  file_info_list: {
                    file_ids: [file.response?.data.id] // 调用文件上传接口后，文件上传成功后返回的文件id
                  }
                }
              }
            };
            const documentList = await postdocEditList(id, params);

            // const { documents: dataList = [] } = documentList.data;

            // setFileList((prev) => {
            //   const newList = fileList.map((item) => {
            //     // 同步最新文件状态
            //     if (item.uid === file.uid) {
            //       return {
            //         uid: dataList[0].id,
            //         name: dataList[0].name,
            //         status: 'done',
            //         enabled: dataList[0].enabled
            //       };
            //     }
            //     return item;
            //   });
            //   return newList;
            // });
            init();
            onInit();
            Message.success(`${file.name} 上传成功`);
          } catch {}
        } else {
          try {
            Modal.confirm({
              title: '确认删除文件?',
              content: `确定要删除 ${file.name} 吗？`,
              async onOk() {
                await deletedocEditList(id, file.uid);
                // setFileList((prev) => {
                //   const newList = fileList.map((item) => {
                //     // 同步最新文件状态
                //     if (item.uid === file.uid) {
                //       return {
                //         uid: file.id,
                //         name: file.name,
                //         status: 'done',
                //         enabled: file.enabled
                //       };
                //     }
                //     return item;
                //   });
                //   return newList;
                // });
                // if (file.uid === selectedFileId) {
                //   console.log(123);

                //   setSelectedFileId(null);
                //   // setdocOperation(null);
                // }
                init();
                onInit();
                Message.success(`${file.name} 删除成功`);
              }
            });
          } catch (error) {
            Message.error(`删除失败: ${error.message}`);
            return false; // 阻止组件删除
          }
        }
        break;

      case 'error':
        const errorMsg = file.response?.message || '网络连接异常';
        Message.error(`${file.name} 上传失败: ${errorMsg}`);
        break;

      case 'uploading':
        // 可在此处添加进度提示
        break;
    }
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
      Message.success(`编辑失败`);
    }
  };
  const FuncEditM = async (e) => {
    // console.log(e, 'e');

    try {
      const params = {
        process_rule: {
          rules: {
            parsing_strategy: e.parseTacticsV,
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
              separator: '\n\n',
              separators: e.logotypeV,
              max_tokens: Number(e.sliceLengthV), // 切片最大长度
              matchstrategy: e.regularPositionV, //正则表达式切片时
              chunk_overlap: Number(e.sliceOverlapLengthV) // 切片重叠长度
            }
          },
          mode: e.sublevelTacticsV // 分段策略： custom(自定义切分)、automatic(自动切分)
        }
      };
      // console.log(params, 'params');

      await patchknowledgeBasePolicy(id, params);
      onInit();
      Message.success(`编辑成功`);
    } catch {
      Message.success(`编辑失败`);
    }
  };
  const handleSearchSublevel = (value) => {
    setvalueSublevel(value);
  };
  const handleChange = (e) => {
    setText(e.target.value);
  };
  const SearchSublevel = (e) => {
    setPagination((prevPagination) => ({
      ...prevPagination,
      page: 1,
      keyword: valueSublevel
    }));
    funcdocSegmentation({
      ...pagination,
      page: 1,
      keyword: valueSublevel
    });
  };
  const handlePaginationChange = (page, pageSize) => {
    console.log('当前页:', page, '每页显示:', pageSize);
    // 在这里可以执行其他逻辑，例如请求新数据
    setPagination((prevPagination) => ({
      ...prevPagination,
      page: page,
      limit: pageSize
    }));
    funcdocSegmentation({
      ...pagination,
      page: page,
      limit: pageSize
    });
  };
  const funDownload = () => {};
  const funcSegmentation = (e) => {
    setsegmentationlistId(e.id);
    setpositionbox(e.position_bbox);
  };
  return (
    <div className="PageContentTrue">
      <div className="leftList">
        <InputSearch
          className="inp"
          value={searchQuery}
          onChange={onSearchChange}
          allowClear
          placeholder="搜索文件名称"
        />
        <Upload
          className="bg-white"
          drag
          // disabled={uploadFileList.length >= 10}
          multiple
          accept=".docx,.pdf,.txt"
          action={uploadUrl}
          tip="支持上传docx、pdf、txt文件，文件大小、数量不做限制（大小至少100M，单次上传10000篇）"
          onChange={onUploadChange}
          fileList={uploadFileList}
          beforeUpload={(file, list) => checkFile(file, list)}
          renderUploadItem={(originNode, file) => (
            <div
              className={`file-item ${file.uid === selectedFileId ? 'selected-file' : ''}`}
              onClick={(e) => {
                // 阻止事件冒泡到父元素
                e.stopPropagation();
                setSelectedFileId(
                  file.uid === selectedFileId ? selectedFileId : file.uid
                );
              }}
            >
              {originNode}
            </div>
          )}
        >
          <Button type="primary" className="but">
            添加文件
          </Button>
        </Upload>
      </div>

      {docOperation ? (
        <div className="rightContent">
          <div className="rightContent-header">
            <div className="lefttitle">
              <div className="title">{docOperation.name}</div>
              <div className="_img">
                <IconDownload
                  className="cursor-pointer"
                  onClick={funDownload}
                />
              </div>
            </div>
            <div className="rightbutton">
              <Switch
                checked={checkedManage}
                onChange={handleChangeManage}
                className="btn"
                checkedText="启用"
                uncheckedText="禁用"
              />
              <Button className="btn" type="outline">
                隐藏原文件
              </Button>
              <Button
                className="btn"
                type="outline"
                onClick={editSegmentationManage}
              >
                分段配置
              </Button>
              <Button
                className="btn"
                type="primary"
                onClick={() => addModelOpenManage('add')}
              >
                添加分段
              </Button>
            </div>
          </div>
          <Spin loading={contentloading}>
            <div className="rightContent-content">
              <div className="content-left">
                <DocDisplay
                  documentid={documentid}
                  datasetid={id}
                  positionbox={positionbox}
                ></DocDisplay>
              </div>
              <div className="content-right">
                <div className="segmentation">
                  <div className="tation-left">
                    分段({segmentationlist.length})
                  </div>
                  <div className="tation-right">
                    <InputSearch
                      value={valueSublevel}
                      onChange={handleSearchSublevel}
                      onSearch={SearchSublevel}
                      className="inp"
                      allowClear
                      placeholder="搜索分段"
                    />
                  </div>
                </div>
                <div className="segmentationscoll">
                  {segmentationlist.length > 0 ? (
                    <div>
                      {segmentationlist.map((e, index) => {
                        return (
                          <div
                            key={index}
                            className={`segmentation-box ${segmentationlistId === e.id ? 'highlight-blue' : ''}`}
                            onClick={() => funcSegmentation(e)}
                          >
                            <div className="segmentation-header">
                              <div className="s-l">
                                <span>
                                  分段数：{index + 1}/{segmentationlist.length}
                                </span>
                                <span className="sp">
                                  字符数：{e.word_count}
                                </span>
                              </div>
                              <div
                                className="s-r"
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                              >
                                <div
                                  className={`s-r-t ${hoveredIndex === index ? 'show' : ''}`}
                                >
                                  {e.enabled == true ? '已启用' : '已禁用'}
                                </div>
                                <div
                                  className={`s-r-f ${hoveredIndex === index ? 'show' : ''}`}
                                >
                                  <Tooltip content="编辑分段">
                                    <IconEdit
                                      onClick={() =>
                                        addModelOpenManage('edit', e)
                                      }
                                    />
                                  </Tooltip>
                                  <Tooltip content="删除分段">
                                    <IconDelete
                                      onClick={() =>
                                        segmentationOperation(e, 'delete')
                                      }
                                    />
                                  </Tooltip>

                                  <Switch
                                    checked={e.enabled}
                                    onChange={() => handleChangeChild(e)}
                                    className="btn"
                                    checkedText="启用"
                                    uncheckedText="禁用"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="segmentation-content">
                              {e.content}
                            </div>
                          </div>
                        );
                      })}
                      <Pagination
                        size={'mini'}
                        total={pagination.total}
                        current={pagination.page}
                        pageSize={pagination.limit}
                        showTotal
                        showJumper
                        sizeCanChange
                        onChange={handlePaginationChange}
                      />
                    </div>
                  ) : (
                    <Empty />
                  )}
                </div>
              </div>
            </div>
          </Spin>
        </div>
      ) : (
        <Empty />
      )}

      <Modal
        title={typeSublevel.typestats == 'add' ? '新增页面' : '编辑页面'}
        visible={addChildVisible}
        onOk={() => submitaddChild()}
        onCancel={() => clearaddChild()}
        autoFocus={false}
        focusLock={true}
        style={{
          width: 520
        }}
      >
        <div className="PageContentTrue-addmodel">
          <textarea
            className="input-box"
            placeholder="请输入内容..."
            value={text}
            onChange={handleChange} // 更新状态
          ></textarea>
        </div>
      </Modal>
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
          seteditManageVisible={seteditManageVisible}
          ref={childRef}
          detailsdata={detailsdata}
          FuncEdit={FuncEdit}
          typemodel={'editChild'}
        ></DemoForm>
      </Modal>
      <Modal
        title="分段配置"
        visible={editManageVisible}
        onOk={() => submitEditManage()}
        onCancel={() => clearEditManage()}
        autoFocus={false}
        focusLock={true}
        style={{
          width: 800
        }}
      >
        <DemoForm
          detailsdata={detailsdata}
          seteditChildVisible={seteditChildVisible}
          seteditManageVisible={seteditManageVisible}
          ref={childRef}
          FuncEditM={FuncEditM}
          typemodel={'editManage'}
        ></DemoForm>
      </Modal>
    </div>
  );
}
export default PageContentTrue;
