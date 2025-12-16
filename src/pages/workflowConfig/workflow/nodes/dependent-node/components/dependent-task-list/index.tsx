import React from 'react';
import styles from '../../index.module.scss';
import { Button, Typography } from '@arco-design/web-react';
import { IconDelete, IconPlus } from '@arco-design/web-react/icon';
import BlockIcon from '@/pages/workflowConfig/workflow/block-icon';
import { BlockEnum } from '@/pages/workflowConfig/workflow/types';

export const DependentTaskList = () => {
  return (
    <div className={`flex gap-2  ${styles['dependent-task-list']}`}>
      <div className={'relative flex w-12 justify-center'}>
        <div className={'h-full w-1 bg-[#EEF6FF]'} />
        <div
          className={`transform() ${styles['operator']} absolute z-[1] h-[30px] w-12 rounded-[4px] bg-[#EEF6FF]`}
        ></div>
      </div>
      <div className={'w-full'}>
        <div className={'flex w-full items-center gap-2'}>
          <div
            className={`mb-2 flex items-center gap-2 ${styles['node-item']} flex-1`}
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
          <Button type={'text'} icon={<IconDelete />}></Button>
        </div>
        <Button type={'default'} className={'w-full'} icon={<IconPlus />}>
          <Typography.Text bold>选择工作流/任务节点</Typography.Text>
        </Button>
      </div>
    </div>
  );
};
