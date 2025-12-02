/**
 * Rate limiting middleware for MCP server
 */

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  totalRequests: number;
}

interface RequestInfo {
  ip?: string;
  userAgent?: string;
  timestamp: number;
}

class RateLimiter {
  private requests: Map<string, RequestInfo[]> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      windowMs: config.windowMs || 15 * 60 * 1000, // 15 minutes
      maxRequests: config.maxRequests || 100,
      skipSuccessfulRequests: config.skipSuccessfulRequests || false,
      skipFailedRequests: config.skipFailedRequests || false,
    };

    // Clean up old requests every minute
    setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
  }

  /**
   * Check if request is within rate limit
   */
  async checkLimit(request: any): Promise<RateLimitResult> {
    const key = this.generateKey(request);
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Get existing requests for this key
    let userRequests = this.requests.get(key) || [];

    // Remove requests outside the window
    userRequests = userRequests.filter(req => req.timestamp > windowStart);

    // Check if limit exceeded
    const allowed = userRequests.length < this.config.maxRequests;

    if (allowed) {
      // Add current request
      userRequests.push({
        ip: request.ip,
        userAgent: request.userAgent,
        timestamp: now,
      });
      this.requests.set(key, userRequests);
    }

    return {
      allowed,
      remaining: Math.max(0, this.config.maxRequests - userRequests.length),
      resetTime: Math.ceil((windowStart + this.config.windowMs - now) / 1000),
      totalRequests: userRequests.length,
    };
  }

  /**
   * Generate unique key for rate limiting
   */
  private generateKey(request: any): string {
    // Use IP address as primary identifier
    if (request.ip) {
      return `ip:${request.ip}`;
    }

    // Fallback to user agent
    if (request.userAgent) {
      return `ua:${request.userAgent}`;
    }

    // Default key for anonymous requests
    return 'anonymous';
  }

  /**
   * Clean up old requests
   */
  private cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    for (const [key, requests] of this.requests.entries()) {
      const validRequests = requests.filter(req => req.timestamp > windowStart);
      
      if (validRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validRequests);
      }
    }
  }

  /**
   * Get current statistics
   */
  getStats(): any {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    let totalActiveRequests = 0;
    let activeUsers = 0;

    for (const [key, requests] of this.requests.entries()) {
      const validRequests = requests.filter(req => req.timestamp > windowStart);
      if (validRequests.length > 0) {
        totalActiveRequests += validRequests.length;
        activeUsers++;
      }
    }

    return {
      activeUsers,
      totalActiveRequests,
      windowMs: this.config.windowMs,
      maxRequests: this.config.maxRequests,
      averageRequestsPerUser: activeUsers > 0 ? Math.round(totalActiveRequests / activeUsers) : 0,
    };
  }

  /**
   * Reset rate limit for a specific key
   */
  reset(request: any): void {
    const key = this.generateKey(request);
    this.requests.delete(key);
  }

  /**
   * Reset all rate limits
   */
  resetAll(): void {
    this.requests.clear();
  }
}

// Create default rate limiter instance
export const rateLimiter = new RateLimiter({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
});

export { RateLimiter, RateLimitConfig, RateLimitResult };
