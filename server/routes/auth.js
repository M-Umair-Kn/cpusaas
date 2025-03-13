const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const authMiddleware = require('../middlewares/auth');

// Register route
router.post('/register', authController.register);

// Login route
router.post('/login', authController.login);

// Protected route - get user profile
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router; 