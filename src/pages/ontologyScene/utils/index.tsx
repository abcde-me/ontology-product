import React from 'react';
import {
  InputType,
  TestFunctionItem,
  UiType
} from '@/pages/ontologyScene/types/ontologyFunction';
import { DatePicker, Input, InputNumber, Select } from '@arco-design/web-react';
import { InputNumberWithLabel } from '@ceai-front/arco-material';
import {
  FunctionFileParam,
  MapPicker,
  ObjectInterfaceSelect,
  ObjectTypeSelect
} from '@/pages/ontologyScene/componens';
import styles from '../styles/index.module.scss';
import { LinkType } from '@/types/graphApi';
import { BehaviorActionDetail } from '@/pages/ontologyScene/types/behaviorActions';

export const renderComponentByUiType = (type: UiType, osid?: number) => {
  switch (type) {
    case UiType.TextArea:
      return <Input.TextArea placeholder={'请输入'} />;
    case UiType.InputNumber:
      return (
        <InputNumberWithLabel placeholder={'请输入'} className={'w-[160px]'} />
      );
    case UiType.InputNumberFloat:
      return <InputNumber placeholder={'请输入'} className={'w-[160px]'} />;
    case UiType.Switch:
      return (
        <Select
          className={styles['ui-comp']}
          placeholder={'请选择'}
          options={[
            {
              label: 'true',
              value: 'true'
            },
            {
              label: 'false',
              value: 'false'
            }
          ]}
        />
      );
    case UiType.Date:
      return (
        <DatePicker
          className={'min-w-[160px]'}
          showTime={false}
          getPopupContainer={(node) => node.parentElement || document.body}
        />
      );
    case UiType.Uploader:
      return <FunctionFileParam className={styles['upload']} />;
    case UiType.Geopoint:
      return <MapPicker />;
    case UiType.Timestamp:
      return <DatePicker showTime />;
    case UiType.ObjectOne:
      return (
        <ObjectTypeSelect
          placeholder={'请选择对象类型'}
          getPopupContainer={(node) => node.parentElement || document.body}
          ontologyModelID={osid}
        />
      );
    case UiType.ObjectSet:
      return <ObjectInterfaceSelect mode={'multiple'} />;
    default:
      return <Input placeholder={'请输入'} />;
  }
};

// 将 LinkType 枚举转换为字符串
export const getLinkTypeText = (type?: LinkType): '1:1' | '1:N' | 'N:N' => {
  switch (type) {
    case LinkType.ONE_TO_ONE:
      return '1:1';
    case LinkType.ONE_TO_MANY:
      return '1:N';
    case LinkType.MANY_TO_MANY:
      return 'N:N';
    default:
      return '1:1';
  }
};

export const buildActionTestItem = (
  data: BehaviorActionDetail,
  functionParams: Record<string, any>
): TestFunctionItem => {
  return {
    arguments: Object.entries(functionParams).map(([key, value]) => ({
      name: key,
      value: JSON.stringify(value)
    })),
    code: data.functionCode!,
    content: data.functionContent!,
    logic_function: [data.functionCode!],
    name: data.functionName!,
    params: (data.params || []).map((p) => {
      return {
        inputType: p.uiType ? InputType.Input : InputType.Output,
        ...p
      };
    }),
    object_name: data.objectTypeName,
    object_id: data.objectTypeId,
    pk: data.id
  };
};
