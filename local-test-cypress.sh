# - 用途：开发本地调试cypress的e2e测试
# - 运行方式：
#    1. 设置环境地址和密码:BRIDGE_BASE_ADDRESS、BRIDGE_KUBEADMIN_PASSWORD、CHROME_VERSION
#    2. ./local-test-cypress.sh
set +x

# 接口服务地址
export BRIDGE_BASE_ADDRESS_ADMIN=https://console-ccos-console.apps.cc-ccos56209.ccos.test
# 登录密码
export BRIDGE_KUBEADMIN_PASSWORD=admin
# 本地浏览器访问地址
export BRIDGE_BASE_ADDRESS=http://10.253.56.204:9000



### run script
if [[ $headless == true ]];then
  # headless=true ./local-test-cypress.sh 
  NO_FAILFAST=true yarn run test-cypress-console-plugin-appforge-headless
else
  NO_FAILFAST=true yarn run test-cypress-console-plugin-appforge
fi
