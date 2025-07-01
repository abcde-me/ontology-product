import {
  Breadcrumb,
  Grid,
  Input,
  Modal,
  Pagination,
  Switch
} from '@arco-design/web-react';
import { IconArrowLeft, IconEdit } from '@arco-design/web-react/icon';
import React, { useEffect, useState } from 'react';
import { Router } from 'react-router';
import './index.css';
import AccessTable from './access-tabel';

const InputSearch = Input.Search;
const Row = Grid.Row;
const Col = Grid.Col;
const BreadcrumbItem = Breadcrumb.Item;
const AccessDetail = () => {
  // 文件 成功  失败
  const filed = {
    fild: 125123,
    succeed: 124223,
    error: 7
  };
  // 返回上一层的函数
  const OneLevelUpHan = () => {
    history.back();
  };
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
            <BreadcrumbItem>新建成功的载入名称</BreadcrumbItem>
            <BreadcrumbItem>载入名称记录</BreadcrumbItem>
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
                background: 'red',
                borderRadius: '50%'
              }}
            ></div>
            <div style={{ marginLeft: '5px', fontSize: '14px' }}>失败</div>
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
              <Col span={20}>1</Col>
            </Row>
            <Row className={'task-left-item'}>
              <Col span={4} className={'fontWeight'}>
                结束时间：
              </Col>
              <Col span={20}>2</Col>
            </Row>
            <Row className={'task-left-item'}>
              <Col span={4} className={'fontWeight'}>
                运行时长：
              </Col>
              <Col span={20}>3</Col>
            </Row>
          </div>
          <div className="task-right">
            <div className="task-right-item" style={{ color: 'black' }}>
              <div>总文件</div>
              <div className="fontSize">{filed.fild.toLocaleString()}</div>
            </div>
            <div className="task-right-item" style={{ color: 'green' }}>
              <div>成功</div>
              <div className="fontSize">{filed.succeed.toLocaleString()}</div>
            </div>
            <div className="task-right-item" style={{ color: 'red' }}>
              <div>失败</div>
              <div className="fontSize">{filed.error.toLocaleString()}</div>
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
        />
        <AccessTable />
      </div>
    </div>
  );
};
export default AccessDetail;
