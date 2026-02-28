import React from 'react';
import styles from './index.module.scss';
import classNames from 'classnames';
import { Button, Upload, UploadProps } from '@arco-design/web-react';
import {
  IconClose,
  IconLoading,
  IconRefresh,
  IconUpload
} from '@arco-design/web-react/icon';
import { PrefixAimdp } from '@/api/endpoints';
import FileIcon from '../../assets/file-icon.svg';
import { uploadFunctionFile } from '@/api/ontologySceneLibrary/ontologyFunction';

export const FunctionFileParam = (
  props: CustomFormItemCompProps<UploadProps['fileList']>
) => {
  const { value, onChange, disabled } = props;

  return (
    <div
      className={classNames([styles['function-file-param'], props.className])}
    >
      <Upload
        showUploadList={false}
        className={styles['upload']}
        action={`${PrefixAimdp}/UploadOntologyActionDataFile`}
        multiple={false}
        fileList={value}
        disabled={disabled}
        limit={1}
        onChange={(value) => {
          onChange?.(
            value.map((file) => {
              // @ts-ignore
              if (file.response?.status === 200) {
                // @ts-ignore
                file.url = file.response.data.path;
              }
              return file;
            })
          );
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
              <div
                key={file.uid}
                className={'flex w-full items-center gap-1 overflow-hidden'}
              >
                <div key={file.uid} className={styles['file-item']}>
                  {['done', 'error'].includes(file.status || 'init') ? (
                    <FileIcon className={'flex-shrink-0'} />
                  ) : (
                    <IconLoading />
                  )}
                  <p className={styles['file-name']}>{file.name}</p>
                  <IconClose
                    className={'flex-shrink-0 cursor-pointer'}
                    onClick={() => {
                      if (disabled) return;
                      onChange?.(value.filter((item) => item.uid !== file.uid));
                    }}
                  />
                </div>
                {file.status === 'error' && (
                  <IconRefresh
                    className={'flex-shrink-0 cursor-pointer'}
                    onClick={() => {
                      if (disabled) return;
                      onChange?.([
                        {
                          ...file,
                          status: 'init'
                        }
                      ]);
                      uploadFunctionFile(file.originFile!).then((res) => {
                        onChange?.([
                          {
                            ...file,
                            status: 'done',
                            url: res
                          }
                        ]);
                      });
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
