import React, { useMemo, useState } from 'react';
import { Button, Select, Space, Tooltip } from '@arco-design/web-react';
import { useRequest } from 'ahooks';
import { isNil } from 'lodash-es';
import {
  getFunctionDetail,
  getFunctionList
} from '@/api/ontologySceneLibrary/ontologyFunction';
import styles from './index.module.scss';
import {
  IconClose,
  IconCloseCircle,
  IconDown,
  IconInfoCircle
} from '@arco-design/web-react/icon';
import { FunctionContentDialog } from '@/pages/ontologyScene/modules/behaviorActionDetail/components';
import { useParams } from 'react-router-dom';
import { OntologyFunctionDetail } from '@/pages/ontologyScene/types/ontologyFunction';
import classNames from 'classnames';
import { GlobalTooltip } from '@ceai-front/arco-material';

export const FunctionsSelect = (
  props: CustomFormItemCompProps<number | undefined> & {
    currentFunctionData?: OntologyFunctionDetail;
  }
) => {
  const {
    value,
    onChange,
    disabled,
    currentFunctionData: functionDetail
  } = props;
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
  const [showFunction, setShowFunction] = useState(functionDetail);

  const changeFunction = (value: number | undefined) => {
    const functionData = allFunctions.find((f) => f.id === value);
    onChange?.(value, functionData);
  };

  const searchFunction = (text: string) => {
    return allFunctions.flatMap(({ code, name, id }) => {
      if (code.includes(text) || name.includes(text)) {
        return [id];
      }
      return [];
    });
  };

  const currentFunction = allFunctions.find((f) => f.id === value);

  return (
    <div className={classNames([`flex items-center gap-3`, props.className])}>
      <Select
        placeholder={'请选择或搜索函数'}
        className={`flex-1 ${styles['function-select']}`}
        dropdownMenuClassName={styles['function-select-wrapper']}
        renderFormat={(option, value) => {
          if (isNil(value)) return null;
          return option?.children?.[0] ?? null;
        }}
        getPopupContainer={(node) => node.parentElement || document.body}
        arrowIcon={
          <div className={'flex items-center gap-2'}>
            {!!value && (
              <Tooltip content={'详情'}>
                <IconInfoCircle
                  className={
                    'function-info-icon z-50 cursor-pointer text-[16px]'
                  }
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setShowFunctionContent(true);
                    setShowFunction(currentFunction);
                  }}
                />
              </Tooltip>
            )}
            <IconDown />
          </div>
        }
        allowClear
        clearIcon={
          <div className={'flex items-center gap-2'}>
            {!!value && (
              <Tooltip content={'详情'}>
                <IconInfoCircle
                  className={
                    'function-info-icon z-50 cursor-pointer text-[16px]'
                  }
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setShowFunctionContent(true);
                    setShowFunction(currentFunction);
                  }}
                />
              </Tooltip>
            )}
            <IconClose
              onClick={(e) => {
                e.stopPropagation();
                changeFunction(undefined);
              }}
            />
          </div>
        }
        value={value}
        onChange={changeFunction}
        showSearch
        filterOption={(inputValue, option) => {
          return searchFunction(inputValue).includes(option.props.value);
        }}
      >
        {allFunctions.map((item) => {
          const { value, code, name } = item;
          return (
            <Select.Option
              key={value}
              value={value as string}
              className={styles['select-option']}
            >
              <GlobalTooltip.Ellipsis text={code} />
              <Tooltip content={'详情'}>
                <IconInfoCircle
                  className={`${styles['function-info-icon']} z-50 cursor-pointer text-[16px]`}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setShowFunctionContent(true);
                    setShowFunction(item);
                  }}
                />
              </Tooltip>
              <div
                className={
                  'flex items-center overflow-hidden font-PingFangSc text-[12px] leading-[18px] text-[#7D859C]'
                }
              >
                显示名称：
                <GlobalTooltip.Ellipsis text={name} />
              </div>
            </Select.Option>
          );
        })}
      </Select>
      <FunctionContentDialog
        data={showFunction}
        visible={showFunctionContent}
        onCancel={() => setShowFunctionContent(false)}
      />
    </div>
  );
};
