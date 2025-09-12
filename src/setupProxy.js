// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createProxyMiddleware } = require('http-proxy-middleware');

const addProxy = (options) => {
  return {
    target: '',
    changeOrigin: true,
    secure: false,
    logger: console,
    on: {
      proxyReq: (proxyReq, req, res) => {
        // proxyReq.removeHeader('origin');
      },
      proxyRes: (proxyRes, req, res) => {
        proxyRes.headers['Access-Control-Allow-Origin'] = req.headers.origin;
        proxyRes.headers['Access-Control-Allow-Credentials'] = true;
        proxyRes.headers['Access-Control-Allow-Methods'] =
          'GET, POST, PUT, DELETE, OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] =
          'Origin, X-Requested-With, X-Regionid, X-Auth-Validate, Content-Type, Accept, Authorization';
      }
    },
    ...options
  };
};

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
      createProxyMiddleware(
        addProxy({
          target: 'http://61.182.98.8:38054/api/auth/v1'
        })
      )
    );
    app.use(
      ['/api/aimdp/v1'],
      createProxyMiddleware(
        addProxy({
          // 需要通过VPN访问
          // http://10.1.4.73:31183/api/aimdp/v1
          // target: 'http://61.182.98.8:38084/api/aimdp/v1'
          target: 'http://10.1.4.73:30432/label-service/api/v1'
        })
      )
    );
    // 数据标注服务
    app.use(
      ['/label-service/api/v1'],
      createProxyMiddleware(
        addProxy({
          // 需要通过VPN访问
          // http://10.1.4.73:30432/label-service/api/v1
          target: 'http://61.182.98.8:38085/label-service/api/v1'
        })
      )
    );
    app.use(
      ['/labeleditor'],
      createProxyMiddleware({
        target: 'http://localhost:9050/labeleditor',
        changeOrigin: true,
        secure: false,
        logger: console,
        on: {}
      })
    );
  }
};
