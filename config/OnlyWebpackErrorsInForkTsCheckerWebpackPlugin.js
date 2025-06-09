const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = class OnlyWebpackErrorsInForkTsCheckerWebpackPlugin {
  apply(compiler) {
    const hooks = ForkTsCheckerWebpackPlugin.getCompilerHooks(compiler);

    hooks.issues.tap(
      'OnlyWebpackErrorsInForkTsCheckerWebpackPlugin',
      (issues, compilation) => {
        const files = new Set();
        for (const module of compilation.modules) {
          if (module.resource) {
            files.add(module.resource);
          }
        }
        // display errors only for files that are managed by webpack
        return issues.filter((issue) => !issue.file || files.has(issue.file));
      },
    );
  }
};
