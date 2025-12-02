import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { portfolioData, contactInfo, portfolioStats } from '@/data/portfolio-data';
import { ApiResponse } from '@/types/portfolio';
import { logger } from '@/utils/logger';

/**
 * Portfolio management tools for the MCP server
 */

// ===== GET PORTFOLIO OVERVIEW =====
export const getPortfolioOverview: Tool = {
  name: 'get_portfolio_overview',
  description: 'Get complete portfolio overview including basic info, stats, and summary',
  inputSchema: {
    type: 'object',
    properties: {
      includeProjects: {
        type: 'boolean',
        description: 'Whether to include project summaries',
        default: false
      },
      includeSkills: {
        type: 'boolean',
        description: 'Whether to include skill summaries',
        default: false
      },
      includeContact: {
        type: 'boolean',
        description: 'Whether to include contact information',
        default: true
      }
    }
  },
  handler: async (args: any): Promise<ApiResponse> => {
    try {
      logger.info('Getting portfolio overview', args);

      const overview = {
        id: portfolioData.id,
        title: portfolioData.title,
        subtitle: portfolioData.subtitle,
        description: portfolioData.description,
        tagline: portfolioData.tagline,
        bio: portfolioData.bio,
        name: portfolioData.name,
        profession: portfolioData.profession,
        location: portfolioData.location,
        profileImage: portfolioData.profileImage,
        stats: portfolioData.stats,
        theme: portfolioData.theme,
        language: portfolioData.language,
        version: portfolioData.version,
        lastUpdated: portfolioData.updatedAt
      };

      // Conditionally include additional data
      const result: any = { ...overview };

      if (args.includeContact) {
        result.contact = portfolioData.contact;
      }

      if (args.includeSkills) {
        result.skillsSummary = {
          total: portfolioData.skills.length,
          categories: portfolioData.skills.reduce((acc, skill) => {
            acc[skill.category] = (acc[skill.category] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          topSkills: portfolioData.skills
            .sort((a, b) => b.proficiency - a.proficiency)
            .slice(0, 5)
            .map(skill => ({
              name: skill.name,
              proficiency: skill.proficiency,
              category: skill.category
            }))
        };
      }

      if (args.includeProjects) {
        result.projectsSummary = {
          total: portfolioData.projects.length,
          featured: portfolioData.projects.filter(p => p.featured).length,
          categories: portfolioData.projects.reduce((acc, project) => {
            acc[project.category] = (acc[project.category] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          recentProjects: portfolioData.projects
            .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
            .slice(0, 3)
            .map(project => ({
              id: project.id,
              title: project.title,
              category: project.category,
              featured: project.featured,
              updatedAt: project.updatedAt
            }))
        };
      }

      return {
        success: true,
        data: result,
        message: 'Portfolio overview retrieved successfully',
        timestamp: new Date(),
        version: '1.0.0'
      };
    } catch (error) {
      logger.error('Error getting portfolio overview:', error);
      return {
        success: false,
        error: 'Failed to retrieve portfolio overview',
        timestamp: new Date(),
        version: '1.0.0'
      };
    }
  }
};

// ===== GET PORTFOLIO STATS =====
export const getPortfolioStats: Tool = {
  name: 'get_portfolio_stats',
  description: 'Get detailed portfolio statistics and metrics',
  inputSchema: {
    type: 'object',
    properties: {
      includeBreakdown: {
        type: 'boolean',
        description: 'Whether to include detailed breakdowns',
        default: true
      }
    }
  },
  handler: async (args: any): Promise<ApiResponse> => {
    try {
      logger.info('Getting portfolio stats', args);

      const stats = { ...portfolioStats };
      const result: any = { ...stats };

      if (args.includeBreakdown) {
        // Skills breakdown
        result.skillsBreakdown = {
          byCategory: portfolioData.skills.reduce((acc, skill) => {
            acc[skill.category] = (acc[skill.category] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          byLevel: portfolioData.skills.reduce((acc, skill) => {
            acc[skill.level] = (acc[skill.level] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          averageProficiency: Math.round(
            portfolioData.skills.reduce((sum, skill) => sum + skill.proficiency, 0) / 
            portfolioData.skills.length
          )
        };

        // Projects breakdown
        result.projectsBreakdown = {
          byCategory: portfolioData.projects.reduce((acc, project) => {
            acc[project.category] = (acc[project.category] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          byStatus: portfolioData.projects.reduce((acc, project) => {
            acc[project.status] = (acc[project.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          byYear: portfolioData.projects.reduce((acc, project) => {
            acc[project.year] = (acc[project.year] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          totalViews: portfolioData.projects.reduce((sum, project) => sum + project.views, 0),
          totalLikes: portfolioData.projects.reduce((sum, project) => sum + project.likes, 0)
        };

        // Experience breakdown
        result.experienceBreakdown = {
          totalYearsAcrossSkills: portfolioData.skills.reduce((sum, skill) => sum + skill.yearsOfExperience, 0),
          skillsWithMostExperience: portfolioData.skills
            .sort((a, b) => b.yearsOfExperience - a.yearsOfExperience)
            .slice(0, 3)
            .map(skill => ({
              name: skill.name,
              years: skill.yearsOfExperience,
              proficiency: skill.proficiency
            }))
        };
      }

      return {
        success: true,
        data: result,
        message: 'Portfolio stats retrieved successfully',
        timestamp: new Date(),
        version: '1.0.0'
      };
    } catch (error) {
      logger.error('Error getting portfolio stats:', error);
      return {
        success: false,
        error: 'Failed to retrieve portfolio stats',
        timestamp: new Date(),
        version: '1.0.0'
      };
    }
  }
};

// ===== GET CONTACT INFO =====
export const getContactInfo: Tool = {
  name: 'get_contact_info',
  description: 'Get contact information and social media links',
  inputSchema: {
    type: 'object',
    properties: {
      includePrivate: {
        type: 'boolean',
        description: 'Whether to include private contact details',
        default: false
      },
      activeOnly: {
        type: 'boolean',
        description: 'Whether to include only active social links',
        default: true
      }
    }
  },
  handler: async (args: any): Promise<ApiResponse> => {
    try {
      logger.info('Getting contact info', args);

      const contact = { ...contactInfo };
      const result: any = { ...contact };

      // Filter social links if activeOnly is true
      if (args.activeOnly) {
        result.socialLinks = contact.socialLinks.filter(link => link.isActive);
      }

      // Remove private information if not requested
      if (!args.includePrivate) {
        delete result.phone;
        // Keep email as it's generally public for portfolio contact
      }

      // Add formatted social links for easy display
      result.formattedSocialLinks = result.socialLinks.map((link: any) => ({
        platform: link.platform,
        url: link.url,
        displayName: link.username || link.platform,
        icon: link.icon
      }));

      return {
        success: true,
        data: result,
        message: 'Contact info retrieved successfully',
        timestamp: new Date(),
        version: '1.0.0'
      };
    } catch (error) {
      logger.error('Error getting contact info:', error);
      return {
        success: false,
        error: 'Failed to retrieve contact info',
        timestamp: new Date(),
        version: '1.0.0'
      };
    }
  }
};

// ===== GET ACHIEVEMENTS =====
export const getAchievements: Tool = {
  name: 'get_achievements',
  description: 'Get portfolio achievements and milestones',
  inputSchema: {
    type: 'object',
    properties: {
      publicOnly: {
        type: 'boolean',
        description: 'Whether to include only public achievements',
        default: true
      },
      category: {
        type: 'string',
        description: 'Filter by achievement category'
      },
      limit: {
        type: 'number',
        description: 'Maximum number of achievements to return',
        default: 10
      }
    }
  },
  handler: async (args: any): Promise<ApiResponse> => {
    try {
      logger.info('Getting achievements', args);

      let achievements = [...portfolioData.achievements];

      // Filter by public only
      if (args.publicOnly) {
        achievements = achievements.filter(achievement => achievement.isPublic);
      }

      // Filter by category
      if (args.category) {
        achievements = achievements.filter(achievement => 
          achievement.category.toLowerCase().includes(args.category.toLowerCase())
        );
      }

      // Sort by date (most recent first)
      achievements.sort((a, b) => b.date.getTime() - a.date.getTime());

      // Apply limit
      if (args.limit) {
        achievements = achievements.slice(0, args.limit);
      }

      return {
        success: true,
        data: {
          achievements,
          total: achievements.length,
          categories: [...new Set(portfolioData.achievements.map(a => a.category))]
        },
        message: 'Achievements retrieved successfully',
        timestamp: new Date(),
        version: '1.0.0'
      };
    } catch (error) {
      logger.error('Error getting achievements:', error);
      return {
        success: false,
        error: 'Failed to retrieve achievements',
        timestamp: new Date(),
        version: '1.0.0'
      };
    }
  }
};

// Export all portfolio tools
export const portfolioTools: Tool[] = [
  getPortfolioOverview,
  getPortfolioStats,
  getContactInfo,
  getAchievements
];
