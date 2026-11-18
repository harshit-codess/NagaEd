'use strict';

const userService = require('../services/userService');
const { parseUserId } = require('../validators/authValidators');
const { AppError } = require('../utils/errors');

async function getUser(req, res) {
  const id = parseUserId(req.params.id);
  if (id === null) throw AppError.badRequest('User id must be a positive integer');

  // A valid token only grants access to its own record (prevents IDOR).
  if (req.auth.userId !== id) throw AppError.forbidden();

  const user = await userService.getById(id);
  res.status(200).json({ user });
}

module.exports = { getUser };
