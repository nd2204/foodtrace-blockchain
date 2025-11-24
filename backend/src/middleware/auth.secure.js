/**
 * src/middleware/auth.secure.js
 * Middleware xác thực JWT + kiểm tra quyền truy cập (role-based)
 * 
 * ✅ Bảo mật cao — yêu cầu JWT_SECRET phải có trong .env
 * ✅ Hỗ trợ phân quyền động: admin, manufacturer, customer
 * ✅ Gọn, dễ tái sử dụng trong route: secure(['admin']), secure(['manufacturer','admin'])
 */

const jwt = require('jsonwebtoken');
require('dotenv').config();

if (!process.env.JWT_SECRET) {
  throw new Error('🚨 JWT_SECRET phải được đặt trong file .env để middleware hoạt động an toàn!');
}

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware xác thực người dùng + phân quyền
 * @param {Array<string>} roles - các vai trò được phép, ví dụ: ['admin', 'manufacturer']
 */
module.exports = function secure(roles = []) {
  return (req, res, next) => {
    try {
      const authHeader = req.headers['authorization'];
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Thiếu token xác thực (Authorization: Bearer <token>)' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      // Giải mã thông tin người dùng từ token
      req.user = {
        userId: decoded.userId || decoded.id || decoded.sub || null,
        role: decoded.role || 'user',
        username: decoded.username || decoded.email || null,
      };

      // Nếu route có yêu cầu role cụ thể → kiểm tra quyền
      if (roles.length > 0 && !roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Bạn không có quyền truy cập tài nguyên này' });
      }

      next();
    } catch (err) {
      console.error('❌ JWT verify error:', err.message);
      return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
    }
  };
};
