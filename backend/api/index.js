const { app } = require("../app");

// Vercel serverless entrypoint: forward request/response to Express.
module.exports = (req, res) => {
  return app(req, res);
};

