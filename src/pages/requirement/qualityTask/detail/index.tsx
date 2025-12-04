import { Breadcrumb } from '@arco-design/web-react';
import { IconArrowLeft } from '@arco-design/web-react/icon';
import React from 'react';
import { useHistory } from 'react-router';

import './index.scss';

const BreadcrumbItem = Breadcrumb.Item;
function QualityTaskDetail() {
  const history = useHistory();
  return (
    <div className="quality-task-detail">
      <div className="head-breadcrumb-box">
        <IconArrowLeft
          style={{ cursor: 'pointer', fontSize: '14px', marginRight: 12 }}
          onClick={() => history.goBack()}
        />
        <Breadcrumb style={{ fontSize: 20 }}>
          <BreadcrumbItem
            onClick={() => history.goBack()}
            className={'breadcrumb-text'}
          >
            质检任务
          </BreadcrumbItem>
          <BreadcrumbItem>{''}</BreadcrumbItem>
        </Breadcrumb>
      </div>
      <div className="quality-task-detail-content"></div>
    </div>
  );
}

export default QualityTaskDetail;
