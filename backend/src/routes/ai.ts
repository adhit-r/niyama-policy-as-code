import express from 'express';
import { aiService } from '../services/aiService';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { 
  AIPolicyGenerationRequest, 
  AIPolicyOptimizationRequest,
  PolicyLanguage 
} from '../types';

const router = express.Router();

/**
 * @swagger
 * /ai/generate-policy:
 *   post:
 *     summary: Generate a policy using AI
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *               - category
 *               - language
 *             properties:
 *               description:
 *                 type: string
 *                 description: Natural language description of the policy
 *               category:
 *                 type: string
 *                 enum: [security, compliance, resource_management, data_governance, network, rbac, image_scanning]
 *               language:
 *                 type: string
 *                 enum: [rego, yaml, json]
 *               framework:
 *                 type: string
 *                 description: Compliance framework (optional)
 *               context:
 *                 type: object
 *                 description: Additional context for policy generation
 *     responses:
 *       200:
 *         description: Policy generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     policy:
 *                       type: string
 *                     explanation:
 *                       type: string
 *                     confidence:
 *                       type: number
 *                     suggestions:
 *                       type: array
 *                       items:
 *                         type: string
 *                     complianceMappings:
 *                       type: array
 *       400:
 *         description: Invalid request
 *       500:
 *         description: AI service error
 */
router.post('/generate-policy', asyncHandler(async (req, res) => {
  const { description, category, language, framework, context } = req.body;

  // Validate required fields
  if (!description || !category || !language) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: description, category, language',
      timestamp: new Date().toISOString(),
    });
  }

  // Validate language
  if (!Object.values(PolicyLanguage).includes(language)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid language. Must be one of: rego, yaml, json',
      timestamp: new Date().toISOString(),
    });
  }

  const request: AIPolicyGenerationRequest = {
    description,
    category,
    language,
    framework,
    context,
  };

  try {
    const result = await aiService.generatePolicy(request);
    
    logger.info('Policy generated successfully', {
      category,
      language,
      framework,
      confidence: result.confidence,
    });

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Policy generation failed:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate policy',
      timestamp: new Date().toISOString(),
    });
  }
}));

/**
 * @swagger
 * /ai/optimize-policy/{policyId}:
 *   post:
 *     summary: Optimize an existing policy using AI
 *     tags: [AI]
 *     parameters:
 *       - in: path
 *         name: policyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the policy to optimize
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - optimizationType
 *             properties:
 *               optimizationType:
 *                 type: string
 *                 enum: [performance, security, compliance, readability]
 *               context:
 *                 type: object
 *                 description: Additional context for optimization
 *     responses:
 *       200:
 *         description: Policy optimized successfully
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Policy not found
 *       500:
 *         description: AI service error
 */
router.post('/optimize-policy/:policyId', asyncHandler(async (req, res) => {
  const { policyId } = req.params;
  const { optimizationType, context } = req.body;

  if (!optimizationType) {
    return res.status(400).json({
      success: false,
      error: 'Missing required field: optimizationType',
      timestamp: new Date().toISOString(),
    });
  }

  // TODO: Fetch actual policy content from database
  const policyContent = `// Placeholder policy content for policy ID: ${policyId}`;

  const request: AIPolicyOptimizationRequest = {
    policyId,
    optimizationType,
    context,
  };

  try {
    const result = await aiService.optimizePolicy(request);
    
    logger.info('Policy optimized successfully', {
      policyId,
      optimizationType,
      confidence: result.confidence,
    });

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Policy optimization failed:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to optimize policy',
      timestamp: new Date().toISOString(),
    });
  }
}));

/**
 * @swagger
 * /ai/explain-policy:
 *   post:
 *     summary: Explain a policy using AI
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - policyContent
 *               - language
 *             properties:
 *               policyContent:
 *                 type: string
 *                 description: The policy code to explain
 *               language:
 *                 type: string
 *                 enum: [rego, yaml, json]
 *     responses:
 *       200:
 *         description: Policy explained successfully
 *       400:
 *         description: Invalid request
 *       500:
 *         description: AI service error
 */
router.post('/explain-policy', asyncHandler(async (req, res) => {
  const { policyContent, language } = req.body;

  if (!policyContent || !language) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: policyContent, language',
      timestamp: new Date().toISOString(),
    });
  }

  if (!Object.values(PolicyLanguage).includes(language)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid language. Must be one of: rego, yaml, json',
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const explanation = await aiService.explainPolicy(policyContent, language);
    
    logger.info('Policy explained successfully', {
      language,
      contentLength: policyContent.length,
    });

    res.json({
      success: true,
      data: { explanation },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Policy explanation failed:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to explain policy',
      timestamp: new Date().toISOString(),
    });
  }
}));

/**
 * @swagger
 * /ai/suggest-improvements:
 *   post:
 *     summary: Get improvement suggestions for a policy using AI
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - policyContent
 *               - language
 *             properties:
 *               policyContent:
 *                 type: string
 *                 description: The policy code to analyze
 *               language:
 *                 type: string
 *                 enum: [rego, yaml, json]
 *     responses:
 *       200:
 *         description: Improvement suggestions generated successfully
 *       400:
 *         description: Invalid request
 *       500:
 *         description: AI service error
 */
router.post('/suggest-improvements', asyncHandler(async (req, res) => {
  const { policyContent, language } = req.body;

  if (!policyContent || !language) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: policyContent, language',
      timestamp: new Date().toISOString(),
    });
  }

  if (!Object.values(PolicyLanguage).includes(language)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid language. Must be one of: rego, yaml, json',
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const suggestions = await aiService.suggestImprovements(policyContent, language);
    
    logger.info('Improvement suggestions generated successfully', {
      language,
      contentLength: policyContent.length,
      suggestionCount: suggestions.length,
    });

    res.json({
      success: true,
      data: { suggestions },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Improvement suggestions failed:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate improvement suggestions',
      timestamp: new Date().toISOString(),
    });
  }
}));

/**
 * @swagger
 * /ai/health:
 *   get:
 *     summary: Check AI service health
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: AI service health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     healthy:
 *                       type: boolean
 *                     service:
 *                       type: string
 *                     model:
 *                       type: string
 *       500:
 *         description: AI service unhealthy
 */
router.get('/health', asyncHandler(async (req, res) => {
  try {
    const isHealthy = await aiService.healthCheck();
    
    if (isHealthy) {
      res.json({
        success: true,
        data: {
          healthy: true,
          service: 'Google Gemini',
          model: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
        },
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'AI service is not healthy',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error: any) {
    logger.error('AI health check failed:', error);
    
    res.status(500).json({
      success: false,
      error: 'AI service health check failed',
      timestamp: new Date().toISOString(),
    });
  }
}));

export default router;

