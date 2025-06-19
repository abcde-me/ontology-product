import React from "react";
import { Breadcrumb } from "@arco-design/web-react";
import { IconArrowLeft } from "@arco-design/web-react/icon";
import { useParams } from '@/utils/url'
import { useHistory } from "react-router";
import './detail.css'

const BreadcrumbItem = Breadcrumb.Item;

export default function WorkflowTaskDetail() {
  const taskId = useParams('id');
  const history = useHistory();
  return (
    <div className="workflow-task-detail">
      <Breadcrumb style={{ fontSize: 12 }}>
        <BreadcrumbItem onClick={() => history.goBack()}>
          <IconArrowLeft />
        </BreadcrumbItem>
        <BreadcrumbItem>作业详情</BreadcrumbItem>
        <BreadcrumbItem>{taskId}</BreadcrumbItem>
      </Breadcrumb>
    </div>
  )
}