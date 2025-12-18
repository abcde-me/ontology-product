import React, { memo, useEffect, useState } from 'react';
import style from './processing.module.scss';
import { Button, Message } from '@arco-design/web-react';
import ViewToggle, { ViewType } from '../ViewToggle';
import ScriptTable from '../sctipt-table';
import ScriptCard from '../sctipt-card';
import { downloadDevelopScript, createDevelopScript } from '@/api/sql-develop';
import { useUrlState } from '../../hooks/useUrlState';
import { generateSqlDefaultName } from '../../utils';

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
          script_name: generateSqlDefaultName(new Date()),
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
      <div className={style['processing-wrapper']}>
        {/* 头部操作按钮 */}
        <div className={style['processing-header']}>
          <div className={style['processing-header-title']}>
            加工脚本({processingNum})
          </div>
          <div className={style['processing-header-icons-group']}>
            {iconActive === ViewType.LIST && !isShowAll && (
              <Button
                onClick={() => {
                  handleDownloadAll();
                }}
                className={style['header-btn']}
              >
                下载全部
              </Button>
            )}
            <Button
              loading={createScriptLoading}
              className={style['header-btn']}
              onClick={() => {
                handleCreateScript();
              }}
            >
              新建脚本
            </Button>
            <ViewToggle
              className={style['processing-header-icons-options']}
              value={iconActive}
              onChange={setIconActive}
            />
          </div>
        </div>
        <div className={style['processing-content']}>
          {iconActive === ViewType.TABLE ? (
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
