import { login } from '@/api/user';
import LoginBgPng from '@/assets/LOGINbg.png';
import LogoPng from '@/assets/logo.png';
import { setLocalStorage, removeLocalStorage, getLocalStorage } from '@/utils/storage';
import { Button, Card, Form, Input } from '@arco-design/web-react';
import React from 'react';
import { useHistory } from 'react-router-dom';

const LoginCard = () => {
  const [form] = Form.useForm();
  const history = useHistory();

  const handleSubmit = async (values: any) => {
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
      if(getLocalStorage('loginToken')){
         removeLocalStorage('loginToken')
      }
      setLocalStorage('loginToken', res.data.token);
      // TODO: 跳转到哪里
      history.push('/tenant/compute/appforge/member');
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
        <div className="mb-8 flex w-full max-w-md flex-col items-center">
          <div className="flex w-full flex-row items-center justify-between">
            <div className="flex items-center">
              <img
                src={LogoPng}
                alt="Logo"
                className="mr-6 w-48 object-contain"
              />
              <div className="mx-4 h-6 w-px bg-gray-400" />
            </div>
            <div className="text-xl font-bold text-gray-800">AppForge</div>
          </div>
        </div>

        {/* 表单部分 */}
        <Form
          form={form}
          requiredSymbol={false}
          layout="vertical"
          onSubmit={handleSubmit}
        >
          <Form.Item
            label={<div className="text-bold text-gray-800">账号</div>}
            field="account"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            label={<div className="text-bold text-gray-800">密码</div>}
            field="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" long htmlType="submit" className="mt-4">
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginCard;
