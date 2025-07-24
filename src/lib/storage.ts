// src/lib/storage.ts
import fs from 'fs';
import path from 'path';
import { BlogPost, Comment, SiteSettings, Analytics } from './types';
import { validateBlogPost, validateComment, validateSiteSettings } from './validation';
import { sanitizeBlogPost, sanitizeComment, sanitizeSiteSettings } from './sanitization';

const DATA_DIR = path.join(process.cwd(), 'data');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
const COMMENTS_FILE = path.join(DATA_DIR, 'comments.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default data structures
const defaultSettings: SiteSettings = {
  siteName: "Ghar nari",
  tagline: "जहाँ कहानियाँ जिंदगी बन जाती हैं",
  welcomeMessage: "Welcome to my literary sanctuary - a space where life's stories unfold",
  aboutSection: "I'm a passionate writer exploring the depths of human experience through words, capturing the essence of life, society, and the stories that connect us all.",
  authorName: "Author Name",
  authorBio: "A storyteller at heart, weaving narratives from life's beautiful moments - from home to heart, from society to soul.",
  socialLinks: {}
};

// Initialize files if they don't exist or are empty
const initializeFile = (filePath: string, defaultData: any) => {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf-8').trim();
    if (!content) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
      return;
    }
    
    // Test if content is valid JSON
    JSON.parse(content);
  } catch (error) {
    console.warn(`Reinitializing ${filePath} due to corruption:`, error);
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
};

// Initialize all files
initializeFile(POSTS_FILE, []);
initializeFile(COMMENTS_FILE, []);
initializeFile(SETTINGS_FILE, defaultSettings);
initializeFile(ANALYTICS_FILE, []);

export class DataStorage {
  // Helper method to ensure valid JSON file with validation
  private static ensureValidJsonFile(filePath: string, defaultData: any, validator?: (data: any) => any): void {
    try {
      const data = fs.readFileSync(filePath, 'utf-8').trim();
      if (!data) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
      } else {
        const parsed = JSON.parse(data);
        if (validator) {
          validator(parsed);
        }
      }
    } catch (error) {
      console.warn(`Fixing corrupted file ${filePath}:`, error);
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
  }

  // Posts methods with validation and sanitization
  static async getPosts(): Promise<BlogPost[]> {
    try {
      this.ensureValidJsonFile(POSTS_FILE, []);
      const data = fs.readFileSync(POSTS_FILE, 'utf-8');
      const posts = JSON.parse(data);
      
      // Validate and sanitize posts
      const validatedPosts = posts.map((post: any) => {
        const sanitized = sanitizeBlogPost(post);
        const validation = validateBlogPost(sanitized);
        
        if (validation.success) {
          return validation.data;
        } else {
          console.warn(`Invalid post data for ${post.id}:`, validation.error.issues);
          // Return a corrected version or filter out
          return null;
        }
      }).filter(Boolean);
      
      return validatedPosts;
    } catch (error) {
      console.error('Error reading posts:', error);
      return [];
    }
  }

  static async savePosts(posts: BlogPost[]): Promise<void> {
    try {
      // Validate and sanitize before saving
      const processedPosts = posts.map((post) => {
        const sanitized = sanitizeBlogPost(post);
        const validation = validateBlogPost(sanitized);
        
        if (!validation.success) {
          throw new Error(`Invalid post data: ${validation.error.issues.map(i => i.message).join(', ')}`);
        }
        
        return validation.data;
      });

      fs.writeFileSync(POSTS_FILE, JSON.stringify(processedPosts, null, 2));
    } catch (error) {
      console.error('Error saving posts:', error);
      throw new Error('Failed to save posts');
    }
  }

  // Comments methods with validation and sanitization
  static async getComments(): Promise<Comment[]> {
    try {
      this.ensureValidJsonFile(COMMENTS_FILE, []);
      const data = fs.readFileSync(COMMENTS_FILE, 'utf-8');
      const comments = JSON.parse(data);
      
      const validatedComments = comments.map((comment: any) => {
        const sanitized = sanitizeComment(comment);
        const validation = validateComment(sanitized);
        
        if (validation.success) {
          return validation.data;
        } else {
          console.warn(`Invalid comment data for ${comment.id}:`, validation.error.issues);
          return null;
        }
      }).filter(Boolean);
      
      return validatedComments;
    } catch (error) {
      console.error('Error reading comments:', error);
      return [];
    }
  }

  static async saveComments(comments: Comment[]): Promise<void> {
    try {
      const processedComments = comments.map((comment) => {
        const sanitized = sanitizeComment(comment);
        const validation = validateComment(sanitized);
        
        if (!validation.success) {
          throw new Error(`Invalid comment data: ${validation.error.issues.map(i => i.message).join(', ')}`);
        }
        
        return validation.data;
      });

      fs.writeFileSync(COMMENTS_FILE, JSON.stringify(processedComments, null, 2));
    } catch (error) {
      console.error('Error saving comments:', error);
      throw new Error('Failed to save comments');
    }
  }

  // Settings methods with validation and sanitization
  static async getSettings(): Promise<SiteSettings> {
    try {
      this.ensureValidJsonFile(SETTINGS_FILE, defaultSettings);
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      const settings = JSON.parse(data);
      
      const sanitized = sanitizeSiteSettings(settings);
      const validation = validateSiteSettings(sanitized);
      
      if (validation.success) {
        return validation.data;
      } else {
        console.warn('Invalid settings data, using defaults:', validation.error.issues);
        return defaultSettings;
      }
    } catch (error) {
      console.error('Error reading settings:', error);
      return defaultSettings;
    }
  }

