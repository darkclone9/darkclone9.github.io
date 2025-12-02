#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';
import { portfolioTools } from './tools/portfolio-tools.js';
import { skillTools } from './tools/skill-tools.js';
import { projectTools } from './tools/project-tools.js';
import { analyticsTools } from './tools/analytics-tools.js';
import { exportTools } from './tools/export-tools.js';
import { validateToolInput } from './utils/validation.js';
import { rateLimiter } from './middleware/rate-limiter.js';
import { errorHandler } from './utils/error-handler.js';

// Load environment variables
dotenv.config();

/**
 * Gary's Portfolio MCP Server
 * 
 * A Model Context Protocol server for managing Gary's graphic design portfolio.
 * Provides tools for retrieving, filtering, and managing portfolio content including
 * skills, projects, contact information, and analytics.
 */
class PortfolioMCPServer {
  private server: Server;
  private tools: Map<string, Tool>;

  constructor() {
    this.server = new Server(
      {
        name: 'gary-portfolio-mcp-server',
        version: '1.0.0',
        description: 'MCP server for Gary\'s graphic design portfolio management',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.tools = new Map();
    this.initializeTools();
    this.setupHandlers();
  }

  /**
   * Initialize all available tools
   */
  private initializeTools(): void {
    const allTools = [
      ...portfolioTools,
      ...skillTools,
      ...projectTools,
      ...analyticsTools,
      ...exportTools,
    ];

    allTools.forEach(tool => {
      this.tools.set(tool.name, tool);
    });

    logger.info(`Initialized ${this.tools.size} tools`);
  }

  /**
   * Setup MCP server handlers
   */
  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      logger.info('Listing available tools');
      
      return {
        tools: Array.from(this.tools.values()),
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      logger.info(`Tool called: ${name}`, { args });

      try {
        // Rate limiting check
        const rateLimitResult = await rateLimiter.checkLimit(request);
        if (!rateLimitResult.allowed) {
          throw new Error(`Rate limit exceeded. Try again in ${rateLimitResult.resetTime} seconds.`);
        }

        // Get the tool
        const tool = this.tools.get(name);
        if (!tool) {
          throw new Error(`Unknown tool: ${name}`);
        }

        // Validate input
        const validationResult = validateToolInput(tool, args || {});
        if (!validationResult.valid) {
          throw new Error(`Invalid input: ${validationResult.errors.join(', ')}`);
        }

        // Execute the tool
        const result = await this.executeTool(name, args || {});

        logger.info(`Tool executed successfully: ${name}`, { result });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        const handledError = errorHandler.handleError(error as Error, {
          tool: name,
          args,
          timestamp: new Date().toISOString(),
        });

        logger.error(`Tool execution failed: ${name}`, handledError);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: handledError.message,
                code: handledError.code,
                timestamp: new Date().toISOString(),
              }, null, 2),
            },
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * Execute a specific tool
   */
  private async executeTool(toolName: string, args: any): Promise<any> {
    switch (toolName) {
      // Portfolio tools
      case 'get_portfolio_overview':
        return portfolioTools.find(t => t.name === toolName)?.handler?.(args);
      case 'get_portfolio_stats':
        return portfolioTools.find(t => t.name === toolName)?.handler?.(args);
      case 'get_contact_info':
        return portfolioTools.find(t => t.name === toolName)?.handler?.(args);

      // Skill tools
      case 'get_skills':
        return skillTools.find(t => t.name === toolName)?.handler?.(args);
      case 'get_skill_by_id':
        return skillTools.find(t => t.name === toolName)?.handler?.(args);
      case 'filter_skills':
        return skillTools.find(t => t.name === toolName)?.handler?.(args);
      case 'get_skills_by_category':
        return skillTools.find(t => t.name === toolName)?.handler?.(args);

      // Project tools
      case 'get_projects':
        return projectTools.find(t => t.name === toolName)?.handler?.(args);
      case 'get_project_by_id':
        return projectTools.find(t => t.name === toolName)?.handler?.(args);
      case 'filter_projects':
        return projectTools.find(t => t.name === toolName)?.handler?.(args);
      case 'get_featured_projects':
        return projectTools.find(t => t.name === toolName)?.handler?.(args);

      // Analytics tools
      case 'track_event':
        return analyticsTools.find(t => t.name === toolName)?.handler?.(args);
      case 'get_analytics_stats':
        return analyticsTools.find(t => t.name === toolName)?.handler?.(args);

      // Export tools
      case 'export_portfolio':
        return exportTools.find(t => t.name === toolName)?.handler?.(args);
      case 'export_skills':
        return exportTools.find(t => t.name === toolName)?.handler?.(args);
      case 'export_projects':
        return exportTools.find(t => t.name === toolName)?.handler?.(args);

      default:
        throw new Error(`Tool handler not implemented: ${toolName}`);
    }
  }

  /**
   * Start the MCP server
   */
  public async start(): Promise<void> {
    const transport = new StdioServerTransport();
    
    logger.info('Starting Gary\'s Portfolio MCP Server...');
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`Version: 1.0.0`);
    
    await this.server.connect(transport);
    
    logger.info('Portfolio MCP Server started successfully');
    logger.info('Available tools:', Array.from(this.tools.keys()));
  }

  /**
   * Stop the MCP server
   */
  public async stop(): Promise<void> {
    logger.info('Stopping Portfolio MCP Server...');
    await this.server.close();
    logger.info('Portfolio MCP Server stopped');
  }
}

// Handle process signals for graceful shutdown
const server = new PortfolioMCPServer();

process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  await server.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  await server.stop();
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
if (require.main === module) {
  server.start().catch((error) => {
    logger.error('Failed to start server:', error);
    process.exit(1);
  });
}

export { PortfolioMCPServer };
