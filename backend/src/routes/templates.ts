import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { auditLog } from '../database/elasticsearch';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * @swagger
 * /templates:
 *   get:
 *     summary: Get all policy templates
 *     tags: [Templates]
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
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: isPublic
 *         schema:
 *           type: boolean
 *         description: Filter by public/private templates
 *     responses:
 *       200:
 *         description: Templates retrieved successfully
 */
router.get('/', authorize('templates', 'read'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, category, isPublic } = req.query;
  const organizationId = req.user!.organizationId;

  try {
    // Mock data for now - in production, this would query the database
    const templates = [
      {
        id: '1',
        name: 'RBAC - Admin Only',
        description: 'Restrict admin access to specific users',
        content: 'package kubernetes.admission\n\nimport rego.v1\n\ndeny contains msg if {\n    input.request.kind.kind == "Role"\n    input.request.kind.group == "rbac.authorization.k8s.io"\n    input.request.operation == "CREATE"\n    not "admin" in input.request.object.metadata.labels\n    msg := "Only admin roles are allowed"\n}',
        language: 'rego',
        category: 'rbac',
        parameters: [
          {
            name: 'adminLabel',
            type: 'string',
            description: 'Label to identify admin roles',
            required: true,
            defaultValue: 'admin',
          }
        ],
        isPublic: true,
        authorId: 'system',
        downloadCount: 1250,
        rating: 4.8,
        tags: ['kubernetes', 'rbac', 'security'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Resource Limits',
        description: 'Enforce resource limits on containers',
        content: 'package kubernetes.admission\n\nimport rego.v1\n\ndeny contains msg if {\n    input.request.kind.kind == "Pod"\n    input.request.operation == "CREATE"\n    container := input.request.object.spec.containers[_]\n    not container.resources.limits.memory\n    msg := sprintf("Container %v must have memory limits", [container.name])\n}',
        language: 'rego',
        category: 'resource_management',
        parameters: [
          {
            name: 'minMemory',
            type: 'string',
            description: 'Minimum memory limit',
            required: true,
            defaultValue: '128Mi',
          }
        ],
        isPublic: true,
        authorId: 'system',
        downloadCount: 980,
        rating: 4.6,
        tags: ['kubernetes', 'resources', 'containers'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // Log audit event
    await auditLog.log(
      req.user!.id,
      'read_templates',
      'templates',
      'list',
      organizationId,
      { page, limit, category, isPublic }
    );

    res.json({
      success: true,
      data: templates,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: templates.length,
        totalPages: 1,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Failed to get templates:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve templates',
      timestamp: new Date().toISOString(),
    });
  }
}));

/**
 * @swagger
 * /templates/{id}:
 *   get:
 *     summary: Get a specific template
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Template ID
 *     responses:
 *       200:
 *         description: Template retrieved successfully
 *       404:
 *         description: Template not found
 */
router.get('/:id', authorize('templates', 'read'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;

  try {
    // Mock data for now
    const template = {
      id,
      name: 'RBAC - Admin Only',
      description: 'Restrict admin access to specific users',
      content: 'package kubernetes.admission\n\nimport rego.v1\n\ndeny contains msg if {\n    input.request.kind.kind == "Role"\n    input.request.kind.group == "rbac.authorization.k8s.io"\n    input.request.operation == "CREATE"\n    not "admin" in input.request.object.metadata.labels\n    msg := "Only admin roles are allowed"\n}',
      language: 'rego',
      category: 'rbac',
      parameters: [
        {
          name: 'adminLabel',
          type: 'string',
          description: 'Label to identify admin roles',
          required: true,
          defaultValue: 'admin',
        }
      ],
      isPublic: true,
      authorId: 'system',
      downloadCount: 1250,
      rating: 4.8,
      tags: ['kubernetes', 'rbac', 'security'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Log audit event
    await auditLog.log(
      req.user!.id,
      'read_template',
      'template',
      id,
      organizationId
    );

    res.json({
      success: true,
      data: template,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Failed to get template:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve template',
      timestamp: new Date().toISOString(),
    });
  }
}));

export default router;



