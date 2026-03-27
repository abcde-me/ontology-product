import React, { useCallback, useState } from 'react';
import styles from './index.module.scss';
import classNames from 'classnames';
import { ObjectTypeSelect } from '../../componens';
import { useRequest } from 'ahooks';
import { listOntologyPhysicalProperties } from '@/api/ontologySceneLibrary/graph';
import { ObjectType } from '@/types/objectType';
import { InstanceSelect } from '@/pages/ontologyScene/componens/ObjectInstanceSelect/InsSelect';
import { useParams } from 'react-router-dom';
import { isNil } from 'lodash-es';

interface ObjData {
  icon?: string;
  name?: string;
  id?: number;
  code?: string;
}

export interface ObjInsValue {
  objectTypeData?: ObjData;
  objInsID?: React.Key[] | React.Key | undefined;
}

export interface ObjInsProps extends CustomFormItemCompProps<ObjInsValue> {
  mode: 'single' | 'multiple';
  osid?: number;
  onChange?: (
    value: ObjInsValue,
    options?: [ObjectType, Record<string, any>]
  ) => void;
  getPopupContainer?: (node?: HTMLElement) => Element;
  objTypeSelectClassName?: string;
  objInsClassName?: string;
}

export const ObjectInstanceSelect = (props: ObjInsProps) => {
  const { value, onChange, disabled, className } = props;
  const { objectTypeData, objInsID } = value || {};
  const { id: OSId } = useParams<Record<string, any>>();

  const { data: primaryKey, loading: primaryKeyLoading } = useRequest(
    () => {
      if (isNil(value?.objectTypeData?.id)) {
        return Promise.resolve(undefined);
      }
      return listOntologyPhysicalProperties({
        objectTypeIdList: [Number(value?.objectTypeData?.id)],
        isPrimary: 1,
        ontologyModelID: +OSId,
        isUse: 1
      }).then((res) => {
        return res.data.result?.find(({ isPrimary }) => !!isPrimary)?.name;
      });
    },
    {
      refreshDeps: [value?.objectTypeData?.id]
    }
  );

  // Handle object type change by clearing selected instances
  const handleObjectTypeChange = useCallback(
    (objKey?: string, objType?: ObjectType) => {
      onChange?.({
        objectTypeData: !!objType
          ? {
              name: objType.name,
              icon: objType.icon,
              code: objKey,
              id: objType.id
            }
          : undefined,
        objInsID: undefined
      });
    },
    [onChange]
  );

  return (
    <div
      className={classNames([
        styles['obj-instance'],
        className,
        'obj-ins-wrapper'
      ])}
    >
      <ObjectTypeSelect
        className={classNames([
          styles['obj-one'],
          props.objTypeSelectClassName
        ])}
        value={value?.objectTypeData?.code as any}
        onChange={handleObjectTypeChange as any}
        placeholder={'请搜索或选择对象类型'}
        disabled={disabled}
        ontologyModelID={+OSId}
        primaryKey={'code'}
        getPopupContainer={props.getPopupContainer as any}
        selectProps={{
          dropdownMenuStyle: {
            width: 400
          },
          triggerProps: {
            autoAlignPopupWidth: false,
            position: 'bl',
            style: {
              width: 400
            }
          }
        }}
      />
      <div
        className={`w-[1px] bg-[#c3c7d4] ${styles['ui-gap']} obj-ins-gap flex-shrink-0`}
      />
      <InstanceSelect
        objectTypeId={value?.objectTypeData?.id}
        placeholder={!!primaryKey ? `请选择对象实例` : '请先选择对象类型'}
        primaryKey={primaryKey}
        disabled={primaryKeyLoading || disabled}
        className={classNames([styles['ins-sel'], props.objInsClassName])}
        mode={props.mode}
        value={objInsID}
        searchKey={'code'}
        onChange={(v) => {
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
