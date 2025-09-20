import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { metrics } from '../database/influxdb';
import { auditLog, policyEvaluationLog } from '../database/elasticsearch';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * @swagger
 * /policies:
 *   get:
 *     summary: Get all policies
 *     tags: [Policies]
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
 *         name: severity
 *         schema:
 *           type: string
 *         description: Filter by severity
 *     responses:
 *       200:
 *         description: Policies retrieved successfully
 */
router.get('/', authorize('policies', 'read'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, category, severity } = req.query;
  const organizationId = req.user!.organizationId;

  try {
    // Mock data for now - in production, this would query the database
    const policies = [
      {
        id: '1',
        name: 'RBAC Admin Only',
        description: 'Restrict admin access to specific users',
        category: 'rbac',
        severity: 'high',
        isActive: true,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Resource Limits',
        description: 'Enforce resource limits on containers',
        category: 'resource_management',
        severity: 'medium',
        isActive: true,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // Log audit event
    await auditLog.log(
      req.user!.id,
      'read_policies',
      'policies',
      'list',
      organizationId,
      { page, limit, category, severity }
    );

    res.json({
      success: true,
      data: policies,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: policies.length,
        totalPages: 1,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Failed to get policies:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve policies',
      timestamp: new Date().toISOString(),
    });
  }
}));

/**
 * @swagger
 * /policies/{id}:
 *   get:
 *     summary: Get a specific policy
 *     tags: [Policies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Policy ID
 *     responses:
 *       200:
 *         description: Policy retrieved successfully
 *       404:
 *         description: Policy not found
 */
router.get('/:id', authorize('policies', 'read'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;

  try {
    // Mock data for now
    const policy = {
      id,
      name: 'RBAC Admin Only',
      description: 'Restrict admin access to specific users',
      content: 'package kubernetes.admission\n\nimport rego.v1\n\ndeny contains msg if {\n    input.request.kind.kind == "Role"\n    input.request.kind.group == "rbac.authorization.k8s.io"\n    input.request.operation == "CREATE"\n    not "admin" in input.request.object.metadata.labels\n    msg := "Only admin roles are allowed"\n}',
      language: 'rego',
      category: 'rbac',
      severity: 'high',
      isActive: true,
      version: 1,
      authorId: req.user!.id,
      organizationId,
      tags: ['kubernetes', 'rbac', 'security'],
      complianceMappings: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Log audit event
    await auditLog.log(
      req.user!.id,
      'read_policy',
      'policy',
      id,
      organizationId
    );

    res.json({
      success: true,
      data: policy,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Failed to get policy:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve policy',
      timestamp: new Date().toISOString(),
    });
  }
}));

/**
 * @swagger
 * /policies:
 *   post:
 *     summary: Create a new policy
 *     tags: [Policies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - content
 *               - language
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               content:
 *                 type: string
 *               language:
 *                 type: string
 *                 enum: [rego, yaml, json]
 *               category:
 *                 type: string
 *               severity:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Policy created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', authorize('policies', 'create'), asyncHandler(async (req, res) => {
  const { name, description, content, language, category, severity = 'medium', tags = [] } = req.body;
  const organizationId = req.user!.organizationId;

  if (!name || !content || !language || !category) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: name, content, language, category',
      timestamp: new Date().toISOString(),
    });
  }

  try {
    // Mock policy creation - in production, this would save to database
    const policy = {
      id: Date.now().toString(),
      name,
      description,
      content,
      language,
      category,
      severity,
      isActive: true,
      version: 1,
      authorId: req.user!.id,
      organizationId,
      tags,
      complianceMappings: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Log audit event
    await auditLog.log(
      req.user!.id,
      'create_policy',
      'policy',
      policy.id,
      organizationId,
      { name, category, severity }
    );

    res.status(201).json({
      success: true,
      data: policy,
      message: 'Policy created successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Failed to create policy:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to create policy',
      timestamp: new Date().toISOString(),
    });
  }
}));

/**
 * @swagger
 * /policies/{id}/evaluate:
 *   post:
 *     summary: Evaluate a policy against a resource
 *     tags: [Policies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Policy ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resource
 *             properties:
 *               resource:
 *                 type: object
 *                 description: Resource to evaluate against the policy
 *     responses:
 *       200:
 *         description: Policy evaluation completed
 *       404:
 *         description: Policy not found
 */
router.post('/:id/evaluate', authorize('policies', 'read'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { resource } = req.body;
  const organizationId = req.user!.organizationId;

  if (!resource) {
    return res.status(400).json({
      success: false,
      error: 'Resource is required',
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const startTime = Date.now();
    
    // Mock policy evaluation - in production, this would use OPA
    const result = Math.random() > 0.3 ? 'allow' : 'deny';
    const duration = Date.now() - startTime;

    const evaluation = {
      id: Date.now().toString(),
      policyId: id,
      resourceId: resource.id || 'unknown',
      resourceType: resource.kind || 'unknown',
      result,
      violations: result === 'deny' ? [
        {
          id: '1',
          message: 'Policy violation detected',
          severity: 'medium',
        }
      ] : [],
      evaluatedAt: new Date().toISOString(),
      metadata: {
        duration,
        resource,
      },
    };

    // Record metrics
    await metrics.recordPolicyEvaluation(id, result, duration, organizationId);

    // Log evaluation
    await policyEvaluationLog.log(
      id,
      evaluation.resourceId,
      evaluation.resourceType,
      result,
      organizationId,
      duration,
      evaluation.violations,
      evaluation.metadata
    );

    // Log audit event
    await auditLog.log(
      req.user!.id,
      'evaluate_policy',
      'policy',
      id,
      organizationId,
      { result, duration, resourceId: evaluation.resourceId }
    );

    res.json({
      success: true,
      data: evaluation,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Failed to evaluate policy:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to evaluate policy',
      timestamp: new Date().toISOString(),
    });
  }
}));

export default router;

