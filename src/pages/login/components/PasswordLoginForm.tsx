import { Login } from '@/api/modules/user';
import { isRequestSuccess } from '@/api/utils';
import { Button, Form, Input } from '@arco-design/web-react';
import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { CaptchaImage } from './CaptchaImage';
import { DEFAULT_LOGIN_CAPTCHA_CODE } from '../constants';
import { useLoginCaptcha } from '../hooks/useLoginCaptcha';
import styles from '../index.module.scss';
import { getLoginRedirectPath } from '../utils';

interface LoginFormValues {
  account: string;
  password: string;
  captchaCode: string;
}

export function PasswordLoginForm() {
  const [form] = Form.useForm<LoginFormValues>();
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const location = useLocation();
  const {
    captchaId,
    captchaImage,
    loading: captchaLoading,
    refresh
  } = useLoginCaptcha();

  const handleSubmit = async (values: LoginFormValues) => {
    if (!captchaId) {
      form.setFields({
        captchaCode: {
          error: { message: '验证码加载失败，请点击图片刷新' }
        }
      });
      return;
    }

    try {
      setLoading(true);
      const res = await Login({
        account: values.account,
        password: values.password,
        captchaId,
        captchaCode: values.captchaCode
      });
      if (isRequestSuccess(res)) {
        history.push(getLoginRedirectPath(location.search));
        return;
      }

      form.setFieldValue('captchaCode', DEFAULT_LOGIN_CAPTCHA_CODE);
      void refresh();
    } catch (error) {
      console.error('登录失败:', error);
      form.setFieldValue('captchaCode', DEFAULT_LOGIN_CAPTCHA_CODE);
      void refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      requiredSymbol={false}
      layout="vertical"
      initialValues={{ captchaCode: DEFAULT_LOGIN_CAPTCHA_CODE }}
      onSubmit={handleSubmit}
    >
      <Form.Item
        label={
          <div className="text-[14px] font-bold text-gray-800">用户名</div>
        }
        field="account"
        rules={[{ required: true, message: '请输入用户名' }]}
      >
        <Input placeholder="请输入用户名" />
      </Form.Item>

      <Form.Item
        label={<div className="text-[14px] font-bold text-gray-800">密码</div>}
        field="password"
        rules={[{ required: true, message: '请输入密码' }]}
      >
        <Input.Password placeholder="请输入密码" />
      </Form.Item>

      <Form.Item
        label={
          <div className="text-[14px] font-bold text-gray-800">验证码</div>
        }
        required
      >
        <div className={styles.captchaRow}>
          <Form.Item
            field="captchaCode"
            rules={[{ required: true, message: '请输入验证码' }]}
            noStyle
          >
            <Input
              className={styles.captchaInput}
              placeholder={DEFAULT_LOGIN_CAPTCHA_CODE}
              maxLength={6}
            />
          </Form.Item>
          <CaptchaImage
            image={captchaImage}
            loading={captchaLoading}
            onRefresh={refresh}
          />
        </div>
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          long
          htmlType="submit"
          className="mt-4"
          loading={loading}
          disabled={loading}
        >
          {loading ? '登录中...' : '登录'}
        </Button>
      </Form.Item>
    </Form>
  );
}
