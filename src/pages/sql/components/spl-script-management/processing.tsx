import React, { memo, useEffect, useState } from 'react';
import { Button, Message } from '@arco-design/web-react';
import ViewToggle, { ViewType } from '@/components/ViewToggle';
import ScriptTable from '../sctipt-table';
import ScriptCard from '../sctipt-card';
import { downloadDevelopScript, createDevelopScript } from '@/api/sql-develop';
import { useUrlState } from '../../hooks/useUrlState';
import { generateSqlDefaultName } from '../../utils';
import classNames from 'classnames';
import styles from './processing.module.scss';
interface PaginationProps {
  onToScriptList: (type: string) => void;
  curActiveTab: string;
}

const Processing: React.FC<PaginationProps> = memo(
  ({ onToScriptList, curActiveTab }) => {
    const [processingNum, setProcessingNum] = React.useState<number>(0);
    const [iconActive, setIconActive] = React.useState<ViewType>(ViewType.LIST);
    const [isShowAll, setIsShoAll] = useState(false);
    const [createScriptLoading, setCreateScriptLoading] = useState(false);
    const { updateUrlState } = useUrlState();

    const handleCreateScript = async () => {
      try {
        setCreateScriptLoading(true);
        const createRes = await createDevelopScript({
          script_name: generateSqlDefaultName(new Date(), '加工脚本'),
          script_context: '',
          script_desc: '',
          script_params: []
        });

        if (createRes.status !== 200) {
          Message.error(createRes.message);
          return;
        }

        Message.success('创建成功');
        updateUrlState(
          {
            activeDevelopScriptId: String(createRes.data.script_id),
            activeTab: 'files'
          },
          { method: 'push' }
        );
      } catch (error) {
        console.error('创建脚本失败', error);
        Message.error('创建脚本失败');
      } finally {
        setCreateScriptLoading(false);
      }
    };

    useEffect(() => {
      setIsShoAll(isShowAll);
    }, [isShowAll]);
    const handleDownloadAll = async () => {
      try {
        const res = (await downloadDevelopScript()) as unknown as Blob;
        const url = window.URL.createObjectURL(res);
        const a = document.createElement('a');
        a.href = url;
        a.download = `加工脚本.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('下载脚本失败', error);
        Message.error('下载脚本失败');
      }
    };
    return (
      <div
        className={classNames('overflow-hidden', styles['processing-wrapper'])}
      >
        {/* 头部操作按钮 */}
        <div className="my-[16px] flex items-center justify-between">
          <div className="text-[16px] font-[600] leading-[24px] text-[var(--text-color-text-1)]">
            加工脚本({processingNum})
          </div>
          <div className="flex items-center justify-end gap-[8px]">
            {iconActive === ViewType.LIST && !isShowAll && (
              <Button
                type="outline"
                onClick={() => {
                  handleDownloadAll();
                }}
              >
                下载全部
              </Button>
            )}
            <Button
              loading={createScriptLoading}
              type="outline"
              onClick={() => {
                handleCreateScript();
              }}
            >
              新建脚本
            </Button>
            <ViewToggle
              className="flex overflow-hidden rounded"
              value={iconActive}
              onChange={setIconActive}
            />
          </div>
        </div>
        <div>
          {iconActive === ViewType.CARD ? (
            <ScriptCard
              onToScriptList={onToScriptList}
              onTotalChange={setProcessingNum}
            />
          ) : (
            <ScriptTable
              curActiveTab={curActiveTab}
              isAll={setIsShoAll}
              onToScriptList={onToScriptList}
              onTotalChange={setProcessingNum}
            />
          )}
        </div>
      </div>
    );
  }
);

export default Processing;
