import express from 'express';
import { body, validationResult } from 'express-validator';
import { authService } from '../services/authService';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();

// Validation middleware
const validateRegister = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
  body('organizationName').trim().isLength({ min: 1 }).withMessage('Organization name is required'),
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const validateChangePassword = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
];

const validateResetPassword = [
  body('email').isEmail().normalizeEmail(),
];

const validateConfirmReset = [
  body('resetToken').notEmpty().withMessage('Reset token is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
];

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - organizationName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               organizationName:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or user already exists
 *       500:
 *         description: Server error
 */
router.post('/register', validateRegister, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
      timestamp: new Date().toISOString(),
    });
  }

  const { email, password, firstName, lastName, organizationName } = req.body;

  try {
    const result = await authService.register({
      email,
      password,
      firstName,
      lastName,
      organizationName,
    });

    res.status(201).json({
      success: true,
      data: result,
      message: 'User registered successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Registration failed:', error);
    
    res.status(400).json({
      success: false,
      error: error.message || 'Registration failed',
      timestamp: new Date().toISOString(),
    });
  }
}));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       400:
 *         description: Validation error
 */
router.post('/login', validateLogin, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
      timestamp: new Date().toISOString(),
    });
  }

  const { email, password } = req.body;

  try {
    const result = await authService.login({ email, password });

    res.json({
      success: true,
      data: result,
      message: 'Login successful',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Login failed:', error);
    
    res.status(401).json({
      success: false,
      error: error.message || 'Login failed',
      timestamp: new Date().toISOString(),
    });
  }
}));

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid refresh token
 */
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: 'Refresh token is required',
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const result = await authService.refreshToken(refreshToken);

    res.json({
      success: true,
      data: result,
      message: 'Token refreshed successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Token refresh failed:', error);
    
    res.status(401).json({
      success: false,
      error: error.message || 'Token refresh failed',
      timestamp: new Date().toISOString(),
    });
  }
}));

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */
router.post('/logout', authenticate, asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  try {
    await authService.logout(req.user!.id, refreshToken);

    res.json({
      success: true,
      message: 'Logout successful',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Logout failed:', error);
    
    res.status(500).json({
      success: false,
      error: 'Logout failed',
      timestamp: new Date().toISOString(),
    });
  }
}));

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user information
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  try {
    const user = await authService.getCurrentUser(req.user!.id);

    res.json({
      success: true,
      data: user,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Get current user failed:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to get user information',
      timestamp: new Date().toISOString(),
    });
  }
}));

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Validation error or incorrect current password
 *       401:
 *         description: Unauthorized
 */
router.post('/change-password', authenticate, validateChangePassword, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
      timestamp: new Date().toISOString(),
    });
  }

  const { currentPassword, newPassword } = req.body;

  try {
    await authService.changePassword(req.user!.id, currentPassword, newPassword);

    res.json({
      success: true,
      message: 'Password changed successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Password change failed:', error);
    
    res.status(400).json({
      success: false,
      error: error.message || 'Password change failed',
      timestamp: new Date().toISOString(),
    });
  }
}));

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset email sent (if user exists)
 *       400:
 *         description: Validation error
 */
router.post('/reset-password', validateResetPassword, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
      timestamp: new Date().toISOString(),
    });
  }

  const { email } = req.body;

  try {
    await authService.resetPassword(email);

    // Always return success to prevent email enumeration
    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Password reset request failed:', error);
    
    res.status(500).json({
      success: false,
      error: 'Password reset request failed',
      timestamp: new Date().toISOString(),
    });
  }
}));

/**
 * @swagger
 * /auth/confirm-reset:
 *   post:
 *     summary: Confirm password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resetToken
 *               - newPassword
 *             properties:
 *               resetToken:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Validation error or invalid token
 */
router.post('/confirm-reset', validateConfirmReset, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
      timestamp: new Date().toISOString(),
    });
  }

  const { resetToken, newPassword } = req.body;

  try {
    await authService.confirmPasswordReset(resetToken, newPassword);

    res.json({
      success: true,
      message: 'Password reset successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Password reset confirmation failed:', error);
    
    res.status(400).json({
      success: false,
      error: error.message || 'Password reset failed',
      timestamp: new Date().toISOString(),
    });
  }
}));

export default router;

