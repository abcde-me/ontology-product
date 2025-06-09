'use strict';

const path = require('path');
const getClientEnvironment = require('./env');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');

const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const {
  ConsoleRemotePlugin,
} = require('@openshift-console/dynamic-plugin-sdk-webpack');
const paths = require('./paths');
const regioned = require('./region-console-remote-plugin');

// We will provide `paths.publicUrlOrPath` to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// Omit trailing slash as %PUBLIC_URL%/xyz looks better than %PUBLIC_URL%xyz.
// Get environment variables to inject into our app.
const env = getClientEnvironment(paths.publicUrlOrPath.slice(0, -1));
const isConsolePlugin = process.env.NODE_RUN_TYPE === 'ConsolePlugin';

// Some apps do not need the benefits of saving a web request, so not inlining the chunk
// makes for a smoother build process.
const shouldInlineRuntimeChunk = process.env.INLINE_RUNTIME_CHUNK !== 'false';

// custom overrides
class Cfg {
  constructor(webpackEnv) {
    this.webpackEnv = webpackEnv;
    this.isEnvDevelopment = webpackEnv === 'development';
    this.isEnvProduction = webpackEnv === 'production';
  }
  resolveAlias = {
    '@': path.resolve(paths.appPath, './src'),
    "react/jsx-dev-runtime": "react/jsx-dev-runtime.js",
    "react/jsx-runtime": "react/jsx-runtime.js"
  };
  commonLoaders = [
    {
      test: /\.less$/,
      exclude: [/\.module\.less$/],
      use: [
        {
          loader: 'style-loader',
        },
        {
          loader: 'css-loader',
        },
        {
          loader: 'less-loader',
          options: {
            lessOptions: {},
          },
        },
      ],
    },
    {
      test: /\.module\.less$/,
      // exclude: /node_modules/,
      use: [
        {
          loader: 'style-loader',
        },
        {
          loader: 'css-loader',
          options: {
            modules: {
              // 开启 CSS Modules
              mode: 'local',
              localIdentName: '[local]--[hash:base64:5]',
            },
          },
        },
        {
          loader: 'less-loader',
          options: {
            lessOptions: {},
          },
        },
      ],
    },
  ];
  commonPlugins = [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(paths.appPath, './locales'),
          to: 'locales',
        },
      ],
    }),
  ];
  overrideConsolePlugin() {
    const { isEnvProduction } = this;
    let output = {
      path: path.resolve(paths.appPath, 'dist'),
      filename: '[name]-bundle.js',
      chunkFilename: '[name]-chunk.js',
      assetModuleFilename: '[name].[hash][ext]',
    };
    let optimization = {
      chunkIds: 'named',
    };
    if (isEnvProduction) {
      output.filename = '[name]-bundle-[hash].min.js';
      output.chunkFilename = '[name]-chunk-[chunkhash].min.js';
      optimization.chunkIds = 'deterministic';
    }
    return {
      entry: {},
      output,
      optimization,
      // devtool:'source-map',
      plugins: {
        consolePlugin: [
          new (isConsolePlugin
            ? regioned(ConsoleRemotePlugin)
            : ConsoleRemotePlugin)(),
        ],
        miniCss: [
          isEnvProduction &&
            new MiniCssExtractPlugin({
              // Options similar to the same options in webpackOptions.output
              // both options are optional
              filename: '[name].[contenthash:8].css',
              chunkFilename: '[name].[contenthash:8].chunk.css',
            }),
        ],
      },
    };
  }
  overrideApp() {
    const { isEnvProduction } = this;

    return {
      optimization: {},
      plugins: {
        copyPlugins: [
          new CopyWebpackPlugin({
            patterns: [
              {
                from: path.resolve(paths.appPath, './assets'),
                to: 'assets',
              },
            ],
          }),
        ],
        html: [
          // Generates an `index.html` file with the <script> injected.
          new HtmlWebpackPlugin(
            Object.assign(
              {},
              {
                inject: true,
                template: paths.appHtml,
              },
              isEnvProduction
                ? {
                    minify: {
                      removeComments: true,
                      collapseWhitespace: true,
                      removeRedundantAttributes: true,
                      useShortDoctype: true,
                      removeEmptyAttributes: true,
                      removeStyleLinkTypeAttributes: true,
                      keepClosingSlash: true,
                      minifyJS: true,
                      minifyCSS: true,
                      minifyURLs: true,
                    },
                  }
                : undefined,
            ),
          ),
          // Inlines the webpack runtime script. This script is too small to warrant
          // a network request.
          // https://github.com/facebook/create-react-app/issues/5358
          isEnvProduction &&
            shouldInlineRuntimeChunk &&
            new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/runtime-.+[.]js/]),
          // Makes some environment variables available in index.html.
          // The public URL is available as %PUBLIC_URL% in index.html, e.g.:
          // <link rel="icon" href="%PUBLIC_URL%/favicon.ico">
          // It will be an empty string unless you specify "homepage"
          // in `package.json`, in which case it will be the pathname of that URL.
          new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw),
        ],
        miniCss: [
          isEnvProduction &&
            new MiniCssExtractPlugin({
              // Options similar to the same options in webpackOptions.output
              // both options are optional
              filename: 'static/css/[name].[contenthash:8].css',
              chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
            }),
        ],
        mainfest: [
          // Generate an asset manifest file with the following content:
          // - "files" key: Mapping of all asset filenames to their corresponding
          //   output file so that tools can pick it up without having to parse
          //   `index.html`
          // - "entrypoints" key: Array of files which are included in `index.html`,
          //   can be used to reconstruct the HTML if necessary
          new WebpackManifestPlugin({
            fileName: 'asset-manifest.json',
            publicPath: paths.publicUrlOrPath,
            generate: (seed, files, entrypoints) => {
              const manifestFiles = files.reduce((manifest, file) => {
                manifest[file.name] = file.path;
                return manifest;
              }, seed);
              const entrypointFiles = entrypoints.main.filter(
                (fileName) => !fileName.endsWith('.map'),
              );

              return {
                files: manifestFiles,
                entrypoints: entrypointFiles,
              };
            },
          }),
        ],
      },
    };
  }
}

const devServerOverride = {
  port: 9001,
  allowedHosts: 'all',
  devMiddleware: {
    writeToDisk: true,
  },
};
module.exports = {
  isConsolePlugin,
  Cfg,
  devServerOverride,
};
