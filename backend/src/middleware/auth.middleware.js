const jwt = require('jsonwebtoken');
require('dotenv').config();

// Vulnerable version: Hardcode JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'my-hardcoded-secret-12345'; // Vulnerable!

const authMiddleware = {
  verifyToken: (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Bearer token
    if (!token) return res.status(401).json({ error: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ error: 'Invalid token' });
      req.user = decoded;
      next();
    });
  },

  checkRole: (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    next();
  },
};

module.exports = authMiddleware;