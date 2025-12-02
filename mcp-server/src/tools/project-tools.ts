import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { projectsData } from '@/data/portfolio-data';
import { ApiResponse, ProjectFilter, ProjectCategory, ProjectStatus } from '@/types/portfolio';
import { logger } from '@/utils/logger';

/**
 * Project management tools for the MCP server
 */

// ===== GET ALL PROJECTS =====
export const getProjects: Tool = {
  name: 'get_projects',
  description: 'Get all projects with optional filtering and pagination',
  inputSchema: {
    type: 'object',
    properties: {
      limit: {
        type: 'number',
        minimum: 1,
        maximum: 100,
        description: 'Maximum number of projects to return',
        default: 10
      },
      offset: {
        type: 'number',
        minimum: 0,
        description: 'Number of projects to skip',
        default: 0
      },
      sortBy: {
        type: 'string',
        enum: ['title', 'date', 'views', 'likes', 'category', 'featured'],
        description: 'Field to sort by',
        default: 'date'
      },
      sortOrder: {
        type: 'string',
        enum: ['asc', 'desc'],
        description: 'Sort order',
        default: 'desc'
      },
      includeStats: {
        type: 'boolean',
        description: 'Whether to include project statistics',
        default: false
      }
    }
  },
  handler: async (args: any): Promise<ApiResponse> => {
    try {
      logger.info('Getting all projects', args);

      let projects = [...projectsData];

      // Sort projects
      const sortField = args.sortBy || 'date';
      const sortOrder = args.sortOrder || 'desc';

      projects.sort((a, b) => {
        let aValue: any, bValue: any;

        switch (sortField) {
          case 'title':
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          case 'date':
            aValue = a.updatedAt.getTime();
            bValue = b.updatedAt.getTime();
            break;
          case 'views':
            aValue = a.views;
            bValue = b.views;
            break;
          case 'likes':
            aValue = a.likes;
            bValue = b.likes;
            break;
          case 'category':
            aValue = a.category;
            bValue = b.category;
            break;
          case 'featured':
            aValue = a.featured ? 1 : 0;
            bValue = b.featured ? 1 : 0;
            break;
          default:
            aValue = a.updatedAt.getTime();
            bValue = b.updatedAt.getTime();
        }

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      // Apply pagination
      const total = projects.length;
      const offset = args.offset || 0;
      const limit = args.limit || 10;
      projects = projects.slice(offset, offset + limit);

      const result: any = {
        projects,
        pagination: {
          total,
          offset,
          limit,
          hasMore: offset + limit < total
        }
      };

      // Include statistics if requested
      if (args.includeStats) {
        result.stats = {
          total: projectsData.length,
          featured: projectsData.filter(p => p.featured).length,
          published: projectsData.filter(p => p.status === 'published').length,
          byCategory: projectsData.reduce((acc, project) => {
            acc[project.category] = (acc[project.category] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          byYear: projectsData.reduce((acc, project) => {
            acc[project.year] = (acc[project.year] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          totalViews: projectsData.reduce((sum, project) => sum + project.views, 0),
          totalLikes: projectsData.reduce((sum, project) => sum + project.likes, 0),
          averageViews: Math.round(projectsData.reduce((sum, project) => sum + project.views, 0) / projectsData.length)
        };
      }

      return {
        success: true,
        data: result,
        message: `Retrieved ${projects.length} of ${total} projects`,
        timestamp: new Date(),
        version: '1.0.0'
      };
    } catch (error) {
      logger.error('Error getting projects:', error);
      return {
        success: false,
        error: 'Failed to retrieve projects',
        timestamp: new Date(),
        version: '1.0.0'
      };
    }
  }
};

// ===== GET PROJECT BY ID =====
export const getProjectById: Tool = {
  name: 'get_project_by_id',
  description: 'Get detailed information about a specific project by ID',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'Project ID (UUID)'
      },
      includeRelated: {
        type: 'boolean',
        description: 'Whether to include related projects',
        default: false
      }
    },
    required: ['id']
  },
  handler: async (args: any): Promise<ApiResponse> => {
    try {
      logger.info('Getting project by ID', args);

      const project = projectsData.find(p => p.id === args.id);

      if (!project) {
        return {
          success: false,
          error: `Project not found with ID: ${args.id}`,
          timestamp: new Date(),
          version: '1.0.0'
        };
      }

      const result: any = { project };

      // Include related projects if requested
      if (args.includeRelated) {
        result.relatedProjects = projectsData.filter(p => 
          p.id !== project.id && (
            p.category === project.category ||
            p.technologies.some(tech => project.technologies.includes(tech)) ||
            p.skillsUsed.some(skill => project.skillsUsed.includes(skill))
          )
        ).slice(0, 3);
      }

      // Include projects in same category
      result.categoryPeers = projectsData.filter(p => 
        p.category === project.category && p.id !== project.id
      ).slice(0, 3);

      return {
        success: true,
        data: result,
        message: 'Project retrieved successfully',
        timestamp: new Date(),
        version: '1.0.0'
      };
    } catch (error) {
      logger.error('Error getting project by ID:', error);
      return {
        success: false,
        error: 'Failed to retrieve project',
        timestamp: new Date(),
        version: '1.0.0'
      };
    }
  }
};

// ===== FILTER PROJECTS =====
export const filterProjects: Tool = {
  name: 'filter_projects',
  description: 'Filter projects based on various criteria',
  inputSchema: {
    type: 'object',
    properties: {
      category: {
        type: 'string',
        enum: ['branding', 'web-design', 'print-design', 'motion-graphics', 'photography', 'illustration', 'ui-ux', 'programming', 'video-production'],
        description: 'Filter by project category'
      },
      status: {
        type: 'string',
        enum: ['draft', 'published', 'archived', 'featured'],
        description: 'Filter by project status'
      },
      featured: {
        type: 'boolean',
        description: 'Filter featured projects only'
      },
      year: {
        type: 'number',
        description: 'Filter by project year'
      },
      technology: {
        type: 'string',
        description: 'Filter by technology used'
      },
      skill: {
        type: 'string',
        description: 'Filter by skill used'
      },
      search: {
        type: 'string',
        description: 'Search in project title, description, or tags'
      },
      minViews: {
        type: 'number',
        description: 'Minimum number of views'
      },
      hasImages: {
        type: 'boolean',
        description: 'Filter projects that have images'
      },
      hasLiveUrl: {
        type: 'boolean',
        description: 'Filter projects that have live URLs'
      }
    }
  },
  handler: async (args: any): Promise<ApiResponse> => {
    try {
      logger.info('Filtering projects', args);

      let filteredProjects = [...projectsData];

      // Filter by category
      if (args.category) {
        filteredProjects = filteredProjects.filter(project => project.category === args.category);
      }

      // Filter by status
      if (args.status) {
        filteredProjects = filteredProjects.filter(project => project.status === args.status);
      }

      // Filter by featured
      if (args.featured !== undefined) {
        filteredProjects = filteredProjects.filter(project => project.featured === args.featured);
      }

      // Filter by year
      if (args.year) {
        filteredProjects = filteredProjects.filter(project => project.year === args.year);
      }

      // Filter by technology
      if (args.technology) {
        filteredProjects = filteredProjects.filter(project => 
          project.technologies.some(tech => 
            tech.toLowerCase().includes(args.technology.toLowerCase())
          )
        );
      }

      // Filter by skill
      if (args.skill) {
        filteredProjects = filteredProjects.filter(project => 
          project.skillsUsed.some(skill => 
            skill.toLowerCase().includes(args.skill.toLowerCase())
          )
        );
      }

      // Filter by search term
      if (args.search) {
        const searchTerm = args.search.toLowerCase();
        filteredProjects = filteredProjects.filter(project => 
          project.title.toLowerCase().includes(searchTerm) ||
          project.description.toLowerCase().includes(searchTerm) ||
          project.shortDescription.toLowerCase().includes(searchTerm) ||
          project.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }

      // Filter by minimum views
      if (args.minViews !== undefined) {
        filteredProjects = filteredProjects.filter(project => project.views >= args.minViews);
      }

      // Filter by images
      if (args.hasImages !== undefined) {
        if (args.hasImages) {
          filteredProjects = filteredProjects.filter(project => project.images.length > 0);
        } else {
          filteredProjects = filteredProjects.filter(project => project.images.length === 0);
        }
      }

      // Filter by live URL
      if (args.hasLiveUrl !== undefined) {
        if (args.hasLiveUrl) {
          filteredProjects = filteredProjects.filter(project => project.liveUrl);
        } else {
          filteredProjects = filteredProjects.filter(project => !project.liveUrl);
        }
      }

      // Sort by views (highest first) then by date
      filteredProjects.sort((a, b) => {
        if (b.views !== a.views) {
          return b.views - a.views;
        }
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      });

      return {
        success: true,
        data: {
          projects: filteredProjects,
          total: filteredProjects.length,
          filters: args
        },
        message: `Found ${filteredProjects.length} projects matching criteria`,
        timestamp: new Date(),
        version: '1.0.0'
      };
    } catch (error) {
      logger.error('Error filtering projects:', error);
      return {
        success: false,
        error: 'Failed to filter projects',
        timestamp: new Date(),
        version: '1.0.0'
      };
    }
  }
};

// ===== GET FEATURED PROJECTS =====
export const getFeaturedProjects: Tool = {
  name: 'get_featured_projects',
  description: 'Get featured projects with optional category filtering',
  inputSchema: {
    type: 'object',
    properties: {
      category: {
        type: 'string',
        description: 'Filter featured projects by category'
      },
      limit: {
        type: 'number',
        minimum: 1,
        maximum: 20,
        description: 'Maximum number of featured projects to return',
        default: 5
      }
    }
  },
  handler: async (args: any): Promise<ApiResponse> => {
    try {
      logger.info('Getting featured projects', args);

      let featuredProjects = projectsData.filter(project => project.featured);

      // Filter by category if specified
      if (args.category) {
        featuredProjects = featuredProjects.filter(project => project.category === args.category);
      }

      // Sort by views and likes
      featuredProjects.sort((a, b) => {
        const aScore = a.views + (a.likes * 2);
        const bScore = b.views + (b.likes * 2);
        return bScore - aScore;
      });

      // Apply limit
      const limit = args.limit || 5;
      featuredProjects = featuredProjects.slice(0, limit);

      return {
        success: true,
        data: {
          projects: featuredProjects,
          total: featuredProjects.length,
          categories: [...new Set(projectsData.filter(p => p.featured).map(p => p.category))]
        },
        message: `Retrieved ${featuredProjects.length} featured projects`,
        timestamp: new Date(),
        version: '1.0.0'
      };
    } catch (error) {
      logger.error('Error getting featured projects:', error);
      return {
        success: false,
        error: 'Failed to retrieve featured projects',
        timestamp: new Date(),
        version: '1.0.0'
      };
    }
  }
};

// Export all project tools
export const projectTools: Tool[] = [
  getProjects,
  getProjectById,
  filterProjects,
  getFeaturedProjects
];
