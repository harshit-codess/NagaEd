'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const users = require('../repositories/userRepository');
const { AppError } = require('../utils/errors');

// Compared against when the email is unknown, so "no such user" and
// "wrong password" take about the same time (mitigates user enumeration).
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', config.bcryptRounds);

function signToken(user) {
  return jwt.sign({ sub: String(user.id) }, config.jwt.secret, {
    algorithm: 'HS256',
    expiresIn: config.jwt.expiresIn,
  });
}

async function register({ username, email, password, address }) {
  const passwordHash = await bcrypt.hash(password, config.bcryptRounds);
  try {
    const id = await users.create({ username, email, passwordHash, address });
    return users.findById(id);
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') {
      if (String(err.message).includes('uq_users_username')) {
        throw AppError.conflict('Username already taken', 'USERNAME_TAKEN');
      }
      throw AppError.conflict('Email already in use', 'EMAIL_IN_USE');
    }
    throw err;
  }
}

async function login({ email, password }) {
  const record = await users.findByEmailWithHash(email);
  const ok = await bcrypt.compare(password, record ? record.passwordHash : DUMMY_HASH);
  if (!record || !ok) throw AppError.invalidCredentials();

  const { passwordHash, ...user } = record; // eslint-disable-line no-unused-vars
  return { token: signToken(user), user };
}

module.exports = { register, login };
