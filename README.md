# console-plugin-appforge

AppForge（用于构建适用于特定用途或业务场景的定制化模型的智能平台）产品前端框架

# CCXD Pro

## 编码约定

[基于 arco pro 而来的动态插件](./docs/README-Arco.md)

## 运行方式

### 以独立项目运行

```
// 初始化项目
yarn install

// 开发模式
yarn run dev

// 构建
yarn run build
```

### 以 console 插件运行

建议也放到虚机上

```
// 初始化项目
yarn install

// 开发模式
yarn run dev:cp

// 构建
yarn run start:http-server
```

然后在 console 项目运行

```
# 登录环境
oc login https://console-ccos-console.apps.cc-ccos56209.ccos.test:6443 -u admin -p admin@123

# 首次运行设置端口
firewall-cmd --zone=public --add-port=9001/tcp --permanent
firewall-cmd --reload
firewall-cmd --list-ports

# 后端
source contrib/oc-environment.sh
./bin/bridge  -plugins console-plugin-appforge=http://虚机IP:9001

# 前端
cd frontend/
yarn run dev
```

最后访问 虚机 IP:9000 可见左侧菜单

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
