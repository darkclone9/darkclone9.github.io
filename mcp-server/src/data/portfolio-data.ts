import { v4 as uuidv4 } from 'uuid';
import { Portfolio, Skill, Project, ContactInfo, PortfolioStats, Achievement } from '@/types/portfolio';

// ===== SKILLS DATA =====
export const skillsData: Skill[] = [
  // Adobe Creative Suite
  {
    id: uuidv4(),
    name: 'Adobe Illustrator',
    category: 'adobe',
    level: 'advanced',
    proficiency: 85,
    description: 'Vector graphics, logo design, illustrations, and brand identity creation',
    icon: 'fab fa-adobe',
    color: '#FF0000',
    yearsOfExperience: 2.5,
    projectCount: 15,
    tags: ['vector-graphics', 'logo-design', 'branding', 'illustrations'],
    applications: ['Logo design', 'Brand identity', 'Vector illustrations', 'Icon creation', 'Print graphics'],
    integrations: ['Photoshop', 'After Effects', 'Web Development'],
    lastUpdated: new Date(),
    isActive: true
  },
  {
    id: uuidv4(),
    name: 'Adobe Photoshop',
    category: 'adobe',
    level: 'advanced',
    proficiency: 80,
    description: 'Photo manipulation, digital art, compositing, and visual effects',
    icon: 'fab fa-adobe',
    color: '#FF0000',
    yearsOfExperience: 2.5,
    projectCount: 20,
    tags: ['photo-editing', 'digital-art', 'compositing', 'retouching'],
    applications: ['Photo enhancement', 'Digital compositing', 'Digital art', 'UI/UX design'],
    integrations: ['Illustrator', 'After Effects', 'Photography'],
    lastUpdated: new Date(),
    isActive: true
  },
  {
    id: uuidv4(),
    name: 'Adobe After Effects',
    category: 'adobe',
    level: 'intermediate',
    proficiency: 70,
    description: 'Motion graphics, animations, visual effects, and video compositing',
    icon: 'fab fa-adobe',
    color: '#FF0000',
    yearsOfExperience: 1.5,
    projectCount: 8,
    tags: ['motion-graphics', 'animation', 'visual-effects', 'video'],
    applications: ['Logo animations', 'Motion graphics', 'Video effects', 'Social media content'],
    integrations: ['Illustrator', 'Photoshop', 'Premiere Pro', 'Music Composition'],
    lastUpdated: new Date(),
    isActive: true
  },
  {
    id: uuidv4(),
    name: 'Adobe Premiere Pro',
    category: 'adobe',
    level: 'intermediate',
    proficiency: 65,
    description: 'Video editing, color grading, audio mixing, and post-production',
    icon: 'fab fa-adobe',
    color: '#FF0000',
    yearsOfExperience: 1.5,
    projectCount: 6,
    tags: ['video-editing', 'post-production', 'color-grading', 'audio'],
    applications: ['Video editing', 'Color grading', 'Audio mixing', 'Post-production'],
    integrations: ['After Effects', 'Videography', 'Music Composition'],
    lastUpdated: new Date(),
    isActive: true
  },
  {
    id: uuidv4(),
    name: 'Adobe InDesign',
    category: 'adobe',
    level: 'intermediate',
    proficiency: 60,
    description: 'Layout design, typography, print materials, and publication design',
    icon: 'fab fa-adobe',
    color: '#FF0000',
    yearsOfExperience: 1,
    projectCount: 4,
    tags: ['layout-design', 'typography', 'print-design', 'publications'],
    applications: ['Layout design', 'Typography', 'Print materials', 'Publication design'],
    integrations: ['Illustrator', 'Photoshop'],
    lastUpdated: new Date(),
    isActive: true
  },

  // Programming Languages
  {
    id: uuidv4(),
    name: 'Python',
    category: 'programming',
    level: 'intermediate',
    proficiency: 75,
    description: 'Automation scripts, data visualization, and creative coding projects',
    icon: 'fab fa-python',
    color: '#007ACC',
    yearsOfExperience: 1.5,
    projectCount: 12,
    tags: ['automation', 'data-visualization', 'scripting', 'creative-coding'],
    applications: ['Design automation', 'Data visualization', 'Image processing', 'Generative art'],
    integrations: ['Adobe Creative Suite', 'Photography', 'Web Development'],
    lastUpdated: new Date(),
    isActive: true
  },
  {
    id: uuidv4(),
    name: 'HTML/CSS',
    category: 'programming',
    level: 'advanced',
    proficiency: 80,
    description: 'Web design, responsive layouts, and interactive experiences',
    icon: 'fab fa-html5',
    color: '#007ACC',
    yearsOfExperience: 2,
    projectCount: 10,
    tags: ['web-design', 'responsive-design', 'css-animations', 'frontend'],
    applications: ['Responsive design', 'Visual design', 'CSS animations', 'Accessibility'],
    integrations: ['Design Software', 'Python', 'Photography', 'Video Content'],
    lastUpdated: new Date(),
    isActive: true
  },
  {
    id: uuidv4(),
    name: 'Java',
    category: 'programming',
    level: 'beginner',
    proficiency: 45,
    description: 'Application development and programming fundamentals',
    icon: 'fab fa-java',
    color: '#007ACC',
    yearsOfExperience: 0.5,
    projectCount: 3,
    tags: ['application-development', 'programming-fundamentals', 'oop'],
    applications: ['Application development', 'Programming fundamentals'],
    integrations: ['Python', 'Web Development'],
    lastUpdated: new Date(),
    isActive: true
  },

  // Creative Skills
  {
    id: uuidv4(),
    name: 'Photography',
    category: 'creative',
    level: 'advanced',
    proficiency: 85,
    description: 'Composition, lighting, post-processing, and visual storytelling',
    icon: 'fas fa-camera',
    color: '#FFD700',
    yearsOfExperience: 3,
    projectCount: 25,
    tags: ['composition', 'lighting', 'post-processing', 'visual-storytelling'],
    applications: ['Portrait work', 'Landscape photography', 'Product photography', 'Event documentation'],
    integrations: ['Photoshop', 'Videography', 'Python', 'Design Projects'],
    lastUpdated: new Date(),
    isActive: true
  },
  {
    id: uuidv4(),
    name: 'Videography',
    category: 'creative',
    level: 'intermediate',
    proficiency: 70,
    description: 'Cinematography, directing, and video production',
    icon: 'fas fa-video',
    color: '#FFD700',
    yearsOfExperience: 2,
    projectCount: 8,
    tags: ['cinematography', 'directing', 'video-production', 'storytelling'],
    applications: ['Cinematography', 'Video production', 'Storytelling', 'Content creation'],
    integrations: ['Photography', 'After Effects', 'Premiere Pro'],
    lastUpdated: new Date(),
    isActive: true
  },
  {
    id: uuidv4(),
    name: 'Music Composition',
    category: 'creative',
    level: 'intermediate',
    proficiency: 65,
    description: 'Audio production, sound design, and multimedia integration',
    icon: 'fas fa-music',
    color: '#FFD700',
    yearsOfExperience: 2.5,
    projectCount: 6,
    tags: ['audio-production', 'sound-design', 'composition', 'multimedia'],
    applications: ['Music composition', 'Sound design', 'Audio production', 'Multimedia integration'],
    integrations: ['After Effects', 'Premiere Pro', 'Python'],
    lastUpdated: new Date(),
    isActive: true
  }
];

