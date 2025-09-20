import { InfluxDB, Point } from 'influx';
import { logger } from '../utils/logger';

let influxDB: InfluxDB;

export const connectInfluxDB = async (): Promise<void> => {
  try {
    const influxUrl = process.env.INFLUXDB_URL || 'http://localhost:8086';
    const token = process.env.INFLUXDB_TOKEN || 'niyama_admin_token';
    const org = process.env.INFLUXDB_ORG || 'niyama';
    const bucket = process.env.INFLUXDB_BUCKET || 'niyama_metrics';

    influxDB = new InfluxDB({
      url: influxUrl,
      token: token,
    });

    // Test connection
    await influxDB.ping(5000);

    logger.info('✅ InfluxDB connection established successfully');
  } catch (error) {
    logger.error('❌ Failed to connect to InfluxDB:', error);
    throw error;
  }
};

export const getInfluxDB = (): InfluxDB => {
  if (!influxDB) {
    throw new Error('InfluxDB not initialized. Call connectInfluxDB() first.');
  }
  return influxDB;
};

// Metrics collection
export const metrics = {
  async recordPolicyEvaluation(
    policyId: string,
    result: 'allow' | 'deny' | 'warn',
    duration: number,
    organizationId: string
  ): Promise<void> {
    try {
      const point = new Point('policy_evaluations')
        .tag('policy_id', policyId)
        .tag('result', result)
        .tag('organization_id', organizationId)
        .floatField('duration_ms', duration)
        .timestamp(new Date());

      await influxDB.writePoint(point);
    } catch (error) {
      logger.error('Failed to record policy evaluation metric:', error);
    }
  },

  async recordPolicyViolation(
    policyId: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    organizationId: string
  ): Promise<void> {
    try {
      const point = new Point('policy_violations')
        .tag('policy_id', policyId)
        .tag('severity', severity)
        .tag('organization_id', organizationId)
        .intField('count', 1)
        .timestamp(new Date());

      await influxDB.writePoint(point);
    } catch (error) {
      logger.error('Failed to record policy violation metric:', error);
    }
  },

  async recordComplianceScore(
    frameworkId: string,
    score: number,
    organizationId: string
  ): Promise<void> {
    try {
      const point = new Point('compliance_scores')
        .tag('framework_id', frameworkId)
        .tag('organization_id', organizationId)
        .floatField('score', score)
        .timestamp(new Date());

      await influxDB.writePoint(point);
    } catch (error) {
      logger.error('Failed to record compliance score metric:', error);
    }
  },

  async recordSystemHealth(
    component: string,
    status: 'healthy' | 'degraded' | 'unhealthy',
    responseTime?: number,
    errorRate?: number
  ): Promise<void> {
    try {
      const point = new Point('system_health')
        .tag('component', component)
        .tag('status', status)
        .timestamp(new Date());

      if (responseTime !== undefined) {
        point.floatField('response_time_ms', responseTime);
      }

      if (errorRate !== undefined) {
        point.floatField('error_rate', errorRate);
      }

      await influxDB.writePoint(point);
    } catch (error) {
      logger.error('Failed to record system health metric:', error);
    }
  },

  async recordAPIMetrics(
    endpoint: string,
    method: string,
    statusCode: number,
    duration: number,
    organizationId?: string
  ): Promise<void> {
    try {
      const point = new Point('api_requests')
        .tag('endpoint', endpoint)
        .tag('method', method)
        .tag('status_code', statusCode.toString())
        .floatField('duration_ms', duration)
        .timestamp(new Date());

      if (organizationId) {
        point.tag('organization_id', organizationId);
      }

      await influxDB.writePoint(point);
    } catch (error) {
      logger.error('Failed to record API metrics:', error);
    }
  },

  async recordAIMetrics(
    operation: string,
    duration: number,
    success: boolean,
    organizationId?: string
  ): Promise<void> {
    try {
      const point = new Point('ai_operations')
        .tag('operation', operation)
        .tag('success', success.toString())
        .floatField('duration_ms', duration)
        .timestamp(new Date());

      if (organizationId) {
        point.tag('organization_id', organizationId);
      }

      await influxDB.writePoint(point);
    } catch (error) {
      logger.error('Failed to record AI metrics:', error);
    }
  },

  async recordUserActivity(
    userId: string,
    action: string,
    organizationId: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const point = new Point('user_activity')
        .tag('user_id', userId)
        .tag('action', action)
        .tag('organization_id', organizationId)
        .timestamp(new Date());

      if (metadata) {
        Object.entries(metadata).forEach(([key, value]) => {
          if (typeof value === 'string') {
            point.tag(`meta_${key}`, value);
          } else if (typeof value === 'number') {
            point.floatField(`meta_${key}`, value);
          } else if (typeof value === 'boolean') {
            point.booleanField(`meta_${key}`, value);
          }
        });
      }

      await influxDB.writePoint(point);
    } catch (error) {
      logger.error('Failed to record user activity metric:', error);
    }
  },
};

