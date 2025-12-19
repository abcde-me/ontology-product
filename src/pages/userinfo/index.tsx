import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Button, Space, Avatar, Message } from '@arco-design/web-react';
import type { FormInstance } from '@arco-design/web-react/es/Form';
import { updatePassword, updateUser, getRoleData } from '@/api/user';
import { UpdateMyselfInformation } from '@/api/modules/user';
import dayjs from 'dayjs';
import { UserEditModal } from './components/UserEditModal';
import { PasswordModal } from './components/PasswordModal';
import { useUserInfo, useUserInfoStore } from '@/store/userInfoStore';

const formatPhoneNumber = (phone: string): string => {
  if (!phone || phone.length !== 11) return phone;
  return `${phone.substring(0, 3)}****${phone.substring(7)}`;
};

export default function HomePage() {
  const [editVisible, setEditVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const form = useRef<FormInstance>(null);
  const passwordForm = useRef<FormInstance>(null);
  const [roleMap, setRoleMap] = useState<Record<string, string>>({});

  // 从全局 store 获取用户信息
  const userInfo = useUserInfo();

  const { updateUserInfo } = useUserInfoStore();

  useEffect(() => {
    // 获取角色数据并打印
    getRoleData().then((res) => {
      const map: Record<string, string> = {};
      if (res?.data && Array.isArray(res.data)) {
        res.data.forEach((item: any) => {
          map[item.code] = item.name;
        });
      }
      setRoleMap(map);
    });
  }, []);

  // 当用户信息更新时，同步到表单
  useEffect(() => {
    if (userInfo) {
      form.current?.setFieldsValue(userInfo);
    }
  }, [userInfo]);
  return (
    <div className="flex min-h-screen justify-center bg-gray-50 py-12">
      <div className="w-full max-w-2xl px-4">
        <p className="mb-6 text-[20px] font-[500] text-black">我的账号</p>

        {/* 用户信息卡片 */}
        <div className=" my-5 rounded-lg bg-white p-5 shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <Avatar size={64} className="ai-avatar">
                {userInfo?.username?.[0]?.toLocaleUpperCase()}
              </Avatar>
              <div className="ml-5">
                <div className="mb-2 text-[20px] font-bold">
                  {userInfo?.username}
                </div>
                <div className="mb-3 text-[16px] text-gray-600">
                  {userInfo?.account}
                </div>
                <div className="mb-2 text-[16px] text-gray-600">
                  <span className="inline-block w-16 font-[500]">手机号</span>
                  <span className="ml-3">
                    {formatPhoneNumber(userInfo?.phone || '')}
                  </span>
                </div>
                <div className="text-[16px] text-gray-600">
                  <span className="inline-block w-16 text-[16px] font-[500]">
                    注册时间
                  </span>
                  <span className="ml-3">
                    {dayjs(userInfo?.created_at).format('YYYY-MM-DD HH:mm:ss')}
                  </span>
                </div>
              </div>
            </div>
            <Space size="large">
              <Button onClick={() => setEditVisible(true)}>编辑</Button>
            </Space>
          </div>
        </div>

        {/* 密码卡片 */}
        <div className="my-5 rounded-lg bg-white p-5 shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-[14px] font-[500]">登录密码</div>
            <Space size="large">
              <Button onClick={() => setPasswordVisible(true)}>修改密码</Button>
            </Space>
          </div>
          <div className="text-[16px]">
            <span className="inline-block w-12">密码</span>
            <span className="ml-3 text-gray-600">*************</span>
          </div>
        </div>

        {/* 部门信息卡片 */}
        <div className=" my-5 rounded-lg bg-white p-5 shadow-md">
          <div className="mb-4 text-[14px] font-[500]">部门信息</div>
          <div className="mb-3 text-[16px]">
            <span className="inline-block w-12 font-[500]">部门</span>
            <span className="ml-4 text-gray-600">
              {userInfo?.organization?.name}
            </span>
          </div>
          <div className="text-[16px]">
            <span className="inline-block w-12 font-[500]">角色</span>
            <span className="ml-4 text-gray-600">
              {userInfo?.roles &&
                userInfo?.roles.map((role: any) => role.name).join(', ')}
            </span>
          </div>
        </div>
      </div>

      {/* 模态框保留原样 */}
      <UserEditModal
        visible={editVisible}
        onOk={async (values) => {
          // console.log('接收到的用户信息:', values);
          const res = await UpdateMyselfInformation(values);
          if (res.statusCode === 0) {
            // 重置表单
            Message.success('修改成功');
            // 更新全局 store 中的用户信息
            updateUserInfo(values);
          }
          setEditVisible(false);
        }}
        onCancel={() => setEditVisible(false)}
        formRef={form}
        initialValues={{
          account: userInfo?.account || '',
          phone: userInfo?.phone || '',
          username: userInfo?.name || ''
        }}
      />

      <PasswordModal
        visible={passwordVisible}
        onOk={async (values) => {
          console.log('接收到的密码信息:', values);
          const res = await updatePassword({
            userid: userInfo?.id,
            oldPassword: values.OldPassword,
            newPassword: values.newPassword
          });
          if (res.statusCode === 0) {
            // 重置表单
            passwordForm.current?.resetFields();
            Message.success('修改成功');
          }
          setPasswordVisible(false);
        }}
        onCancel={() => {
          passwordForm.current?.resetFields();
          setPasswordVisible(false);
        }}
        formRef={passwordForm}
      />
    </div>
  );
}
