import express from 'express';
import { complianceService } from '../services/complianceService';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { MappingType } from '../types';

const router = express.Router();

/**
 * @swagger
 * /compliance/frameworks:
 *   get:
 *     summary: Get all compliance frameworks
 *     tags: [Compliance]
 *     responses:
 *       200:
 *         description: List of compliance frameworks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       version:
 *                         type: string
 *                       description:
 *                         type: string
 *                       controls:
 *                         type: array
 *                       isActive:
 *                         type: boolean
 */
router.get('/frameworks', asyncHandler(async (req, res) => {
  try {
    const frameworks = await complianceService.getFrameworks();
    
    res.json({
      success: true,
      data: frameworks,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Failed to get compliance frameworks:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve compliance frameworks',
      timestamp: new Date().toISOString(),
    });
  }
}));

/**
 * @swagger
 * /compliance/frameworks/{id}:
 *   get:
 *     summary: Get a specific compliance framework
 *     tags: [Compliance]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Framework ID
 *     responses:
 *       200:
 *         description: Compliance framework details
 *       404:
 *         description: Framework not found
 */
router.get('/frameworks/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  try {
    const framework = await complianceService.getFramework(id);
    
    if (!framework) {
      return res.status(404).json({
        success: false,
        error: 'Framework not found',
        timestamp: new Date().toISOString(),
      });
    }
    
    res.json({
      success: true,
      data: framework,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Failed to get compliance framework:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve compliance framework',
      timestamp: new Date().toISOString(),
    });
  }
}));

/**
 * @swagger
 * /compliance/frameworks/{id}/controls:
 *   get:
 *     summary: Get controls for a compliance framework
 *     tags: [Compliance]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Framework ID
 *     responses:
 *       200:
 *         description: List of compliance controls
 */
router.get('/frameworks/:id/controls', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  try {
    const controls = await complianceService.getControls(id);
    
    res.json({
      success: true,
      data: controls,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Failed to get compliance controls:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve compliance controls',
      timestamp: new Date().toISOString(),
    });
  }
}));

/**
 * @swagger
 * /compliance/frameworks/{frameworkId}/controls/{controlId}:
 *   get:
 *     summary: Get a specific compliance control
 *     tags: [Compliance]
 *     parameters:
 *       - in: path
 *         name: frameworkId
 *         required: true
 *         schema:
 *           type: string
 *         description: Framework ID
 *       - in: path
 *         name: controlId
 *         required: true
 *         schema:
 *           type: string
 *         description: Control ID
 *     responses:
 *       200:
 *         description: Compliance control details
 *       404:
 *         description: Control not found
 */
router.get('/frameworks/:frameworkId/controls/:controlId', asyncHandler(async (req, res) => {
  const { frameworkId, controlId } = req.params;
  
  try {
    const control = await complianceService.getControl(frameworkId, controlId);
    
    if (!control) {
      return res.status(404).json({
        success: false,
        error: 'Control not found',
        timestamp: new Date().toISOString(),
      });
    }
    
    res.json({
      success: true,
      data: control,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Failed to get compliance control:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve compliance control',
      timestamp: new Date().toISOString(),
    });
  }
}));

/**
 * @swagger
 * /compliance/mappings:
 *   post:
 *     summary: Map a policy to a compliance control
 *     tags: [Compliance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - policyId
 *               - frameworkId
 *               - controlId
 *               - mappingType
 *               - confidence
 *             properties:
 *               policyId:
 *                 type: string
 *               frameworkId:
 *                 type: string
 *               controlId:
 *                 type: string
 *               mappingType:
 *                 type: string
 *                 enum: [direct, indirect, partial]
 *               confidence:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *               evidence:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Policy mapping created successfully
 *       400:
 *         description: Invalid request
 */
router.post('/mappings', asyncHandler(async (req, res) => {
  const { policyId, frameworkId, controlId, mappingType, confidence, evidence = [] } = req.body;
  
  // Validate required fields
  if (!policyId || !frameworkId || !controlId || !mappingType || confidence === undefined) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: policyId, frameworkId, controlId, mappingType, confidence',
      timestamp: new Date().toISOString(),
    });
  }
  
  // Validate mapping type
  if (!Object.values(MappingType).includes(mappingType)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid mapping type. Must be one of: direct, indirect, partial',
      timestamp: new Date().toISOString(),
    });
  }
  
  // Validate confidence
  if (confidence < 0 || confidence > 1) {
    return res.status(400).json({
      success: false,
      error: 'Confidence must be between 0 and 1',
      timestamp: new Date().toISOString(),
    });
  }
  
  try {
    const mapping = await complianceService.mapPolicyToControl(
      policyId,
      frameworkId,
      controlId,
      mappingType,
      confidence,
      evidence
    );
    
    res.json({
      success: true,
      data: mapping,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Failed to create policy mapping:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to create policy mapping',
      timestamp: new Date().toISOString(),
    });
  }
}));

