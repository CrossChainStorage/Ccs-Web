// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        '/stamps',
        createProxyMiddleware({
            target: 'http://localhost:1633',
            changeOrigin: true,
        }),
    );
    app.use(
        '/bzz',
        createProxyMiddleware({
            target: 'http://localhost:1633',
            changeOrigin: true,
        }),
    );
};
