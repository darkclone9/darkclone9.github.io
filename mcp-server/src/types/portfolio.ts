import { z } from 'zod';

// ===== SKILL TYPES =====
export const SkillCategorySchema = z.enum(['adobe', 'programming', 'creative']);
export type SkillCategory = z.infer<typeof SkillCategorySchema>;

export const SkillLevelSchema = z.enum(['beginner', 'intermediate', 'advanced', 'expert']);
export type SkillLevel = z.infer<typeof SkillLevelSchema>;

export const SkillSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  category: SkillCategorySchema,
  level: SkillLevelSchema,
  proficiency: z.number().min(0).max(100),
  description: z.string().min(1).max(500),
  icon: z.string().optional(),
  color: z.string().optional(),
  yearsOfExperience: z.number().min(0).max(50),
  certifications: z.array(z.string()).optional(),
  relatedSkills: z.array(z.string()).optional(),
  learningResources: z.array(z.string()).optional(),
  projectCount: z.number().min(0).default(0),
  lastUpdated: z.date().default(() => new Date()),
  isActive: z.boolean().default(true),
  tags: z.array(z.string()).optional(),
  applications: z.array(z.string()).optional(),
  integrations: z.array(z.string()).optional()
});

export type Skill = z.infer<typeof SkillSchema>;

// ===== PROJECT TYPES =====
export const ProjectStatusSchema = z.enum(['draft', 'published', 'archived', 'featured']);
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

export const ProjectCategorySchema = z.enum([
  'branding', 'web-design', 'print-design', 'motion-graphics', 
  'photography', 'illustration', 'ui-ux', 'programming', 'video-production'
]);
export type ProjectCategory = z.infer<typeof ProjectCategorySchema>;

export const ProjectImageSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  alt: z.string(),
  caption: z.string().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  format: z.string().optional(),
  size: z.number().positive().optional(),
  isPrimary: z.boolean().default(false)
});

export type ProjectImage = z.infer<typeof ProjectImageSchema>;

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  shortDescription: z.string().min(1).max(300),
  category: ProjectCategorySchema,
  subcategory: z.string().optional(),
  status: ProjectStatusSchema.default('draft'),
  featured: z.boolean().default(false),
  
  // Technical details
  technologies: z.array(z.string()),
  skillsUsed: z.array(z.string()),
  tools: z.array(z.string()),
  duration: z.string().optional(),
  teamSize: z.number().positive().optional(),
  role: z.string().optional(),
  
  // Media
  images: z.array(ProjectImageSchema),
  videoUrl: z.string().url().optional(),
  liveUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  behanceUrl: z.string().url().optional(),
  
  // Metadata
  client: z.string().optional(),
  year: z.number().min(2020).max(2030),
  tags: z.array(z.string()),
  challenges: z.array(z.string()).optional(),
  solutions: z.array(z.string()).optional(),
  results: z.array(z.string()).optional(),
  testimonial: z.string().optional(),
  
  // Dates
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  
  // Analytics
  views: z.number().min(0).default(0),
  likes: z.number().min(0).default(0),
  shares: z.number().min(0).default(0)
});

export type Project = z.infer<typeof ProjectSchema>;

// ===== CONTACT TYPES =====
export const SocialLinkSchema = z.object({
  platform: z.string(),
  url: z.string().url(),
  username: z.string().optional(),
  icon: z.string().optional(),
  isActive: z.boolean().default(true)
});

export type SocialLink = z.infer<typeof SocialLinkSchema>;

export const ContactInfoSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url().optional(),
  resume: z.string().url().optional(),
  socialLinks: z.array(SocialLinkSchema),
  availability: z.enum(['available', 'busy', 'unavailable']).default('available'),
  preferredContact: z.enum(['email', 'phone', 'social']).default('email'),
  timezone: z.string().optional(),
  languages: z.array(z.string()).optional()
});

export type ContactInfo = z.infer<typeof ContactInfoSchema>;

// ===== PORTFOLIO TYPES =====
export const AchievementSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  date: z.date(),
  category: z.string(),
  icon: z.string().optional(),
  url: z.string().url().optional(),
  isPublic: z.boolean().default(true)
});

export type Achievement = z.infer<typeof AchievementSchema>;

export const PortfolioStatsSchema = z.object({
  totalProjects: z.number().min(0),
  totalSkills: z.number().min(0),
  yearsOfExperience: z.number().min(0),
  clientsSatisfied: z.number().min(0),
  projectsCompleted: z.number().min(0),
  skillCategories: z.number().min(0),
  certifications: z.number().min(0),
  awards: z.number().min(0),
  lastUpdated: z.date().default(() => new Date())
});

export type PortfolioStats = z.infer<typeof PortfolioStatsSchema>;

export const PortfolioSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  subtitle: z.string(),
  description: z.string(),
  tagline: z.string().optional(),
  bio: z.string(),
  
  // Personal info
  name: z.string(),
  profession: z.string(),
  location: z.string().optional(),
  profileImage: z.string().url().optional(),
  
  // Content
  skills: z.array(SkillSchema),
  projects: z.array(ProjectSchema),
  achievements: z.array(AchievementSchema),
  contact: ContactInfoSchema,
  stats: PortfolioStatsSchema,
  
  // Settings
  isPublic: z.boolean().default(true),
  theme: z.string().default('default'),
  language: z.string().default('en'),
  
  // Metadata
  version: z.string().default('1.0.0'),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
});

export type Portfolio = z.infer<typeof PortfolioSchema>;

// ===== API RESPONSE TYPES =====
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
  timestamp: z.date().default(() => new Date()),
  version: z.string().default('1.0.0')
});

export type ApiResponse<T = any> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: Date;
  version: string;
};

// ===== FILTER TYPES =====
export const SkillFilterSchema = z.object({
  category: SkillCategorySchema.optional(),
  level: SkillLevelSchema.optional(),
  minProficiency: z.number().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional()
});

export type SkillFilter = z.infer<typeof SkillFilterSchema>;

export const ProjectFilterSchema = z.object({
  category: ProjectCategorySchema.optional(),
  status: ProjectStatusSchema.optional(),
  featured: z.boolean().optional(),
  year: z.number().optional(),
  technology: z.string().optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0)
});

export type ProjectFilter = z.infer<typeof ProjectFilterSchema>;

// ===== MCP TOOL TYPES =====
export interface MCPToolResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export interface MCPToolInput {
  [key: string]: any;
}

// ===== ANALYTICS TYPES =====
export const AnalyticsEventSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['view', 'click', 'download', 'contact', 'share']),
  resource: z.string(),
  resourceId: z.string().optional(),
  userAgent: z.string().optional(),
  ip: z.string().optional(),
  referrer: z.string().optional(),
  timestamp: z.date().default(() => new Date()),
  metadata: z.record(z.any()).optional()
});

export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;

export const AnalyticsStatsSchema = z.object({
  totalViews: z.number().min(0),
  uniqueVisitors: z.number().min(0),
  popularProjects: z.array(z.string()),
  popularSkills: z.array(z.string()),
  topReferrers: z.array(z.string()),
  deviceTypes: z.record(z.number()),
  countries: z.record(z.number()),
  timeRange: z.object({
    start: z.date(),
    end: z.date()
  })
});

export type AnalyticsStats = z.infer<typeof AnalyticsStatsSchema>;
