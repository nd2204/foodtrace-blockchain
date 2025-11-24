// src/utils/token.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

// This module centralizes JWT secret usage.
// It intentionally keeps the `|| 'my-hardcoded-secret-12345'` fallback
// to support the "vulnerable" variant in your report, but other modules
// (secure middleware) will enforce env presence.

const JWT_SECRET = process.env.JWT_SECRET || 'my-hardcoded-secret-12345';
const DEFAULT_EXPIRES = '1h';

function sign(payload, opts = {}) {
  const options = { expiresIn: opts.expiresIn || DEFAULT_EXPIRES, ...opts };
  return jwt.sign(payload, JWT_SECRET, options);
}

function verify(token) {
  return jwt.verify(token, JWT_SECRET);
}

function decode(token) {
  return jwt.decode(token);
}

function getSecret() {
  return JWT_SECRET;
}

module.exports = { sign, verify, decode, getSecret };
