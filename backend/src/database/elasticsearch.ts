import { Client } from '@elastic/elasticsearch';
import { logger } from '../utils/logger';

let elasticsearchClient: Client;

export const connectElasticsearch = async (): Promise<void> => {
  try {
    const esUrl = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';
    const username = process.env.ELASTICSEARCH_USERNAME || 'elastic';
    const password = process.env.ELASTICSEARCH_PASSWORD || 'password';

    elasticsearchClient = new Client({
      node: esUrl,
      auth: {
        username,
        password,
      },
      requestTimeout: 30000,
      maxRetries: 3,
      resurrectStrategy: 'ping',
    });

    // Test connection
    await elasticsearchClient.ping();

    // Create indices if they don't exist
    await createIndices();

    logger.info('✅ Elasticsearch connection established successfully');
  } catch (error) {
    logger.error('❌ Failed to connect to Elasticsearch:', error);
    throw error;
  }
};

export const getElasticsearchClient = (): Client => {
  if (!elasticsearchClient) {
    throw new Error('Elasticsearch client not initialized. Call connectElasticsearch() first.');
  }
  return elasticsearchClient;
};

// Create indices with proper mappings
async function createIndices(): Promise<void> {
  const indices = [
    {
      name: 'audit-logs',
      mapping: {
        properties: {
          timestamp: { type: 'date' },
          userId: { type: 'keyword' },
          action: { type: 'keyword' },
          resourceType: { type: 'keyword' },
          resourceId: { type: 'keyword' },
          organizationId: { type: 'keyword' },
          ipAddress: { type: 'ip' },
          userAgent: { type: 'text' },
          details: { type: 'object' },
          severity: { type: 'keyword' },
        },
      },
    },
    {
      name: 'policy-evaluations',
      mapping: {
        properties: {
          timestamp: { type: 'date' },
          policyId: { type: 'keyword' },
          resourceId: { type: 'keyword' },
          resourceType: { type: 'keyword' },
          result: { type: 'keyword' },
          organizationId: { type: 'keyword' },
          duration: { type: 'float' },
          violations: { type: 'object' },
          metadata: { type: 'object' },
        },
      },
    },
    {
      name: 'policy-violations',
      mapping: {
        properties: {
          timestamp: { type: 'date' },
          policyId: { type: 'keyword' },
          resourceId: { type: 'keyword' },
          message: { type: 'text' },
          severity: { type: 'keyword' },
          status: { type: 'keyword' },
          organizationId: { type: 'keyword' },
          detectedAt: { type: 'date' },
          resolvedAt: { type: 'date' },
        },
      },
    },
    {
      name: 'system-logs',
      mapping: {
        properties: {
          timestamp: { type: 'date' },
          level: { type: 'keyword' },
          message: { type: 'text' },
          service: { type: 'keyword' },
          component: { type: 'keyword' },
          organizationId: { type: 'keyword' },
          metadata: { type: 'object' },
        },
      },
    },
  ];

  for (const index of indices) {
    try {
      const exists = await elasticsearchClient.indices.exists({ index: index.name });
      
      if (!exists) {
        await elasticsearchClient.indices.create({
          index: index.name,
          body: {
            mappings: index.mapping,
            settings: {
              number_of_shards: 1,
              number_of_replicas: 0,
              refresh_interval: '5s',
            },
          },
        });
        
        logger.info(`Created Elasticsearch index: ${index.name}`);
      }
    } catch (error) {
      logger.error(`Failed to create index ${index.name}:`, error);
    }
  }
}

// Audit logging
export const auditLog = {
  async log(
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    organizationId: string,
    details: Record<string, any> = {},
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const document = {
        timestamp: new Date().toISOString(),
        userId,
        action,
        resourceType,
        resourceId,
        organizationId,
        ipAddress,
        userAgent,
        details,
        severity: this.getSeverity(action),
      };

      await elasticsearchClient.index({
        index: 'audit-logs',
        body: document,
      });
    } catch (error) {
      logger.error('Failed to log audit event:', error);
    }
  },

  getSeverity(action: string): string {
    const criticalActions = ['delete', 'deactivate', 'suspend'];
    const warningActions = ['update', 'modify', 'change'];
    
    if (criticalActions.some(a => action.toLowerCase().includes(a))) {
      return 'critical';
    } else if (warningActions.some(a => action.toLowerCase().includes(a))) {
      return 'warning';
    } else {
      return 'info';
    }
  },

  async search(
    query: any,
    size: number = 100,
    from: number = 0
  ): Promise<any> {
    try {
      const response = await elasticsearchClient.search({
        index: 'audit-logs',
        body: {
          query,
          size,
          from,
          sort: [{ timestamp: { order: 'desc' } }],
        },
      });

      return response.body;
    } catch (error) {
      logger.error('Failed to search audit logs:', error);
      throw error;
    }
  },
};

