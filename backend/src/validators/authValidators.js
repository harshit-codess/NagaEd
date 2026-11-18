'use strict';

// Pure functions (no I/O) so they are trivial to unit test.
// Each returns { value, errors } where errors is [{ field, message }].

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME_RE = /^[A-Za-z0-9_.-]+$/;

const isString = (v) => typeof v === 'string';

function validateRegister(body) {
  const errors = [];
  const src = body && typeof body === 'object' ? body : {};
  const value = {};

  // username
  if (!isString(src.username) || src.username.trim() === '') {
    errors.push({ field: 'username', message: 'Username is required' });
  } else {
    const username = src.username.trim();
    if (username.length < 3 || username.length > 30) {
      errors.push({ field: 'username', message: 'Username must be 3-30 characters' });
    } else if (!USERNAME_RE.test(username)) {
      errors.push({
        field: 'username',
        message: 'Username may only contain letters, numbers, ".", "_" and "-"',
      });
    } else {
      value.username = username;
    }
  }

  // email
  if (!isString(src.email) || src.email.trim() === '') {
    errors.push({ field: 'email', message: 'Email is required' });
  } else {
    const email = src.email.trim().toLowerCase();
    if (email.length > 254 || !EMAIL_RE.test(email)) {
      errors.push({ field: 'email', message: 'Email is not a valid email address' });
    } else {
      value.email = email;
    }
  }

  // password (never trimmed or logged)
  if (!isString(src.password) || src.password === '') {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (src.password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
  } else if (Buffer.byteLength(src.password, 'utf8') > 72) {
    // bcrypt silently truncates after 72 bytes; reject instead of surprising users.
    errors.push({ field: 'password', message: 'Password must be at most 72 bytes' });
  } else if (!/[A-Za-z]/.test(src.password) || !/[0-9]/.test(src.password)) {
    errors.push({ field: 'password', message: 'Password must contain at least one letter and one number' });
  } else {
    value.password = src.password;
  }

  // address
  if (!isString(src.address) || src.address.trim() === '') {
    errors.push({ field: 'address', message: 'Address is required' });
  } else {
    const address = src.address.trim();
    if (address.length < 5 || address.length > 255) {
      errors.push({ field: 'address', message: 'Address must be 5-255 characters' });
    } else {
      value.address = address;
    }
  }

  return { value, errors };
}

function validateLogin(body) {
  const errors = [];
  const src = body && typeof body === 'object' ? body : {};
  const value = {};

  if (!isString(src.email) || src.email.trim() === '') {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!EMAIL_RE.test(src.email.trim())) {
    errors.push({ field: 'email', message: 'Email is not a valid email address' });
  } else {
    value.email = src.email.trim().toLowerCase();
  }

  if (!isString(src.password) || src.password === '') {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (src.password.length > 1024) {
    errors.push({ field: 'password', message: 'Password is too long' });
  } else {
    value.password = src.password;
  }

  return { value, errors };
}

function parseUserId(raw) {
  if (!/^[1-9][0-9]{0,15}$/.test(String(raw))) return null;
  return Number(raw);
}

module.exports = { validateRegister, validateLogin, parseUserId };
