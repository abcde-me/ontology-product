import React, { useMemo, useState } from 'react';
import { Button, Message, Select, Tooltip } from '@arco-design/web-react';
import { useRequest } from 'ahooks';
import { isNil } from 'lodash-es';
import { getFunctionList } from '@/api/ontologySceneLibrary/ontologyFunction';
import styles from './index.module.scss';
import {
  IconClose,
  IconDown,
  IconInfoCircle,
  IconRobot
} from '@arco-design/web-react/icon';
import { FunctionContentDialog } from '../FunctionContentDialog';
import { FunctionRecommendModal } from '../FunctionRecommendModal';
import { getFunctionDetail } from '@/api/ontologySceneLibrary/ontologyFunction';
import { useParams } from 'react-router-dom';
import { OntologyFunctionDetail } from '@/pages/ontologyScene/types/ontologyFunction';
import classNames from 'classnames';
import { GlobalTooltip } from '@ceai-front/arco-material';
import {
  recommendBehaviorFunctions,
  type BehaviorFunctionRecommendation,
  type BehaviorFunctionRecommendSource
} from '@/pages/ontologyScene/modules/behaviorActionDetail/services/recommendBehaviorFunctions';

export const FunctionsSelect = (
  props: CustomFormItemCompProps<number | undefined> & {
    currentFunctionData?: OntologyFunctionDetail;
    behaviorName?: string;
    behaviorDescription?: string;
    objectTypeName?: string;
  }
) => {
  const {
    value,
    onChange,
    disabled,
    currentFunctionData: functionDetail,
    behaviorName,
    behaviorDescription,
    objectTypeName
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
  const [recommendVisible, setRecommendVisible] = useState(false);
  const [recommending, setRecommending] = useState(false);
  const [recommendations, setRecommendations] = useState<
    BehaviorFunctionRecommendation[]
  >([]);
  const [recommendSource, setRecommendSource] =
    useState<BehaviorFunctionRecommendSource>();

  const normalizeFunctionId = (
    rawValue: number | string | undefined
  ): number | undefined => {
    if (rawValue === undefined || rawValue === null || rawValue === '') {
      return undefined;
    }
    const numericValue = Number(rawValue);
    return Number.isFinite(numericValue) ? numericValue : undefined;
  };

  const changeFunction = (rawValue: number | string | undefined) => {
    const functionId = normalizeFunctionId(rawValue);
    const functionData = allFunctions.find((f) => f.id === functionId);
    onChange?.(functionId, functionData);
  };

  const searchFunction = (text: string) => {
    return allFunctions.flatMap(({ code, name, id }) => {
      if (code?.includes(text) || name?.includes(text)) {
        return [id];
      }
      return [];
    });
  };

  const currentFunction = useMemo(
    () => allFunctions.find((f) => f.id === value),
    [allFunctions, value]
  );

  const handleSmartRecommend = async () => {
    if (!behaviorName?.trim()) {
      Message.warning('请先填写行为名称');
      return;
    }

    if (!allFunctions.length) {
      Message.warning('当前场景暂无可用函数，请先创建函数');
      return;
    }

    setRecommendVisible(true);
    setRecommending(true);
    setRecommendations([]);
    setRecommendSource(undefined);

    try {
      const result = await recommendBehaviorFunctions({
        behaviorName,
        behaviorDescription,
        objectTypeName,
        functions: allFunctions
      });
      setRecommendations(result.recommendations);
      setRecommendSource(result.source);
    } catch (error) {
      Message.error({
        content: (error as Error)?.message || '智能推荐失败，请稍后重试',
        duration: 3000
      });
      setRecommendVisible(false);
    } finally {
      setRecommending(false);
    }
  };

  const handleSelectRecommendation = async (functionId: number) => {
    setRecommendVisible(false);

    try {
      const fullDetail = await getFunctionDetail(functionId);
      if (!fullDetail) {
        Message.error('函数详情加载失败，请手动选择');
        return;
      }

      onChange?.(functionId, fullDetail);
      Message.success('已选用推荐函数');
    } catch (error) {
      Message.error({
        content: (error as Error)?.message || '选用推荐函数失败，请手动选择',
        duration: 3000
      });
    }
  };

  return (
    <div className={classNames([`flex items-center gap-3`, props.className])}>
      <Select
        placeholder={'请选择或搜索函数'}
        className={`flex-1 ${styles['function-select']}`}
        dropdownMenuClassName={styles['function-select-wrapper']}
        disabled={disabled || functionsLoading}
        renderFormat={(option, rawValue) => {
          const normalizedValue = normalizeFunctionId(rawValue);
          if (isNil(normalizedValue)) return null;
          if (option?.children?.[0]) {
            return option.children[0];
          }
          const matchedFunction = allFunctions.find(
            (item) => item.id === normalizedValue
          );
          return matchedFunction?.code ? (
            <GlobalTooltip.Ellipsis text={matchedFunction.code} />
          ) : null;
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
              value={value}
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
      <Tooltip content="根据行为名称与描述智能推荐函数">
        <Button
          type="text"
          className={styles['recommend-btn']}
          icon={<IconRobot />}
          loading={recommending}
          disabled={disabled || functionsLoading}
          onClick={() => void handleSmartRecommend()}
        />
      </Tooltip>
      <FunctionContentDialog
        data={showFunction}
        visible={showFunctionContent}
        onCancel={() => setShowFunctionContent(false)}
      />
      <FunctionRecommendModal
        visible={recommendVisible}
        loading={recommending}
        source={recommendSource}
        recommendations={recommendations}
        onSelect={handleSelectRecommendation}
        onCancel={() => setRecommendVisible(false)}
      />
    </div>
  );
};
