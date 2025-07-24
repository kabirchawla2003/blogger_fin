// lib/types.ts
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  category: string;
  tags: string[];
  featuredImage?: string;
  status: 'draft' | 'published' | 'scheduled';
  views: number;
  readTime: number;
  isDraft: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  author: string;
  email: string;
  content: string;
  createdAt: string;
  approved: boolean;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  welcomeMessage: string;
  aboutSection: string;
  authorName: string;
  authorBio: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface Analytics {
  postId: string;
  views: number;
  reads: number;
  engagementScore: number;
  lastViewed: string;
}
