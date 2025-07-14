// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createProxyMiddleware } = require('http-proxy-middleware');

// https://create-react-app.dev/docs/proxying-api-requests-in-development/
module.exports = function (app) {
  if (process.env.SINGLE_APP === 'true') {
    app.use(
      ['/api/aiap/v1'],
      createProxyMiddleware({
        target: 'http://10.252.26.5:30925/api/aiap/v1',
        changeOrigin: true,
        secure: false
        // logger: console,
        // pathRewrite: {
        //   '^/api/appforge/v1': ''
        // }
      })
    );
    app.use(
      ['/api/auth/v1'],
      createProxyMiddleware({
        target: 'http://10.252.26.5:31646/api/auth/v1',
        changeOrigin: true,
        secure: false,
        logger: console,
        on: {
          proxyReq: (proxyReq, req, res) => {
            proxyReq.removeHeader('origin');
          }
        }
      })
    );
    app.use(
      ['/api/aimdp/v1'],
      createProxyMiddleware({
        target: 'http://10.1.4.73:30183/api/aimdp/v1',
        changeOrigin: true,
        secure: false,
        logger: console,
        on: {
          proxyReq: (proxyReq, req, res) => {
            proxyReq.removeHeader('origin');
          }
        }
      })
    );
  }
};
//    "dev": "cross-env PORT=9001 GENERATE_SOURCEMAP=false SINGLE_APP=true yarn start",
