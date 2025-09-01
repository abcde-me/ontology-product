// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createProxyMiddleware } = require('http-proxy-middleware');

// https://create-react-app.dev/docs/proxying-api-requests-in-development/
module.exports = function (app) {
  if (process.env.SINGLE_APP === 'true') {
    app.options('*', (req, res) => {
      res.header('Access-Control-Allow-Origin', req.headers.origin);
      res.header('Access-Control-Allow-Credentials', true);
      res.header(
        'Access-Control-Allow-Methods',
        'GET,HEAD,PUT,PATCH,POST,DELETE'
      );
      res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, X-Regionid, X-Auth-Validate, Content-Type, Accept, Authorization'
      ); // Allowed headers
      res.sendStatus(200);
    });
    app.use(
      ['/api/auth/v1'],
      createProxyMiddleware({
        // 蜂巢工区可以不通过VPN访问
        // target: 'http://10.56.56.6:30084/api/auth/v1',
        // 需要通过VPN访问
        target: 'http://61.182.98.8:38054/api/auth/v1',
        changeOrigin: true,
        secure: false,
        logger: console,
        on: {
          proxyReq: (proxyReq, req, res) => {
            // proxyReq.removeHeader('origin');
          },
          proxyRes: (proxyRes, req, res) => {
            proxyRes.headers['Access-Control-Allow-Origin'] =
              req.headers.origin;
            proxyRes.headers['Access-Control-Allow-Credentials'] = true;
            proxyRes.headers['Access-Control-Allow-Methods'] =
              'GET, POST, PUT, DELETE, OPTIONS';
            proxyRes.headers['Access-Control-Allow-Headers'] =
              'Origin, X-Requested-With, X-Regionid, X-Auth-Validate, Content-Type, Accept, Authorization';
          }
        }
      })
    );
    app.use(
      ['/api/aimdp/v1'],
      createProxyMiddleware({
        // 蜂巢工区可以不通过VPN访问
        // target: 'http://10.56.56.6:30084/api/auth/v1',
        // 需要通过VPN访问
        target: 'http://61.182.98.8:38055/api/aimdp/v1',
        changeOrigin: true,
        secure: false,
        logger: console,
        on: {
          proxyReq: (proxyReq, req, res) => {
            // proxyReq.removeHeader('origin');
          },
          proxyRes: (proxyRes, req, res) => {
            proxyRes.headers['Access-Control-Allow-Origin'] =
              req.headers.origin;
            proxyRes.headers['Access-Control-Allow-Credentials'] = true;
            proxyRes.headers['Access-Control-Allow-Methods'] =
              'GET, POST, PUT, DELETE, OPTIONS';
            proxyRes.headers['Access-Control-Allow-Headers'] =
              'Origin, X-Requested-With, X-Regionid, X-Auth-Validate, Content-Type, Accept, Authorization';
          }
        }
      })
    );
    app.use(
      ['/labeleditor'],
      createProxyMiddleware({
        target: 'http://localhost:9050/labeleditor',
        changeOrigin: true,
        secure: false,
        logger: console,
        on: {
          // proxyRes: (proxyRes, req, res) => {
          //   proxyRes.headers['Access-Control-Allow-Origin'] =
          //     req.headers.origin;
          //   proxyRes.headers['Access-Control-Allow-Credentials'] = true;
          //   proxyRes.headers['Access-Control-Allow-Methods'] =
          //     'GET, POST, PUT, DELETE, OPTIONS';
          //   proxyRes.headers['Access-Control-Allow-Headers'] =
          //     'Origin, X-Requested-With, X-Regionid, X-Auth-Validate, Content-Type, Accept, Authorization';
          // }
        }
      })
    );
  }
};
