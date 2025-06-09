import React from 'react'
import { useState, useRef, useEffect } from 'react';
import { Form, Button, Space, Avatar, Message } from '@arco-design/web-react';
import type { FormInstance } from '@arco-design/web-react/es/Form';
import { updatePassword,updateUser, getMe } from '@/api/user'
import dayjs from 'dayjs';
import { UserEditModal } from './components/UserEditModal';
import { PasswordModal } from './components/PasswordModal';
import { use } from 'echarts';

const formatPhoneNumber = (phone: string): string => {
  if (!phone || phone.length !== 11) return phone;
  return `${phone.substring(0, 3)}****${phone.substring(7)}`;
};

export default function HomePage() {
  const [editVisible, setEditVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [userInfo, setUserInfo] = useState({
    account: '',
    username: '',
    phone: '',
    created_at: '',
    organization: '',
    role: ''
  })
  const form = useRef<FormInstance>(null);
  const passwordForm = useRef<FormInstance>(null);

  // 获取信息的函数
  function getMeInfo() {
    getMe().then(res => {
      if (res.success) {
        setUserInfo(res.data);
        form.current?.setFieldsValue(res.data);
      }
    })
  }


  useEffect(() => {
    getMeInfo()
  },[])
  console.log('userInfo', userInfo)
  return (
      <div className="flex justify-center min-h-screen bg-gray-50 py-8">
      <div className="w-full max-w-2xl px-4">
        <p className="text-black text-xl mb-6">我的账号</p>

        {/* 用户信息卡片 */}
        <div className=" my-5 p-5 bg-white rounded-lg shadow-md">
          <div className="flex justify-between items-start">
            <div className="flex items-start">
              <Avatar size={64} className="bg-blue-600">
                {
                  userInfo?.username[0]?.toLocaleUpperCase()
                }
              </Avatar>
              <div className="ml-5">
                <div className="text-lg font-bold mb-2">{userInfo?.account}</div>
                <div className="text-gray-600 text-sm mb-3">{userInfo?.username}</div>
                <div className="text-gray-600 text-sm mb-2">
                  <span className="inline-block w-16 font-bold text-black">手机号</span>
                  {formatPhoneNumber(userInfo?.phone)}
                </div>
                <div className="text-gray-600 text-sm">
                  <span className="inline-block w-16 font-bold text-black">注册时间</span>
                  {dayjs(userInfo?.created_at).format('YYYY-MM-DD HH:mm:ss')}
                </div>
              </div>
            </div>
            <Space size='large'>
              <Button 
                onClick={() => setEditVisible(true)}
              >
                编辑
              </Button>
            </Space>
          </div>
        </div>
        
        {/* 密码卡片 */}
        <div className="my-5 p-5 bg-white rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <div className="text-base font-bold">登录密码</div>
            <Space size='large'>
              <Button 
                onClick={() => setPasswordVisible(true)}
              >
                修改密码
              </Button>
            </Space>
          </div>
          <div>
            <span className="inline-block w-12">密码</span>
            <span className="ml-4 text-gray-600">*************</span>
          </div>
        </div>
        
        {/* 部门信息卡片 */}
        <div className=" my-5 p-5 bg-white rounded-lg shadow-md">
          <div className="text-base font-bold mb-4">部门信息</div>
          <div className="mb-3">
            <span className="inline-block w-12">部门</span>
            <span className="ml-4 text-gray-600">{userInfo?.organization}</span>
          </div>
          <div>
            <span className="inline-block w-12">角色</span>
            <span className="ml-4 text-gray-600">{userInfo?.role}</span>
          </div>
        </div>
      </div>

      {/* 模态框保留原样 */}
      <UserEditModal
        visible={editVisible}
        onOk={async (values) => {
          // console.log('接收到的用户信息:', values);
          const res = await updateUser(values)
          if(res.success){
            // 重置表单
            Message.success('修改成功');
            getMeInfo()
          }
          setEditVisible(false);
        }}
        onCancel={() => setEditVisible(false)}
        formRef={form}
        initialValues={userInfo}
      />

      <PasswordModal
        visible={passwordVisible}
        onOk={async (values) => {
          // console.log('接收到的密码信息:', values);
          const res = await updatePassword(values);
          console.log('res', res)
          if(res.success){
            // 重置表单
            passwordForm.current?.resetFields();
            Message.success('修改成功');
          }
          setPasswordVisible(false);
        }}
        onCancel={() => setPasswordVisible(false)}
        formRef={passwordForm}
      />
    </div>
  );
}