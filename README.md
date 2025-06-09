# console-plugin-appforge

AppForge（用于构建适用于特定用途或业务场景的定制化模型的智能平台）产品前端框架

# CCXD Pro

## 编码约定

[基于 arco pro 而来的动态插件](./docs/README-Arco.md)

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

## 单元测试

```
// 目录或者单个文件
yarn run test
```

## E2E 测试

### 本地开发调试：

```
# GUI方式
./local-test-protractor.sh

# 无头方式
headless=true ./local-test-cypress.sh
```

### mocha 报告

```
yarn run cypress-postreport
```
