# DEV.md - 分支管理与开发规范

## 🌿 分支结构

master (受保护) - 生产环境代码
develop (受保护) - 集成测试环境代码
│
├── feature/\*\* - 功能开发分支
├── bugfix/\*\* - 非紧急缺陷修复
└── hotfix/\*\* - 生产紧急修复

## 🛠️ 分支使用规范

### 1. 功能开发流程

```bash
# 从develop创建功能分支
git checkout -b feature/PROJ-123-short-desc develop

# 开发完成后推送
git push origin feature/PROJ-123-short-desc

# 创建Merge Request到develop分支
```

### 2. 缺陷修复流程

```bash
# 非紧急缺陷
git checkout -b bugfix/PROJ-456-desc develop

# 生产环境紧急修复
git checkout -b hotfix/PROJ-789-desc master
```

### 3. 发布流程

```bash
# 从develop创建发布分支
git checkout -b release/v1.0.0 develop

# 合并到master并打tag
git tag -a v1.0.0 -m "Release v1.0.0"
```

## 🔍 代码提交规范

### 格式

[类型]: 描述

详细说明（可选）

### 示例

```bash
# 从develop创建发布分支
git commit -m "feat: 增加JWT认证"
```

## 🚀 每日MR最佳实践

### 1. 每日开发流程

```bash
# 早晨同步最新代码
git checkout develop
git pull --rebase

# 基于最新develop创建当日开发分支
git checkout -b feature/PROJ-123-day1-work

# 当天工作结束后
git push origin feature/PROJ-123-day1-work

# 创建MR到develop分支，并将MR链接复制到群里同步
```
