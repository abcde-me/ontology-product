import React from 'react';
import { UiType } from '@/pages/ontologyScene/types/ontologyFunction';
import {
  DatePicker,
  Input,
  InputNumber,
  Switch,
  Upload
} from '@arco-design/web-react';
import { InputNumberWithLabel } from '@ceai-front/arco-material';
import {
  DateTimePicker,
  MapPicker,
  ObjectOne,
  ObjectSet,
  ObjectTypeSelect
} from '@/pages/ontologyScene/componens';
import styles from '../styles/index.module.scss';

export const renderComponentByUiType = (type: UiType) => {
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
      return <Switch />;
    case UiType.Date:
      return (
        <DatePicker
          className={'min-w-[160px]'}
          showTime={false}
          getPopupContainer={(node) => node.parentElement || document.body}
        />
      );
    case UiType.Uploader:
      return (
        <Upload
          multiple
          className={styles['upload']}
          action={'/'}
          //图片和pdf格式
          accept={'.jpg,.jpeg,.png,.pdf'}
        />
      );
    case UiType.Geopoint:
      return <MapPicker />;
    case UiType.Timestamp:
      return <DateTimePicker />;
    case UiType.ObjectOne:
      return (
        <ObjectTypeSelect
          placeholder={'请选择对象类型'}
          getPopupContainer={(node) => node.parentElement || document.body}
        />
      );
    case UiType.ObjectSet:
      return <ObjectSet />;
    default:
      return <Input placeholder={'请输入'} />;
  }
};
