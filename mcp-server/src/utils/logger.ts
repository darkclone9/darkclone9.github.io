import winston from 'winston';
import path from 'path';

/**
 * Logger configuration for the MCP server
 */

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to winston
winston.addColors(logColors);

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}` +
    (info.splat !== undefined ? `${info.splat}` : " ") +
    (info.stack !== undefined ? `${info.stack}` : " ")
  ),
);

// Define log transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: logFormat,
  }),
];

// Add file transport in production
if (process.env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    })
  );
}

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels: logLevels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports,
  exitOnError: false,
});

// Create a stream object for Morgan HTTP logging
export const loggerStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Helper functions for structured logging
export const loggerHelpers = {
  /**
   * Log tool execution
   */
  logToolExecution: (toolName: string, args: any, duration?: number) => {
    logger.info('Tool executed', {
      tool: toolName,
      args,
      duration: duration ? `${duration}ms` : undefined,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log tool error
   */
  logToolError: (toolName: string, error: Error, args?: any) => {
    logger.error('Tool execution failed', {
      tool: toolName,
      error: error.message,
      stack: error.stack,
      args,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log API request
   */
  logApiRequest: (method: string, path: string, ip?: string, userAgent?: string) => {
    logger.http('API request', {
      method,
      path,
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log performance metrics
   */
  logPerformance: (operation: string, duration: number, metadata?: any) => {
    logger.info('Performance metric', {
      operation,
      duration: `${duration}ms`,
      metadata,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log security event
   */
  logSecurity: (event: string, details: any, severity: 'low' | 'medium' | 'high' = 'medium') => {
    logger.warn('Security event', {
      event,
      severity,
      details,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log analytics event
   */
  logAnalytics: (event: string, data: any) => {
    logger.info('Analytics event', {
      event,
      data,
      timestamp: new Date().toISOString(),
    });
  },
};

// Export default logger
export default logger;
