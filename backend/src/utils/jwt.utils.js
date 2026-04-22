const jwt = require('jsonwebtoken');
const config = require('../config/config');

const sign = (payload) => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
};

const verify = (token) => {
  return jwt.verify(token, config.jwtSecret);
};

module.exports = { sign, verify };
