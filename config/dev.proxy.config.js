const { PORT_API_SERVER = 8083 } = process.env;

module.exports = [
  {
    context: ['/api'],
    target: `http://localhost:${PORT_API_SERVER}/`,
    secure: true,
    changeOrigin: true,
  },
];
