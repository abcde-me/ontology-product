import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import './index.less';
import {
  IconCheckCircleFill,
  IconCloseCircleFill,
  IconDelete,
  IconDownload,
  IconLoading
} from '@arco-design/web-react/icon';
import DocDisplay from '../docDisplay/index';
import DemoForm from '../../../components/From/index';
import FileSublevel from '../FileSublevel/index';
import TabelPage from '../tabelPage/index';
import {
  Button,
  Empty,
  Input,
  Message,
  Modal,
  Radio,
  Switch,
  Tooltip
} from '@arco-design/web-react';
import { get } from 'lodash';
import { useLocation } from 'react-router-dom';
import {
  AddDocsublevel,
  deletedocEditList,
  deletedocsublevel,
  editDocsublevel,
  getdocDetail,
  getdocIndex,
  getdocSegmentation,
  getdocumentList,
  postdocumentList,
  putdocSwitch,
  putdocSwitchSegmentation,
  putknowledgeBaseList
} from '@/api/datasetsV2';
import { GetknowGetPolicyElement, GetknowGetPolicy } from '@/api/tabElements';
import brother from '../brother';
import { PrefixV2 } from '@/api/endpoints';
import { getToken } from '@/utils/request';
import DOCV2 from '@/assets/file/DOCV2.svg';
import PDFV2 from '@/assets/file/PDFV2.svg';
import TXTV2 from '@/assets/file/TXTV2.svg';
import XLSXV2 from '@/assets/file/XLSXV2.svg';
import FileTree from '../HierarchyTree/index';
import CSVV2 from '@/assets/file/CSVV2.svg';
import TextTruncate from '../TextTruncate';
import TagContent from '../tagContent';
import TagTree from '@/pages/dataMarket/components/components/TagTree';
import useTagEment from '../../../../store/useTagEment';

