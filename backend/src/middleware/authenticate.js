'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config');
const { AppError } = require('../utils/errors');

module.exports = function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(AppError.unauthorized('Missing or malformed Authorization header'));
  }
  try {
    // Pin the algorithm so "alg: none" / algorithm-confusion tokens are rejected.
    const payload = jwt.verify(token, config.jwt.secret, { algorithms: ['HS256'] });
    const userId = Number(payload.sub);
    if (!Number.isSafeInteger(userId)) throw new Error('bad subject');
    req.auth = { userId };
    return next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    return next(AppError.unauthorized(message));
  }
};
