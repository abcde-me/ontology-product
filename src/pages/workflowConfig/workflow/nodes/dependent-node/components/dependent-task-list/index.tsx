import React, { useState } from 'react';
import styles from '../../index.module.scss';
import { Button, Checkbox, Typography } from '@arco-design/web-react';
import { IconDelete, IconPlus, IconSwap } from '@arco-design/web-react/icon';
import BlockIcon from '@/pages/workflowConfig/workflow/block-icon';
import { DependentTaskDialog } from '../../components';
import { DependItem, DependRelation } from '../../types';

type DependentTaskValue = {
  relation: DependRelation;
  list: DependItem[];
};

interface IProps {
  value?: DependentTaskValue;
  onChange?: (value?: DependentTaskValue) => void;
  disabled?: boolean;
}

export const DependentTaskList = (props: IProps) => {
  const { value, onChange, disabled } = props;
  const [showModal, setShowModal] = useState(false);

  const changeDependentTask = (value?: DependentTaskValue) => {
    onChange?.(value);
  };

  return (
    <div
      className={`flex gap-2  ${styles['dependent-task-list']} w-full overflow-hidden`}
    >
      {!!value && value.list.length > 1 && (
        <div
          className={`relative flex w-[48px] flex-shrink-0 justify-center font-medium ${styles[`relation-${value?.relation === DependRelation.OR ? 'or' : 'and'}`]}`}
        >
          <div className={'h-full w-1 bg-[#EEF6FF]'} />
          <div
            className={`${styles['operator']} absolute z-[1] flex h-[30px] w-12 items-center justify-center rounded-[4px] bg-[#EEF6FF]`}
            onClick={() => {
              const { relation = DependRelation.AND, list } = value || {};
              changeDependentTask({
                relation:
                  relation === DependRelation.AND
                    ? DependRelation.OR
                    : DependRelation.AND,
                list
              });
            }}
          >
            {value?.relation === DependRelation.OR ? '或' : '且'}
            <IconSwap />
          </div>
        </div>
      )}
      <div className={'flex-1 overflow-y-auto overflow-x-hidden'}>
        {(value?.list || []).map((item) => {
          const { definitionCode, title, desc, parameterPassing, task_type } =
            item;
          return (
            <div
              className={`mb-2 flex w-full items-center gap-2 `}
              key={definitionCode}
            >
              <div
                className={`flex items-center gap-2 ${styles['node-item']} flex-1 overflow-hidden`}
              >
                <BlockIcon
                  type={task_type || 'workflow'}
                  size={'md'}
                  className={'flex-shrink-0'}
                />
                <div className={'flex-1 overflow-hidden'}>
                  <div
                    className={
                      'w-full overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[#1E293B]'
                    }
                  >
                    {title}
                  </div>
                  {!!desc && (
                    <div
                      className={
                        'mt-1 w-full overflow-hidden text-ellipsis whitespace-nowrap text-[#94A3B8]'
                      }
                    >
                      {desc}
                    </div>
                  )}
                </div>
                <Checkbox
                  className={'flex-shrink-0'}
                  checked={parameterPassing}
                  onChange={(checked) => {
                    const { relation, list } = value!;
                    changeDependentTask({
                      relation,
                      list: list.map((item) => {
                        if (item.definitionCode === definitionCode) {
                          item.parameterPassing = checked;
                        }
                        return item;
                      })
                    });
                  }}
                >
                  参数传递
                </Checkbox>
              </div>
              <Button
                type={'text'}
                icon={<IconDelete />}
                onClick={() => {
                  const { relation, list } = value!;
                  changeDependentTask({
                    relation,
                    list: list.filter(
                      (item) => item.definitionCode !== definitionCode
                    )
                  });
                }}
              />
            </div>
          );
        })}
        <Button
          type={'default'}
          className={'w-full'}
          icon={<IconPlus />}
          disabled={disabled}
          onClick={() => {
            setShowModal(true);
          }}
        >
          <Typography.Text bold>选择工作流/任务节点</Typography.Text>
        </Button>
      </div>
      <DependentTaskDialog
        data={value?.list || []}
        open={showModal}
        onOk={(data) => {
          const { relation = DependRelation.AND } = value || {};
          changeDependentTask({
            relation,
            list: data
          });
        }}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};
