import React, { useEffect, useState } from 'react';
import {
  Button,
  Message,
  Spin,
  Table,
  TableColumnProps,
  Tabs
} from '@arco-design/web-react';
import { IconClose, IconCopy } from '@arco-design/web-react/icon';
import { useHistory } from 'react-router-dom';
import {
  NoDataCard,
  GlobalTooltip,
  copyToClipboard
} from '@ceai-front/arco-material';
import { getActionDetail } from '@/api/ontologySceneLibrary/ontologyAction';
import { getFunctionDetail } from '@/api/ontologySceneLibrary/ontologyFunction';
import {
  OntologyActionParam,
  TYPE2RULE_TYPES,
  UI_TYPE_LABEL,
  ValidateRule
} from '@/pages/ontologyScene/types/behaviorActions';
import {
  InputType,
  ParamType,
  UiType
} from '@/pages/ontologyScene/types/ontologyFunction';
import {
  EllipsisPopover,
  PyCodeContent
} from '@/pages/ontologyScene/components';
import { ValidateRuleCard } from '@/pages/ontologyScene/modules/behaviorActions/components';
import { useAIWorkbenchGraphStore } from '../../store';
import { useAIWorkbenchStore } from '@/pages/aiOntologyWorkbench/store';
import ActionIconSvg from '@/pages/aiOntologyWorkbench/assets/action.svg';

const TabPane = Tabs.TabPane;

interface BehaviorPanelProps {
  behaviorId: string | number;
}

