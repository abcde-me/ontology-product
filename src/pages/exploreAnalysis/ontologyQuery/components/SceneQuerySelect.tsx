import React, { useEffect, useState } from 'react';
import { Message, Select } from '@arco-design/web-react';
import type { SelectProps } from '@arco-design/web-react';
import { SCENE_QUERY_ALL_VALUE } from '../constants';
import { fetchSceneQueryOptions } from '../services/sceneOptions';
import type { SceneQueryOption } from '../services/sceneOptions';
import styles from './SceneQuerySelect.module.scss';

const Option = Select.Option;

const DEFAULT_SCENE_OPTIONS: SceneQueryOption[] = [
  { label: '不限', value: SCENE_QUERY_ALL_VALUE }
];

interface SceneQuerySelectProps extends SelectProps {
  loading?: boolean;
}

export const SceneQuerySelect: React.FC<SceneQuerySelectProps> = ({
  loading,
  ...selectProps
}) => {
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [sceneOptions, setSceneOptions] = useState<SceneQueryOption[]>(
    DEFAULT_SCENE_OPTIONS
  );

  useEffect(() => {
    setOptionsLoading(true);
    fetchSceneQueryOptions()
      .then((options) => {
        setSceneOptions([...DEFAULT_SCENE_OPTIONS, ...options]);
      })
      .catch((error) => {
        console.error('加载本体场景库失败:', error);
        Message.error('加载本体场景库失败');
      })
      .finally(() => {
        setOptionsLoading(false);
      });
  }, []);

  const { className, style, ...restSelectProps } = selectProps;

  return (
    <Select
      placeholder="本体场景库"
      loading={optionsLoading || loading}
      allowClear
      showSearch
      className={[styles.sceneQuerySelect, className].filter(Boolean).join(' ')}
      style={style}
      filterOption={(inputValue, option) =>
        String(option?.props?.children || '')
          .toLowerCase()
          .includes(inputValue.toLowerCase())
      }
      dropdownMenuStyle={{ minWidth: 360 }}
      {...restSelectProps}
    >
      {sceneOptions.map((item) => (
        <Option key={item.value} value={item.value} title={item.label}>
          {item.label}
        </Option>
      ))}
    </Select>
  );
};
