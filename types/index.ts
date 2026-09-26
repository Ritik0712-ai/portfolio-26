// ============================================================
// Core domain types for the portfolio CMS
// ============================================================

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  tags: string[];
  reading_time: string | null;
  featured: boolean;
  published: boolean;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  role: string | null;
  problem: string | null;
  approach: string | null;
  architecture: string | null;
  learnings: string | null;
  technical_decisions: TechnicalDecision[] | null;
  outcomes: Outcome[] | null;
  technologies: string[];
  demo_url: string | null;
  repo_url: string | null;
  cover_image: string | null;
  gallery: string[];
  featured: boolean;
  published: boolean;
  display_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface TechnicalDecision {
  decision: string;
  rationale: string;
  trade_off: string;
}

export interface Outcome {
  outcome: string;
  result: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  avatar: string | null;
  content: string;
  rating: number | null;
  approved: boolean;
  display_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface Stat {
  id: string;
  icon: string;
  value: number;
  suffix: string;
  label: string;
  display_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  display_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface Feedback {
  id: string;
  name: string;
  email: string | null;
  role: string | null;
  company: string | null;
  project: string | null;
  rating: number;
  content: string;
  permission_display: boolean;
  reviewed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  slug: string;
  name: string;
  email: string;
  message: string;
  approved: boolean;
  created_at: string;
  updated_at: string;
}

// Admin user type (from auth.users join admin_users)
export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
}

// API response wrappers
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  issue_date: string | null;
  expiry_date: string | null;
  credential_url: string | null;
  image_url: string | null;
  display_order: number;
  published: boolean;
  created_at: string;
}

export interface DsaProblem {
  id: string;
  title: string;
  slug: string;
  number: number | null;
  url: string | null;
  difficulty: 'Easy' | 'Medium' | 'Hard' | null;
  topics: string[];
  approach: string | null;
  time_complexity: string | null;
  space_complexity: string | null;
  code: string | null;
  language: string | null;
  notes: string | null;
  revisit: boolean;
  solved_at: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}
