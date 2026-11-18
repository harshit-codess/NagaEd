'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { validateRegister, validateLogin, parseUserId } = require('../src/validators/authValidators');

const good = { username: 'nitesh_das', email: 'Nitesh@Example.com ', password: 'Passw0rdOk', address: '12 Sector 30, Chandigarh' };

test('register: accepts valid input and normalises email', () => {
  const { value, errors } = validateRegister(good);
  assert.equal(errors.length, 0);
  assert.equal(value.email, 'nitesh@example.com');
});

test('register: reports every missing field', () => {
  const { errors } = validateRegister({});
  assert.deepEqual(errors.map((e) => e.field).sort(), ['address', 'email', 'password', 'username']);
});

test('register: rejects non-object bodies and non-string fields', () => {
  assert.ok(validateRegister(undefined).errors.length === 4);
  assert.ok(validateRegister({ ...good, username: 123 }).errors.some((e) => e.field === 'username'));
  assert.ok(validateRegister({ ...good, email: { $ne: null } }).errors.some((e) => e.field === 'email'));
});

test('register: rejects weak / malformed values', () => {
  assert.ok(validateRegister({ ...good, email: 'nope' }).errors.some((e) => e.field === 'email'));
  assert.ok(validateRegister({ ...good, password: 'short1' }).errors.some((e) => e.field === 'password'));
  assert.ok(validateRegister({ ...good, password: 'onlyletters' }).errors.some((e) => e.field === 'password'));
  assert.ok(validateRegister({ ...good, password: 'a1'.repeat(40) }).errors.some((e) => e.field === 'password'));
  assert.ok(validateRegister({ ...good, username: 'a b' }).errors.some((e) => e.field === 'username'));
  assert.ok(validateRegister({ ...good, address: 'x' }).errors.some((e) => e.field === 'address'));
});

test('login: validates and normalises', () => {
  assert.equal(validateLogin({ email: 'A@B.co', password: 'x' }).value.email, 'a@b.co');
  assert.equal(validateLogin({}).errors.length, 2);
});

test('parseUserId: only positive integers', () => {
  assert.equal(parseUserId('42'), 42);
  for (const bad of ['0', '-1', '1.5', 'abc', '1; DROP TABLE users', '']) assert.equal(parseUserId(bad), null);
});
