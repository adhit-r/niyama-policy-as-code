import express from 'express';
import { authenticate, authorize, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { auditLog } from '../database/elasticsearch';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users in the organization
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter by role
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */
router.get('/', authorize('users', 'read'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, isActive } = req.query;
  const organizationId = req.user!.organizationId;

  try {
    // Mock data for now - in production, this would query the database
    const users = [
      {
        id: '1',
        email: 'admin@company.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin',
        organizationId,
        isActive: true,
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        email: 'engineer@company.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'devsecops_engineer',
        organizationId,
        isActive: true,
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // Log audit event
    await auditLog.log(
      req.user!.id,
      'read_users',
      'users',
      'list',
      organizationId,
      { page, limit, role, isActive }
    );

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: users.length,
        totalPages: 1,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Failed to get users:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve users',
      timestamp: new Date().toISOString(),
    });
  }
}));

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a specific user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 */
router.get('/:id', authorize('users', 'read'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;

  try {
    // Mock data for now
    const user = {
      id,
      email: 'admin@company.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'admin',
      organizationId,
      isActive: true,
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Log audit event
    await auditLog.log(
      req.user!.id,
      'read_user',
      'user',
      id,
      organizationId
    );

    res.json({
      success: true,
      data: user,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Failed to get user:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user',
      timestamp: new Date().toISOString(),
    });
  }
}));

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               role:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 */
router.put('/:id', authorize('users', 'update'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, role, isActive } = req.body;
  const organizationId = req.user!.organizationId;

  try {
    // Mock user update - in production, this would update the database
    const user = {
      id,
      email: 'admin@company.com',
      firstName: firstName || 'John',
      lastName: lastName || 'Doe',
      role: role || 'admin',
      organizationId,
      isActive: isActive !== undefined ? isActive : true,
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Log audit event
    await auditLog.log(
      req.user!.id,
      'update_user',
      'user',
      id,
      organizationId,
      { firstName, lastName, role, isActive }
    );

    res.json({
      success: true,
      data: user,
      message: 'User updated successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Failed to update user:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to update user',
      timestamp: new Date().toISOString(),
    });
  }
}));

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete('/:id', authorize('users', 'delete'), requireRole(['admin']), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;

  try {
    // Mock user deletion - in production, this would delete from database
    // Log audit event
    await auditLog.log(
      req.user!.id,
      'delete_user',
      'user',
      id,
      organizationId
    );

    res.json({
      success: true,
      message: 'User deleted successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Failed to delete user:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to delete user',
      timestamp: new Date().toISOString(),
    });
  }
}));

export default router;



