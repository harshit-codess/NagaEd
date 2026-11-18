'use strict';

const { pool } = require('../db/pool');

// All queries are parameterised (?) -> no SQL injection.
const PUBLIC_COLUMNS = 'id, username, email, address, created_at AS createdAt';

async function create({ username, email, passwordHash, address }) {
  const [result] = await pool.execute(
    'INSERT INTO users (username, email, password_hash, address) VALUES (?, ?, ?, ?)',
    [username, email, passwordHash, address]
  );
  return result.insertId;
}

async function findByEmailWithHash(email) {
  const [rows] = await pool.execute(
    `SELECT ${PUBLIC_COLUMNS}, password_hash AS passwordHash FROM users WHERE email = ? LIMIT 1`,
    [email]
  );
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.execute(`SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

module.exports = { create, findByEmailWithHash, findById };
