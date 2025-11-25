const express = require('express');
const authController = require('../controllers/auth.controller');

const router = express.Router()
  .post('/register', authController.register)
  .post('/verify-code', authController.verifyCode)
  .post('/forgot-password', authController.forgotPassword)
  .post('/reset-password', authController.resetPassword)
  .post('/login', authController.login);

module.exports = router;