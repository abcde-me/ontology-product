// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

// region-console-remote-plugin
// 用于hack修改掉， ConsoleRemotePlugin 对于 webpack 的 publicPath 配置写死为 /api/plugins 的问题
// 不太能理解为什么要设计成写死的，写死为 /api/plugins 不能满足多 region 的设计
// 代码在 ./node_modules/@openshift-console/dynamic-plugin-sdk-webpack/lib/webpack/ConsoleRemotePlugin.js line 47
// 依赖 @openshift-console/dynamic-plugin-sdk-webpack@0.0.6 和 webpack@^5.0.0

// 核心在于修改 webpack 的 publicPath 配置，本身这个配置就是 webpack 的，存在插件给配置反向修改写死就不合适

module.exports = (CRP) => {
  // 从 ConsoleRemotePlugin 原型链上把原始 apply 复制一份
  const oldApply = CRP.prototype.apply;

  // 修改为新的 apply
  // 在新的里面调用原始 apply，同时加上自己的逻辑
  // 可以理解成继承了 ConsoleRemotePlugin ，然后重写 apply 方法，里面调用父类的方法来保证原始代码的运行
  Object.assign(CRP.prototype, {
    apply(compiler) {
      oldApply.call(this, compiler);
      // https://webpack.js.org/guides/public-path/#automatic-publicpath
      compiler.options.output.publicPath = 'auto';
    },
  });

  return CRP;
};
