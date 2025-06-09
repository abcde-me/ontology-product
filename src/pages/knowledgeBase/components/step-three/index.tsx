import { Progress } from '@arco-design/web-react';
import { find, get } from 'lodash';
import * as React from 'react';

export const StepThree: React.FunctionComponent<any> = ({
  knowledgeDetail,
  indexingStatusDetail,
  documents,
  sourceData,
  cRef
}) => {
  React.useImperativeHandle(cRef, () => ({
    onStep
  }));

  const type = React.useMemo(() => {
    return !!get(knowledgeDetail, 'id', false) ? 'add' : 'create';
  }, [knowledgeDetail]);

  const onStep = async () => {};

  const getPercent = (item) => {
    const completedCount = item?.completed_segments || 0;
    const totalCount = item?.total_segments || 0;
    if (totalCount === 0) return 0;
    const percent = Math.round((completedCount * 100) / totalCount);
    return percent > 100 ? 100 : percent;
  };

  const getColor = (item) => {
    const { indexing_status, total_segments = 0 } = item;
    return indexing_status === 'error' && total_segments
      ? 'rgb(var(--danger-6))'
      : '';
  };

  const getTrailColor = (item) => {
    const { indexing_status, total_segments = 0 } = item;
    if (indexing_status === 'error') {
      total_segments;
    }
    return indexing_status === 'error' && !total_segments
      ? 'rgb(var(--danger-6))'
      : '';
  };

  const getFileName = (item) => {
    const file = find(documents, { id: item.id });
    return get(file, 'name', '--');
  };

  const getRuleName = (key: string) => {
    if (key === 'remove_extra_spaces')
      return '替换掉连续的空格、换行符和制表符';
    if (key === 'remove_urls_emails') return '删除所有 URL 和电子邮件地址';

    if (key === 'remove_stopwords')
      return '去除停用词，例如 “a”，“an”，“the” 等';
  };

  const isCompleted = React.useMemo(() => {
    return (
      indexingStatusDetail.length &&
      indexingStatusDetail.every((indexingStatusDetail) =>
        ['completed', 'error'].includes(indexingStatusDetail.indexing_status)
      )
    );
  }, [indexingStatusDetail]);

  return (
    <>
      <div className="mb-[16px] rounded-[8px] bg-[rgb(var(--primary-1))] px-[36px] py-[16px]">
        <div className="mb-[8px] text-[14px] font-[600] leading-[22px] text-[var(--color-text-1)]">
          {type === 'create' ? '知识库已创建' : '文档已上传'}
        </div>
        <div>
          {type === 'create'
            ? '我们自动为该知识库起了个名称，您也可以随时修改'
            : `文档已上传至知识库： ${get(knowledgeDetail, 'name', '--')} ，你可以在知识库的文档列表中找到它。`}
        </div>
        <div className="mt-[32px] text-[14px] font-[500] leading-[22px] text-[var(--color-text-1)]">
          {isCompleted ? '嵌入已完成' : '嵌入处理中...'}
        </div>
        <div>
          {indexingStatusDetail.map((item, index) => {
            return (
              <div key={index}>
                <div>
                  {getFileName(item)}
                  <span className="ml-[8px]">
                    {item.indexing_status === 'completed'
                      ? '嵌入成功'
                      : item.indexing_status === 'error'
                        ? '嵌入失败'
                        : ''}
                  </span>
                </div>
                <Progress
                  color={getColor(item)}
                  trailColor={getTrailColor(item)}
                  percent={getPercent(item)}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-[16px] rounded-[6px] border border-[var(--color-border-2)] bg-white">
          <div className="border-b border-[var(--color-border-2)] px-[16px] py-[13px]">
            <span className="inline-block w-[140px] text-[var(--color-text-4)]">
              分段规则
            </span>
            <span className="text-[var(--color-text-1)]">
              {sourceData?.mode === 'automatic' ? '自动' : '手动'}
            </span>
          </div>
          <div className="border-b border-[var(--color-border-2)] px-[16px] py-[13px]">
            <span className="inline-block w-[140px] text-[var(--color-text-4)]">
              分段长度
            </span>
            <span className="text-[var(--color-text-1)]">
              {get(sourceData, 'rules.segmentation.max_tokens', 0)}
            </span>
          </div>
          <div className="px-[16px] py-[13px]">
            <span className="inline-block w-[140px] text-[var(--color-text-4)]">
              文本预定义与清洗
            </span>
            <span className="text-[var(--color-text-1)]">
              {sourceData.mode === 'automatic'
                ? '自动'
                : sourceData?.rules?.pre_processing_rules
                    ?.map((rule) => {
                      if (rule.enabled) return getRuleName(rule.id);
                    })
                    .filter(Boolean)
                    .join('；')}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
