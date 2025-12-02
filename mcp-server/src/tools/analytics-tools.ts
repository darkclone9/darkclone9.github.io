import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ApiResponse, AnalyticsEvent, AnalyticsStats } from '@/types/portfolio';
import { logger, loggerHelpers } from '@/utils/logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * Analytics tools for the MCP server
 */

// In-memory analytics storage (in production, use a proper database)
const analyticsEvents: AnalyticsEvent[] = [];
const analyticsStats: AnalyticsStats = {
  totalViews: 0,
  uniqueVisitors: 0,
  popularProjects: [],
  popularSkills: [],
  topReferrers: [],
  deviceTypes: {},
  countries: {},
  timeRange: {
    start: new Date(),
    end: new Date()
  }
};

// ===== TRACK EVENT =====
export const trackEvent: Tool = {
  name: 'track_event',
  description: 'Track analytics events for portfolio interactions',
  inputSchema: {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['view', 'click', 'download', 'contact', 'share'],
        description: 'Type of event to track'
      },
      resource: {
        type: 'string',
        description: 'Resource being tracked (e.g., "project", "skill", "page")'
      },
      resourceId: {
        type: 'string',
        description: 'ID of the specific resource'
      },
      userAgent: {
        type: 'string',
        description: 'User agent string'
      },
      ip: {
        type: 'string',
        description: 'IP address (will be anonymized)'
      },
      referrer: {
        type: 'string',
        description: 'Referrer URL'
      },
      metadata: {
        type: 'object',
        description: 'Additional event metadata',
        additionalProperties: true
      }
    },
    required: ['type', 'resource']
  },
  handler: async (args: any): Promise<ApiResponse> => {
    try {
      logger.info('Tracking analytics event', args);

      // Create analytics event
      const event: AnalyticsEvent = {
        id: uuidv4(),
        type: args.type,
        resource: args.resource,
        resourceId: args.resourceId,
        userAgent: args.userAgent,
        ip: args.ip ? anonymizeIP(args.ip) : undefined,
        referrer: args.referrer,
        timestamp: new Date(),
        metadata: args.metadata
      };

      // Store event
      analyticsEvents.push(event);

      // Update stats
      updateAnalyticsStats(event);

      // Log analytics event
      loggerHelpers.logAnalytics(event.type, {
        resource: event.resource,
        resourceId: event.resourceId,
        timestamp: event.timestamp
      });

      return {
        success: true,
        data: {
          eventId: event.id,
          tracked: true
        },
        message: 'Event tracked successfully',
        timestamp: new Date(),
        version: '1.0.0'
      };
    } catch (error) {
      logger.error('Error tracking event:', error);
      return {
        success: false,
        error: 'Failed to track event',
        timestamp: new Date(),
        version: '1.0.0'
      };
    }
  }
};

// ===== GET ANALYTICS STATS =====
export const getAnalyticsStats: Tool = {
  name: 'get_analytics_stats',
  description: 'Get analytics statistics and insights',
  inputSchema: {
    type: 'object',
    properties: {
      timeRange: {
        type: 'string',
        enum: ['day', 'week', 'month', 'year', 'all'],
        description: 'Time range for statistics',
        default: 'month'
      },
      includeEvents: {
        type: 'boolean',
        description: 'Whether to include recent events',
        default: false
      },
      eventType: {
        type: 'string',
        enum: ['view', 'click', 'download', 'contact', 'share'],
        description: 'Filter by event type'
      }
    }
  },
  handler: async (args: any): Promise<ApiResponse> => {
    try {
      logger.info('Getting analytics stats', args);

      const timeRange = args.timeRange || 'month';
      const now = new Date();
      let startDate: Date;

      // Calculate start date based on time range
      switch (timeRange) {
        case 'day':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0); // All time
      }

      // Filter events by time range and type
      let filteredEvents = analyticsEvents.filter(event => 
        event.timestamp >= startDate
      );

      if (args.eventType) {
        filteredEvents = filteredEvents.filter(event => event.type === args.eventType);
      }

      // Calculate statistics
      const stats = calculateStats(filteredEvents, startDate, now);

      const result: any = {
        stats,
        timeRange: {
          start: startDate,
          end: now,
          period: timeRange
        }
      };

      // Include recent events if requested
      if (args.includeEvents) {
        result.recentEvents = filteredEvents
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 20);
      }

      return {
        success: true,
        data: result,
        message: 'Analytics stats retrieved successfully',
        timestamp: new Date(),
        version: '1.0.0'
      };
    } catch (error) {
      logger.error('Error getting analytics stats:', error);
      return {
        success: false,
        error: 'Failed to retrieve analytics stats',
        timestamp: new Date(),
        version: '1.0.0'
      };
    }
  }
};

