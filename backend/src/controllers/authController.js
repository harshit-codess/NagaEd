'use strict';

const authService = require('../services/authService');
const { validateRegister, validateLogin } = require('../validators/authValidators');
const { AppError } = require('../utils/errors');

async function register(req, res) {
  const { value, errors } = validateRegister(req.body);
  if (errors.length) throw AppError.validation(errors);

  const user = await authService.register(value);
  res.status(201).json({ user });
}

async function login(req, res) {
  const { value, errors } = validateLogin(req.body);
  if (errors.length) throw AppError.validation(errors);

  const { token, user } = await authService.login(value);
  res.status(200).json({ token, tokenType: 'Bearer', user });
}

module.exports = { register, login };
