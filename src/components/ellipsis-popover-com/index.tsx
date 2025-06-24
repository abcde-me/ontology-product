import * as React from 'react';
import { forwardRef, useRef, useImperativeHandle } from 'react';
import { Popover, Link, Message, Typography } from '@arco-design/web-react';
import { IconCopy } from '@arco-design/web-react/icon';
import { useTranslation } from 'react-i18next';
import PopEditCom from '../PopEditCom';
// import '../../style/common.less';
import './index.css';

function EllipsisPopover(props: any, ref: any) {
  const { t } = useTranslation('plugin__console-plugin-aidp');
  const {
    dataTestId,
    value,
    isCopy,
    isLink,
    handleLink,
    isEdit,
    editTitle,
    editType,
    handleEdit,
    className,
    tips,
    validatorRules,
    preferTypography,
    ellipsis
  } = props;
  const valueRef = useRef(null);
  const editRef = useRef(null);
  const columnTextRef = useRef(null);
  const columnInputRef = useRef(null);
  const [isShowTooltip, setIsShowTooltip] = React.useState(false);
  const [columnTextVisible, setColumnTextVisible] = React.useState(false);
  const [columnInputVisible, setColumnInputVisible] = React.useState(false);
  const columnTimerRef = useRef(null);

  useImperativeHandle(ref, () => ({}));
  const onMouseOver = () => {
    // TODO: ts错误
    // @ts-expect-error
    clearTimeout(columnTimerRef.current);
    const columnTimer = setTimeout(() => {
      setColumnTextVisible(true);
    }, 200);
    // TODO: ts错误
    // @ts-expect-error
    columnTimerRef.current = columnTimer;
  };
  React.useEffect(() => {
    if (columnTextVisible) {
      const tag = valueRef.current;
      const tag1 = columnTextRef.current;
      if (tag && tag1) {
        let parentWidth = Number(
          // TODO: ts错误
          // @ts-expect-error
          window.getComputedStyle(tag.parentNode).width.replace('px', '')
        ); // 获取元素父级宽度精确到小数
        const contentWidth = Number(
          window.getComputedStyle(tag1).width.replace('px', '')
        ); // 获取元素宽度精确到小数
        if (isCopy || isEdit) parentWidth = parentWidth - 20;

        setIsShowTooltip(contentWidth > parentWidth);
      } else {
        setIsShowTooltip(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnTextVisible]);
  const onMouseOut = () => {
    setIsShowTooltip(false);
    setColumnTextVisible(false);
    // TODO: ts错误
    // @ts-expect-error
    clearTimeout(columnTimerRef.current);
  };
  const onMouseOverIconCopy = () => {
    setColumnInputVisible(true);
  };
  const onMouseOutIconCopy = () => {
    setColumnInputVisible(false);
  };
  const handleCopy = () => {
    const oInput = columnInputRef.current;
    // 选择对象
    // TODO: ts错误
    // @ts-expect-error
    oInput.select();
    // 执行浏览器复制命令
    try {
      document.execCommand('Copy');
      Message.success({
        className: 'net-ecs-message',
        content: t('CopySucceeded')
      });
    } catch (e) {
      Message.success({
        className: 'net-ecs-message',
        content: t('CopyFailed')
      });
    }
  };
  const renderPopover = () => {
    const displayContent = value || value === 0 ? value : '--';
    return preferTypography ? (
      <Typography.Paragraph
        ellipsis={{
          showTooltip: {
            type: 'popover',
            props: { position: 'tl', className: 'compute-aidp-popover' }
          },
          ...ellipsis
        }}
        className={`typoWrap ${className ? className : ''}`}
      >
        {displayContent}
      </Typography.Paragraph>
    ) : (
      <Popover
        className="compute-aidp-popover"
        position="tl"
        content={value}
        popupVisible={isShowTooltip}
      >
        {isLink ? (
          <Link
            data-test-id={dataTestId}
            className={`ellipsis-text ${
              isCopy || isEdit ? 'ellipsis-pop-span' : ''
            } ${className ? className : ''}`}
            onClick={handleLink}
            ref={valueRef}
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
          >
            {displayContent}
          </Link>
        ) : (
          <span
            data-test-id={dataTestId}
            className={`ellipsis-text ${
              isCopy || isEdit ? 'ellipsis-pop-span' : ''
            } ${className ? className : ''}`}
            ref={valueRef}
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
          >
            {displayContent}
          </span>
        )}
      </Popover>
    );
  };
  return (
    <div className="ellipsis-popover-div">
      {renderPopover()}
      {isCopy && (
        <Popover
          className="compute-aidp-popover"
          position="top"
          content={t('Copy')}
        >
          <IconCopy
            className="ellipsis-pop-copy-icon"
            onClick={handleCopy}
            onMouseOver={onMouseOverIconCopy}
            onMouseOut={onMouseOutIconCopy}
          />
        </Popover>
      )}
      {isEdit && (
        <PopEditCom
          ref={editRef}
          title={editTitle || t('Name')}
          type={editType || 'input'}
          value={value}
          handleOk={(val: any) => handleEdit(val, editRef)}
          editIconDataTestId="port-pop-edit-icon"
          editConfirmDataTestId="port-pop-edit-confirm-btn"
          tips={tips}
          validatorRules={validatorRules}
        />
      )}
      {columnTextVisible && (
        <span ref={columnTextRef} className="column-text-span">
          {value}
        </span>
      )}
      {columnInputVisible && (
        <input
          ref={columnInputRef}
          readOnly
          defaultValue={value}
          className="column-text-span"
        />
      )}
    </div>
  );
}

export default forwardRef(EllipsisPopover);
