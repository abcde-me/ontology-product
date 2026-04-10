import React from 'react';
import styles from './index.module.scss';
import classNames from 'classnames';
import {
  Button,
  Form,
  Popover,
  Upload,
  UploadProps
} from '@arco-design/web-react';
import {
  IconClose,
  IconLoading,
  IconRefresh,
  IconUpload
} from '@arco-design/web-react/icon';
import { PrefixAimdp } from '@/api/endpoints';
import FileIcon from '../../assets/file-icon.svg';
import { uploadFunctionFile } from '@/api/ontologySceneLibrary/ontologyFunction';
import { UploadItem } from '@arco-design/web-react/es/Upload';

export const FunctionFileParam = (
  props: CustomFormItemCompProps<UploadItem[]> & {
    getPopupContainer?: () => Element;
  }
) => {
  const { value, onChange, disabled } = props;
  const { form } = Form.useFormContext();

  return (
    <div
      className={classNames([
        styles['function-file-param'],
        props.className,
        disabled ? 'bg-[var(--color-fill-2)]' : '',
        'f-file-wrapper'
      ])}
    >
      <Upload
        showUploadList={false}
        className={styles['upload']}
        action={`${PrefixAimdp}/UploadOntologyActionDataFile`}
        // multiple={false}
        fileList={value}
        disabled={disabled}
        limit={2}
        onChange={(value, file) => {
          // @ts-ignore
          if (file.response?.status === 200) {
            // @ts-ignore
            file.url = file.response.data.path;
          }
          onChange?.([file]);
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
                  <div
                    className={'flex flex-1 items-center gap-2 overflow-hidden'}
                  >
                    {['done', 'error'].includes(file.status || 'init') ? (
                      <FileIcon className={'flex-shrink-0'} />
                    ) : (
                      <IconLoading className={'flex-shrink-0'} />
                    )}
                    <Popover
                      content={file.name ?? null}
                      getPopupContainer={props.getPopupContainer}
                    >
                      <p className={styles['file-name']}>{file.name}</p>
                    </Popover>
                  </div>
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
