const express = require('express');
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const validationRules = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', authLimiter, validationRules.register, authController.register);
router.post('/login', authLimiter, validationRules.login, authController.login);
router.post('/refresh-token', authController.refreshToken);  // check again

// Protected routes
router.get('/profile', auth, authController.getProfile);
router.post('/logout', auth, authController.logout);

module.exports = router;