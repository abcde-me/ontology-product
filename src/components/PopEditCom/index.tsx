import * as React from 'react';
import { useImperativeHandle, forwardRef } from 'react';
import {
  Trigger,
  Form,
  Input,
  Select,
  Button,
  InputNumber,
  Popover
} from '@arco-design/web-react';
import { useTranslation } from 'react-i18next';
import { Valiate } from '../../utils/valiate';
import './index.css';
import { IconEdit } from '@arco-design/web-react/icon';

const FormItem = Form.Item;
const Option = Select.Option;
const formItemLayout = { labelCol: { span: 0 }, wrapperCol: { span: 24 } };

function PopEditCom(props: any, ref: any) {
  const { t } = useTranslation('plugin__console-plugin-aidp');
  const { requiredInputRule, requiredSelectRule, nameRule, descRule } =
    Valiate();
  const {
    type,
    title,
    value,
    options,
    isShowValue,
    handleOk,
    paramType,
    editIconDataTestId,
    editConfirmDataTestId,
    editNameDataTestId,
    tips,
    validatorRules,
    max
  } = props;
  const [visible, setVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const [form] = Form.useForm();
  useImperativeHandle(ref, () => ({
    form,
    setVisible: (visible: any) => {
      setVisible(visible);
    },
    setLoading: (loading: any) => {
      setLoading(loading);
    }
  }));

  const tipStyle = {
    color: '#a0a0a0'
  };

  return (
    <span className="ml-[5px] cursor-pointer">
      <Trigger
        showArrow
        popupVisible={visible}
        trigger="click"
        position="right"
        className="pop-edit-trigger"
        onVisibleChange={(visible) => {
          setInputValue(value);
          setVisible(visible);
        }}
        onClickOutside={() => {
          setVisible(false);
        }}
        popup={() => (
          <div
            data-test-id="pop-edit-main-modal"
            className="pop-edit-main radius-[4px] w-[332px] bg-[var(--color-bg-1)] p-[16px] shadow-[0_0px_10px_2px_var(--color-border-1)]"
          >
            <div className="mb-[12px] text-[14px] font-[600] text-[var(--color-text-2)]">
              {title}
            </div>
            <Form
              form={form}
              colon
              {...formItemLayout}
              initialValues={{ name: inputValue }}
            >
              {type === 'input' && (
                <>
                  <FormItem
                    field="name"
                    rules={[
                      requiredInputRule,
                      {
                        validator(value, callback) {
                          validatorRules
                            ? validatorRules(value, callback, t)
                            : nameRule(value, callback);
                        }
                      }
                    ]}
                    extra={
                      tips
                        ? tips
                        : '使用中文、英文、数字、.、_或-组成，最多包含 64个字符，必须使用中/英文开头'
                    }
                  >
                    <Input
                      placeholder={t('PleaseEnter') + title}
                      value={inputValue}
                      onChange={(val: any) => setInputValue(val)}
                      data-test-id={editNameDataTestId}
                      autoComplete={'off'}
                      maxLength={max || 64}
                    />
                  </FormItem>
                </>
              )}
              {type === 'textarea' && (
                <>
                  <FormItem field="name" rules={[{ validator: descRule }]}>
                    <Input.TextArea
                      maxLength={256}
                      showWordLimit
                      placeholder={t('PleaseEnter') + title}
                      value={inputValue}
                      onChange={(val: any) => setInputValue(val)}
                    />
                  </FormItem>
                  <div className="tipStyle" style={tipStyle}>
                    长度为2～256个字符，不能以http://或https://开头
                  </div>
                </>
              )}
              {type === 'inputNumber' && (
                <Popover
                  className="compute-aidp-popover"
                  position="top"
                  content={'64-9000'}
                >
                  <FormItem field="name" rules={[requiredInputRule]}>
                    <InputNumber
                      placeholder={t('PleaseEnter') + title}
                      min={64}
                      max={9000}
                      value={inputValue}
                      onChange={(val: any) => setInputValue(val)}
                    />
                  </FormItem>
                </Popover>
              )}
              {type === 'select' && (
                <FormItem field="name" rules={[requiredSelectRule]}>
                  <Select
                    placeholder={t('PleaseSelect') + title}
                    value={inputValue}
                    onChange={(val: any) => setInputValue(val)}
                  >
                    {options.map((item: any, index: number) => {
                      return (
                        <Option key={index} value={item.value}>
                          {isShowValue
                            ? `${item.label} (${item.value})`
                            : item.label}
                        </Option>
                      );
                    })}
                  </Select>
                </FormItem>
              )}
            </Form>
            <div className="text-right">
              <Button
                size="small"
                type="outline"
                onClick={() => setVisible(false)}
              >
                {t('Cancel')}
              </Button>
              <Button
                data-test-id={editConfirmDataTestId}
                size="small"
                type="primary"
                className="ml-[8px]"
                loading={loading}
                onClick={async () => {
                  try {
                    await form.validate();
                    if (paramType) {
                      handleOk(inputValue, paramType);
                    } else {
                      handleOk(inputValue);
                    }
                  } catch (e) {
                    console.log(e);
                  }
                }}
              >
                {t('Confirm')}
              </Button>
            </div>
          </div>
        )}
      >
        <IconEdit
          data-test-id={editIconDataTestId}
          className="align-middle text-[16px] text-[rgb(var(--link-6))] hover:text-[rgb(var(--link-5))]"
        />
      </Trigger>
    </span>
  );
}

export default forwardRef(PopEditCom);
