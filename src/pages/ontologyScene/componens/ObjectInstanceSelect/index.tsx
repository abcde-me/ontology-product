import React, { useCallback } from 'react';
import styles from './index.module.scss';
import classNames from 'classnames';
import { ObjectTypeSelect } from '../../componens';
import { useRequest } from 'ahooks';
import { listOntologyPhysicalProperties } from '@/api/ontologySceneLibrary/graph';
import { ObjectType } from '@/types/objectType';
import { InterfaceSelect } from '@/pages/ontologyScene/componens/ObjectInstanceSelect/InsSelect';
import { useParams } from 'react-router-dom';

export interface ObjInsValue {
  objectTypeID?: number;
  objInsID?: React.Key[] | React.Key | undefined;
}

export interface ObjInsProps extends CustomFormItemCompProps<ObjInsValue> {
  mode: 'single' | 'multiple';
  osid?: number;
  onChange?: (
    value: ObjInsValue,
    options?: [ObjectType, Record<string, any>]
  ) => void;
}

export const ObjectInstanceSelect = (props: ObjInsProps) => {
  const { value, onChange, disabled, className } = props;
  const { objectTypeID, objInsID } = value || {};
  const { id: OSId } = useParams<Record<string, any>>();

  const { data: primaryKey, loading: primaryKeyLoading } = useRequest(
    () => {
      return listOntologyPhysicalProperties({
        objectTypeIdList: [objectTypeID!],
        isPrimary: 1,
        ontologyModelID: +OSId
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
        placeholder={primaryKey ? `请选择对象实例` : '请先选择对象类型'}
        primaryKey={primaryKey}
        disabled={primaryKeyLoading || disabled}
        className={styles['ins-sel']}
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
