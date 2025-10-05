import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { metrics, queries } from '../database/influxdb';
import { auditLog, policyEvaluationLog, policyViolationLog, systemLog } from '../database/elasticsearch';
import { logger } from '../utils/logger';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * @swagger
 * /monitoring/metrics:
 *   get:
 *     summary: Get system metrics
 *     tags: [Monitoring]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           default: 1h
 *         description: Time range for metrics (e.g., 1h, 24h, 7d)
 *     responses:
 *       200:
 *         description: System metrics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/metrics', authorize('monitoring', 'read'), asyncHandler(async (req, res) => {
  const { timeRange = '1h' } = req.query;
  const organizationId = req.user!.organizationId;

  try {
    const [
      policyStats,
      complianceTrends,
      systemHealth,
      apiMetrics,
    ] = await Promise.all([
      queries.getPolicyEvaluationStats(organizationId, timeRange as string),
      queries.getComplianceTrends(organizationId, 'soc2-type-ii', timeRange as string),
      queries.getSystemHealth(undefined, timeRange as string),
      queries.getAPIMetrics(undefined, timeRange as string),
    ]);

    const metricsData = {
      policyEvaluations: policyStats,
      complianceTrends,
      systemHealth,
      apiMetrics,
      timestamp: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: metricsData,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Failed to get metrics:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve metrics',
      timestamp: new Date().toISOString(),
    });
  }
}));

/**
 * @swagger
 * /monitoring/alerts:
 *   get:
 *     summary: Get system alerts
 *     tags: [Monitoring]
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
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         description: Filter by severity
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, acknowledged, resolved, suppressed]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Alerts retrieved successfully
 */
router.get('/alerts', authorize('monitoring', 'read'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, severity, status } = req.query;
  const organizationId = req.user!.organizationId;

  try {
    const query: any = {
      bool: {
        must: [
          {
            term: {
              organizationId,
            },
          },
        ],
      },
    };

    if (severity) {
      query.bool.must.push({
        term: {
          severity,
        },
      });
    }

    if (status) {
      query.bool.must.push({
        term: {
          status,
        },
      });
    }

    const from = (parseInt(page as string) - 1) * parseInt(limit as string);

    const alerts = await policyViolationLog.search(query, parseInt(limit as string), from);

    res.json({
      success: true,
      data: alerts.hits.hits.map((hit: any) => hit._source),
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: alerts.hits.total.value,
        totalPages: Math.ceil(alerts.hits.total.value / parseInt(limit as string)),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Failed to get alerts:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve alerts',
      timestamp: new Date().toISOString(),
    });
  }
}));

/**
 * @swagger
 * /monitoring/audit-logs:
 *   get:
 *     summary: Get audit logs
 *     tags: [Monitoring]
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
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: startTime
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start time for filtering
 *       - in: query
 *         name: endTime
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End time for filtering
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 */
router.get('/audit-logs', authorize('monitoring', 'read'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, action, userId, startTime, endTime } = req.query;
  const organizationId = req.user!.organizationId;

  try {
    const query: any = {
      bool: {
        must: [
          {
            term: {
              organizationId,
            },
          },
        ],
      },
    };

    if (action) {
      query.bool.must.push({
        term: {
          action,
        },
      });
    }

    if (userId) {
      query.bool.must.push({
        term: {
          userId,
        },
      });
    }

    if (startTime || endTime) {
      const rangeQuery: any = {
        range: {
          timestamp: {},
        },
      };

      if (startTime) {
        rangeQuery.range.timestamp.gte = startTime;
      }

      if (endTime) {
        rangeQuery.range.timestamp.lte = endTime;
      }

      query.bool.must.push(rangeQuery);
    }

    const from = (parseInt(page as string) - 1) * parseInt(limit as string);

    const logs = await auditLog.search(query, parseInt(limit as string), from);

    res.json({
      success: true,
      data: logs.hits.hits.map((hit: any) => hit._source),
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: logs.hits.total.value,
        totalPages: Math.ceil(logs.hits.total.value / parseInt(limit as string)),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Failed to get audit logs:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve audit logs',
      timestamp: new Date().toISOString(),
    });
  }
}));

/**
 * @swagger
 * /monitoring/policy-evaluations:
 *   get:
 *     summary: Get policy evaluation logs
 *     tags: [Monitoring]
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
 *         name: policyId
 *         schema:
 *           type: string
 *         description: Filter by policy ID
 *       - in: query
 *         name: result
 *         schema:
 *           type: string
 *           enum: [allow, deny, warn]
 *         description: Filter by result
 *     responses:
 *       200:
 *         description: Policy evaluation logs retrieved successfully
 */
router.get('/policy-evaluations', authorize('monitoring', 'read'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, policyId, result } = req.query;
  const organizationId = req.user!.organizationId;

  try {
    const query: any = {
      bool: {
        must: [
          {
            term: {
              organizationId,
            },
          },
        ],
      },
    };

    if (policyId) {
      query.bool.must.push({
        term: {
          policyId,
        },
      });
    }

    if (result) {
      query.bool.must.push({
        term: {
          result,
        },
      });
    }

    const from = (parseInt(page as string) - 1) * parseInt(limit as string);

    const evaluations = await policyEvaluationLog.search(query, parseInt(limit as string), from);

    res.json({
      success: true,
      data: evaluations.hits.hits.map((hit: any) => hit._source),
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: evaluations.hits.total.value,
        totalPages: Math.ceil(evaluations.hits.total.value / parseInt(limit as string)),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Failed to get policy evaluations:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve policy evaluations',
      timestamp: new Date().toISOString(),
    });
  }
}));

/**
 * @swagger
 * /monitoring/system-logs:
 *   get:
 *     summary: Get system logs
 *     tags: [Monitoring]
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
 *         name: level
 *         schema:
 *           type: string
 *           enum: [debug, info, warn, error]
 *         description: Filter by log level
 *       - in: query
 *         name: service
 *         schema:
 *           type: string
 *         description: Filter by service
 *     responses:
 *       200:
 *         description: System logs retrieved successfully
 */
router.get('/system-logs', authorize('monitoring', 'read'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, level, service } = req.query;
  const organizationId = req.user!.organizationId;

  try {
    const query: any = {
      bool: {
        must: [
          {
            term: {
              organizationId,
            },
          },
        ],
      },
    };

    if (level) {
      query.bool.must.push({
        term: {
          level,
        },
      });
    }

    if (service) {
      query.bool.must.push({
        term: {
          service,
        },
      });
    }

    const from = (parseInt(page as string) - 1) * parseInt(limit as string);

    const logs = await systemLog.search(query, parseInt(limit as string), from);

    res.json({
      success: true,
      data: logs.hits.hits.map((hit: any) => hit._source),
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: logs.hits.total.value,
        totalPages: Math.ceil(logs.hits.total.value / parseInt(limit as string)),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Failed to get system logs:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve system logs',
      timestamp: new Date().toISOString(),
    });
  }
}));

/**
 * @swagger
 * /monitoring/health:
 *   get:
 *     summary: Get system health status
 *     tags: [Monitoring]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System health status retrieved successfully
 */
router.get('/health', authorize('monitoring', 'read'), asyncHandler(async (req, res) => {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        api: 'healthy',
        database: 'healthy',
        redis: 'healthy',
        influxdb: 'healthy',
        elasticsearch: 'healthy',
        opa: 'healthy',
        ai: 'healthy',
      },
      metrics: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
      },
    };

    res.json({
      success: true,
      data: healthStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Failed to get health status:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve health status',
      timestamp: new Date().toISOString(),
    });
  }
}));

export default router;



