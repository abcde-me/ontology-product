import React, { useMemo, useState } from 'react';
import { Button, Select, Tooltip } from '@arco-design/web-react';
import { useRequest } from 'ahooks';
import { isNil } from 'lodash-es';
import {
  getFunctionDetail,
  getFunctionList
} from '@/api/ontologySceneLibrary/ontologyFunction';
import styles from './index.module.scss';
import { IconInfoCircle } from '@arco-design/web-react/icon';
import { FunctionContentDialog } from '@/pages/ontologyScene/modules/behaviorActionDetail/components';
import { useParams } from 'react-router-dom';

export const FunctionsSelect = (
  props: CustomFormItemCompProps<number | undefined>
) => {
  const { value, onChange, disabled } = props;
  const { id: OSId } = useParams<Record<string, string>>();
  const { data: allFunctions = [], loading: functionsLoading } = useRequest(
    () => {
      return getFunctionList({
        ontologyModelID: +OSId,
        pageNum: 1,
        pageSize: 1000
      }).then((res) =>
        res.items.map((f) => {
          return {
            ...f,
            label: f.name,
            value: f.id
          };
        })
      );
    }
  );
  const [showFunctionContent, setShowFunctionContent] = useState(false);

  const { data: functionDetail } = useRequest(
    () => {
      if (isNil(value)) return Promise.resolve(undefined);
      return getFunctionDetail(value);
    },
    {
      refreshDeps: [value]
    }
  );

  const changeFunction = (value: number | undefined) => {
    const functionData = allFunctions.find((f) => f.id === value);
    onChange?.(value, functionData);
  };

  return (
    <div className={'flex w-full items-center gap-3'}>
      <Select
        placeholder={'请选择行为动作的函数'}
        className={`flex-1 ${styles['function-select']}`}
        dropdownMenuClassName={styles['function-select-wrapper']}
        renderFormat={(option, value) => {
          if (isNil(value)) return null;
          return option?.children?.[0] ?? null;
        }}
        value={value}
        allowClear
        onChange={changeFunction}
      >
        {allFunctions.map((item) => {
          const { value, code, name } = item;
          return (
            <Select.Option
              key={value}
              value={value as string}
              className={styles['select-option']}
            >
              <div
                className={`${styles['function-name']} font-PingFangSc text-[14px] leading-[22px] text-[#0F131F]`}
              >
                {code}
                <Tooltip content={'详情'}>
                  <IconInfoCircle
                    className={'function-info-icon text-[16px]'}
                    onClick={(event) => {
                      event.stopPropagation();
                      setShowFunctionContent(true);
                    }}
                  />
                </Tooltip>
              </div>
              <div
                className={
                  'font-PingFangSc text-[12px] leading-[22px] text-[#7D859C]'
                }
              >
                显示名称：{name}
              </div>
            </Select.Option>
          );
        })}
      </Select>
      <FunctionContentDialog
        data={functionDetail}
        visible={showFunctionContent}
        onCancel={() => setShowFunctionContent(false)}
      />
    </div>
  );
};
