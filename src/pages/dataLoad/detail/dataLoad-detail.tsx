import {
  Breadcrumb,
  Button,
  Form,
  Grid,
  Input,
  Message,
  Modal,
  Pagination,
  Popover,
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
import EllipsisPopoverCom from '@/components/ellipsis-popover-com';
import { DATA_LOAD_PERMISSIONS } from '@/config/permissions';
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
      setListDetail(res.data);
      setPerms(res.data.perms);
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
  // 详情页面所有权限
  const [perms, setPerms] = useState<any>([]);
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
        execution_id: searchValue.trim(),
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
    const boo = detailList?.findIndex(
      (item) => item.status == 'succeed' || item.status == 'stopping'
    );
    setRunningFlag(boo == -1 ? false : true);
  };
  // 停止中的过程
  const StopeJudgmentTask = async () => {
    try {
      setDetailListLoading(true);
      const res = await getLoadRecordList({
        task_id: Number(loadId),
        page: current,
        page_size: pageSize,
        execution_id: searchValue.trim(),
        ...directoryObj
      });
      if (res.data.items[0].status === 'stopped') {
        Message.success('任务已停止');
      } else {
        if (res.data.items[0].status === 'failed') {
          Message.error(res.data.items[0].error_msg);
        } else {
          Message.error('任务停止失败');
        }
      }
      setTotal(res.data.total);
      setDetailList(res.data.items);
      const boo = detailList?.findIndex(
        (item) => item.status == 'succeed' || item.status == 'stopping'
      );
      setRunningFlag(boo == -1 ? false : true);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailListLoading(false);
    }
  };
  // 启停任务
  const startAndStoponchange = async (val) => {
    try {
      const res = await startAndStopeLoad({
        task_id: Number(loadId),
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
        Message.success(`已成功发起载入任务${listDetail?.name}`);
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

  const clearHan = async () => {
    try {
      setDetailListLoading(true);
      const res = await getLoadRecordList({
        task_id: Number(loadId),
        page: 1,
        page_size: pageSize,
        execution_id: '',
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
  useEffect(() => {
    if (detailList) {
      const hasRunningTask = detailList.some(
        (item) => item.status === 'running' || item.status === 'stopping'
      );
      console.log(hasRunningTask);

      setRunningFlag(hasRunningTask);
    }
  }, [detailList]);

  return (
    <div>
      <div
        style={{
          margin: '14px 0px',
          fontSize: '20px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <IconArrowLeft
          style={{ cursor: 'pointer', fontSize: '14px', marginTop: '2px' }}
          onClick={() => {
            OneLevelUpHan();
          }}
        />
        <Breadcrumb
          style={{
            marginLeft: '20px',
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <BreadcrumbItem
            href="/tenant/compute/modaforge/dataLoad"
            style={{ color: '#7F8C9F' }}
          >
            数据载入详情
          </BreadcrumbItem>
          <BreadcrumbItem>
            <div style={{ maxWidth: '300px' }}>
              <EllipsisPopoverCom value={listDetail?.name}></EllipsisPopoverCom>
            </div>
          </BreadcrumbItem>
        </Breadcrumb>
      </div>
      <div
        className="dataload-detail-method"
        style={{
          backgroundColor: 'white',
          display: 'flex',
          flexDirection: 'column',
          // margin: '10px 10px 20px 10px',
          borderRadius: '10px',
          minHeight: '87vh'
        }}
      >
        <div className="box">
          <div style={{ fontSize: '17px', fontWeight: '600' }}>任务信息</div>

          {perms.includes(DATA_LOAD_PERMISSIONS.CAN_UPDATE) && (
            <div
              style={{
                color: runningFlag ? '#ccc' : 'rgb(0, 125, 250)',
                pointerEvents: runningFlag ? 'none' : undefined,
                cursor: runningFlag ? '' : 'pointer',
                fontSize: '14px'
              }}
              onClick={() => {
                setEditVisible(true);
                console.log(listDetail?.run_config?.cycle_text);
              }}
            >
              <IconEdit /> 编辑
            </div>
          )}
        </div>
        <div className="info-container">
          <div className="info-column">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                margin: '5px'
              }}
            >
              <div
                style={{ fontWeight: '500', fontSize: '14px', width: '80px' }}
              >
                载入位置：
              </div>
              <div
                style={{
                  fontSize: '14px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '400px'
                }}
              >
                {listDetail && (
                  <EllipsisPopoverCom
                    value={listDetail.data_path_name}
                    isEdit={false}
                  />
                )}
                {/* {findParent(directoryArr ? directoryArr : [], listDetail && listDetail.data_path_id)} */}
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                margin: '5px'
                // alignItems: 'center'
              }}
            >
              <div
                style={{ fontWeight: '500', fontSize: '14px', width: '80px' }}
              >
                创建人：
              </div>
              <div style={{ fontSize: '14px' }}>
                {listDetail && listDetail.createor}
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                margin: '5px'
              }}
            >
              <div
                style={{ fontWeight: '500', fontSize: '14px', width: '80px' }}
              >
                创建时间：
              </div>
              <div style={{ fontSize: '14px' }}>
                {listDetail && listDetail.created_at}
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                margin: '5px'
              }}
            >
              <div
                style={{ fontWeight: '500', fontSize: '14px', width: '80px' }}
              >
                更新时间：
              </div>
              <div style={{ fontSize: '14px' }}>
                {listDetail && listDetail.last_run_time}
              </div>
            </div>
          </div>
          <div
            className="info-column"
            style={{ justifyContent: 'space-between' }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                margin: '5px'
              }}
            >
              <div
                style={{ fontWeight: '500', fontSize: '14px', width: '90px' }}
              >
                数据源类型：
              </div>
              <div style={{ fontSize: '14px' }}>
                {listDetail && listDetail.source_type}
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                margin: '5px'
              }}
            >
              <div
                style={{ fontWeight: '500', fontSize: '14px', width: '90px' }}
              >
                连接器名称：
              </div>
              <div
                style={{
                  fontSize: '14px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '400px'
                }}
              >
                {listDetail && (
                  <EllipsisPopoverCom
                    value={listDetail.connector_name}
                    isEdit={false}
                  />
                )}
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                margin: '5px'
              }}
            >
              <div
                style={{ fontWeight: '500', fontSize: '14px', width: '90px' }}
              >
                载入形式：
              </div>
              <div
                style={{
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {listDetail && listDetail.load_type == 'once'
                  ? '单次载入'
                  : '周期载入'}
                {listDetail && listDetail.load_type == 'cron' && (
                  <Switch
                    className={'cronSwitch'}
                    size="default"
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
                  display: 'flex',
                  alignItems: 'flex-start',
                  margin: '5px'
                }}
              >
                <div
                  style={{
                    fontWeight: '500',
                    fontSize: '14px',
                    width: '90px'
                  }}
                >
                  周期设置：
                </div>
                <div className="ellipsis-two-lines-cron">
                  <EllipsisPopoverCom
                    value={parseCron(
                      listDetail &&
                        listDetail.run_config &&
                        listDetail.run_config.cycle_text
                    )}
                    isEdit={false}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <div
          style={{
            margin: '15px 0px 15px 24px',
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
            padding: '0px 20px 0px 24px'
          }}
        >
          <InputSearch
            onClear={clearHan}
            allowClear
            placeholder="搜索运行ID"
            style={{ width: 220 }}
            onPressEnter={() => {
              getDetailList();
            }}
            onChange={(value) => {
              setSearchValue(value);
            }}
          />
          {perms.includes(DATA_LOAD_PERMISSIONS.CAN_START) && (
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
          )}
        </div>
        <div
          style={{
            width: '100%',
            overflow: 'hidden'
          }}
        >
          <TableDetail
            taskId={listDetail && listDetail.task_id}
            judgmentTaskHan={judgmentTask}
            TimedStops={StopeJudgmentTask}
            {...detailList}
            datalist={detailList}
            loading={detailListLoading}
            name={listDetail?.name || ''}
            change={getChildrenTableChange}
            permission={perms}
          />
        </div>
        <Pagination
          sizeOptions={[10, 20, 50, 100]}
          showTotal
          total={total}
          showJumper
          sizeCanChange
          style={{
            margin: '20px 30px',
            display: 'flex',
            justifyContent: 'end'
          }}
          onChange={handlePageChange}
          onPageSizeChange={(pageSize) => {
            setPageSize(pageSize);
            setCurrent(1);
          }}
        />
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
