/**
 * Error handling utilities for MCP server
 */

export interface ErrorDetails {
  message: string;
  code: string;
  statusCode: number;
  timestamp: string;
  context?: any;
}

export class PortfolioError extends Error {
  public code: string;
  public statusCode: number;
  public context?: any;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', statusCode: number = 500, context?: any) {
    super(message);
    this.name = 'PortfolioError';
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;
  }
}

export class ValidationError extends PortfolioError {
  constructor(message: string, context?: any) {
    super(message, 'VALIDATION_ERROR', 400, context);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends PortfolioError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} not found with ID: ${id}` : `${resource} not found`;
    super(message, 'NOT_FOUND', 404, { resource, id });
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends PortfolioError {
  constructor(resetTime: number) {
    super(`Rate limit exceeded. Try again in ${resetTime} seconds.`, 'RATE_LIMIT_EXCEEDED', 429, { resetTime });
    this.name = 'RateLimitError';
  }
}

export class AuthenticationError extends PortfolioError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends PortfolioError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

export class ExportError extends PortfolioError {
  constructor(format: string, reason?: string) {
    const message = reason ? `Export failed for ${format}: ${reason}` : `Export failed for ${format}`;
    super(message, 'EXPORT_ERROR', 500, { format, reason });
    this.name = 'ExportError';
  }
}

class ErrorHandler {
  /**
   * Handle and format errors for API responses
   */
  handleError(error: Error, context?: any): ErrorDetails {
    const timestamp = new Date().toISOString();

    if (error instanceof PortfolioError) {
      return {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        timestamp,
        context: { ...error.context, ...context }
      };
    }

    // Handle common Node.js errors
    if (error.name === 'TypeError') {
      return {
        message: 'Invalid input type',
        code: 'TYPE_ERROR',
        statusCode: 400,
        timestamp,
        context
      };
    }

    if (error.name === 'SyntaxError') {
      return {
        message: 'Invalid syntax in request',
        code: 'SYNTAX_ERROR',
        statusCode: 400,
        timestamp,
        context
      };
    }

    if (error.name === 'ReferenceError') {
      return {
        message: 'Reference error in processing',
        code: 'REFERENCE_ERROR',
        statusCode: 500,
        timestamp,
        context
      };
    }

    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      return {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        timestamp,
        context: { ...context, validationErrors: (error as any).errors }
      };
    }

    // Default error handling
    return {
      message: error.message || 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
      statusCode: 500,
      timestamp,
      context
    };
  }

  /**
   * Create standardized error response
   */
  createErrorResponse(error: Error, context?: any): any {
    const errorDetails = this.handleError(error, context);
    
    return {
      success: false,
      error: errorDetails.message,
      code: errorDetails.code,
      timestamp: errorDetails.timestamp,
      context: process.env.NODE_ENV === 'development' ? errorDetails.context : undefined
    };
  }

  /**
   * Log error with appropriate level
   */
  logError(error: Error, context?: any): void {
    const errorDetails = this.handleError(error, context);
    
    // Import logger here to avoid circular dependencies
    const { logger } = require('./logger');
    
    if (errorDetails.statusCode >= 500) {
      logger.error('Server error:', {
        message: errorDetails.message,
        code: errorDetails.code,
        stack: error.stack,
        context: errorDetails.context
      });
    } else if (errorDetails.statusCode >= 400) {
      logger.warn('Client error:', {
        message: errorDetails.message,
        code: errorDetails.code,
        context: errorDetails.context
      });
    } else {
      logger.info('Error handled:', {
        message: errorDetails.message,
        code: errorDetails.code,
        context: errorDetails.context
      });
    }
  }

  /**
   * Wrap async functions with error handling
   */
  wrapAsync<T extends any[], R>(fn: (...args: T) => Promise<R>) {
    return async (...args: T): Promise<R> => {
      try {
        return await fn(...args);
      } catch (error) {
        this.logError(error as Error, { function: fn.name, args });
        throw error;
      }
    };
  }

  /**
   * Create error from HTTP response
   */
  fromHttpResponse(status: number, message: string, context?: any): PortfolioError {
    let code: string;
    
    switch (status) {
      case 400:
        code = 'BAD_REQUEST';
        break;
      case 401:
        code = 'UNAUTHORIZED';
        break;
      case 403:
        code = 'FORBIDDEN';
        break;
      case 404:
        code = 'NOT_FOUND';
        break;
      case 429:
        code = 'RATE_LIMIT_EXCEEDED';
        break;
      case 500:
        code = 'INTERNAL_SERVER_ERROR';
        break;
      default:
        code = 'HTTP_ERROR';
    }
    
    return new PortfolioError(message, code, status, context);
  }

  /**
   * Validate and throw if invalid
   */
  validateOrThrow(condition: boolean, message: string, context?: any): void {
    if (!condition) {
      throw new ValidationError(message, context);
    }
  }

  /**
   * Assert resource exists or throw NotFoundError
   */
  assertExists<T>(resource: T | null | undefined, resourceName: string, id?: string): T {
    if (resource === null || resource === undefined) {
      throw new NotFoundError(resourceName, id);
    }
    return resource;
  }

  /**
   * Safe JSON parse with error handling
   */
  safeJsonParse<T>(json: string, defaultValue: T): T {
    try {
      return JSON.parse(json);
    } catch (error) {
      this.logError(new Error(`JSON parse failed: ${error}`), { json });
      return defaultValue;
    }
  }

  /**
   * Safe async operation with timeout
   */
  async withTimeout<T>(
    operation: Promise<T>,
    timeoutMs: number = 30000,
    timeoutMessage: string = 'Operation timed out'
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new PortfolioError(timeoutMessage, 'TIMEOUT_ERROR', 408));
      }, timeoutMs);
    });

    return Promise.race([operation, timeoutPromise]);
  }
}

// Create singleton instance
export const errorHandler = new ErrorHandler();

// Export error classes and handler
export {
  ErrorHandler,
  PortfolioError as default
};
