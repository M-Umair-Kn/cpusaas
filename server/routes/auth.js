import express from 'express';
import * as authController from '../controllers/auth.js';
import authMiddleware from '../middlewares/auth.js';

const router = express.Router();

// Register route
router.post('/register', authController.register);

// Login route
router.post('/login', authController.login);

// Protected route - get user profile
router.get('/profile', authMiddleware, authController.getProfile);

export default router;