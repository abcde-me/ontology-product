import { Login } from '@/api/modules/user';
import { isRequestSuccess } from '@/api/utils';
import { isDevBypassEnabled, withDevInitTimeout } from '@/utils/devFallback';
import { setLoginToken } from '@/utils/env';
import { Button, Form, Input, Message } from '@arco-design/web-react';
import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  DEFAULT_LOGIN_CAPTCHA_CODE,
  DEV_LOGIN_CAPTCHA_ID,
  DEV_LOGIN_TOKEN
} from '../constants';
import { getLoginRedirectPath } from '../utils';

interface LoginFormValues {
  account: string;
  password: string;
}

export function PasswordLoginForm() {
  const [form] = Form.useForm<LoginFormValues>();
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const location = useLocation();

  const enterSystem = () => {
    history.push(getLoginRedirectPath(location.search));
  };

  const enterWithDevBypass = () => {
    setLoginToken(DEV_LOGIN_TOKEN);
    Message.success('后端登录不可用，已使用本地开发账号进入');
    enterSystem();
  };

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      setLoading(true);

      const loginRequest = Login({
        account: values.account,
        password: values.password,
        captchaId: DEV_LOGIN_CAPTCHA_ID,
        captchaCode: DEFAULT_LOGIN_CAPTCHA_CODE
      });

      const res = isDevBypassEnabled()
        ? await withDevInitTimeout(loginRequest, 'Login')
        : await loginRequest;

      if (isRequestSuccess(res)) {
        enterSystem();
        return;
      }

      if (isDevBypassEnabled()) {
        enterWithDevBypass();
        return;
      }

      Message.error(res?.message || '登录失败');
    } catch (error) {
      console.error('登录失败:', error);
      if (isDevBypassEnabled()) {
        enterWithDevBypass();
        return;
      }
      Message.error('登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      requiredSymbol={false}
      layout="vertical"
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
