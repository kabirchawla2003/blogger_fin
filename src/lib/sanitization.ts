// src/lib/sanitization.ts
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Create a JSDOM window for server-side DOMPurify
const window = new JSDOM('').window;
const purify = DOMPurify(window as any);

// Configure DOMPurify for different content types
const htmlConfig = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 
    'code', 'pre', 'img'
  ],
  ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target'],
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
};

const markdownConfig = {
  ALLOWED_TAGS: ['*'],
  KEEP_CONTENT: true,
  ALLOWED_ATTR: [],
};

// Sanitization Functions
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  return purify.sanitize(html, htmlConfig);
}

export function sanitizeMarkdown(markdown: string): string {
  if (!markdown) return '';
  // For markdown, we're more permissive but still remove dangerous scripts
  return purify.sanitize(markdown, {
    ...markdownConfig,
    FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input'],
  });
}

export function sanitizeText(text: string): string {
  if (!text) return '';
  // Strip all HTML tags and decode entities
  return purify.sanitize(text, { 
    ALLOWED_TAGS: [], 
    KEEP_CONTENT: true 
  }).trim();
}

export function sanitizeUrl(url: string): string {
  if (!url) return '';
  
  try {
    const parsedUrl = new URL(url);
    // Only allow http, https, and mailto protocols
    if (['http:', 'https:', 'mailto:'].includes(parsedUrl.protocol)) {
      return parsedUrl.toString();
    }
    return '';
  } catch {
    return '';
  }
}

// Blog Post Sanitization
export function sanitizeBlogPost(post: any) {
  return {
    ...post,
    title: sanitizeText(post.title),
    slug: sanitizeText(post.slug).toLowerCase().replace(/[^a-z0-9-]/g, ''),
    content: sanitizeMarkdown(post.content),
    excerpt: sanitizeText(post.excerpt),
    author: sanitizeText(post.author),
    category: sanitizeText(post.category),
    tags: post.tags?.map((tag: string) => sanitizeText(tag)).filter(Boolean) || [],
    featuredImage: post.featuredImage ? sanitizeUrl(post.featuredImage) : undefined,
  };
}

// Comment Sanitization
export function sanitizeComment(comment: any) {
  return {
    ...comment,
    author: sanitizeText(comment.author),
    email: sanitizeText(comment.email).toLowerCase(),
    content: sanitizeText(comment.content),
  };
}

// Site Settings Sanitization
export function sanitizeSiteSettings(settings: any) {
  return {
    ...settings,
    siteName: sanitizeText(settings.siteName),
    tagline: sanitizeText(settings.tagline),
    welcomeMessage: sanitizeText(settings.welcomeMessage),
    aboutSection: sanitizeMarkdown(settings.aboutSection),
    authorName: sanitizeText(settings.authorName),
    authorBio: sanitizeText(settings.authorBio),
    socialLinks: {
      twitter: settings.socialLinks?.twitter ? sanitizeUrl(settings.socialLinks.twitter) : '',
      linkedin: settings.socialLinks?.linkedin ? sanitizeUrl(settings.socialLinks.linkedin) : '',
      github: settings.socialLinks?.github ? sanitizeUrl(settings.socialLinks.github) : '',
    },
  };
}

// File name sanitization
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}