// ===== GET POPULAR CONTENT =====
export const getPopularContent: Tool = {
  name: 'get_popular_content',
  description: 'Get most popular projects and skills based on analytics',
  inputSchema: {
    type: 'object',
    properties: {
      contentType: {
        type: 'string',
        enum: ['projects', 'skills', 'pages'],
        description: 'Type of content to analyze',
        default: 'projects'
      },
      limit: {
        type: 'number',
        minimum: 1,
        maximum: 20,
        description: 'Number of items to return',
        default: 10
      },
      timeRange: {
        type: 'string',
        enum: ['day', 'week', 'month', 'year', 'all'],
        description: 'Time range for analysis',
        default: 'month'
      }
    }
  },
  handler: async (args: any): Promise<ApiResponse> => {
    try {
      logger.info('Getting popular content', args);

      const contentType = args.contentType || 'projects';
      const limit = args.limit || 10;
      const timeRange = args.timeRange || 'month';

      // Calculate time range
      const now = new Date();
      let startDate: Date;
      switch (timeRange) {
        case 'day':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }

      // Filter events by time range and content type
      const filteredEvents = analyticsEvents.filter(event => 
        event.timestamp >= startDate && 
        event.resource === contentType.slice(0, -1) // Remove 's' from plural
      );

      // Count interactions by resource ID
      const interactions: Record<string, number> = {};
      filteredEvents.forEach(event => {
        if (event.resourceId) {
          interactions[event.resourceId] = (interactions[event.resourceId] || 0) + 1;
        }
      });

      // Sort by interaction count
      const popularItems = Object.entries(interactions)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([resourceId, count]) => ({
          resourceId,
          interactions: count,
          lastInteraction: filteredEvents
            .filter(e => e.resourceId === resourceId)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]?.timestamp
        }));

      return {
        success: true,
        data: {
          popularItems,
          contentType,
          timeRange: {
            start: startDate,
            end: now,
            period: timeRange
          },
          totalInteractions: filteredEvents.length
        },
        message: `Retrieved ${popularItems.length} popular ${contentType}`,
        timestamp: new Date(),
        version: '1.0.0'
      };
    } catch (error) {
      logger.error('Error getting popular content:', error);
      return {
        success: false,
        error: 'Failed to retrieve popular content',
        timestamp: new Date(),
        version: '1.0.0'
      };
    }
  }
};

// ===== HELPER FUNCTIONS =====

/**
 * Anonymize IP address for privacy
 */
function anonymizeIP(ip: string): string {
  const parts = ip.split('.');
  if (parts.length === 4) {
    // IPv4: Replace last octet with 0
    return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
  }
  // For IPv6 or other formats, return a hash or partial
  return ip.substring(0, ip.length / 2) + 'xxxx';
}

/**
 * Update analytics statistics
 */
function updateAnalyticsStats(event: AnalyticsEvent): void {
  if (event.type === 'view') {
    analyticsStats.totalViews++;
  }

  // Update popular content
  if (event.resourceId) {
    if (event.resource === 'project') {
      const index = analyticsStats.popularProjects.indexOf(event.resourceId);
      if (index > -1) {
        // Move to front
        analyticsStats.popularProjects.splice(index, 1);
      }
      analyticsStats.popularProjects.unshift(event.resourceId);
      analyticsStats.popularProjects = analyticsStats.popularProjects.slice(0, 10);
    } else if (event.resource === 'skill') {
      const index = analyticsStats.popularSkills.indexOf(event.resourceId);
      if (index > -1) {
        analyticsStats.popularSkills.splice(index, 1);
      }
      analyticsStats.popularSkills.unshift(event.resourceId);
      analyticsStats.popularSkills = analyticsStats.popularSkills.slice(0, 10);
    }
  }

  // Update referrers
  if (event.referrer) {
    const domain = extractDomain(event.referrer);
    if (domain && !analyticsStats.topReferrers.includes(domain)) {
      analyticsStats.topReferrers.unshift(domain);
      analyticsStats.topReferrers = analyticsStats.topReferrers.slice(0, 10);
    }
  }
}

/**
 * Calculate statistics from events
 */
function calculateStats(events: AnalyticsEvent[], startDate: Date, endDate: Date): any {
  const stats = {
    totalEvents: events.length,
    eventTypes: {} as Record<string, number>,
    resourceTypes: {} as Record<string, number>,
    dailyBreakdown: {} as Record<string, number>,
    hourlyBreakdown: {} as Record<string, number>,
    topResources: {} as Record<string, number>
  };

  events.forEach(event => {
    // Count by event type
    stats.eventTypes[event.type] = (stats.eventTypes[event.type] || 0) + 1;

    // Count by resource type
    stats.resourceTypes[event.resource] = (stats.resourceTypes[event.resource] || 0) + 1;

    // Daily breakdown
    const day = event.timestamp.toISOString().split('T')[0];
    stats.dailyBreakdown[day] = (stats.dailyBreakdown[day] || 0) + 1;

    // Hourly breakdown
    const hour = event.timestamp.getHours().toString();
    stats.hourlyBreakdown[hour] = (stats.hourlyBreakdown[hour] || 0) + 1;

    // Top resources
    if (event.resourceId) {
      const key = `${event.resource}:${event.resourceId}`;
      stats.topResources[key] = (stats.topResources[key] || 0) + 1;
    }
  });

  return stats;
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return null;
  }
}

// Export all analytics tools
export const analyticsTools: Tool[] = [
  trackEvent,
  getAnalyticsStats,
  getPopularContent
];
