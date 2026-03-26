# 本体平台前端

本体平台前端项目，专注于知识图谱构建和管理的企业级应用。

## 功能特性

- **本体场景库**: 创建和管理本体场景，定义领域知识结构
- **对象类型管理**: 定义和管理本体中的对象类型
- **属性管理**: 管理本体对象的属性定义
- **链接管理**: 定义对象间的关系和链接
- **行为动作**: 扩展本体的功能性行为
- **函数管理**: 自定义本体相关的函数逻辑
- **执行记录**: 监控和管理本体的运行状态

## 技术栈

- **前端框架**: React 17 + TypeScript
- **UI组件库**: Arco Design
- **状态管理**: Redux + Zustand
- **路由**: React Router 5.2.0
- **构建工具**: Webpack 5
- **样式**: Less + Sass + Tailwind CSS

## 运行方式

### 以独立项目运行

```
// 初始化项目
yarn install --frozen-lockfile

// 开发模式
yarn run dev

// 构建
yarn run build
```

## 开发规范

### 🌿 分支结构

release-1.0 (受保护) - 测试环境代码  
develop (受保护) - 开发环境代码  
feat-8.30 (受保护) - 8.30版本开发代码  
feat-9.30 (受保护) - 9.30版本开发代码  
├── feature-\*\* - 功能开发分支  
├── bugfix-\*\* - 非紧急缺陷修复  
└── hotfix-\*\* - 生产紧急修复

### 🛠️ 分支使用规范

#### 1. 功能开发流程

```bash
# 从基准分支创建功能分支，以9.30版本为例
git checkout -b feature-short-desc feat-9.30

# 开发完成后推送
git push origin feature-short-desc

# 创建Merge Request到基准分支，比如9.30版本合并到feat-9.30分支
```

#### 2. 缺陷修复流程

```bash
# 非紧急缺陷
git checkout -b bugfix-short-desc xxx

# 生产环境紧急修复
git checkout -b hotfix-short-desc develop
```

### 🚀 发布流程（双流水线规范）

#### 1. 开发环境发布

-[开发环境流水线地址](https://cdp.cestc.cn/product/#/project/pipeline/result?projectId=1909193124970778626&pipelineId=1955146558538309634&buildNo=1)  
-❗触发条件：手动触发流水线  
-[开发环境地址](http://10.1.4.73:31501/tenant/compute/onto/login)

#### 1. 测试环境发布（release-1.0分支）

-[测试环境流水线地址](https://cdp.cestc.cn/product/#/project/pipeline/result?projectId=1909193124970778626&pipelineId=1955145494502100993&buildNo=1)  
-❗触发条件：代码合并到 release-1.0 分支时，自动触发流水线  
-[测试环境地址](http://10.1.4.73:30501/tenant/compute/onto/login)

### 🔍 代码提交规范

#### 格式

[类型]: 描述

详细说明（可选）

#### 示例

```bash
# 从develop创建发布分支
git commit -m "feat: 增加JWT认证"
```

### 🚀 每日MR最佳实践

#### 1. 每日开发流程

```bash
# 早晨同步最新代，以9.30版本为例
git checkout feat-9.30
git pull --rebase

# 基于最新develop创建当日开发分支
git checkout -b feature-short-desc

# 当天工作结束后
git push origin feature-short-desc

# 创建MR到指定分支，并将MR链接复制到群里同步
```
