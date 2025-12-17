import React from 'react';
import {
  Button,
  Collapse,
  Form,
  Modal,
  Tree,
  Typography
} from '@arco-design/web-react';
import styles from './index.module.scss';
import BlockIcon from '@/pages/workflowConfig/workflow/block-icon';
import { IconDelete } from '@arco-design/web-react/icon';
import useArcoTable from '@/hooks/use-arco-table';
import { SearchWorkflowParams } from '@/pages/workflowList/types';
import { SorterInfo } from '@arco-design/web-react/lib/Table/interface';
import { getStructuredWorkflowList } from '@/api/workflowList';
import form from '@/pages/workflowConfig/components/markdown-blocks/form';

const CollapseItem = Collapse.Item;

export const TaskItem = () => {
  return (
    <div
      className={`mb-2 flex items-center gap-2 ${styles['task-item']} flex-1`}
    >
      {/*@ts-ignore*/}
      <BlockIcon type={'workflow'} size={'md'} />
      <div>
        <Typography.Text bold className={'mb-2'}>
          这是标题
        </Typography.Text>
        <div>这是描述</div>
      </div>
    </div>
  );
};

export const DependentTaskDialog = () => {
  const [form] = Form.useForm();
  useArcoTable(
    ({ pagination, filters, sorter, query }) => {
      const searchParams: SearchWorkflowParams = {
        page: pagination.current,
        page_size: pagination.pageSize,
        ...query
      };
      return getStructuredWorkflowList(searchParams);
    },
    {
      defaultPage: 1,
      defaultPageSize: 10,
      deps: [],
      form
    }
  );

  return (
    <Modal visible={true} title={'外部任务设置'} style={{ width: '60vw' }}>
      <div className={`flex ${styles['modal-content']} w-full`}>
        <div className={`${styles['left']} flex-1 flex-col gap-2 p-4`}>
          <div className={`${styles['left-header']} flex-shrink-0`}></div>
          <div className={`${styles['left-body']} flex-1`}></div>
          <div className={`${styles['left-footer']} flex-shrink-0`}></div>
        </div>
        <div className={`${styles['right']} flex-1 p-4`}></div>
      </div>
    </Modal>
  );
};