// Policy evaluation logging
export const policyEvaluationLog = {
  async log(
    policyId: string,
    resourceId: string,
    resourceType: string,
    result: 'allow' | 'deny' | 'warn',
    organizationId: string,
    duration: number,
    violations: any[] = [],
    metadata: Record<string, any> = {}
  ): Promise<void> {
    try {
      const document = {
        timestamp: new Date().toISOString(),
        policyId,
        resourceId,
        resourceType,
        result,
        organizationId,
        duration,
        violations,
        metadata,
      };

      await elasticsearchClient.index({
        index: 'policy-evaluations',
        body: document,
      });
    } catch (error) {
      logger.error('Failed to log policy evaluation:', error);
    }
  },

  async search(
    query: any,
    size: number = 100,
    from: number = 0
  ): Promise<any> {
    try {
      const response = await elasticsearchClient.search({
        index: 'policy-evaluations',
        body: {
          query,
          size,
          from,
          sort: [{ timestamp: { order: 'desc' } }],
        },
      });

      return response.body;
    } catch (error) {
      logger.error('Failed to search policy evaluations:', error);
      throw error;
    }
  },
};

// Policy violation logging
export const policyViolationLog = {
  async log(
    policyId: string,
    resourceId: string,
    message: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    organizationId: string,
    status: 'open' | 'acknowledged' | 'resolved' | 'suppressed' = 'open'
  ): Promise<void> {
    try {
      const document = {
        timestamp: new Date().toISOString(),
        policyId,
        resourceId,
        message,
        severity,
        status,
        organizationId,
        detectedAt: new Date().toISOString(),
      };

      await elasticsearchClient.index({
        index: 'policy-violations',
        body: document,
      });
    } catch (error) {
      logger.error('Failed to log policy violation:', error);
    }
  },

  async search(
    query: any,
    size: number = 100,
    from: number = 0
  ): Promise<any> {
    try {
      const response = await elasticsearchClient.search({
        index: 'policy-violations',
        body: {
          query,
          size,
          from,
          sort: [{ timestamp: { order: 'desc' } }],
        },
      });

      return response.body;
    } catch (error) {
      logger.error('Failed to search policy violations:', error);
      throw error;
    }
  },
};

// System logging
export const systemLog = {
  async log(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    service: string,
    component: string,
    organizationId?: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    try {
      const document = {
        timestamp: new Date().toISOString(),
        level,
        message,
        service,
        component,
        organizationId,
        metadata,
      };

      await elasticsearchClient.index({
        index: 'system-logs',
        body: document,
      });
    } catch (error) {
      logger.error('Failed to log system event:', error);
    }
  },

  async search(
    query: any,
    size: number = 100,
    from: number = 0
  ): Promise<any> {
    try {
      const response = await elasticsearchClient.search({
        index: 'system-logs',
        body: {
          query,
          size,
          from,
          sort: [{ timestamp: { order: 'desc' } }],
        },
      });

      return response.body;
    } catch (error) {
      logger.error('Failed to search system logs:', error);
      throw error;
    }
  },
};

// Query helpers
export const searchHelpers = {
  async searchByTimeRange(
    index: string,
    startTime: Date,
    endTime: Date,
    additionalQuery: any = {},
    size: number = 100
  ): Promise<any> {
    try {
      const query = {
        bool: {
          must: [
            {
              range: {
                timestamp: {
                  gte: startTime.toISOString(),
                  lte: endTime.toISOString(),
                },
              },
            },
            additionalQuery,
          ],
        },
      };

      const response = await elasticsearchClient.search({
        index,
        body: {
          query,
          size,
          sort: [{ timestamp: { order: 'desc' } }],
        },
      });

      return response.body;
    } catch (error) {
      logger.error('Failed to search by time range:', error);
      throw error;
    }
  },

  async searchByOrganization(
    index: string,
    organizationId: string,
    additionalQuery: any = {},
    size: number = 100
  ): Promise<any> {
    try {
      const query = {
        bool: {
          must: [
            {
              term: {
                organizationId,
              },
            },
            additionalQuery,
          ],
        },
      };

      const response = await elasticsearchClient.search({
        index,
        body: {
          query,
          size,
          sort: [{ timestamp: { order: 'desc' } }],
        },
      });

      return response.body;
    } catch (error) {
      logger.error('Failed to search by organization:', error);
      throw error;
    }
  },

  async aggregateByField(
    index: string,
    field: string,
    additionalQuery: any = {},
    size: number = 100
  ): Promise<any> {
    try {
      const query = {
        bool: {
          must: [additionalQuery],
        },
      };

      const response = await elasticsearchClient.search({
        index,
        body: {
          query,
          aggs: {
            field_aggregation: {
              terms: {
                field,
                size,
              },
            },
          },
          size: 0,
        },
      });

      return response.body;
    } catch (error) {
      logger.error('Failed to aggregate by field:', error);
      throw error;
    }
  },
};

// Health check
export const checkElasticsearchHealth = async (): Promise<boolean> => {
  try {
    await elasticsearchClient.ping();
    return true;
  } catch (error) {
    logger.error('Elasticsearch health check failed:', error);
    return false;
  }
};

export const closeElasticsearch = async (): Promise<void> => {
  if (elasticsearchClient) {
    await elasticsearchClient.close();
    logger.info('Elasticsearch connection closed');
  }
};

