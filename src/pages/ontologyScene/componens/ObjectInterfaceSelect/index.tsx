import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import styles from './index.module.scss';
import classNames from 'classnames';
import { ObjectTypeSelect } from '../../componens';
import { SelectWithNoData } from '@/components/new-no-data-comps';
import { isNil } from 'lodash-es';
import { useRequest, useVirtualList } from 'ahooks';
import { Spin } from '@arco-design/web-react';
import { NoDataCard } from '@ceai-front/arco-material';
import {
  listOntologyObjectTypeData,
  listOntologyPhysicalProperties
} from '@/api/ontologySceneLibrary/graph';
import { ObjectType } from '@/types/objectType';
import { InterfaceSelect } from '@/pages/ontologyScene/componens/ObjectInterfaceSelect/InsSelect';
import { useParams } from 'react-router-dom';

export interface ObjInsValue {
  objectTypeID?: number;
  objInsID?: React.Key[] | React.Key | undefined;
}

// Page size for backend pagination
const PAGE_SIZE = 20;
// Row height used by the virtual list
const ITEM_HEIGHT = 36;
// Dropdown panel height
const DROPDOWN_HEIGHT = 240;
// Scroll threshold to trigger loading the next page
const LOAD_MORE_THRESHOLD = 40;

type ObjectInstance = Record<string, unknown> & {
  id?: React.Key;
  name?: string;
  code?: string;
};

type InstanceOption = {
  value: React.Key;
  label: string;
  raw?: ObjectInstance;
};

// Normalize any value into a stable string key
const normalizeKey = (value: React.Key) => String(value);

// Build a display label with best-effort fields
const getInstanceLabel = (item: ObjectInstance) => {
  const candidate = item.name ?? item.code ?? item.id;
  return isNil(candidate) ? '-' : String(candidate);
};

// Normalize instance data to ensure a usable id exists
const normalizeInstance = (
  item: ObjectInstance,
  index: number,
  page: number
) => {
  const rawId = item.id ?? item.code ?? item.name;
  const safeId = isNil(rawId) ? `${page}-${index}` : rawId;
  return { ...item, id: safeId };
};

export interface ObjInsProps extends CustomFormItemCompProps<ObjInsValue> {
  mode: 'single' | 'multiple';
  osid?: number;
  onChange?: (
    value: ObjInsValue,
    options?: [ObjectType, Record<string, any>]
  ) => void;
}

export const ObjectInterfaceSelect = (props: ObjInsProps) => {
  const { value, onChange, disabled, className } = props;
  const { objectTypeID, objInsID } = value || {};
  const { id: OSId } = useParams<Record<string, any>>();

  const { data: primaryKey, loading: primaryKeyLoading } = useRequest(
    () => {
      return listOntologyPhysicalProperties({
        id: objectTypeID!
      }).then((res) => {
        return res.data.result?.find(({ isPrimary }) => !!isPrimary)?.name;
      });
    },
    {
      ready: !!objectTypeID,
      refreshDeps: [objectTypeID]
    }
  );

  // Handle object type change by clearing selected instances
  const handleObjectTypeChange = useCallback(
    (nextId?: number) => {
      onChange?.({
        objectTypeID: nextId,
        objInsID: []
      });
    },
    [onChange]
  );

  return (
    <div className={classNames([styles['obj-interface'], className])}>
      <ObjectTypeSelect
        className={styles['obj-one']}
        value={objectTypeID}
        onChange={handleObjectTypeChange}
        disabled={disabled}
        ontologyModelID={+OSId}
      />
      <InterfaceSelect
        objectTypeId={objectTypeID}
        primaryKey={primaryKey}
        disabled={primaryKeyLoading || disabled}
        mode={props.mode}
        value={value?.objInsID}
        onChange={(v) => {
          onChange?.({
            ...value,
            objInsID: v
          });
        }}
      />
    </div>
  );
};