// Query helpers
export const queries = {
  async getPolicyEvaluationStats(
    organizationId: string,
    timeRange: string = '1h'
  ): Promise<any> {
    try {
      const query = `
        from(bucket: "niyama_metrics")
          |> range(start: -${timeRange})
          |> filter(fn: (r) => r._measurement == "policy_evaluations")
          |> filter(fn: (r) => r.organization_id == "${organizationId}")
          |> group(columns: ["result"])
          |> count()
      `;

      const result = await influxDB.query(query);
      return result;
    } catch (error) {
      logger.error('Failed to query policy evaluation stats:', error);
      return [];
    }
  },

  async getComplianceTrends(
    organizationId: string,
    frameworkId: string,
    timeRange: string = '30d'
  ): Promise<any> {
    try {
      const query = `
        from(bucket: "niyama_metrics")
          |> range(start: -${timeRange})
          |> filter(fn: (r) => r._measurement == "compliance_scores")
          |> filter(fn: (r) => r.organization_id == "${organizationId}")
          |> filter(fn: (r) => r.framework_id == "${frameworkId}")
          |> group(columns: ["_time"])
          |> mean(column: "_value")
      `;

      const result = await influxDB.query(query);
      return result;
    } catch (error) {
      logger.error('Failed to query compliance trends:', error);
      return [];
    }
  },

  async getSystemHealth(
    component?: string,
    timeRange: string = '1h'
  ): Promise<any> {
    try {
      let query = `
        from(bucket: "niyama_metrics")
          |> range(start: -${timeRange})
          |> filter(fn: (r) => r._measurement == "system_health")
      `;

      if (component) {
        query += `|> filter(fn: (r) => r.component == "${component}")`;
      }

      query += `
        |> group(columns: ["component"])
        |> last()
      `;

      const result = await influxDB.query(query);
      return result;
    } catch (error) {
      logger.error('Failed to query system health:', error);
      return [];
    }
  },

  async getAPIMetrics(
    endpoint?: string,
    timeRange: string = '1h'
  ): Promise<any> {
    try {
      let query = `
        from(bucket: "niyama_metrics")
          |> range(start: -${timeRange})
          |> filter(fn: (r) => r._measurement == "api_requests")
      `;

      if (endpoint) {
        query += `|> filter(fn: (r) => r.endpoint == "${endpoint}")`;
      }

      query += `
        |> group(columns: ["endpoint", "method", "status_code"])
        |> count()
      `;

      const result = await influxDB.query(query);
      return result;
    } catch (error) {
      logger.error('Failed to query API metrics:', error);
      return [];
    }
  },
};

// Health check
export const checkInfluxDBHealth = async (): Promise<boolean> => {
  try {
    await influxDB.ping(5000);
    return true;
  } catch (error) {
    logger.error('InfluxDB health check failed:', error);
    return false;
  }
};

export const closeInfluxDB = async (): Promise<void> => {
  if (influxDB) {
    await influxDB.close();
    logger.info('InfluxDB connection closed');
  }
};

