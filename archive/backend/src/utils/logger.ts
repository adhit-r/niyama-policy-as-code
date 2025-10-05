import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta, null, 2)}`;
    }
    return log;
  })
);

// Create transports
const transports: winston.transport[] = [
  // Console transport
  new winston.transports.Console({
    format: consoleFormat,
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  }),
];

// Add file transports in production
if (process.env.NODE_ENV === 'production') {
  // Application logs
  transports.push(
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat,
      level: 'info',
    })
  );

  // Error logs
  transports.push(
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      format: logFormat,
      level: 'error',
    })
  );

  // Audit logs
  transports.push(
    new DailyRotateFile({
      filename: 'logs/audit-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '90d',
      format: logFormat,
      level: 'audit',
    })
  );
}

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports,
  exitOnError: false,
});

// Add custom audit level
winston.addColors({
  audit: 'cyan',
});

// Audit logger for compliance tracking
export const auditLogger = winston.createLogger({
  level: 'audit',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    ...(process.env.NODE_ENV === 'production' ? [
      new DailyRotateFile({
        filename: 'logs/audit-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '90d',
        format: logFormat,
      })
    ] : []),
  ],
});

// Helper functions for structured logging
export const logAudit = (action: string, userId: string, resourceId: string, details?: any) => {
  auditLogger.audit('AUDIT', {
    action,
    userId,
    resourceId,
    timestamp: new Date().toISOString(),
    details,
  });
};

export const logSecurity = (event: string, severity: 'low' | 'medium' | 'high' | 'critical', details?: any) => {
  logger.warn('SECURITY_EVENT', {
    event,
    severity,
    timestamp: new Date().toISOString(),
    details,
  });
};

export const logPerformance = (operation: string, duration: number, details?: any) => {
  logger.info('PERFORMANCE', {
    operation,
    duration,
    timestamp: new Date().toISOString(),
    details,
  });
};

export const logError = (error: Error, context?: any) => {
  logger.error('ERROR', {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    context,
  });
};

export default logger;

