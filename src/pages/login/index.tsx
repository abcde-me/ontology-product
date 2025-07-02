import { login } from '@/api/user';
import LoginBgPng from '@/assets/LOGINbg.png';
import LogoPng from '@/assets/logo.png';
import {
  setLocalStorage,
  removeLocalStorage,
  getLocalStorage
} from '@/utils/storage';
import { Button, Card, Form, Input, Space } from '@arco-design/web-react';
import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

const LoginCard = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const location = useLocation();

  // 获取重定向URL
  const getRedirectPath = () => {
    const params = new URLSearchParams(location.search);
    const redirectUri = params.get('redirect_uri');
    if (redirectUri) {
      try {
        const url = new URL(redirectUri);
        // 只返回路径部分，不包括域名
        return url.pathname + url.search + url.hash;
      } catch (e) {
        console.error('Invalid redirect URL:', e);
      }
    }
    // 默认重定向到应用商店页面
    return '/tenant/compute/modaforge/connection';
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      console.log(values);
      const res = await login(values);
      console.log('登录结果', res);
      if (res.success) {
        // 测试解析后端返回的实际 token
        const testToken = res.data.token;
        console.log('解析后端返回的实际 token:');

        // // 导入解析工具
        // import('@/utils/authUtils').then(({ getTokenExpiration, isValidToken }) => {
        //   console.log('Token 有效性:', isValidToken(testToken));
        //   const expTime = getTokenExpiration(testToken);
        //   console.log('过期时间:', expTime ? new Date(expTime).toLocaleString() : '解析失败');
        // });
        if (getLocalStorage('loginToken')) {
          removeLocalStorage('loginToken');
        }
        setLocalStorage('loginToken', res.data.token);
        localStorage.removeItem('cascader');
        // 重定向到之前的页面或默认页面
        const redirectPath = getRedirectPath();
        history.push(redirectPath);
      }
    } catch (error) {
      console.error('登录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex h-screen w-full items-center justify-center"
      style={{
        backgroundImage: `url(${LoginBgPng})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <Card
        className="mx-4 w-full max-w-md p-4"
        bordered={false}
        style={{
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}
      >
        {/* Logo 和标题部分 */}
        <Header />

        {/* 表单部分 */}
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
            label={
              <div className="text-[14px] font-bold text-gray-800">密码</div>
            }
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
      </Card>
    </div>
  );
};

export default LoginCard;

function Header() {
  return (
    <div className="flex justify-center">
      <Space className="mb-8">
        <img className="w-48 object-contain" src={LogoPng} />
        <div className="mx-[6px] h-6 w-[1px] bg-gray-400"></div>
        <div className="text-xl font-bold text-gray-800">多模态治理平台</div>
      </Space>
    </div>
  );
}
