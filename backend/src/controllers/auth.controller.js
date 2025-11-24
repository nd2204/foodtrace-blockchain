// src/controllers/auth.controller.js
const bcrypt = require('bcrypt');
const getPool = require('../config/db.config');
const redis = require('../utils/redis');
const { sendEmail } = require('../utils/email');
const tokenUtil = require('../utils/token');
require('dotenv').config();

const SALT_ROUNDS = 10;
const VERIFY_TTL = 600; // 10 minutes
const RESET_TTL = 600;

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const authController = {
  register: async (req, res) => {
    const { username, email, password, role = 'user', full_name, phone, address } = req.body;
    if (!username || !email || !password || !full_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const pool = await getPool();
    let conn;
    try {
      conn = await pool.getConnection();
      await conn.beginTransaction();

      const [existing] = await conn.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
      if (existing.length > 0) {
        await conn.rollback();
        return res.status(400).json({ error: 'Username or email already exists' });
      }

      const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
      const insertQuery = `INSERT INTO users (username, email, password_hash, role, full_name, phone, address, is_verified, created_at, updated_at)
                           VALUES (?, ?, ?, ?, ?, ?, ?, 0, NOW(), NOW())`;
      const [result] = await conn.query(insertQuery, [username, email, password_hash, role, full_name, phone, address]);

      // generate verification code and store in redis
      const code = generateCode();
      await redis.setEx(`verify:${email}`, VERIFY_TTL, code);

      // send verification email
      await sendEmail(email, 'Verify Your Account', `<p>Your verification code: <strong>${code}</strong> (expires in 10 minutes)</p>`);

      await conn.commit();
      res.status(201).json({ message: 'Registered. Check your email for verification code.' });
    } catch (err) {
      if (conn) await conn.rollback();
      console.error('Register error:', err);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      if (conn) conn.release();
    }
  },

  verifyCode: async (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: 'Email and code required' });

    try {
      const stored = await redis.get(`verify:${email}`);
      if (!stored) return res.status(400).json({ error: 'Invalid or expired code' });
      if (stored !== String(code)) return res.status(400).json({ error: 'Invalid code' });

      const pool = await getPool();
      await pool.query('UPDATE users SET is_verified = 1, updated_at = NOW() WHERE email = ?', [email]);

      // remove code
      await redis.del(`verify:${email}`);

      res.json({ message: 'Email verified successfully' });
    } catch (err) {
      console.error('verifyCode error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  forgotPassword: async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    try {
      const pool = await getPool();
      const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      if (!users.length) return res.status(404).json({ error: 'User not found' });

      const code = generateCode();
      await redis.setEx(`reset:${email}`, RESET_TTL, code);

      await sendEmail(email, 'Password reset code', `<p>Your reset code: <strong>${code}</strong> (expires in 10 minutes)</p>`);

      res.json({ message: 'Password reset code sent to email' });
    } catch (err) {
      console.error('forgotPassword error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  resetPassword: async (req, res) => {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) return res.status(400).json({ error: 'Email, code, newPassword required' });

    try {
      const stored = await redis.get(`reset:${email}`);
      if (!stored) return res.status(400).json({ error: 'Invalid or expired code' });
      if (stored !== String(code)) return res.status(400).json({ error: 'Invalid code' });

      const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
      const pool = await getPool();
      await pool.query('UPDATE users SET password_hash = ?, updated_at = NOW() WHERE email = ?', [password_hash, email]);

      await redis.del(`reset:${email}`);
      res.json({ message: 'Password reset successfully' });
    } catch (err) {
      console.error('resetPassword error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  login: async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Invalid input' });

    try {
      const pool = await getPool();
      const [users] = await pool.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, username]);
      const user = users[0];
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });
      if (!user.is_verified) return res.status(401).json({ error: 'Email not verified' });

      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

      const payload = { userId: user.user_id, role: user.role, username: user.username };
      const jwtToken = tokenUtil.sign(payload, { expiresIn: process.env.JWT_EXPIRES || '1h' });

      res.json({ message: 'Login successful', token: jwtToken });
    } catch (err) {
      console.error('login error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  logout: async (req, res) => {
    // optional: blacklist token using redis with TTL equal to remaining lifetime
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(400).json({ error: 'No token provided' });
    const token = authHeader.split(' ')[1];
    try {
      const decoded = tokenUtil.decode(token);
      // exp is in seconds since epoch
      const ttl = decoded && decoded.exp ? Math.max(0, decoded.exp - Math.floor(Date.now() / 1000)) : 3600;
      await redis.setEx(`bl:${token}`, ttl, '1');
      return res.json({ message: 'Logged out' });
    } catch (err) {
      return res.status(400).json({ error: 'Invalid token' });
    }
  },
};

module.exports = authController;
