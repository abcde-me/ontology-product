import type { FC } from 'react';
import React from 'react';
import { useMemo, useState } from 'react';
import {
  PortalToFollowElem,
  PortalToFollowElemContent,
  PortalToFollowElemTrigger
} from '@/pages/workflowConfig/components/portal-to-follow-elem';
import type { OffsetOptions, Placement } from '@floating-ui/react';
import AllTools from '@/pages/workflowConfig/workflow/block-selector/all-tools';
import type { ToolDefaultValue, ToolValue } from './types';
import type { BlockEnum } from '@/pages/workflowConfig/workflow/types';
import SearchBox from '@/pages/workflowConfig/plugins/marketplace/search-box';
import { useTranslation } from 'react-i18next';
import { useBoolean } from 'ahooks';
import EditCustomToolModal from '@/pages/workflowConfig/tools/edit-custom-collection-modal/modal';
// import { createCustomCollection, } from '@/service/tools'
import type { CustomCollectionBackend } from '@/pages/workflowConfig/tools/types';
import Toast from '@/pages/workflowConfig/components/toast';
// import { useAllBuiltInTools, useAllCustomTools, useAllWorkflowTools, useInvalidateAllCustomTools } from '@/service/use-tools'
import cn from '@/pages/workflowConfig/utils/classnames';
import customTools from '@/pages/workflowConfig/mockData/customTools.json';
import workflowTools from '@/pages/workflowConfig/mockData/workflowTools.json';

type Props = {
  panelClassName?: string;
  disabled: boolean;
  trigger: React.ReactNode;
  placement?: Placement;
  offset?: OffsetOptions;
  isShow: boolean;
  onShowChange: (isShow: boolean) => void;
  onSelect: (tool: ToolDefaultValue) => void;
  supportAddCustomTool?: boolean;
  scope?: string;
  selectedTools?: ToolValue[];
  editCustomToolClassName?: string;
};

const ToolPicker: FC<Props> = ({
  disabled,
  trigger,
  placement = 'right-start',
  offset = 0,
  isShow,
  onShowChange,
  onSelect,
  supportAddCustomTool,
  scope = 'all',
  selectedTools,
  panelClassName,
  editCustomToolClassName
}) => {
  const { t } = useTranslation('plugin__console-plugin-appforge');
  const [searchText, setSearchText] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const buildInTools: any = [];
  // const { data: customTools } = useAllCustomTools()
  // const { data: workflowTools } = useAllWorkflowTools()
  console.warn('API NOT IMPLEMENTED', 'useInvalidateAllCustomTools');
  // const invalidateCustomTools = useInvalidateAllCustomTools()
  const invalidateCustomTools = () => {};

  const { builtinToolList, customToolList, workflowToolList } = useMemo(() => {
    if (scope === 'plugins') {
      return {
        builtinToolList: buildInTools,
        customToolList: [],
        workflowToolList: []
      };
    }
    if (scope === 'custom') {
      return {
        builtinToolList: [],
        customToolList: customTools,
        workflowToolList: []
      };
    }
    if (scope === 'workflow') {
      return {
        builtinToolList: [],
        customToolList: [],
        workflowToolList: workflowTools
      };
    }
    return {
      builtinToolList: buildInTools,
      customToolList: customTools,
      workflowToolList: workflowTools
    };
  }, [scope, buildInTools, customTools, workflowTools]);

  const handleAddedCustomTool = invalidateCustomTools;

  const handleTriggerClick = () => {
    if (disabled) return;
    onShowChange(true);
  };

  const handleSelect = (_type: BlockEnum, tool?: ToolDefaultValue) => {
    onSelect(tool!);
  };

  const [
    isShowEditCollectionToolModal,
    {
      setFalse: hideEditCustomCollectionModal,
      setTrue: showEditCustomCollectionModal
    }
  ] = useBoolean(false);

  const doCreateCustomToolCollection = (data: CustomCollectionBackend) => {
    // await createCustomCollection(data)
    console.warn('API NOT IMPLEMENTED', 'createCustomCollection', data);
    Toast.notify({
      type: 'success',
      message: t('common.api.actionSuccess')
    });
    hideEditCustomCollectionModal();
    handleAddedCustomTool();
  };

  if (isShowEditCollectionToolModal) {
    return (
      <EditCustomToolModal
        className={editCustomToolClassName}
        positionLeft
        payload={null}
        onHide={hideEditCustomCollectionModal}
        onAdd={doCreateCustomToolCollection}
      />
    );
  }

  return (
    <PortalToFollowElem
      placement={placement}
      offset={offset}
      open={isShow}
      onOpenChange={onShowChange}
    >
      <PortalToFollowElemTrigger onClick={handleTriggerClick}>
        {trigger}
      </PortalToFollowElemTrigger>

      <PortalToFollowElemContent className="z-[1000]">
        <div
          className={cn(
            'relative min-h-20 w-[356px] rounded-[4px] border-[0.5px] border-components-panel-border bg-components-panel-bg-blur shadow-lg backdrop-blur-sm',
            panelClassName
          )}
        >
          <div className="p-2 pb-1">
            <SearchBox
              search={searchText}
              onSearchChange={setSearchText}
              tags={tags}
              onTagsChange={setTags}
              size="small"
              showTags={false}
              placeholder={t('plugin.searchTools')}
            />
          </div>
          <AllTools
            className="tool-icon mt-1"
            toolContentClassName="max-w-[360px]"
            tags={tags}
            searchText={searchText}
            onSelect={handleSelect}
            buildInTools={builtinToolList || []}
            customTools={(customToolList || []) as any[]}
            workflowTools={(workflowToolList || []) as any[]}
            supportAddCustomTool={supportAddCustomTool}
            onAddedCustomTool={handleAddedCustomTool}
            onShowAddCustomCollectionModal={showEditCustomCollectionModal}
            selectedTools={selectedTools}
          />
        </div>
      </PortalToFollowElemContent>
    </PortalToFollowElem>
  );
};

export default React.memo(ToolPicker);
