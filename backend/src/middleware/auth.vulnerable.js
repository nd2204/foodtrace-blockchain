// src/middleware/auth.vulnerable.js
// Vulnerable version: allows fallback secret for demo/report
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'my-hardcoded-secret-12345';

module.exports = (roles = []) => {
  return (req, res, next) => {
    try {
      const token = req.headers['authorization']?.split(' ')[1];
      if (!token) return res.status(401).json({ error: 'No token provided' });

      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;

      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      }

      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
};