/**
 * @swagger
 * /compliance/reports:
 *   post:
 *     summary: Generate a compliance report
 *     tags: [Compliance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organizationId
 *               - frameworkId
 *             properties:
 *               organizationId:
 *                 type: string
 *               frameworkId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Compliance report generated successfully
 *       400:
 *         description: Invalid request
 */
router.post('/reports', asyncHandler(async (req, res) => {
  const { organizationId, frameworkId } = req.body;
  
  if (!organizationId || !frameworkId) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: organizationId, frameworkId',
      timestamp: new Date().toISOString(),
    });
  }
  
  try {
    const report = await complianceService.generateComplianceReport(organizationId, frameworkId);
    
    res.json({
      success: true,
      data: report,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Failed to generate compliance report:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate compliance report',
      timestamp: new Date().toISOString(),
    });
  }
}));

/**
 * @swagger
 * /compliance/reports:
 *   get:
 *     summary: Get compliance reports
 *     tags: [Compliance]
 *     parameters:
 *       - in: query
 *         name: organizationId
 *         schema:
 *           type: string
 *         description: Organization ID
 *       - in: query
 *         name: frameworkId
 *         schema:
 *           type: string
 *         description: Framework ID
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
 *     responses:
 *       200:
 *         description: List of compliance reports
 */
router.get('/reports', asyncHandler(async (req, res) => {
  const { organizationId, frameworkId, page = 1, limit = 20 } = req.query;
  
  try {
    // This would typically query the database for actual reports
    // For now, return a mock response
    const reports = [];
    
    res.json({
      success: true,
      data: reports,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: 0,
        totalPages: 0,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Failed to get compliance reports:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve compliance reports',
      timestamp: new Date().toISOString(),
    });
  }
}));

/**
 * @swagger
 * /compliance/score:
 *   get:
 *     summary: Get compliance score for an organization
 *     tags: [Compliance]
 *     parameters:
 *       - in: query
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *       - in: query
 *         name: frameworkId
 *         required: true
 *         schema:
 *           type: string
 *         description: Framework ID
 *     responses:
 *       200:
 *         description: Compliance score
 */
router.get('/score', asyncHandler(async (req, res) => {
  const { organizationId, frameworkId } = req.query;
  
  if (!organizationId || !frameworkId) {
    return res.status(400).json({
      success: false,
      error: 'Missing required parameters: organizationId, frameworkId',
      timestamp: new Date().toISOString(),
    });
  }
  
  try {
    const score = await complianceService.getComplianceScore(
      organizationId as string,
      frameworkId as string
    );
    
    res.json({
      success: true,
      data: { score },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Failed to get compliance score:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve compliance score',
      timestamp: new Date().toISOString(),
    });
  }
}));

/**
 * @swagger
 * /compliance/trends:
 *   get:
 *     summary: Get compliance trends over time
 *     tags: [Compliance]
 *     parameters:
 *       - in: query
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *       - in: query
 *         name: frameworkId
 *         required: true
 *         schema:
 *           type: string
 *         description: Framework ID
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Number of months to include
 *     responses:
 *       200:
 *         description: Compliance trends data
 */
router.get('/trends', asyncHandler(async (req, res) => {
  const { organizationId, frameworkId, months = 12 } = req.query;
  
  if (!organizationId || !frameworkId) {
    return res.status(400).json({
      success: false,
      error: 'Missing required parameters: organizationId, frameworkId',
      timestamp: new Date().toISOString(),
    });
  }
  
  try {
    const trends = await complianceService.getComplianceTrends(
      organizationId as string,
      frameworkId as string,
      parseInt(months as string)
    );
    
    res.json({
      success: true,
      data: trends,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Failed to get compliance trends:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve compliance trends',
      timestamp: new Date().toISOString(),
    });
  }
}));

export default router;

