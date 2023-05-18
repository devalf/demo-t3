const { PORT_API_SERVER = 8081 } = process.env;

module.exports = {
  '/api': {
    target: `http://localhost:${PORT_API_SERVER}/`,
    secure: true,
    changeOrigin: true,
  },
};
