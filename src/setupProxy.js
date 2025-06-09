const { createProxyMiddleware } = require('http-proxy-middleware');

// https://create-react-app.dev/docs/proxying-api-requests-in-development/
module.exports = function (app) {
  if (process.env.SINGLE_APP === "true") {
    console.log("==================>enable proxy", process.env.SINGLE_APP)
    app.use(
      ['/api/aiap/v1'],
      createProxyMiddleware({
        target: 'http://10.252.26.5:30925/api/aiap/v1',
        changeOrigin: true,
        secure: false,
        // logger: console,
        // pathRewrite: {
        //   '^/api/appforge/v1': ''
        // }
      })
    );
    app.use(
      ['/api/auth/v1'],
      createProxyMiddleware({
        target: 'https://10.252.20.4:31000/api/auth/v1',
        changeOrigin: true,
        secure: false,
        logger: console,
        on: {
          proxyReq: (proxyReq, req, res) => {
            proxyReq.removeHeader("origin");
          },
        }
      })
    );
  }
};
//    "dev": "cross-env PORT=9001 GENERATE_SOURCEMAP=false SINGLE_APP=true yarn start",