function PageContentTrue(props) {
  const messType = useRef(false);
  const [contentloading, setcontentloading] = useState(false);
  const InputSearch = Input.Search;
  const childRef: any = useRef();
  const childRef1: any = useRef();
  const childRef2: any = useRef();
  const tablePageRef: any = useRef();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [checkedManage, setCheckedManage] = useState(false);
  const [editManageVisible, seteditManageVisible] = useState(false); //切片配置
  const [editChildVisible, seteditChildVisible] = useState(false); //切片编辑
  const [addfileVisible, setaddfileVisible] = useState(false);
  const [addChildVisible, setaddChildVisible] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [docOperation, setdocOperation] = useState<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const latestQuery = useRef(searchQuery);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [segmentationlist, setsegmentationlist] = useState<any>([]);
  const { detailsdata, onInit } = props;
  const { id, app_count } = detailsdata || {};
  const filedetail = useRef<any>();
  const [text, setText] = useState('');
  const [contentTagList, setContentTagList] = useState([]);
  const [typeSublevel, settypeSublevel] = useState<any>({});
  const [valueSublevel, setvalueSublevel] = useState('');
  const [documentid, setdocumentid] = useState('');
  const [segmentationlistId, setsegmentationlistId] = useState('');
  const [sonTreeData1, setSonTreeData1] = useState<any>({});
  const [segment_count, setsegment_count] = useState({});
  const [checkIds, setCheckIds] = useState(['']);
  const [pagination, setPagination] = useState<any>({
    page: 1, // 当前页码
    limit: 10, // 每页显示的数据条数
    content: '',
    total: 0,
    segment_type: 0
  });
  const paginationRef = useRef(pagination);
  const [positionbox, setpositionbox] = useState({});
  const [DocDisplayType, setDocDisplayType] = useState(true);
  const [typepage, settypepage] = useState(true);
  const [textTagList, setTextTagList] = useState([]);
  const [switchType, setSwitchType] = useState(false);
  const [switchList, setSwitchList] = useState([]);
  const {
    onSwitchTag,
    onSwitchTagVisible,
    onHandTreeTag,
    toTreeTagList,
    onHandToTreeTag,
    onHandDocTagLiist,
    onHandPolicyVisiable
  } = useTagEment();
  brother.on('editFuncFrom', () => {
    editheader();
  });
  useEffect(() => {
    SearchSublevel(valueSublevel);
  }, [valueSublevel]);

  useEffect(() => {
    latestQuery.current = searchQuery;
  }, [searchQuery]);

  useEffect(() => {
    brother.on('setSonTreeData', (item) => {
      setSonTreeData1(item.catalog_content);
    });
  }, []);

  useEffect(() => {
    init();
  }, [id]);

  useEffect(() => {
    const performAsyncOperations = async () => {
      const listdata = fileList.find(
        (obj: any) => obj.uid === selectedFileId
      ) as any;
      setdocOperation(listdata);
      if (listdata) {
        if (
          listdata.indexing_status == 'completed' &&
          messType.current == true
        ) {
          await funcgetdocDetail(); //文档详情
          await funcdocSegmentation({ ...pagination }); //切片列表

          await onInit(); //知识库详情
          Message.success({
            id: '1',
            content: '修改成功'
          });
          messType.current = false;
        }
      }
    };
    performAsyncOperations();
  }, [fileList]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (latestQuery.current === searchQuery) {
        init();
      }
    }, 500);

    return () => clearTimeout(timer); // 清理定时器
  }, [searchQuery]);

  useEffect(() => {
    if (selectedFileId && fileList.length > 0) {
      setsegmentationlist([]);
      const apirequst = async () => {
        setcontentloading(true);
        const listdata = fileList.find(
          (obj: any) => obj.uid === selectedFileId
        ) as any;
        setdocOperation(listdata);
        if (
          listdata.name.slice(-4) == 'xlsx' ||
          listdata.name.slice(-3) == 'csv'
        ) {
          settypepage(false);
        } else {
          settypepage(true);
        }
        setPagination((prevPagination) => ({
          ...prevPagination,
          segment_type: 0
        }));
        await funcgetdocDetail(); //文档详情

        await funcdocSegmentation({ ...pagination, segment_type: 0 }); //切片列表

        setcontentloading(false);
        setvalueSublevel('');
      };
      apirequst();
    }
  }, [selectedFileId]);
  useEffect(() => {
    if (id) {
      const intervalId = setInterval(() => {
        init('false');
        // funcdocSegmentation({ ...pagination });
      }, 6000);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [id]); // 空数组意味着只在组件挂载时执行一次
  useEffect(() => {
    paginationRef.current = pagination;
    if (selectedFileId) {
      const intervalId = setInterval(() => {
        funcdocSegmentation({ ...paginationRef.current });
      }, 6000);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [selectedFileId, pagination]); // 空数组意味着只在组件挂载时执行一次

  const init = async (tp?) => {
    if (!id) return;
    try {
      const params = {
        page: 1,
        limit: 999,
        name: latestQuery.current
      };
      const documentList = await getdocumentList(id, params); //文件列表
      const { data: dataList = [] } = documentList.data;
      const ids = dataList.map((item) => item.id);
      setCheckIds(ids);
      const paramss = {
        dataset_ids: ids
      };
      const tagpoliy = await GetknowGetPolicyElement(paramss);
      onHandPolicyVisiable(tagpoliy.data);
      if (dataList.length > 0) {
        const initialFiles = dataList.map((e) => {
          return {
            ...e,
            uid: e.id,
            name: e.name,
            status: 'done',
            enabled: e.enabled
          };
        });

        setFileList(initialFiles); // 设置初始文件列表
        if (!tp) {
          setSelectedFileId(initialFiles[0].uid);
        }
      } else {
        setFileList([]); // 设置初始文件列表
        setSelectedFileId('');
      }
    } catch {}
  };
  const submitEditChild = () => {
    childRef1.current.submitEditFromOnc();
  };
  const clearEditChild = () => {
    childRef1.current.clearEditFromOnc();
  };
  const tabelPageradioFun = (type) => {
    setPagination((prevPagination) => ({
      ...prevPagination,
      segment_type: type
    }));
    funcdocSegmentation({
      ...pagination,
      page: 1,
      segment_type: type
    });
  };
  const funcgetdocDetail = async () => {
    try {
      const dataset_id = id;
      const documentList = await getdocDetail(
        dataset_id,
        selectedFileId as string
      );
      GetknowGetPolicy(dataset_id, selectedFileId as string).then((res) => {
        if (res.code === 'Success') {
          onHandToTreeTag(res.data.document_tags || []);
          setTextTagList(res.data.document_tags || []);
          onSwitchTagVisible(res.data.auto_gen_segment_tag);
          setSwitchList(res.data.segment_tags || []);
        }
      });
      const { data: data = {} } = documentList;
      setTextTagList(data.tags || []);
      onHandDocTagLiist(data.tags || []);
      setSwitchType(data.process_rule.rules.auto_gen_segment_tag);

      setdocumentid(data.id);
      setCheckedManage(data.enabled);
      filedetail.current = data;
    } catch {}
  };
  //tabelPage更新funcdocSegmentation
  const tabelPageonclick = () => {
    funcdocSegmentation({ ...pagination });
  };
  const funcdocSegmentation = async (params) => {
    if (!id || !selectedFileId) return;
    try {
      params.limit =
        filedetail?.current?.process_rule?.mode == 'split_by_title'
          ? 999
          : params.limit;
      const dataset_id = id;

      const documentList = await getdocSegmentation(
        dataset_id,
        selectedFileId,
        params
      );

      const {
        data: data = [],
        total = '',
        page = '',
        segment_count = {}
      } = documentList.data;

      // setsegmentationlistId(data[0].id);
      // setpositionbox(data[0].position_bbox);
      // 用来存储已经出现过的值
      const seen = new Set();

      data.forEach((item) => {
        if (seen.has(item.title)) {
          item.title = ''; // 如果值已经出现，设置为空字符串
        } else {
          seen.add(item.title); // 否则添加到记录中
        }
      });
      setsegmentationlist(data || []);
      setsegment_count(segment_count);
      setPagination((prevPagination) => ({
        ...prevPagination,
        page: page,
        total: total
      }));
    } catch {}
  };
  //处理switch管理

  const handleChangeManage = async (checked: boolean) => {
    try {
      const dataset_id = id;
      const indexdata = await getdocIndex(dataset_id, selectedFileId as string);
      const { data: indexing_status = '' } = indexdata;

      if (indexing_status.indexing_status === 'completed') {
        console.log('索引完成，停止请求');
        let ty = '';
        if (checkedManage !== true) {
          ty = 'enable';
        } else {
          ty = 'disable';
        }
        await putdocSwitch(dataset_id, selectedFileId as string, ty);
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
      await putdocSwitchSegmentation(
        dataset_id,
        selectedFileId as string,
        ty,
        e.id
      );
      Message.success(`${ty == 'enable' ? '启用' : '禁用'}成功`);
      await funcdocSegmentation({ ...pagination });
    } catch {}
  };
  //切片操作
  const handleModalAction = async (e, actionType) => {
    if (actionType === 'confirm') {
      console.log('确定删除');
      // 执行删除操作
      const dataset_id = id;
      await deletedocsublevel(dataset_id, selectedFileId as string, e.id);
      await funcdocSegmentation({ ...pagination });
      await onInit();
      Message.success('删除切片成功！');
    } else {
      console.log('取消删除');
      // 可以执行其他操作或只是关闭模态框
    }
  };
  const segmentationOperation = (e, type) => {
    if (type === 'edit') {
      seteditChildVisible(true);
      return; // 提前返回，避免继续执行后续代码
    }
    Modal.confirm({
      title: '确定要删除切片吗',
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
  useEffect(() => {
    if (typeSublevel.typestats == 'add') {
      console.log('新增后选中该切片');

      setsegmentationlistId(segmentationlist[segmentationlist.length - 1]?.id);

      setpositionbox(
        segmentationlist[segmentationlist.length - 1]?.position_bbox || {}
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segmentationlist]);
  const submitaddChild = async () => {
    const dataset_id = id;
    const params = {
      content: text,
      keywords: [],
      answer: '',
      segment_tag_list: toTreeTagList
    };
    if (typeSublevel.typestats == 'add') {
      try {
        await AddDocsublevel(dataset_id, selectedFileId as string, params);

        await funcdocSegmentation({
          ...pagination,
          limit: 10,
          page:
            pagination.total < 10 ? 1 : Math.ceil((pagination.total + 1) / 10)
        });
        await onInit();
        setPagination((prevPagination) => ({
          ...prevPagination,
          limit: 10,
          page:
            pagination.total < 10 ? 1 : Math.ceil((pagination.total + 1) / 10)
        }));
        setText('');
        setContentTagList([]);
        setaddChildVisible(false);
        onHandTreeTag([]);
        onHandDocTagLiist([]);
        Message.success('新增切片成功！');
      } catch {}
    } else {
      try {
        await editDocsublevel(
          dataset_id,
          selectedFileId as string,
          typeSublevel.id,
          params
        );
        setText('');
        setContentTagList([]);
        setaddChildVisible(false);
        await funcdocSegmentation({ ...pagination });
        onHandTreeTag([]);
        onHandDocTagLiist([]);
        Message.success('编辑切片成功！');
      } catch {}
    }
  };
  const clearaddChild = () => {
    setText('');
    setContentTagList([]);
    onHandToTreeTag([]);
    onHandTreeTag([]);
    onHandDocTagLiist([]);
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
      onHandTreeTag(e.tags || []);
    }
    setaddChildVisible(true);
  };
  const editSegmentationManage = () => {
    seteditManageVisible(true);
    onHandTreeTag(textTagList);
    onSwitchTag('display');
    onSwitchTagVisible(switchType);
  };
  const submitEditManage = () => {
    childRef2.current.submitEditFromOnM();
  };
  const submitaddfile = () => {
    childRef.current.submitaddfile();
  };
  const clearaddfile = () => {
    childRef.current.clearfileFrom();
  };
  const clearEditManage = () => {
    childRef2.current.clearEditFromOnM();
  };
  //文件上传
  const uploadFileList = useMemo(() => {
    // 根据搜索框内容过滤文件列表
    return fileList.map((x: any) => {
      return x.status === 'error'
        ? {
            ...x,
            response: get(x, 'response.message', '网络错误')
          }
        : x;
    });
  }, [fileList]);
  const checkFile = (file, list) => {
    const isValidFileType = /\.(docx|pdf|txt)$/i.test(file.name);
    if (!isValidFileType) {
      Message.error('只能上传 docx、pdf、txt 文件');
      return false;
    }
    if (file.size > 100 * 1024 * 1024 * 1024) {
      Message.error('单文件大小不能超过100GB');
      return false;
    }
    return true;
  };
  const onSearchChange = (e) => {
    setSearchQuery(e);
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
  function convertTagDataToTreeFormat(tagTypeDtos) {
    return tagTypeDtos.map((tagType, tagIndex) => {
      // 检查当前标签类型是否在第一个选择器中已被选择
      const selectedTagType = toTreeTagList.find(
        (item) => item.tag_key_id === tagType.id
      );

      // 如果该标签类型在第一个选择器中被选择了（无论全选还是部分选择），则父节点和所有子节点都禁用
      const isParentDisabled = !!selectedTagType;

      return {
        title: tagType.key_name,
        value: tagType.key_name,
        key: tagType.id,
        disabled: isParentDisabled, // 父节点禁用
        children: tagType.values.map((value, valueIndex) => {
          return {
            title: value.value,
            value: value.value,
            key: value.id,
            disabled: isParentDisabled // 所有子节点都禁用
          };
        })
      };
    });
  }

  const FuncEditM = async (e) => {
    try {
      const params = {
        original_document_id: selectedFileId,
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
              chunk_overlap: Number(e.sliceOverlapLengthV), // 切片重叠长度
              regex: e.expressionV
            },
            auto_gen_segment_tag: e.docTagText.switchValue,
            segment_tag_list: e.docTagText.treeValue,
            document_tag_list: e.tagText
          },
          mode: e.sublevelTacticsV // 切片策略： custom(自定义切分)、automatic(自动切分)
        }
      };

      await postdocumentList(id, params);
      // await funcdocSegmentation({ ...pagination });//切片列表
      // await funcgetdocDetail()   //文档详情
      // await onInit();  //知识库详情
      await init('false'); //文件目录
      Message.info({
        content: '配置已提交，请等待向量化完成...',
        id: '1',
        duration: 0
      });
      messType.current = true;
    } catch {
      // Message.success(`编辑失败`);
    }
  };
  const funChildStructure = async (item) => {
    const params = {
      original_document_id: selectedFileId,
      process_rule: {
        rules: {
          parsing_strategy: ['text_ocr'],
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
          spreadsheet_schema: item
        },
        mode: 'split_by_line'
      }
    };

    await postdocumentList(id, params);
    await init('false'); //文件目录
    Message.info({
      content: '配置已提交，请等待向量化完成...',
      id: '1',
      duration: 0
    });
    messType.current = true;
  };
  const handleSearchSublevel = (value) => {
    setvalueSublevel(value);
  };
  const handleChange = (e) => {
    setText(e);
  };
  const onChangeSup = useCallback((con: string) => {
    console.log(con);
  }, []);
  const SearchSublevel = (e) => {
    setPagination((prevPagination) => ({
      ...prevPagination,
      page: 1,
      content: valueSublevel
    }));

    funcdocSegmentation({
      ...pagination,
      page: 1,
      content: valueSublevel
    });
  };
  const handlePaginationChange = (page, pageSize) => {
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
  const funDownload = async () => {
    const url = ` ${PrefixV2}/files/datasets/${id}/documents/${documentid}/browser`;
    const response = await fetch(url, {
      headers: { ...getToken() } as HeadersInit
    });
    const blob = await response.blob();

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = docOperation.name;
    link.click();
  };
  const funcSegmentation = (e) => {
    brother.emit('setSegmentationId', e);

    setsegmentationlistId(e.id);

    setpositionbox(e.position_bbox);
  };
  const funcSegmentationTree = (e) => {
    console.log(e, 'e');
    setsegmentationlistId(e.id);
    setpositionbox(e.position_bbox);
  };
  const funDeleteDoc = (e, file) => {
    e.stopPropagation();
    try {
      Modal.confirm({
        title: '确认删除文件?',
        content: `确定要删除 ${file.name} 吗？`,
        async onOk() {
          await deletedocEditList(id, file.uid);
          init();
          onInit();
          Message.success(`${file.name} 删除成功`);
        }
      });
    } catch (error: any) {
      Message.error(`删除失败: ${error.message}`);
      return false; // 阻止组件删除
    }
  };
  const FunSubmitAddfile = async (filevalue) => {
    try {
      const {
        parseTacticsV,
        sliceOverlapLengthV,
        sublevelTacticsV,
        sliceLengthV,
        spreadsheet_schema,
        uploadfileV,
        logotypeV,
        expressionV,
        regularPositionV,
        tagText,
        docTagText
      } = filevalue;
      const param = {
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
              regex: expressionV,
              separator: '\n\n',
              separators: logotypeV,
              max_tokens: Number(sliceLengthV), // 切片最大长度
              chunk_overlap: Number(sliceOverlapLengthV), // 切片重叠长度
              matchstrategy: regularPositionV
            },
            spreadsheet_schema: spreadsheet_schema,
            auto_gen_segment_tag: docTagText.switchValue,
            segment_tag_list: docTagText.treeValue,
            document_tag_list: tagText
          },
          mode: sublevelTacticsV // 切片策略： custom(自定义切分)、automatic(自动切分)
        }
      };
      await postdocumentList(id, param);
      init('false');
      Message.success('文件添加成功');
    } catch {}
  };
  const setaddfileVisibleFun = () => {
    setaddfileVisible(false);
  };
  const funHideFile = () => {
    setDocDisplayType(!DocDisplayType);
  };
  const onclickAddFile = () => {
    setaddfileVisible(true);
    onSwitchTag('');
    onHandDocTagLiist([]);
    onSwitchTagVisible(false);
  };
  const fileTooltip = (item) => {
    return (
      <div>
        <div className="mb-[8px]  font-sans text-base font-semibold text-[#1E293B]">
          {item.name}
        </div>
        <div className="flex h-[22px]  items-center py-1">
          <div className="text-14  font-sans font-normal text-[#1E293B]">
            切片总数：
          </div>
          <div>
            {item.completed_segment_count ? item.completed_segment_count : '--'}
          </div>
        </div>
        <div className="flex h-[22px] items-center py-1">
          <div className="text-14  font-sans font-normal text-[#1E293B]">
            字符总数：
          </div>
          <div>{item.word_count ? item.word_count : '--'}</div>
        </div>
        <div className="flex h-[22px] items-center py-1 ">
          <div className="text-14 font-sans font-normal text-[#1E293B]">
            关联智能体：
          </div>
          <div>{app_count ? app_count : '--'}</div>
        </div>
      </div>
    );
  };
  const modetype = (e) => {
    switch (e) {
      case 'split_by_title':
        return '按层级切分';
      case 'automatic':
        return '自动切片';
      case 'split_by_chunk':
        return '按常见标识符切分';
      case 'split_by_page':
        return '按页切分';
      case 'split_by_regex':
        return '自定义正则切分';
      default:
        return null;
    }
  };
  const editTableStructure = () => {
    tablePageRef.current.editTableStructure();
  };
  const newTableStructure = () => {
    tablePageRef.current.newTableStructure();
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
        <Button type="primary" className="but" onClick={onclickAddFile}>
          添加文件
        </Button>
        <div className="filelist">
          {fileList.map((item: any, index) => {
            let icon;

            // 根据 file.status 显示不同的图标
            if (item.indexing_status === 'completed') {
              icon = <IconCheckCircleFill style={{ color: 'green' }} />;
            } else if (item.indexing_status === 'error') {
              icon = <IconCloseCircleFill style={{ color: 'red' }} />;
            } else {
              icon = <IconLoading style={{ color: 'blue' }} />;
            }
            return (
              <Tooltip
                key={index}
                position="right"
                trigger="hover"
                content={fileTooltip(item)}
              >
                <div
                  key={index}
                  className={`file-item ${item.uid === selectedFileId ? 'selected-file' : ''}`}
                  onClick={(e) => {
                    // 阻止事件冒泡到父元素
                    e.stopPropagation();
                    setSelectedFileId(
                      item.uid === selectedFileId ? selectedFileId : item.uid
                    );
                  }}
                >
                  <div className="flex items-center py-2">
                    <div className="flex h-[16px] w-[16px] items-center justify-center">
                      {item.name.slice(-3) == 'pdf' ? (
                        <PDFV2 />
                      ) : item.name.slice(-4) == 'docx' ? (
                        <DOCV2 />
                      ) : item.name.slice(-4) == 'xlsx' ? (
                        <XLSXV2 />
                      ) : item.name.slice(-3) == 'csv' ? (
                        <CSVV2 />
                      ) : (
                        <TXTV2 />
                      )}
                    </div>
                    <div className=" h-[20px] w-[100px] overflow-hidden text-ellipsis whitespace-nowrap px-2 leading-[20px]">
                      {item.name}
                    </div>

                    <div className=" flex h-[16px] w-[16px] items-center justify-center">
                      {item.indexing_status === 'error' ? (
                        <Tooltip
                          position="top"
                          trigger="hover"
                          content={item.error}
                        >
                          {icon}
                        </Tooltip>
                      ) : (
                        icon
                      )}
                    </div>
                    <div
                      className="flex h-[16px] w-[16px] items-center justify-center"
                      onClick={(e) => funDeleteDoc(e, item)}
                    >
                      <IconDelete />
                    </div>
                  </div>
                </div>
              </Tooltip>
            );
          })}
          {fileList?.length <= 0 && <Empty />}
        </div>
      </div>

      {docOperation ? (
        <div className="rightContent">
          <div className="rightContent-header">
            <div className="lefttitle">
              <div className="title flex items-center">
                <TextTruncate text={docOperation.name} clientHeight={1} />
              </div>
              <div className="ml-[8px] flex min-h-6 items-center justify-center rounded-lg border px-[5px] ">
                {modetype(filedetail?.current?.process_rule?.mode)}
              </div>
              <div className="_img">
                <IconDownload
                  className="cursor-pointer"
                  onClick={funDownload}
                />
              </div>
              <TagContent tagList={textTagList} />
            </div>
            <div className="rightbutton flex items-center">
              <Switch
                checked={checkedManage}
                onChange={handleChangeManage}
                className="btnCs"
                checkedText="启用"
                uncheckedText="禁用"
                disabled={docOperation.indexing_status !== 'completed'}
              />
              {typepage == true ? (
                <div className="flex items-center gap-2">
                  <Button className="btn" type="outline" onClick={funHideFile}>
                    {DocDisplayType == true ? '隐藏原文件' : '显示原文件'}
                  </Button>
                  <Button
                    className="btn"
                    disabled={docOperation.indexing_status !== 'completed'}
                    type="outline"
                    onClick={editSegmentationManage}
                  >
                    切片配置
                  </Button>
                  {filedetail?.current?.process_rule?.mode !==
                  'split_by_title' ? (
                    <Button
                      className="btn"
                      disabled={docOperation.indexing_status !== 'completed'}
                      type="primary"
                      onClick={() => addModelOpenManage('add')}
                    >
                      添加切片
                    </Button>
                  ) : null}
                </div>
              ) : (
                <div>
                  <Button
                    className="btn"
                    disabled={docOperation.indexing_status !== 'completed'}
                    type="outline"
                    onClick={editTableStructure}
                  >
                    表结构配置
                  </Button>
                  <Button
                    className="btn"
                    disabled={docOperation.indexing_status !== 'completed'}
                    type="primary"
                    onClick={newTableStructure}
                  >
                    新增切片
                  </Button>
                </div>
              )}
            </div>
          </div>
          {typepage == true ? (
            <div className="rightContent-content">
              {DocDisplayType == true ? (
                <div className="content-left">
                  <DocDisplay
                    documentid={documentid}
                    datasetid={id}
                    positionbox={positionbox}
                  ></DocDisplay>
                </div>
              ) : null}
              {filedetail?.current?.process_rule?.mode == 'split_by_title' ? (
                <FileTree
                  documentid={documentid}
                  datasetid={id}
                  funcSegmentationTree={funcSegmentationTree}
                  segmentationlistId={segmentationlistId}
                ></FileTree>
              ) : null}

              <div className="content-right ">
                <div className="segmentation flex items-center font-[PingFangSC-Medium] text-base font-medium leading-6 text-[#151b26]">
                  <div className="tation-left">切片({pagination.total})</div>
                  <div className="tation-right">
                    <InputSearch
                      value={valueSublevel}
                      onChange={handleSearchSublevel}
                      // onSearch={SearchSublevel}
                      className="inp"
                      allowClear
                      placeholder="搜索切片"
                    />
                  </div>
                </div>
                {filedetail?.current?.process_rule?.mode == 'split_by_title' ? (
                  <div className="mt-[8px] cursor-pointer text-[16px] font-semibold leading-[36px] text-[#151B26]">
                    <TextTruncate
                      text={sonTreeData1.title}
                      maxW="90px"
                    ></TextTruncate>
                  </div>
                ) : null}

                <div className="segmentationscoll">
                  <FileSublevel
                    docOperation={docOperation}
                    onInit={onInit}
                    filedetail={filedetail?.current}
                    segmentationlist={segmentationlist}
                    segmentationlistId={segmentationlistId}
                    hoveredIndex={hoveredIndex}
                    pagination={pagination}
                    funcSegmentation={funcSegmentation}
                    setHoveredIndex={setHoveredIndex}
                    addModelOpenManage={addModelOpenManage}
                    segmentationOperation={segmentationOperation}
                    handleChangeChild={handleChangeChild}
                    onChangeSup={onChangeSup}
                    handlePaginationChange={handlePaginationChange}
                  ></FileSublevel>
                </div>
              </div>
            </div>
          ) : (
            <TabelPage
              ref={tablePageRef}
              filedetail={filedetail?.current}
              detailsdata={detailsdata}
              onInit={onInit}
              tabelPageonclick={tabelPageonclick}
              handlePaginationChange={handlePaginationChange}
              pagination={pagination}
              docOperation={docOperation}
              segmentationlist={segmentationlist}
              segment_count={segment_count}
              tabelPageradioFun={tabelPageradioFun}
              funChildStructure={funChildStructure}
              handleSearchSublevel={handleSearchSublevel}
            ></TabelPage>
          )}
        </div>
      ) : (
        <Empty />
      )}
      <Modal
        title={'添加文件'}
        visible={addfileVisible}
        onOk={() => submitaddfile()}
        onCancel={() => clearaddfile()}
        autoFocus={false}
        focusLock={true}
        style={{
          width: '75%'
        }}
      >
        <DemoForm
          FunSubmitAddfile={FunSubmitAddfile}
          setaddfileVisible={setaddfileVisibleFun}
          ref={childRef}
          detailsdata={detailsdata}
          typemodel={'createPolicy'}
          typeDisabled={true}
        ></DemoForm>
      </Modal>
      <Modal
        title={typeSublevel.typestats == 'add' ? '添加切片' : '编辑切片'}
        visible={addChildVisible}
        onOk={() => submitaddChild()}
        onCancel={() => clearaddChild()}
        autoFocus={false}
        focusLock={true}
        style={{
          width: 600,
          height: 450
        }}
      >
        <div className="mb-4 flex">
          <p className="mr-1">切片文本：</p>
          <div className="PageContentTrue-addmodel flex-1">
            <Input.TextArea
              showWordLimit
              autoSize={{ minRows: 12 }}
              maxLength={{ length: 8000 }}
              className="input-box"
              placeholder="请输入内容..."
              value={text}
              onChange={handleChange} // 更新状态
            ></Input.TextArea>
          </div>
        </div>
        <div className="flex">
          <p className="mr-2" style={{ marginLeft: '20px' }}>
            标签：
          </p>
          <TagTree />
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
          ref={childRef1}
          detailsdata={detailsdata}
          FuncEdit={FuncEdit}
          typemodel={'editChild'}
        ></DemoForm>
      </Modal>
      <Modal
        title="切片配置"
        visible={editManageVisible}
        onOk={() => submitEditManage()}
        onCancel={() => clearEditManage()}
        autoFocus={false}
        focusLock={true}
        style={{
          width: 1100
        }}
      >
        <DemoForm
          switchList={switchList}
          detailsdata={filedetail?.current}
          seteditChildVisible={seteditChildVisible}
          seteditManageVisible={seteditManageVisible}
          ref={childRef2}
          FuncEditM={FuncEditM}
          typemodel={'editManage'}
        ></DemoForm>
      </Modal>
    </div>
  );
}
export default PageContentTrue;
