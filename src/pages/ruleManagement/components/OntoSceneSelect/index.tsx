import React from 'react';
import classNames from 'classnames';
import { GlobalTooltip } from '@ceai-front/arco-material';
import { FetchDataSelect } from '@/components/FetchDataSelect';
import { listOntologyModel } from '@/api/ontologySceneLibrary/ontologyScene';
import { OntologyModelInfo } from '@/pages/ruleManagement/types';
import { OntologScene } from '@/types/ontologySceneApi';
import { ICON_OPTIONS } from '@/pages/ontologyScene/common/constants';
import styles from './index.module.scss';
import { getModelIconNode } from '@/pages/ruleManagement/utils';

interface OntoSceneOption extends OntologyModelInfo {
  description?: string;
}

export interface OntoSceneSelectProps
  extends CustomFormItemCompProps<number | undefined> {
  wrapperClassName?: string;
  getPopupContainer?: (node: HTMLElement) => HTMLElement;
  currentSceneData?: OntoSceneOption;
  placeholder?: string;
  ontologySceneData?: OntologScene;
}

const renderSceneValue = (scene?: OntoSceneOption | null) => {
  if (!scene) return null;

  return (
    <div className={styles['scene-value']}>
      <div className={`${styles['scene-icon-box']} !h-[24px] !w-[24px]`}>
        {getModelIconNode(scene.icon, styles['scene-icon'])}
      </div>
      <div className={styles['scene-value-text']}>
        <GlobalTooltip.Ellipsis text={scene.name || '-'} />
      </div>
    </div>
  );
};

const renderSceneOption = (scene: OntoSceneOption) => {
  return (
    <div className={styles['scene-option']}>
      <div className={styles['scene-icon-box']}>
        {getModelIconNode(scene.icon, styles['scene-icon'])}
      </div>
      <div className={styles['scene-option-content']}>
        <GlobalTooltip.Ellipsis
          className={styles['scene-option-title']}
          text={scene.name || '-'}
        />
        <GlobalTooltip.Ellipsis
          className={styles['scene-option-desc']}
          text={scene.description || '-'}
        />
      </div>
    </div>
  );
};

export const OntoSceneSelect = (props: OntoSceneSelectProps) => {
  const {
    value,
    onChange,
    disabled,
    id,
    className,
    style,
    wrapperClassName,
    getPopupContainer,
    currentSceneData,
    placeholder
  } = props;

  return (
    <FetchDataSelect<OntoSceneOption>
      id={'autoRuleOntoSceneSelect'}
      value={value}
      disabled={disabled}
      className={classNames(styles['onto-scene-select'], className)}
      wrapperClassName={classNames(
        styles['onto-scene-select-wrapper'],
        wrapperClassName
      )}
      style={style}
      placeholder={placeholder || '请选择或搜索本体场景'}
      renderOption={renderSceneOption}
      renderValue={() => renderSceneValue(currentSceneData)}
      getPopupContainer={getPopupContainer}
      virtualListProps={{
        maxHeight: 400,
        itemHeight: 60
      }}
      fetchData={async ({ search, pageNo, pageSize }) => {
        const response = await listOntologyModel({
          pageNo,
          pageSize,
          filter: search
        });

        return response.data?.result || [];
      }}
      onChange={(nextValue, option) => {
        onChange?.(nextValue as number | undefined, option);
      }}
    />
  );
};
