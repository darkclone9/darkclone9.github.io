import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { skillsData } from '@/data/portfolio-data';
import { ApiResponse, SkillFilter, SkillCategory, SkillLevel } from '@/types/portfolio';
import { logger } from '@/utils/logger';

/**
 * Skill management tools for the MCP server
 */

// ===== GET ALL SKILLS =====
export const getSkills: Tool = {
  name: 'get_skills',
  description: 'Get all skills with optional filtering and sorting',
  inputSchema: {
    type: 'object',
    properties: {
      activeOnly: {
        type: 'boolean',
        description: 'Whether to include only active skills',
        default: true
      },
      sortBy: {
        type: 'string',
        enum: ['name', 'proficiency', 'experience', 'category', 'updated'],
        description: 'Field to sort by',
        default: 'proficiency'
      },
      sortOrder: {
        type: 'string',
        enum: ['asc', 'desc'],
        description: 'Sort order',
        default: 'desc'
      },
      includeStats: {
        type: 'boolean',
        description: 'Whether to include skill statistics',
        default: false
      }
    }
  },
  handler: async (args: any): Promise<ApiResponse> => {
    try {
      logger.info('Getting all skills', args);

      let skills = [...skillsData];

      // Filter active only
      if (args.activeOnly) {
        skills = skills.filter(skill => skill.isActive);
      }

      // Sort skills
      const sortField = args.sortBy || 'proficiency';
      const sortOrder = args.sortOrder || 'desc';

      skills.sort((a, b) => {
        let aValue: any, bValue: any;

        switch (sortField) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'proficiency':
            aValue = a.proficiency;
            bValue = b.proficiency;
            break;
          case 'experience':
            aValue = a.yearsOfExperience;
            bValue = b.yearsOfExperience;
            break;
          case 'category':
            aValue = a.category;
            bValue = b.category;
            break;
          case 'updated':
            aValue = a.lastUpdated.getTime();
            bValue = b.lastUpdated.getTime();
            break;
          default:
            aValue = a.proficiency;
            bValue = b.proficiency;
        }

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      const result: any = { skills };

      // Include statistics if requested
      if (args.includeStats) {
        result.stats = {
          total: skills.length,
          byCategory: skills.reduce((acc, skill) => {
            acc[skill.category] = (acc[skill.category] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          byLevel: skills.reduce((acc, skill) => {
            acc[skill.level] = (acc[skill.level] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          averageProficiency: Math.round(
            skills.reduce((sum, skill) => sum + skill.proficiency, 0) / skills.length
          ),
          totalExperience: skills.reduce((sum, skill) => sum + skill.yearsOfExperience, 0),
          totalProjects: skills.reduce((sum, skill) => sum + skill.projectCount, 0)
        };
      }

      return {
        success: true,
        data: result,
        message: `Retrieved ${skills.length} skills`,
        timestamp: new Date(),
        version: '1.0.0'
      };
    } catch (error) {
      logger.error('Error getting skills:', error);
      return {
        success: false,
        error: 'Failed to retrieve skills',
        timestamp: new Date(),
        version: '1.0.0'
      };
    }
  }
};

// ===== GET SKILL BY ID =====
export const getSkillById: Tool = {
  name: 'get_skill_by_id',
  description: 'Get detailed information about a specific skill by ID',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'Skill ID (UUID)'
      },
      includeRelated: {
        type: 'boolean',
        description: 'Whether to include related skills',
        default: false
      }
    },
    required: ['id']
  },
  handler: async (args: any): Promise<ApiResponse> => {
    try {
      logger.info('Getting skill by ID', args);

      const skill = skillsData.find(s => s.id === args.id);

      if (!skill) {
        return {
          success: false,
          error: `Skill not found with ID: ${args.id}`,
          timestamp: new Date(),
          version: '1.0.0'
        };
      }

      const result: any = { skill };

      // Include related skills if requested
      if (args.includeRelated && skill.relatedSkills) {
        result.relatedSkills = skillsData.filter(s => 
          skill.relatedSkills?.includes(s.name) || 
          skill.relatedSkills?.includes(s.id)
        );
      }

      // Include skills in same category
      result.categoryPeers = skillsData.filter(s => 
        s.category === skill.category && s.id !== skill.id
      );

      return {
        success: true,
        data: result,
        message: 'Skill retrieved successfully',
        timestamp: new Date(),
        version: '1.0.0'
      };
    } catch (error) {
      logger.error('Error getting skill by ID:', error);
      return {
        success: false,
        error: 'Failed to retrieve skill',
        timestamp: new Date(),
        version: '1.0.0'
      };
    }
  }
};

// ===== FILTER SKILLS =====
export const filterSkills: Tool = {
  name: 'filter_skills',
  description: 'Filter skills based on various criteria',
  inputSchema: {
    type: 'object',
    properties: {
      category: {
        type: 'string',
        enum: ['adobe', 'programming', 'creative'],
        description: 'Filter by skill category'
      },
      level: {
        type: 'string',
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        description: 'Filter by skill level'
      },
      minProficiency: {
        type: 'number',
        minimum: 0,
        maximum: 100,
        description: 'Minimum proficiency level'
      },
      maxProficiency: {
        type: 'number',
        minimum: 0,
        maximum: 100,
        description: 'Maximum proficiency level'
      },
      search: {
        type: 'string',
        description: 'Search in skill name, description, or tags'
      },
      hasProjects: {
        type: 'boolean',
        description: 'Filter skills that have associated projects'
      }
    }
  },
  handler: async (args: any): Promise<ApiResponse> => {
    try {
      logger.info('Filtering skills', args);

      let filteredSkills = [...skillsData];

      // Filter by category
      if (args.category) {
        filteredSkills = filteredSkills.filter(skill => skill.category === args.category);
      }

      // Filter by level
      if (args.level) {
        filteredSkills = filteredSkills.filter(skill => skill.level === args.level);
      }

      // Filter by proficiency range
      if (args.minProficiency !== undefined) {
        filteredSkills = filteredSkills.filter(skill => skill.proficiency >= args.minProficiency);
      }
      if (args.maxProficiency !== undefined) {
        filteredSkills = filteredSkills.filter(skill => skill.proficiency <= args.maxProficiency);
      }

      // Filter by search term
      if (args.search) {
        const searchTerm = args.search.toLowerCase();
        filteredSkills = filteredSkills.filter(skill => 
          skill.name.toLowerCase().includes(searchTerm) ||
          skill.description.toLowerCase().includes(searchTerm) ||
          skill.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) ||
          skill.applications?.some(app => app.toLowerCase().includes(searchTerm))
        );
      }

      // Filter by project association
      if (args.hasProjects !== undefined) {
        if (args.hasProjects) {
          filteredSkills = filteredSkills.filter(skill => skill.projectCount > 0);
        } else {
          filteredSkills = filteredSkills.filter(skill => skill.projectCount === 0);
        }
      }

      // Sort by proficiency (highest first)
      filteredSkills.sort((a, b) => b.proficiency - a.proficiency);

      return {
        success: true,
        data: {
          skills: filteredSkills,
          total: filteredSkills.length,
          filters: args
        },
        message: `Found ${filteredSkills.length} skills matching criteria`,
        timestamp: new Date(),
        version: '1.0.0'
      };
    } catch (error) {
      logger.error('Error filtering skills:', error);
      return {
        success: false,
        error: 'Failed to filter skills',
        timestamp: new Date(),
        version: '1.0.0'
      };
    }
  }
};

// ===== GET SKILLS BY CATEGORY =====
export const getSkillsByCategory: Tool = {
  name: 'get_skills_by_category',
  description: 'Get skills organized by category with statistics',
  inputSchema: {
    type: 'object',
    properties: {
      includeStats: {
        type: 'boolean',
        description: 'Whether to include category statistics',
        default: true
      },
      sortWithinCategory: {
        type: 'string',
        enum: ['proficiency', 'experience', 'name'],
        description: 'How to sort skills within each category',
        default: 'proficiency'
      }
    }
  },
  handler: async (args: any): Promise<ApiResponse> => {
    try {
      logger.info('Getting skills by category', args);

      const categories: Record<string, any> = {};
      const sortField = args.sortWithinCategory || 'proficiency';

      // Group skills by category
      skillsData.forEach(skill => {
        if (!categories[skill.category]) {
          categories[skill.category] = {
            name: skill.category,
            skills: [],
            stats: {
              count: 0,
              averageProficiency: 0,
              totalExperience: 0,
              totalProjects: 0
            }
          };
        }
        categories[skill.category].skills.push(skill);
      });

      // Sort skills within each category and calculate stats
      Object.keys(categories).forEach(categoryKey => {
        const category = categories[categoryKey];
        
        // Sort skills
        category.skills.sort((a: any, b: any) => {
          switch (sortField) {
            case 'proficiency':
              return b.proficiency - a.proficiency;
            case 'experience':
              return b.yearsOfExperience - a.yearsOfExperience;
            case 'name':
              return a.name.localeCompare(b.name);
            default:
              return b.proficiency - a.proficiency;
          }
        });

        // Calculate stats
        if (args.includeStats) {
          const skills = category.skills;
          category.stats = {
            count: skills.length,
            averageProficiency: Math.round(
              skills.reduce((sum: number, skill: any) => sum + skill.proficiency, 0) / skills.length
            ),
            totalExperience: skills.reduce((sum: number, skill: any) => sum + skill.yearsOfExperience, 0),
            totalProjects: skills.reduce((sum: number, skill: any) => sum + skill.projectCount, 0),
            topSkill: skills[0]?.name,
            levels: skills.reduce((acc: Record<string, number>, skill: any) => {
              acc[skill.level] = (acc[skill.level] || 0) + 1;
              return acc;
            }, {})
          };
        }
      });

      return {
        success: true,
        data: {
          categories,
          summary: {
            totalCategories: Object.keys(categories).length,
            totalSkills: skillsData.length,
            categoryNames: Object.keys(categories)
          }
        },
        message: 'Skills organized by category successfully',
        timestamp: new Date(),
        version: '1.0.0'
      };
    } catch (error) {
      logger.error('Error getting skills by category:', error);
      return {
        success: false,
        error: 'Failed to organize skills by category',
        timestamp: new Date(),
        version: '1.0.0'
      };
    }
  }
};

// Export all skill tools
export const skillTools: Tool[] = [
  getSkills,
  getSkillById,
  filterSkills,
  getSkillsByCategory
];
