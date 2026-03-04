import React from 'react';
import {
  InputType,
  OntologyFunctionParam,
  ParamType,
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
import dayjs from 'dayjs';

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
      return <ObjectInterfaceSelect mode={'single'} />;
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

export const formatParamValueByType = (
  param: OntologyFunctionParam,
  argValue?: any
) => {
  let dataType: ParamType, value: any;
  if ('uiTypeAndValue' in param) {
    const { uiTypeAndValue } = param;
    const { paramValue, uiType } = uiTypeAndValue!;
    dataType = uiType!.split('_')[0] as ParamType;
    value = paramValue;
  } else {
    dataType = param.type || ParamType.String;
    value = argValue;
  }
  if (
    [ParamType.Integer, ParamType.Float, ParamType.String].includes(dataType)
  ) {
    return value.toString();
  }
  if (dataType === ParamType.Boolean) {
    return value === 'true' ? 'True' : 'False';
  }
  if (dataType === ParamType.Date) {
    return value.toString();
  }
  if (dataType === ParamType.Timestamp) {
    const s = dayjs(value).unix().toString();
    return s;
  }
  if (dataType === ParamType.Attachment) {
    return `Attachment("${value[0].url}")`;
  }
  if (dataType === ParamType.Geopoint) {
    return `GeoPoint(${value.lat}, ${value.lng})`;
  }
  if (dataType === ParamType.ObjectOne) {
    return `ObjectRef(object_type="${value.objectTypeID}", pk=${value.objInsID})`;
  }
  if (dataType === ParamType.ObjectSet) {
    const { objectTypeID, objInsID } = value;
    const args = (objInsID || [])
      .map((id) => {
        return `{"object_type":${objectTypeID},"pk":${id}}`;
      })
      .toString();
    return `ObjectSet([${args}])`;
  }
  return JSON.stringify(value);
};

export const buildActionTestItem = (
  data: BehaviorActionDetail,
  functionParams: Record<string, any>
): TestFunctionItem => {
  const res: TestFunctionItem = {
    arguments: [],
    code: data.code!,
    content: data.functionContent!,
    logic_function: [data.functionCode!],
    name: data.name!,
    description: data.description || '',
    params: [],
    object_name: data.objectTypeName,
    object_id: data.objectTypeId,
    pk: data.id
  };
  (data.params || []).forEach((p) => {
    res.params.push({
      inputType: p.uiType ? InputType.Input : InputType.Output,
      ...p
    });
    res.arguments.push({
      value: formatParamValueByType(p, functionParams[p.name]),
      name: p.name
    });
  });
  return res;
};
