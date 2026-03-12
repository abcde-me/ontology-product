import React, { useCallback, useState } from 'react';
import styles from './index.module.scss';
import classNames from 'classnames';
import { ObjectTypeSelect } from '../../componens';
import { useRequest } from 'ahooks';
import { listOntologyPhysicalProperties } from '@/api/ontologySceneLibrary/graph';
import { ObjectType } from '@/types/objectType';
import { InterfaceSelect } from '@/pages/ontologyScene/componens/ObjectInstanceSelect/InsSelect';
import { useParams } from 'react-router-dom';
import { isNil } from 'lodash-es';

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
  getPopupContainer?: () => Element;
}

export const ObjectInstanceSelect = (props: ObjInsProps) => {
  const { value, onChange, disabled, className } = props;
  const { objectTypeID, objInsID } = value || {};
  const { id: OSId } = useParams<Record<string, any>>();

  const [currentObj, setCurrentObj] = useState<ObjectType>();

  const { data: primaryKey, loading: primaryKeyLoading } = useRequest(
    () => {
      if (isNil(currentObj)) {
        return Promise.resolve(undefined);
      }
      return listOntologyPhysicalProperties({
        objectTypeIdList: [Number(currentObj?.id)],
        isPrimary: 1,
        ontologyModelID: +OSId,
        isUse: 1
      }).then((res) => {
        return res.data.result?.find(({ isPrimary }) => !!isPrimary)?.name;
      });
    },
    {
      refreshDeps: [currentObj]
    }
  );

  // Handle object type change by clearing selected instances
  const handleObjectTypeChange = useCallback(
    (nextId?: number, objType?: ObjectType) => {
      onChange?.({
        objectTypeID: nextId,
        objInsID: undefined
      });
      setCurrentObj(objType);
    },
    [onChange]
  );

  return (
    <div className={classNames([styles['obj-interface'], className])}>
      <ObjectTypeSelect
        className={styles['obj-one']}
        value={currentObj?.code as any}
        onChange={handleObjectTypeChange}
        disabled={disabled}
        ontologyModelID={+OSId}
        primaryKey={'code'}
        getPopupContainer={props.getPopupContainer as any}
      />
      <InterfaceSelect
        objectTypeId={currentObj?.id}
        placeholder={!!primaryKey ? `请选择对象实例` : '请先选择对象类型'}
        primaryKey={primaryKey}
        disabled={primaryKeyLoading || disabled}
        className={styles['ins-sel']}
        mode={props.mode}
        value={objInsID}
        searchKey={'code'}
        onChange={(v) => {
          debugger;
          onChange?.({
            ...value,
            objInsID: v
          });
        }}
        getPopupContainer={props.getPopupContainer as any}
      />
    </div>
  );
};
