import React from 'react';
import styles from './index.module.scss';
import classNames from 'classnames';
import { Button, Upload, UploadProps } from '@arco-design/web-react';
import {
  IconClose,
  IconFile,
  IconLoading,
  IconUpload
} from '@arco-design/web-react/icon';

export const FunctionFileParam = (
  props: CustomFormItemCompProps<UploadProps['fileList']>
) => {
  const { value } = props;
  console.log(123, value);

  return (
    <div className={classNames([styles['function-file-param']])}>
      <Upload
        showUploadList={false}
        multiple
        className={styles['upload']}
        action={'/'}
        fileList={value}
        //图片和pdf格式
        accept={'.jpg,.jpeg,.png,.pdf'}
        onChange={(value) => {
          debugger;
          props.onChange?.(value);
        }}
      >
        <Button icon={<IconUpload />} className={styles['uploader']}>
          上传文件
        </Button>
      </Upload>
      {!!value?.length && (
        <div className={styles['file-list']}>
          {value.map((file) => {
            return (
              <div key={file.uid} className={styles['file-item']}>
                {file.status === 'done' ? (
                  <IconFile className={'flex-shrink-0'} />
                ) : (
                  <IconLoading />
                )}
                <p>{file.name}</p>
                <IconClose
                  className={'flex-shrink-0 cursor-pointer'}
                  onClick={() => {
                    props.onChange?.(
                      value.filter((item) => item.uid !== file.uid)
                    );
                  }}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