// ===== PROJECTS DATA =====
export const projectsData: Project[] = [
  {
    id: uuidv4(),
    title: 'Personal Portfolio Website',
    slug: 'personal-portfolio-website',
    description: 'A comprehensive portfolio website built from scratch using modern HTML5, CSS3, and JavaScript, featuring responsive design, animations, and performance optimization.',
    shortDescription: 'Modern portfolio website with responsive design and animations',
    category: 'web-design',
    status: 'published',
    featured: true,
    technologies: ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design'],
    skillsUsed: ['HTML/CSS', 'JavaScript', 'Adobe Photoshop', 'Adobe Illustrator'],
    tools: ['VS Code', 'Git', 'Adobe Creative Suite'],
    duration: '3 weeks',
    role: 'Full-Stack Designer & Developer',
    images: [
      {
        id: uuidv4(),
        url: '/images/portfolio-website-hero.jpg',
        alt: 'Portfolio website hero section',
        isPrimary: true
      }
    ],
    liveUrl: 'https://gary-portfolio.com',
    githubUrl: 'https://github.com/gary/portfolio',
    year: 2024,
    tags: ['portfolio', 'responsive', 'animations', 'performance'],
    challenges: ['Creating smooth animations', 'Optimizing for mobile', 'Fast loading times'],
    solutions: ['CSS animations with GPU acceleration', 'Mobile-first design', 'Critical CSS inlining'],
    results: ['Under 2-second loading time', 'Perfect mobile experience', 'Professional presentation'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
    views: 150,
    likes: 25,
    shares: 8
  },
  {
    id: uuidv4(),
    title: 'Brand Identity Design',
    slug: 'brand-identity-design',
    description: 'Complete brand identity package for a local business including logo design, color palette, typography, and brand guidelines.',
    shortDescription: 'Complete brand identity package with logo and guidelines',
    category: 'branding',
    status: 'published',
    featured: true,
    technologies: ['Vector Graphics', 'Color Theory', 'Typography'],
    skillsUsed: ['Adobe Illustrator', 'Adobe Photoshop', 'Adobe InDesign'],
    tools: ['Adobe Creative Suite', 'Pantone Color Guide'],
    duration: '2 weeks',
    client: 'Local Business',
    role: 'Brand Designer',
    images: [
      {
        id: uuidv4(),
        url: '/images/brand-identity-logo.jpg',
        alt: 'Brand identity logo design',
        isPrimary: true
      }
    ],
    year: 2024,
    tags: ['branding', 'logo-design', 'identity', 'guidelines'],
    challenges: ['Creating memorable identity', 'Scalable design', 'Brand consistency'],
    solutions: ['Research-driven design', 'Vector-based graphics', 'Comprehensive guidelines'],
    results: ['Increased brand recognition', 'Consistent brand application', 'Client satisfaction'],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date(),
    views: 89,
    likes: 15,
    shares: 5
  },
  {
    id: uuidv4(),
    title: 'Motion Graphics Animation',
    slug: 'motion-graphics-animation',
    description: 'Animated logo sequence and promotional video graphics for social media marketing campaign.',
    shortDescription: 'Animated logo and promotional graphics for social media',
    category: 'motion-graphics',
    status: 'published',
    featured: false,
    technologies: ['Motion Graphics', 'Animation', 'Video Editing'],
    skillsUsed: ['Adobe After Effects', 'Adobe Premiere Pro', 'Adobe Illustrator'],
    tools: ['Adobe Creative Suite', 'Cinema 4D'],
    duration: '1 week',
    client: 'Marketing Agency',
    role: 'Motion Graphics Designer',
    images: [
      {
        id: uuidv4(),
        url: '/images/motion-graphics-preview.jpg',
        alt: 'Motion graphics animation preview',
        isPrimary: true
      }
    ],
    videoUrl: 'https://vimeo.com/example',
    year: 2024,
    tags: ['motion-graphics', 'animation', 'social-media', 'marketing'],
    challenges: ['Smooth animations', 'Brand consistency', 'Multiple formats'],
    solutions: ['Keyframe optimization', 'Style guide adherence', 'Template creation'],
    results: ['Increased engagement', 'Brand awareness', 'Campaign success'],
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date(),
    views: 67,
    likes: 12,
    shares: 3
  }
];

// ===== CONTACT INFO =====
export const contactInfo: ContactInfo = {
  email: 'gary@example.com',
  location: 'United States',
  website: 'https://gary-portfolio.com',
  socialLinks: [
    {
      platform: 'LinkedIn',
      url: 'https://linkedin.com/in/gary',
      username: 'gary',
      icon: 'fab fa-linkedin',
      isActive: true
    },
    {
      platform: 'GitHub',
      url: 'https://github.com/gary',
      username: 'gary',
      icon: 'fab fa-github',
      isActive: true
    },
    {
      platform: 'Behance',
      url: 'https://behance.net/gary',
      username: 'gary',
      icon: 'fab fa-behance',
      isActive: true
    },
    {
      platform: 'Instagram',
      url: 'https://instagram.com/gary',
      username: 'gary',
      icon: 'fab fa-instagram',
      isActive: true
    }
  ],
  availability: 'available',
  preferredContact: 'email',
  timezone: 'America/New_York',
  languages: ['English']
};

// ===== ACHIEVEMENTS =====
export const achievementsData: Achievement[] = [
  {
    id: uuidv4(),
    title: 'Portfolio Website Launch',
    description: 'Successfully launched comprehensive portfolio website with advanced features',
    date: new Date('2024-01-15'),
    category: 'Web Development',
    icon: 'fas fa-rocket',
    isPublic: true
  },
  {
    id: uuidv4(),
    title: 'First Client Project',
    description: 'Completed first professional brand identity project for local business',
    date: new Date('2024-02-01'),
    category: 'Design',
    icon: 'fas fa-award',
    isPublic: true
  },
  {
    id: uuidv4(),
    title: 'Motion Graphics Milestone',
    description: 'Created first professional motion graphics animation for marketing campaign',
    date: new Date('2024-03-01'),
    category: 'Animation',
    icon: 'fas fa-play',
    isPublic: true
  }
];

// ===== PORTFOLIO STATS =====
export const portfolioStats: PortfolioStats = {
  totalProjects: projectsData.length,
  totalSkills: skillsData.length,
  yearsOfExperience: 3,
  clientsSatisfied: 5,
  projectsCompleted: 15,
  skillCategories: 3,
  certifications: 2,
  awards: 1,
  lastUpdated: new Date()
};

// ===== MAIN PORTFOLIO DATA =====
export const portfolioData: Portfolio = {
  id: uuidv4(),
  title: "Gary's Graphic Design Portfolio",
  subtitle: 'Creative Graphic Designer & Digital Artist',
  description: 'Versatile creative professional combining artistic vision with technical expertise. Passionate about creating compelling visual experiences across digital and traditional media.',
  tagline: 'Bringing ideas to life through visual storytelling',
  bio: 'I am a passionate graphic designer with expertise in Adobe Creative Suite, programming, and creative arts. I specialize in creating compelling visual experiences that combine artistic vision with technical precision.',
  
  name: 'Gary',
  profession: 'Graphic Designer & Digital Artist',
  location: 'United States',
  profileImage: '/images/gary-profile.jpg',
  
  skills: skillsData,
  projects: projectsData,
  achievements: achievementsData,
  contact: contactInfo,
  stats: portfolioStats,
  
  isPublic: true,
  theme: 'default',
  language: 'en',
  
  version: '1.0.0',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date()
};
