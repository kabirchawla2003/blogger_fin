// src/lib/validation.ts
import { z } from 'zod';

// Blog Post Validation Schema

export const BlogPostSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  slug: z.string().min(1, "Slug is required").max(500, "Slug too long")
    .regex(/^[A-Za-z0-9\-._~%!$&'()*+,;=:@]+$/, "Slug contains invalid characters"),
  content: z.string().min(1, "Content is required").max(50000, "Content too long"),
  excerpt: z.string().max(500, "Excerpt too long").optional().or(z.literal("")), // Made optional
  author: z.string().min(1, "Author is required").max(100, "Author name too long"),
  publishedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  category: z.enum(['Zindagi', 'Society', 'Parvarish', 'Sehat', 'Ghar ki baat', 'Dil se', 'Kahani'], {
    errorMap: () => ({ message: "Please select a valid category" })
  }),
  tags: z.array(z.string().min(1).max(50)).max(10, "Too many tags").default([]),
  featuredImage: z.string().url().optional().or(z.literal("")),
  status: z.enum(['draft', 'published', 'scheduled']),
  views: z.number().int().min(0).default(0),
  readTime: z.number().int().min(0).default(0),
  isDraft: z.boolean().default(true),
});


// Comment Validation Schema
export const CommentSchema = z.object({
  id: z.string().uuid().optional(),
  postId: z.string().uuid("Invalid post ID"),
  author: z.string().min(1, "Name is required").max(100, "Name too long")
    .regex(/^[a-zA-Z\s\u0900-\u097F]+$/, "Name contains invalid characters"),
  email: z.string().email("Invalid email address").max(100, "Email too long"),
  content: z.string().min(1, "Comment is required").max(1000, "Comment too long"),
  createdAt: z.string().datetime().optional(),
  approved: z.boolean().default(false),
});

// Site Settings Validation Schema
export const SiteSettingsSchema = z.object({
  siteName: z.string().min(1, "Site name is required").max(100, "Site name too long"),
  tagline: z.string().min(1, "Tagline is required").max(200, "Tagline too long"),
  welcomeMessage: z.string().min(1, "Welcome message is required").max(500, "Welcome message too long"),
  aboutSection: z.string().min(1, "About section is required").max(2000, "About section too long"),
  authorName: z.string().min(1, "Author name is required").max(100, "Author name too long"),
  authorBio: z.string().min(1, "Author bio is required").max(500, "Author bio too long"),
  socialLinks: z.object({
    twitter: z.string().url("Invalid Twitter URL").optional().or(z.literal("")),
    linkedin: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
    github: z.string().url("Invalid GitHub URL").optional().or(z.literal("")),
  }).default({}),
});

// File Upload Validation Schema
export const FileUploadSchema = z.object({
  size: z.number().max(5 * 1024 * 1024, "File size must be less than 5MB"),
  type: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif'], {
    errorMap: () => ({ message: "Only JPEG, PNG, WebP, and GIF images are allowed" })
  }),
});

// Validation Helper Functions
export function validateBlogPost(data: unknown) {
  return BlogPostSchema.safeParse(data);
}

export function validateComment(data: unknown) {
  return CommentSchema.safeParse(data);
}

export function validateSiteSettings(data: unknown) {
  return SiteSettingsSchema.safeParse(data);
}

export function validateFileUpload(file: { size: number; type: string }) {
  return FileUploadSchema.safeParse(file);
}

// Bulk validation for arrays
export function validateBlogPosts(data: unknown[]) {
  const results = data.map(item => BlogPostSchema.safeParse(item));
  const errors = results.filter(result => !result.success);
  const validPosts = results.filter(result => result.success).map(result => result.data);
  
  return {
    success: errors.length === 0,
    validPosts,
    errors: errors.map(error => error.error.issues),
  };
}

export function validateComments(data: unknown[]) {
  const results = data.map(item => CommentSchema.safeParse(item));
  const errors = results.filter(result => !result.success);
  const validComments = results.filter(result => result.success).map(result => result.data);
  
  return {
    success: errors.length === 0,
    validComments,
    errors: errors.map(error => error.error.issues),
  };
}
