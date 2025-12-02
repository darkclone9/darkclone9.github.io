import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

/**
 * Validation utilities for MCP server
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  data?: any;
}

/**
 * Validate tool input against its schema
 */
export function validateToolInput(tool: Tool, input: any): ValidationResult {
  try {
    if (!tool.inputSchema) {
      return { valid: true, errors: [], data: input };
    }

    // Convert JSON Schema to Zod schema for validation
    const zodSchema = jsonSchemaToZod(tool.inputSchema);
    const result = zodSchema.safeParse(input);

    if (result.success) {
      return { valid: true, errors: [], data: result.data };
    } else {
      return {
        valid: false,
        errors: result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
      };
    }
  } catch (error) {
    return {
      valid: false,
      errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

/**
 * Convert JSON Schema to Zod schema (simplified implementation)
 */
function jsonSchemaToZod(schema: any): z.ZodSchema {
  if (schema.type === 'object') {
    const shape: Record<string, z.ZodSchema> = {};
    
    if (schema.properties) {
      Object.keys(schema.properties).forEach(key => {
        const prop = schema.properties[key];
        let zodProp = jsonSchemaToZod(prop);
        
        // Handle optional properties
        if (!schema.required || !schema.required.includes(key)) {
          zodProp = zodProp.optional();
        }
        
        // Handle default values
        if (prop.default !== undefined) {
          zodProp = zodProp.default(prop.default);
        }
        
        shape[key] = zodProp;
      });
    }
    
    return z.object(shape);
  }
  
  if (schema.type === 'string') {
    let zodString = z.string();
    
    if (schema.enum) {
      return z.enum(schema.enum);
    }
    
    if (schema.minLength) {
      zodString = zodString.min(schema.minLength);
    }
    
    if (schema.maxLength) {
      zodString = zodString.max(schema.maxLength);
    }
    
    if (schema.pattern) {
      zodString = zodString.regex(new RegExp(schema.pattern));
    }
    
    return zodString;
  }
  
  if (schema.type === 'number' || schema.type === 'integer') {
    let zodNumber = schema.type === 'integer' ? z.number().int() : z.number();
    
    if (schema.minimum !== undefined) {
      zodNumber = zodNumber.min(schema.minimum);
    }
    
    if (schema.maximum !== undefined) {
      zodNumber = zodNumber.max(schema.maximum);
    }
    
    return zodNumber;
  }
  
  if (schema.type === 'boolean') {
    return z.boolean();
  }
  
  if (schema.type === 'array') {
    const itemSchema = schema.items ? jsonSchemaToZod(schema.items) : z.any();
    let zodArray = z.array(itemSchema);
    
    if (schema.minItems) {
      zodArray = zodArray.min(schema.minItems);
    }
    
    if (schema.maxItems) {
      zodArray = zodArray.max(schema.maxItems);
    }
    
    return zodArray;
  }
  
  // Fallback to any for unsupported types
  return z.any();
}

/**
 * Validate UUID format
 */
export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/[^\w\s\-_.@]/g, ''); // Keep only alphanumeric, spaces, and safe characters
}

/**
 * Validate and sanitize search query
 */
export function validateSearchQuery(query: string): ValidationResult {
  if (!query || typeof query !== 'string') {
    return { valid: false, errors: ['Search query must be a non-empty string'] };
  }
  
  const sanitized = sanitizeString(query);
  
  if (sanitized.length < 1) {
    return { valid: false, errors: ['Search query too short after sanitization'] };
  }
  
  if (sanitized.length > 100) {
    return { valid: false, errors: ['Search query too long (max 100 characters)'] };
  }
  
  return { valid: true, errors: [], data: sanitized };
}

/**
 * Validate pagination parameters
 */
export function validatePagination(limit?: number, offset?: number): ValidationResult {
  const errors: string[] = [];
  
  if (limit !== undefined) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      errors.push('Limit must be an integer between 1 and 100');
    }
  }
  
  if (offset !== undefined) {
    if (!Number.isInteger(offset) || offset < 0) {
      errors.push('Offset must be a non-negative integer');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    data: { limit: limit || 10, offset: offset || 0 }
  };
}

/**
 * Validate sort parameters
 */
export function validateSort(sortBy?: string, sortOrder?: string, allowedFields: string[] = []): ValidationResult {
  const errors: string[] = [];
  
  if (sortBy && allowedFields.length > 0 && !allowedFields.includes(sortBy)) {
    errors.push(`Sort field must be one of: ${allowedFields.join(', ')}`);
  }
  
  if (sortOrder && !['asc', 'desc'].includes(sortOrder)) {
    errors.push('Sort order must be "asc" or "desc"');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    data: { sortBy: sortBy || 'date', sortOrder: sortOrder || 'desc' }
  };
}

/**
 * Validate proficiency level
 */
export function validateProficiency(proficiency: number): ValidationResult {
  if (!Number.isInteger(proficiency) || proficiency < 0 || proficiency > 100) {
    return {
      valid: false,
      errors: ['Proficiency must be an integer between 0 and 100']
    };
  }
  
  return { valid: true, errors: [], data: proficiency };
}

/**
 * Validate date range
 */
export function validateDateRange(startDate?: string, endDate?: string): ValidationResult {
  const errors: string[] = [];
  let start: Date | undefined;
  let end: Date | undefined;
  
  if (startDate) {
    start = new Date(startDate);
    if (isNaN(start.getTime())) {
      errors.push('Start date is invalid');
    }
  }
  
  if (endDate) {
    end = new Date(endDate);
    if (isNaN(end.getTime())) {
      errors.push('End date is invalid');
    }
  }
  
  if (start && end && start > end) {
    errors.push('Start date must be before end date');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    data: { startDate: start, endDate: end }
  };
}

/**
 * Common validation schemas
 */
export const commonSchemas = {
  uuid: z.string().uuid(),
  email: z.string().email(),
  url: z.string().url(),
  positiveInteger: z.number().int().positive(),
  nonNegativeInteger: z.number().int().min(0),
  proficiency: z.number().int().min(0).max(100),
  searchQuery: z.string().min(1).max(100),
  sortOrder: z.enum(['asc', 'desc']),
  pagination: z.object({
    limit: z.number().int().min(1).max(100).default(10),
    offset: z.number().int().min(0).default(0)
  })
};
