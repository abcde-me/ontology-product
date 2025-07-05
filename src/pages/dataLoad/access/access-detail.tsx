import { Breadcrumb, Grid, Input } from '@arco-design/web-react';
import { IconArrowLeft, IconEdit } from '@arco-design/web-react/icon';
import React, { useEffect, useState } from 'react';
import './index.css';
import AccessTable from './access-tabel';
import { useParams } from '@/utils/url';
import { getLoadRecord } from '@/api/loadApi';

const InputSearch = Input.Search;
const Row = Grid.Row;
const Col = Grid.Col;
const BreadcrumbItem = Breadcrumb.Item;

const AccessDetail = () => {
  const recordsId = useParams('execution_id');
  const name = useParams('name');
  const [arressDetail, setArressDetail] = useState<any>({});
  // 输入框的默认状态
  const [searchValue, setSearchValue] = useState('');
  // 返回上一层的函数
  const OneLevelUpHan = () => {
    history.back();
  };
  // 获取上面的详情
  const getDetail = async () => {
    try {
      const res = await getLoadRecord(recordsId);
      setArressDetail(res.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getDetail();
  }, []);
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
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Breadcrumb style={{ marginLeft: '15px', fontSize: '17px' }}>
            <BreadcrumbItem href="/tenant/compute/modaforge/dataLoad">
              数据载入
            </BreadcrumbItem>
            <BreadcrumbItem
              onClick={() => {
                history.back();
              }}
              className="bread-style"
            >
              {name}
            </BreadcrumbItem>
            <BreadcrumbItem>{arressDetail.execution_name}</BreadcrumbItem>
          </Breadcrumb>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: '15px'
            }}
          >
            <div
              style={{
                width: '7px',
                height: '7px',
                // background:arressDetail.status === '成功' ? '#52C41A' : '#F5222D',
                borderRadius: '50%'
              }}
            ></div>
            <div style={{ marginLeft: '5px', fontSize: '14px' }}>
              {arressDetail.status}
            </div>
          </div>
        </div>
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
        <div
          style={{
            fontSize: '17px',
            fontWeight: '600',
            margin: '15px 0px 0px 17px'
          }}
        >
          任务信息
        </div>
        <div className="task-box">
          <div className="task-left">
            <Row className={'task-left-item'}>
              <Col span={4} className={'fontWeight'}>
                开始时间：
              </Col>
              <Col span={20} style={{ fontSize: '14px' }}>
                {arressDetail.start_time}
              </Col>
            </Row>
            <Row className={'task-left-item'}>
              <Col span={4} className={'fontWeight'}>
                结束时间：
              </Col>
              <Col span={20} style={{ fontSize: '14px' }}>
                {arressDetail.end_time}
              </Col>
            </Row>
            <Row className={'task-left-item'}>
              <Col span={4} className={'fontWeight'}>
                运行时长：
              </Col>
              <Col span={20} style={{ fontSize: '14px' }}>
                {arressDetail.enable}
              </Col>
            </Row>
          </div>
          <div className="task-right">
            <div className="task-right-item" style={{ color: 'black' }}>
              <div>总文件</div>
              <div className="fontSize">{arressDetail.enable}</div>
            </div>
            <div className="task-right-item" style={{ color: 'green' }}>
              <div>成功</div>
              <div className="fontSize">{arressDetail.success_files}</div>
            </div>
            <div className="task-right-item" style={{ color: 'red' }}>
              <div>失败</div>
              <div className="fontSize">{arressDetail.failed_files}</div>
            </div>
          </div>
        </div>
        <div
          style={{
            fontSize: '17px',
            fontWeight: '600',
            margin: '15px 0px 15px 17px'
          }}
        >
          文件详情
        </div>
        <InputSearch
          allowClear
          placeholder="搜索文件名"
          style={{ width: 200, marginLeft: '17px' }}
          onPressEnter={(e) => {
            setSearchValue(e.target.value);
          }}
        />
        <AccessTable records_id={recordsId} searchValue={searchValue} />
      </div>
    </div>
  );
};
export default AccessDetail;
