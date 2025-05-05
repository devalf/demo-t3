const { NX_PUBLIC_SERVER_NEST_PORT = 8083 } = process.env;

module.exports = [
  {
    context: ['/api'],
    target: `http://localhost:${NX_PUBLIC_SERVER_NEST_PORT}/`,
    secure: true,
    changeOrigin: true,
  },
];
