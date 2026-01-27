import { useTranslation } from 'react-i18next';
import { BLOCKS, FLOW_TYPE2BLOCKS_CONF } from './constants';
import { TabsEnum, ToolTypeEnum } from './types';
import { useParams } from 'react-router-dom';
import { useMemo } from 'react';

export const useBlocks = () => {
  const { t } = useTranslation('plugin__console-plugin-appforge');
  const { type: flowType = 'no_struct' } = useParams<Record<string, string>>();
  const allBlocks = useMemo(() => {
    return FLOW_TYPE2BLOCKS_CONF[flowType || 'no_struct'];
  }, [flowType]);
  return allBlocks;
};

export const useTabs = () => {
  const { t } = useTranslation('plugin__console-plugin-appforge');

  return [
    {
      key: TabsEnum.Blocks,
      name: t('workflow.tabs.blocks')
    },
    {
      key: TabsEnum.Tools,
      name: t('workflow.tabs.tools')
    }
  ];
};

export const useToolTabs = () => {
  const { t } = useTranslation('plugin__console-plugin-appforge');

  return [
    {
      key: ToolTypeEnum.All,
      name: t('workflow.tabs.allTool')
    },
    // {
    //   key: ToolTypeEnum.BuiltIn,
    //   name: t('workflow.tabs.plugin'),
    // },
    {
      key: ToolTypeEnum.Custom,
      name: t('workflow.tabs.customTool')
    },
    {
      key: ToolTypeEnum.Workflow,
      name: t('workflow.tabs.workflowTool')
    }
  ];
};
