'use strict';

const users = require('../repositories/userRepository');
const { AppError } = require('../utils/errors');

async function getById(id) {
  const user = await users.findById(id);
  if (!user) throw AppError.notFound('User not found');
  return user;
}

module.exports = { getById };
