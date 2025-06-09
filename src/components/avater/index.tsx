import { Dropdown, Menu, Message, Image } from '@arco-design/web-react';
import { IconLoading, IconPlus, IconUpload } from '@arco-design/web-react/icon';
import React, { ReactNode, useState } from 'react';
import AISvg from '@/assets/ai.svg';
import { imageGenerate } from '@/api/image';
import cn from 'classnames';
import './index.less';

/**支持上传或者自动生成头像 */
export default function Avatar(props: {
  /**标题-生成头像prompt需要 */
  title?: string;
  /**描述-生成头像prompt需要 */
  description?: string;
  /**头像发生改变 */
  onChange?: (avatar: string) => void;
  /**当前头像 */
  value?: string;
  /**是否只读，默认为false */
  readonly?: boolean;
  /**尺寸,默认56px */
  size?: number;
  /**容器样式 */
  className?: string;
  /*value为空时的默认图片*/
  defaultIcon?: ReactNode;
}) {
  const {
    description,
    title,
    value,
    onChange = () => {},
    readonly = false,
    size = 56,
    className,
    defaultIcon
  } = props;
  const [loading, setLoading] = useState(false);

  const sizeStyle = { width: size + 'px', height: size + 'px' };

  const imgData = value?.startsWith('data:')
    ? value
    : value
      ? 'data:image/jpeg;base64,' + value
      : '';

  if (readonly) {
    return (
      <div
        className={cn('group relative', className)}
        style={sizeStyle}
        onClick={(evt) => evt.stopPropagation()}
      >
        {imgData ? (
          <Image src={imgData} className="modaforge-avatar h-full  w-full" />
        ) : (
          defaultIcon
        )}
      </div>
    );
  }
  return (
    <div className={cn(' flex justify-center', className)}>
      <Dropdown
        droplist={
          <Menu>
            <Menu.Item
              key="ai"
              className="flex items-center text-[var(--color-text-3)] hover:text-[rgb(var(--primary-6))]"
              onClick={() => {
                if (!description || !title) {
                  Message.error('请先填写应用名称和描述');
                  return;
                }
                setLoading(true);
                imageGenerate({ title, describe: description })
                  .then((res) => {
                    onChange(res.icon);
                  })
                  .catch((err) => {
                    Message.error(err?.message);
                  })
                  .finally(() => {
                    setLoading(false);
                  });
              }}
            >
              <AISvg className="mr-[8px]  " />
              智能生成图标
            </Menu.Item>
            <Menu.Item
              key="upload"
              className="flex items-center text-[var(--color-text-3)] hover:text-[rgb(var(--primary-6))]"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.png,.jpg,.jpeg';
                input.onchange = () => {
                  const reader = new FileReader();
                  reader.readAsDataURL(input.files[0]);
                  reader.onload = () => {
                    onChange(reader.result as string);
                  };
                };
                input.click();
              }}
            >
              <IconUpload className="mr-[8px]" />
              上传图标
            </Menu.Item>
          </Menu>
        }
      >
        {value ? (
          <div className="group relative" style={sizeStyle}>
            <Image src={imgData} className="modaforge-avatar h-full w-full" />
            {loading ? (
              <IconLoading
                spin
                className="absolute bottom-0 left-0 right-0 top-0 m-auto text-[21px] text-[var(--color-text-3)] text-[white]"
              />
            ) : null}
          </div>
        ) : (
          <div
            style={sizeStyle}
            className="group relative rounded-[4px] border border-dashed border-[var(--color-border-1)] hover:border-[rgb(var(--primary-5))] hover:bg-[rgb(var(--primary-1))]"
          >
            {loading ? (
              <IconLoading
                spin
                className="absolute bottom-0 left-0 right-0 top-0 m-auto text-[21px] text-[var(--color-text-3)]"
              />
            ) : (
              <IconPlus className="absolute bottom-0 left-0 right-0 top-0 m-auto text-[21px] text-[var(--color-text-3)] group-hover:text-[rgb(var(--link-6))]" />
            )}
          </div>
        )}
      </Dropdown>
    </div>
  );
}
