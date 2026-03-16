import React from 'react';
import { Card, Typography, Space, Button } from '@arco-design/web-react';
import { IconRight, IconBook, IconSettings } from '@arco-design/web-react/icon';
import { useHistory } from 'react-router-dom';
import { useUserInfo } from '@/store/userInfoStore';

const { Title, Paragraph } = Typography;

export default function HomePage() {
  const history = useHistory();
  const userInfo = useUserInfo();

  const handleNavigateToOntology = () => {
    history.push('/tenant/compute/modaforge/ontologyScene');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="mx-auto max-w-6xl">
        {/* 欢迎区域 */}
        <div className="mb-8 text-center">
          <Title heading={1} className="mb-4 text-gray-800">
            欢迎使用业务本体构建平台
          </Title>
          <Paragraph className="text-lg text-gray-600">
            {userInfo?.username
              ? `欢迎回来，${userInfo.username}！`
              : '欢迎使用本体管理系统'}
          </Paragraph>
        </div>

        {/* 功能卡片区域 */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* 本体场景库卡片 */}
          <Card
            className="cursor-pointer transition-all duration-200 hover:shadow-lg"
            onClick={handleNavigateToOntology}
          >
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <IconBook className="text-2xl text-blue-600" />
                </div>
              </div>
              <Title heading={4} className="mb-2">
                本体场景库
              </Title>
              <Paragraph className="mb-4 text-gray-600">
                管理和构建业务本体，创建对象类型、属性、链接关系等
              </Paragraph>
              <Button type="primary">
                立即使用 <IconRight className="ml-1" />
              </Button>
            </div>
          </Card>

          {/* 快速开始卡片 */}
          <Card className="transition-all duration-200 hover:shadow-lg">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <IconSettings className="text-2xl text-green-600" />
                </div>
              </div>
              <Title heading={4} className="mb-2">
                快速开始
              </Title>
              <Paragraph className="mb-4 text-gray-600">
                了解如何创建本体场景、定义对象类型和建立关系
              </Paragraph>
              <Button type="outline">查看指南</Button>
            </div>
          </Card>

          {/* 系统概览卡片 */}
          <Card className="transition-all duration-200 hover:shadow-lg">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                  <IconBook className="text-2xl text-purple-600" />
                </div>
              </div>
              <Title heading={4} className="mb-2">
                系统概览
              </Title>
              <Paragraph className="mb-4 text-gray-600">
                查看系统使用情况、本体统计信息和最近活动
              </Paragraph>
              <Button type="outline">查看详情</Button>
            </div>
          </Card>
        </div>

        {/* 平台介绍区域 */}
        <Card className="mt-8">
          <Title heading={3} className="mb-4">
            关于业务本体构建平台
          </Title>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Title heading={5} className="mb-2">
                什么是本体？
              </Title>
              <Paragraph className="text-gray-600">
                本体是对特定领域概念及其关系的形式化描述，它定义了领域内的基本术语和概念之间的关系，
                为知识共享和重用提供了标准化的框架。
              </Paragraph>
            </div>
            <div>
              <Title heading={5} className="mb-2">
                平台功能
              </Title>
              <ul className="space-y-2 text-gray-600">
                <li>• 本体场景管理：创建和管理不同业务场景的本体</li>
                <li>• 对象类型定义：定义业务实体及其属性</li>
                <li>• 关系建模：建立实体间的链接关系</li>
                <li>• 可视化图谱：直观展示本体结构和关系</li>
                <li>• 行为动作：定义本体的业务行为和函数</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
