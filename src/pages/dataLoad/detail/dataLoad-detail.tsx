import {
  Breadcrumb,
  Button,
  Form,
  Grid,
  Input,
  Message,
  Modal,
  Pagination,
  Switch
} from '@arco-design/web-react';
import { IconArrowLeft, IconEdit, IconPlus } from '@arco-design/web-react/icon';
import React, { useEffect, useState } from 'react';
import TableDetail from './table-detail';
import './index.css';
import Edit from '../edit';
import { ExecutionHistory, TaskInfo } from '../type';
import { useParams } from '@/utils/url';
import {
  getDirectoryList,
  getLoad,
  getLoadRecordList,
  runLoad,
  startAndStopeLoad
} from '@/api/loadApi';
import { parseCron } from './parseCron';
const BreadcrumbItem = Breadcrumb.Item;
const InputSearch = Input.Search;
// 转换
function findParent(data, childId) {
  for (const item of data) {
    if (
      item.children.volume &&
      item.children.volume.some((child) => child.id === childId)
    ) {
      return item; // 返回父级
    }
    // 递归查找子节点
    if (item.children.volume) {
      const found = findParent(item.children.volume, childId);
      if (found) return found;
      console.log(found);
    }
  }
  return null;
}

const DataLoadDetail = () => {
  const [directoryArr, setDirectoryArr] = useState();
  const [form] = Form.useForm();
  const loadId = useParams('task_id');
  // 默认详情的数据
  const [listDetail, setListDetail] = useState<TaskInfo | null>(null);
  // 详情页面的例表数据
  const [detailList, setDetailList] = useState<ExecutionHistory[] | null>([]);
  // 存在运行中的状态
  const [runningFlag, setRunningFlag] = useState<boolean | null>(false);
  // 分页的数据
  // 当前页码
  const [current, setCurrent] = useState(1);
  // 每页几条
  const [pageSize, setPageSize] = useState(10);
  // 总条数
  const [total, setTotal] = useState(0);
  // 搜索框的状态
  const [searchValue, setSearchValue] = useState('');
  // 判断任务中是否存在运行的任务
  const handlePageChange = (page) => {
    setCurrent(page);
  };
  // 编辑弹框的状态
  const [editVisible, setEditVisible] = useState(false);
  // 相切列表loding的状态
  const [detailListLoading, setDetailListLoading] = useState(false);
  // 点击编辑显示弹框
  const hideEditModal = () => {
    setEditVisible(false);
  };
  // 返回上一层的函数
  const OneLevelUpHan = () => {
    history.back();
  };
  // 通过路由id获取数据
  const getTask_idHan = async () => {
    try {
      const res = await getLoad(loadId);
      console.log(res.data);
      setListDetail(res.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  // 获取目录全部数据
  const getdirectorylist = async () => {
    try {
      const res = await getDirectoryList({
        root_type: 1
      });
      if (res.code == '' && res.status == 200) {
        setDirectoryArr(res.data.src);
      }
    } catch (error) {
      console.error('Error fetching directory list:', error);
    }
  };
  const [directoryObj, setDirectoryObj] = useState({});
  // 获取子级表格改变的状态
  const getChildrenTableChange = (val) => {
    setDirectoryObj(val);
  };
  // 获取详情页面数据列表
  const getDetailList = async () => {
    try {
      setDetailListLoading(true);
      const res = await getLoadRecordList({
        task_id: Number(loadId),
        page: current,
        page_size: pageSize,
        record_id: searchValue,
        ...directoryObj
      });
      setTotal(res.data.total);
      setDetailList(res.data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailListLoading(false);
    }
  };
  const judgmentTask = () => {
    getDetailList();
    const boo = detailList?.findIndex((item) => item.status == 'running');
    setRunningFlag(boo == -1 ? false : true);
  };
  // 启停任务
  const startAndStoponchange = async (val) => {
    try {
      const res = await startAndStopeLoad({
        task_id: 116,
        cron_enable: val
      });
      console.log(res);
    } catch (err) {
      console.error(err);
    }
  };
  // 点击新建运行
  const runningHan = async () => {
    try {
      const res = await runLoad({
        task_id: Number(loadId)
      });
      console.log(res);
      if (res.code == '' && res.status == '200') {
        Message.success('新建运行成功');
        getDetailList();
        judgmentTask();
      } else {
        Message.error(res.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  useEffect(() => {
    getDetailList();
  }, [current, pageSize, directoryObj]);
  useEffect(() => {
    getdirectorylist();
    getTask_idHan();
  }, []);
  useEffect(() => {
    if (detailList) {
      const hasRunningTask = detailList.some(
        (item) => item.status === 'running'
      );
      console.log(hasRunningTask);

      setRunningFlag(hasRunningTask);
    }
  }, [detailList]);
  return (
    <div>
      <div
        style={{
          margin: '15px 0px',
          fontSize: '20px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <IconArrowLeft
          style={{ cursor: 'pointer' }}
          onClick={() => {
            OneLevelUpHan();
          }}
        />
        <Breadcrumb style={{ marginLeft: '15px', fontSize: '17px' }}>
          <BreadcrumbItem href="/tenant/compute/modaforge/dataLoad">
            数据载入
          </BreadcrumbItem>
          <BreadcrumbItem>{listDetail?.name}</BreadcrumbItem>
        </Breadcrumb>
      </div>
      <div
        style={{
          backgroundColor: 'white',
          display: 'flex',
          flexDirection: 'column',
          margin: '10px 20px 10px 0px',
          borderRadius: '10px'
        }}
      >
        <div className="box">
          <div style={{ fontSize: '17px', fontWeight: '600' }}>任务信息</div>
          <div
            style={{
              color: runningFlag ? '#ccc' : 'rgb(0, 125, 250)',
              pointerEvents: runningFlag ? 'none' : undefined,
              cursor: runningFlag ? '' : 'pointer'
            }}
            onClick={() => {
              console.log(listDetail);
              setEditVisible(true);
            }}
          >
            <IconEdit /> 编辑
          </div>
        </div>
        <div className="info-container">
          <div className="info-column">
            <div
              style={{
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <div
                style={{ fontWeight: 'bold', fontSize: '15px', width: '80px' }}
              >
                载入位置：
              </div>
              <div style={{ fontSize: '14px' }}>
                {listDetail && listDetail.data_path_name}
                {/* {findParent(directoryArr ? directoryArr : [], listDetail && listDetail.data_path_id)} */}
              </div>
            </div>
            <div
              style={{
                marginBottom: 16,
                display: 'flex'
                // alignItems: 'center'
              }}
            >
              <div
                style={{ fontWeight: 'bold', fontSize: '15px', width: '80px' }}
              >
                创建人：
              </div>
              <div style={{ fontSize: '14px' }}>
                {listDetail && listDetail.createor}
              </div>
            </div>
            <div
              style={{
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <div
                style={{ fontWeight: 'bold', fontSize: '15px', width: '80px' }}
              >
                创建时间：
              </div>
              <div style={{ fontSize: '14px' }}>
                {listDetail && listDetail.created_at}
              </div>
            </div>
            <div
              style={{
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <div
                style={{ fontWeight: 'bold', fontSize: '15px', width: '80px' }}
              >
                更新时间：
              </div>
              <div style={{ fontSize: '14px' }}>
                {listDetail && listDetail.last_run_time}
              </div>
            </div>
          </div>
          <div className="info-column">
            <div
              style={{
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <div
                style={{ fontWeight: 'bold', fontSize: '15px', width: '90px' }}
              >
                数据源类型：
              </div>
              <div style={{ fontSize: '14px' }}>
                {listDetail && listDetail.source_type}
              </div>
            </div>
            <div
              style={{
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <div
                style={{ fontWeight: 'bold', fontSize: '15px', width: '90px' }}
              >
                连接器名称：
              </div>
              <div style={{ fontSize: '14px' }}>
                {listDetail && listDetail.connector_name}
              </div>
            </div>
            <div
              style={{
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <div
                style={{ fontWeight: 'bold', fontSize: '15px', width: '90px' }}
              >
                载入形式：
              </div>
              <div style={{ fontSize: '14px' }}>
                {listDetail && listDetail.load_type == 'once'
                  ? '单次载入'
                  : '周期载入'}
                {listDetail && listDetail.load_type == 'cron' && (
                  <Switch
                    defaultChecked={listDetail && listDetail.cron_enable}
                    checkedText="启用"
                    uncheckedText="停止"
                    style={{ marginLeft: '10px' }}
                    onChange={(val) => {
                      startAndStoponchange(val);
                    }}
                  />
                )}
              </div>
            </div>
            {listDetail && listDetail.load_type == 'cron' && (
              <div
                style={{
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'flex-start'
                }}
              >
                <div
                  style={{
                    fontWeight: 'bold',
                    fontSize: '15px',
                    width: '90px'
                  }}
                >
                  周期设置：
                </div>
                <div className="ellipsis-two-lines-cron">
                  {parseCron(
                    listDetail &&
                      listDetail.run_config &&
                      listDetail.run_config.cycle_text
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div
          style={{
            margin: '15px 0px 15px 20px',
            fontSize: '17px',
            fontWeight: '600'
          }}
        >
          运行历史
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            padding: '0px 15px'
          }}
        >
          <InputSearch
            placeholder="搜索运行ID"
            style={{ width: 230 }}
            onPressEnter={() => {
              getDetailList();
            }}
            onChange={(value) => {
              setSearchValue(value);
            }}
          />
          <Button
            type="primary"
            icon={<IconPlus />}
            disabled={runningFlag ? true : false}
            onClick={() => {
              runningHan();
            }}
          >
            新建运行
          </Button>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'end'
          }}
        >
          <TableDetail
            taskId={listDetail && listDetail.task_id}
            judgmentTaskHan={judgmentTask}
            {...detailList}
            datalist={detailList}
            loading={detailListLoading}
            name={listDetail?.name || ''}
            change={getChildrenTableChange}
          />
          <Pagination
            sizeOptions={[10, 20, 50, 100]}
            showTotal
            total={total}
            showJumper
            sizeCanChange
            style={{ margin: '20px 30px' }}
            onChange={handlePageChange}
            onPageSizeChange={(pageSize) => {
              setPageSize(pageSize);
              setCurrent(1);
            }}
          />
        </div>
        <Modal
          style={{ width: '600px' }}
          title="编辑数据载入任务"
          visible={editVisible}
          // onOk={() => setEditVisible(false)}
          onCancel={() => setEditVisible(false)}
          autoFocus={false}
          focusLock={true}
          footer={null}
          unmountOnExit={true}
        >
          <Edit
            hideEditModalHan={hideEditModal}
            detailData={listDetail}
            editForm={form}
            getDetailList={getTask_idHan}
            loadId={Number(loadId)}
            cron={
              listDetail &&
              listDetail.run_config &&
              listDetail.run_config.cycle_text
            }
          />
        </Modal>
      </div>
    </div>
  );
};
export default DataLoadDetail;