function BehaviorPanel({ behaviorId }: BehaviorPanelProps) {
  const history = useHistory();
  const { currentOntology } = useAIWorkbenchStore();
  const { closeBottomPanel } = useAIWorkbenchGraphStore();

  const [loading, setLoading] = useState(false);
  const [actionDetail, setActionDetail] = useState<any>(null);
  const [functionInfo, setFunctionInfo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('params');
  const [validateRules, setValidateRules] = useState<ValidateRule[]>([]);
  const [inputParams, setInputParams] = useState<OntologyActionParam[]>([]);

  // 加载行为详情
  useEffect(() => {
    if (!behaviorId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        // 加载行为详情
        const actionData = await getActionDetail(behaviorId);
        if (actionData) {
          setActionDetail(actionData);

          // 处理参数和校验规则
          const inputParams: OntologyActionParam[] = [];
          const validateRules: ValidateRule[] = [];

          actionData?.params?.forEach((param: any) => {
            const { name, type, enabledValidation, validationRule, inputType } =
              param;
            if (inputType === InputType.Input) {
              inputParams.push(param);
              if (
                [ParamType.Integer, ParamType.String, ParamType.Float].includes(
                  type
                )
              ) {
                const rule: ValidateRule = {
                  enabledValidation: enabledValidation,
                  failMessage: validationRule?.failMessage || '',
                  rule_name:
                    validationRule?.ruleName || TYPE2RULE_TYPES[type][0].value,
                  ruleConfig: param.validationRule?.ruleConfig,
                  name,
                  type
                };
                validateRules.push(rule);
              }
            }
          });

          setInputParams(inputParams);
          setValidateRules(validateRules);

          // 加载函数详情
          if (actionData.functionId) {
            const funcData = await getFunctionDetail(actionData.functionId);
            if (funcData) {
              setFunctionInfo(funcData);
            }
          }
        } else {
          Message.error('加载行为详情失败');
        }
      } catch (error) {
        console.error('加载行为详情失败:', error);
        Message.error('加载行为详情失败');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [behaviorId]);

  const handleCopy = async (value: string) => {
    const result = await copyToClipboard(value);
    if (!result.success) {
      Message.error(result.message || '复制失败');
    }
  };

  const handleEdit = () => {
    if (!behaviorId || !currentOntology?.id) return;
    history.push(
      `/tenant/compute/onto/ontologyScene/detail/${currentOntology.id}/behaviorActions/edit/${behaviorId}`
    );
  };

  // 参数表格列
  const paramColumns: TableColumnProps<OntologyActionParam>[] = [
    {
      title: '参数显示名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      ellipsis: true,
      render(value) {
        return (
          <EllipsisPopover wrapperClassName={'w-full'} value={value || '-'} />
        );
      }
    },
    {
      title: '参数ID',
      dataIndex: 'code',
      key: 'code',
      width: 180,
      ellipsis: true,
      render(value) {
        return value ? (
          <div className="flex items-center gap-2">
            <EllipsisPopover value={value} />
            <IconCopy
              fontSize={14}
              className="cursor-pointer opacity-0 transition-opacity hover:text-[rgba(var(--primary-6))] group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                void handleCopy(String(value));
              }}
            />
          </div>
        ) : (
          '-'
        );
      }
    },
    {
      title: '数据类型',
      dataIndex: 'type',
      key: 'type',
      width: 180,
      ellipsis: true,
      render(value) {
        return (
          <EllipsisPopover wrapperClassName={'w-full'} value={value || '-'} />
        );
      }
    },
    {
      title: '界面控件',
      dataIndex: 'uiType',
      key: 'uiType',
      width: 180,
      render: (type: UiType = UiType.Input) => {
        return UI_TYPE_LABEL[type];
      }
    }
  ];

  return (
    <div className="flex h-full w-full flex-col bg-white">
      {/* 头部 */}
      <div className="flex items-center justify-between border-b border-[var(--color-border-2)] px-[24px] py-[16px]">
        <div className="flex flex-1 items-center gap-[12px] overflow-hidden">
          <div className="flex items-center gap-[8px] overflow-hidden">
            <ActionIconSvg className="h-[20px] w-[20px] flex-shrink-0" />
            <GlobalTooltip.Ellipsis
              text={actionDetail?.name || '行为详情'}
              className="overflow-hidden text-[16px] font-[500] leading-[24px] text-[var(--color-text-1)]"
            />
          </div>
          <div className="flex items-center gap-[4px]">
            <span className="text-[14px] leading-[22px] text-[var(--color-text-1)]">
              id: {actionDetail?.code || '-'}
            </span>
            {actionDetail?.code && (
              <IconCopy
                fontSize={14}
                className="flex-shrink-0 cursor-pointer text-gray-500 hover:text-[rgba(var(--primary-6))]"
                onClick={() => void handleCopy(actionDetail?.code || '')}
              />
            )}
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center justify-end gap-[16px]">
          <div className="flex items-center gap-[16px]">
            <Button
              type="outline"
              onClick={handleEdit}
              style={{
                backgroundColor: 'var(--color-bg-1)',
                border: '1px solid var(--color-border-1)',
                borderRadius: '4px',
                padding: '5px 12px',
                height: '24px',
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: '22px',
                color: 'var(--color-text-1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 'auto'
              }}
            >
              详情
            </Button>
            <Button
              type="outline"
              onClick={handleEdit}
              style={{
                backgroundColor: 'var(--color-bg-1)',
                border: '1px solid var(--color-border-1)',
                borderRadius: '4px',
                padding: '5px 12px',
                height: '24px',
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: '22px',
                color: 'var(--color-text-1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 'auto'
              }}
            >
              编辑
            </Button>
          </div>
          <div className="h-[16px] w-[1px] bg-[var(--color-border-1)]" />
          <div
            className="flex cursor-pointer items-center justify-center"
            onClick={() => closeBottomPanel()}
            style={{ width: '16px', height: '16px' }}
          >
            <IconClose className="h-4 w-4 text-[var(--color-text-2)]" />
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-hidden px-[24px] py-[12px]">
        <Spin loading={loading} className="w-full">
          {/* Tabs */}
          <Tabs
            activeTab={activeTab}
            onChange={setActiveTab}
            className="h-full [&_.arco-tabs-content]:flex-1 [&_.arco-tabs-content]:overflow-hidden [&_.arco-tabs-nav]:mb-4"
          >
            <TabPane key="params" title={`参数(${inputParams.length})`}>
              <div className="flex h-full flex-col">
                <Table
                  pagination={false}
                  data={inputParams}
                  columns={paramColumns}
                  border={false}
                  rowClassName={() => 'group'}
                  noDataElement={
                    <NoDataCard title="暂无数据" type={'global'} />
                  }
                  className="flex-1 [&_.arco-table-td]:py-[8px] [&_.arco-table-th]:bg-[#f7f8fa] [&_.arco-table-th]:py-[8px]"
                  scroll={{ x: 720, y: 'calc(100% - 40px)' }}
                />
              </div>
            </TabPane>

            <TabPane key="rules" title={`校验规则(${validateRules.length})`}>
              <div className="flex h-full flex-col gap-[12px] overflow-y-auto">
                {!validateRules.length && (
                  <div className="flex flex-1 items-center justify-center">
                    <NoDataCard type={'block'} title={'暂无校验规则'} />
                  </div>
                )}
                {validateRules?.map((rule, index) => (
                  <ValidateRuleCard
                    key={`${rule.rule_name}_${index}`}
                    rule={rule}
                  />
                ))}
              </div>
            </TabPane>

            <TabPane key="function" title={'函数'}>
              <div className="h-full overflow-hidden">
                <PyCodeContent value={functionInfo?.content} readOnly />
              </div>
            </TabPane>
          </Tabs>
        </Spin>
      </div>
    </div>
  );
}

export default BehaviorPanel;
