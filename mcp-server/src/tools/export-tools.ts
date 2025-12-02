import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { portfolioData, skillsData, projectsData } from '@/data/portfolio-data';
import { ApiResponse } from '@/types/portfolio';
import { logger } from '@/utils/logger';

/**
 * Export tools for the MCP server
 */

// ===== EXPORT PORTFOLIO =====
export const exportPortfolio: Tool = {
  name: 'export_portfolio',
  description: 'Export complete portfolio data in various formats',
  inputSchema: {
    type: 'object',
    properties: {
      format: {
        type: 'string',
        enum: ['json', 'markdown', 'csv', 'xml'],
        description: 'Export format',
        default: 'json'
      },
      includeAnalytics: {
        type: 'boolean',
        description: 'Whether to include analytics data',
        default: false
      },
      includePrivate: {
        type: 'boolean',
        description: 'Whether to include private information',
        default: false
      },
      compress: {
        type: 'boolean',
        description: 'Whether to compress the output',
        default: false
      }
    }
  },
  handler: async (args: any): Promise<ApiResponse> => {
    try {
      logger.info('Exporting portfolio', args);

      const format = args.format || 'json';
      let exportData = { ...portfolioData };

      // Remove private information if not requested
      if (!args.includePrivate) {
        if (exportData.contact.phone) {
          delete exportData.contact.phone;
        }
      }

      let result: string;
      let mimeType: string;
      let filename: string;

      switch (format) {
        case 'json':
          result = JSON.stringify(exportData, null, args.compress ? 0 : 2);
          mimeType = 'application/json';
          filename = 'portfolio.json';
          break;

        case 'markdown':
          result = generateMarkdownExport(exportData);
          mimeType = 'text/markdown';
          filename = 'portfolio.md';
          break;

        case 'csv':
          result = generateCSVExport(exportData);
          mimeType = 'text/csv';
          filename = 'portfolio.csv';
          break;

        case 'xml':
          result = generateXMLExport(exportData);
          mimeType = 'application/xml';
          filename = 'portfolio.xml';
          break;

        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      return {
        success: true,
        data: {
          content: result,
          format,
          mimeType,
          filename,
          size: result.length,
          timestamp: new Date().toISOString()
        },
        message: `Portfolio exported successfully as ${format.toUpperCase()}`,
        timestamp: new Date(),
        version: '1.0.0'
      };
    } catch (error) {
      logger.error('Error exporting portfolio:', error);
      return {
        success: false,
        error: 'Failed to export portfolio',
        timestamp: new Date(),
        version: '1.0.0'
      };
    }
  }
};

// ===== EXPORT SKILLS =====
export const exportSkills: Tool = {
  name: 'export_skills',
  description: 'Export skills data in various formats',
  inputSchema: {
    type: 'object',
    properties: {
      format: {
        type: 'string',
        enum: ['json', 'csv', 'markdown'],
        description: 'Export format',
        default: 'json'
      },
      category: {
        type: 'string',
        enum: ['adobe', 'programming', 'creative'],
        description: 'Filter by skill category'
      },
      includeStats: {
        type: 'boolean',
        description: 'Whether to include statistics',
        default: true
      }
    }
  },
  handler: async (args: any): Promise<ApiResponse> => {
    try {
      logger.info('Exporting skills', args);

      let skills = [...skillsData];

      // Filter by category if specified
      if (args.category) {
        skills = skills.filter(skill => skill.category === args.category);
      }

      const format = args.format || 'json';
      let result: string;
      let mimeType: string;
      let filename: string;

      switch (format) {
        case 'json':
          const exportData = {
            skills,
            stats: args.includeStats ? calculateSkillStats(skills) : undefined,
            exportedAt: new Date().toISOString()
          };
          result = JSON.stringify(exportData, null, 2);
          mimeType = 'application/json';
          filename = `skills${args.category ? `-${args.category}` : ''}.json`;
          break;

        case 'csv':
          result = generateSkillsCSV(skills);
          mimeType = 'text/csv';
          filename = `skills${args.category ? `-${args.category}` : ''}.csv`;
          break;

        case 'markdown':
          result = generateSkillsMarkdown(skills, args.includeStats);
          mimeType = 'text/markdown';
          filename = `skills${args.category ? `-${args.category}` : ''}.md`;
          break;

        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      return {
        success: true,
        data: {
          content: result,
          format,
          mimeType,
          filename,
          skillCount: skills.length,
          category: args.category,
          size: result.length
        },
        message: `${skills.length} skills exported successfully as ${format.toUpperCase()}`,
        timestamp: new Date(),
        version: '1.0.0'
      };
    } catch (error) {
      logger.error('Error exporting skills:', error);
      return {
        success: false,
        error: 'Failed to export skills',
        timestamp: new Date(),
        version: '1.0.0'
      };
    }
  }
};

// ===== EXPORT PROJECTS =====
export const exportProjects: Tool = {
  name: 'export_projects',
  description: 'Export projects data in various formats',
  inputSchema: {
    type: 'object',
    properties: {
      format: {
        type: 'string',
        enum: ['json', 'csv', 'markdown'],
        description: 'Export format',
        default: 'json'
      },
      category: {
        type: 'string',
        description: 'Filter by project category'
      },
      featured: {
        type: 'boolean',
        description: 'Export only featured projects'
      },
      includeImages: {
        type: 'boolean',
        description: 'Whether to include image data',
        default: true
      }
    }
  },
  handler: async (args: any): Promise<ApiResponse> => {
    try {
      logger.info('Exporting projects', args);

      let projects = [...projectsData];

      // Filter by category if specified
      if (args.category) {
        projects = projects.filter(project => project.category === args.category);
      }

      // Filter by featured if specified
      if (args.featured) {
        projects = projects.filter(project => project.featured);
      }

      // Remove images if not requested
      if (!args.includeImages) {
        projects = projects.map(project => ({
          ...project,
          images: []
        }));
      }

      const format = args.format || 'json';
      let result: string;
      let mimeType: string;
      let filename: string;

      switch (format) {
        case 'json':
          const exportData = {
            projects,
            stats: calculateProjectStats(projects),
            exportedAt: new Date().toISOString()
          };
          result = JSON.stringify(exportData, null, 2);
          mimeType = 'application/json';
          filename = `projects${args.category ? `-${args.category}` : ''}${args.featured ? '-featured' : ''}.json`;
          break;

        case 'csv':
          result = generateProjectsCSV(projects);
          mimeType = 'text/csv';
          filename = `projects${args.category ? `-${args.category}` : ''}${args.featured ? '-featured' : ''}.csv`;
          break;

        case 'markdown':
          result = generateProjectsMarkdown(projects);
          mimeType = 'text/markdown';
          filename = `projects${args.category ? `-${args.category}` : ''}${args.featured ? '-featured' : ''}.md`;
          break;

        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      return {
        success: true,
        data: {
          content: result,
          format,
          mimeType,
          filename,
          projectCount: projects.length,
          category: args.category,
          featured: args.featured,
          size: result.length
        },
        message: `${projects.length} projects exported successfully as ${format.toUpperCase()}`,
        timestamp: new Date(),
        version: '1.0.0'
      };
    } catch (error) {
      logger.error('Error exporting projects:', error);
      return {
        success: false,
        error: 'Failed to export projects',
        timestamp: new Date(),
        version: '1.0.0'
      };
    }
  }
};

// ===== HELPER FUNCTIONS =====

function generateMarkdownExport(data: any): string {
  return `# ${data.title}

${data.description}

## Contact Information
- **Email**: ${data.contact.email}
- **Location**: ${data.contact.location}
- **Website**: ${data.contact.website}

## Skills (${data.skills.length})
${data.skills.map((skill: any) => 
  `- **${skill.name}** (${skill.level}, ${skill.proficiency}%) - ${skill.description}`
).join('\n')}

## Projects (${data.projects.length})
${data.projects.map((project: any) => 
  `### ${project.title}
${project.description}
- **Category**: ${project.category}
- **Year**: ${project.year}
- **Technologies**: ${project.technologies.join(', ')}
${project.liveUrl ? `- **Live URL**: ${project.liveUrl}` : ''}
`).join('\n')}

---
*Exported on ${new Date().toISOString()}*
`;
}

function generateCSVExport(data: any): string {
  const headers = ['Type', 'Name', 'Category', 'Description', 'Year', 'Status'];
  const rows = [headers.join(',')];

  // Add skills
  data.skills.forEach((skill: any) => {
    rows.push([
      'Skill',
      `"${skill.name}"`,
      skill.category,
      `"${skill.description}"`,
      '',
      skill.level
    ].join(','));
  });

  // Add projects
  data.projects.forEach((project: any) => {
    rows.push([
      'Project',
      `"${project.title}"`,
      project.category,
      `"${project.shortDescription}"`,
      project.year,
      project.status
    ].join(','));
  });

  return rows.join('\n');
}

function generateXMLExport(data: any): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<portfolio>
  <title>${data.title}</title>
  <description>${data.description}</description>
  <skills>
    ${data.skills.map((skill: any) => `
    <skill>
      <name>${skill.name}</name>
      <category>${skill.category}</category>
      <level>${skill.level}</level>
      <proficiency>${skill.proficiency}</proficiency>
      <description>${skill.description}</description>
    </skill>`).join('')}
  </skills>
  <projects>
    ${data.projects.map((project: any) => `
    <project>
      <title>${project.title}</title>
      <category>${project.category}</category>
      <year>${project.year}</year>
      <description>${project.description}</description>
      <status>${project.status}</status>
    </project>`).join('')}
  </projects>
</portfolio>`;
}

function generateSkillsCSV(skills: any[]): string {
  const headers = ['Name', 'Category', 'Level', 'Proficiency', 'Experience Years', 'Projects', 'Description'];
  const rows = [headers.join(',')];

  skills.forEach(skill => {
    rows.push([
      `"${skill.name}"`,
      skill.category,
      skill.level,
      skill.proficiency,
      skill.yearsOfExperience,
      skill.projectCount,
      `"${skill.description}"`
    ].join(','));
  });

  return rows.join('\n');
}

function generateSkillsMarkdown(skills: any[], includeStats: boolean): string {
  let markdown = `# Skills Export\n\n`;

  if (includeStats) {
    const stats = calculateSkillStats(skills);
    markdown += `## Statistics
- **Total Skills**: ${stats.total}
- **Average Proficiency**: ${stats.averageProficiency}%
- **Total Experience**: ${stats.totalExperience} years
- **Total Projects**: ${stats.totalProjects}

`;
  }

  markdown += `## Skills List\n\n`;
  skills.forEach(skill => {
    markdown += `### ${skill.name}
- **Category**: ${skill.category}
- **Level**: ${skill.level}
- **Proficiency**: ${skill.proficiency}%
- **Experience**: ${skill.yearsOfExperience} years
- **Projects**: ${skill.projectCount}
- **Description**: ${skill.description}

`;
  });

  return markdown;
}

function generateProjectsCSV(projects: any[]): string {
  const headers = ['Title', 'Category', 'Status', 'Year', 'Featured', 'Views', 'Likes', 'Technologies', 'Description'];
  const rows = [headers.join(',')];

  projects.forEach(project => {
    rows.push([
      `"${project.title}"`,
      project.category,
      project.status,
      project.year,
      project.featured,
      project.views,
      project.likes,
      `"${project.technologies.join(', ')}"`,
      `"${project.shortDescription}"`
    ].join(','));
  });

  return rows.join('\n');
}

function generateProjectsMarkdown(projects: any[]): string {
  let markdown = `# Projects Export\n\n`;

  projects.forEach(project => {
    markdown += `## ${project.title}
${project.description}

- **Category**: ${project.category}
- **Year**: ${project.year}
- **Status**: ${project.status}
- **Featured**: ${project.featured ? 'Yes' : 'No'}
- **Technologies**: ${project.technologies.join(', ')}
- **Views**: ${project.views}
- **Likes**: ${project.likes}
${project.liveUrl ? `- **Live URL**: ${project.liveUrl}` : ''}
${project.githubUrl ? `- **GitHub**: ${project.githubUrl}` : ''}

`;
  });

  return markdown;
}

function calculateSkillStats(skills: any[]): any {
  return {
    total: skills.length,
    averageProficiency: Math.round(skills.reduce((sum, skill) => sum + skill.proficiency, 0) / skills.length),
    totalExperience: skills.reduce((sum, skill) => sum + skill.yearsOfExperience, 0),
    totalProjects: skills.reduce((sum, skill) => sum + skill.projectCount, 0),
    byCategory: skills.reduce((acc, skill) => {
      acc[skill.category] = (acc[skill.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
}

function calculateProjectStats(projects: any[]): any {
  return {
    total: projects.length,
    featured: projects.filter(p => p.featured).length,
    totalViews: projects.reduce((sum, project) => sum + project.views, 0),
    totalLikes: projects.reduce((sum, project) => sum + project.likes, 0),
    byCategory: projects.reduce((acc, project) => {
      acc[project.category] = (acc[project.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byYear: projects.reduce((acc, project) => {
      acc[project.year] = (acc[project.year] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
}

// Export all export tools
export const exportTools: Tool[] = [
  exportPortfolio,
  exportSkills,
  exportProjects
];