  static async saveSettings(settings: SiteSettings): Promise<void> {
    try {
      const sanitized = sanitizeSiteSettings(settings);
      const validation = validateSiteSettings(sanitized);
      
      if (!validation.success) {
        throw new Error(`Invalid settings data: ${validation.error.issues.map(i => i.message).join(', ')}`);
      }

      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(validation.data, null, 2));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw new Error('Failed to save settings');
    }
  }

  // Analytics methods
  static async getAnalytics(): Promise<Analytics[]> {
    try {
      this.ensureValidJsonFile(ANALYTICS_FILE, []);
      const data = fs.readFileSync(ANALYTICS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading analytics:', error);
      return [];
    }
  }

  static async saveAnalytics(analytics: Analytics[]): Promise<void> {
    try {
      fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(analytics, null, 2));
    } catch (error) {
      console.error('Error saving analytics:', error);
      throw new Error('Failed to save analytics');
    }
  }

  // Enhanced utility methods
  static async getPostById(id: string): Promise<BlogPost | null> {
    try {
      const posts = await this.getPosts();
      return posts.find(post => post.id === id) || null;
    } catch (error) {
      console.error('Error getting post by ID:', error);
      return null;
    }
  }

  static async getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const posts = await this.getPosts();
      return posts.find(post => post.slug === slug && post.status === 'published') || null;
    } catch (error) {
      console.error('Error getting post by slug:', error);
      return null;
    }
  }

  static async getPublishedPosts(): Promise<BlogPost[]> {
    try {
      const posts = await this.getPosts();
      return posts.filter(post => post.status === 'published');
    } catch (error) {
      console.error('Error getting published posts:', error);
      return [];
    }
  }

  static async getCommentsByPostId(postId: string): Promise<Comment[]> {
    try {
      const comments = await this.getComments();
      return comments.filter(comment => comment.postId === postId);
    } catch (error) {
      console.error('Error getting comments by post ID:', error);
      return [];
    }
  }

  static async incrementPostViews(postId: string): Promise<void> {
    try {
      const posts = await this.getPosts();
      const postIndex = posts.findIndex(post => post.id === postId);
      
      if (postIndex !== -1) {
        posts[postIndex].views = (posts[postIndex].views || 0) + 1;
        await this.savePosts(posts);
      }
    } catch (error) {
      console.error('Error incrementing post views:', error);
    }
  }

  // Data integrity check
  static async performIntegrityCheck(): Promise<{ status: string; issues: string[] }> {
    const issues: string[] = [];

    try {
      // Check posts
      const posts = await this.getPosts();
      posts.forEach((post, index) => {
        if (!post.id || !post.title || !post.slug) {
          issues.push(`Post at index ${index} is missing required fields`);
        }
      });

      // Check comments
      const comments = await this.getComments();
      comments.forEach((comment, index) => {
        if (!comment.id || !comment.postId || !comment.author) {
          issues.push(`Comment at index ${index} is missing required fields`);
        }
      });

      // Check settings
      const settings = await this.getSettings();
      if (!settings.siteName || !settings.authorName) {
        issues.push('Site settings are missing required fields');
      }

    } catch (error) {
      issues.push(`Integrity check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      status: issues.length === 0 ? 'healthy' : 'issues_found',
      issues,
    };
  }

  // Cleanup orphaned comments
  static async cleanupOrphanedComments(): Promise<{ removed: number; remaining: number }> {
    try {
      const posts = await this.getPosts();
      const comments = await this.getComments();
      const postIds = new Set(posts.map(post => post.id));
      
      const validComments = comments.filter(comment => postIds.has(comment.postId));
      const orphanedCount = comments.length - validComments.length;
      
      if (orphanedCount > 0) {
        await this.saveComments(validComments);
        console.log(`🧹 Cleaned up ${orphanedCount} orphaned comments`);
      }
      
      return {
        removed: orphanedCount,
        remaining: validComments.length,
      };
    } catch (error) {
      console.error('Error cleaning up orphaned comments:', error);
      throw error;
    }
  }

  // Backup integration methods - using dynamic imports to avoid circular dependency
  static async createBackup(): Promise<string> {
    const { BackupManager } = await import('./backup');
    return BackupManager.createBackup();
  }

  static async restoreFromBackup(backupFileName: string): Promise<void> {
    const { BackupManager } = await import('./backup');
    return BackupManager.restoreFromBackup(backupFileName);
  }

  static async listBackups() {
    const { BackupManager } = await import('./backup');
    return BackupManager.listBackups();
  }

  // Health check method
  static async healthCheck(): Promise<{ status: string; files: any }> {
    const fileStatus = {
      posts: false,
      comments: false,
      settings: false,
      analytics: false
    };

    try {
      await this.getPosts();
      fileStatus.posts = true;
    } catch (error) {
      console.error('Posts file health check failed:', error);
    }

    try {
      await this.getComments();
      fileStatus.comments = true;
    } catch (error) {
      console.error('Comments file health check failed:', error);
    }

    try {
      await this.getSettings();
      fileStatus.settings = true;
    } catch (error) {
      console.error('Settings file health check failed:', error);
    }

    try {
      await this.getAnalytics();
      fileStatus.analytics = true;
    } catch (error) {
      console.error('Analytics file health check failed:', error);
    }

    const allHealthy = Object.values(fileStatus).every(status => status === true);
    
    return {
      status: allHealthy ? 'healthy' : 'degraded',
      files: fileStatus
    };
  }
}
