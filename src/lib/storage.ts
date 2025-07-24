import fs from 'fs';
import path from 'path';
import { BlogPost, Comment, SiteSettings, Analytics } from './types';

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
// In src/lib/storage.ts - find and replace the defaultSettings:

const defaultSettings: SiteSettings = {
  siteName: "Author's Corner",
  tagline: "जहाँ कहानियाँ जिंदगी बन जाती हैं", // Where stories become life
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
    
    // Check if file is empty or contains invalid JSON
    const content = fs.readFileSync(filePath, 'utf-8').trim();
    if (!content) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
      return;
    }
    
    // Test if content is valid JSON
    JSON.parse(content);
  } catch (error) {
    // If any error occurs, reinitialize with default data
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
  // Helper method to ensure valid JSON file
  private static ensureValidJsonFile(filePath: string, defaultData: any): void {
    try {
      const data = fs.readFileSync(filePath, 'utf-8').trim();
      if (!data) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
      } else {
        JSON.parse(data); // Test if valid JSON
      }
    } catch (error) {
      // If file doesn't exist or invalid JSON, create with defaults
      console.warn(`Fixing corrupted file ${filePath}:`, error);
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
  }

  // Posts methods
  static async getPosts(): Promise<BlogPost[]> {
    try {
      this.ensureValidJsonFile(POSTS_FILE, []);
      const data = fs.readFileSync(POSTS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading posts:', error);
      return [];
    }
  }

  static async savePosts(posts: BlogPost[]): Promise<void> {
    try {
      fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
    } catch (error) {
      console.error('Error saving posts:', error);
      throw new Error('Failed to save posts');
    }
  }

  // Comments methods
  static async getComments(): Promise<Comment[]> {
    try {
      this.ensureValidJsonFile(COMMENTS_FILE, []);
      const data = fs.readFileSync(COMMENTS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading comments:', error);
      return [];
    }
  }

  static async saveComments(comments: Comment[]): Promise<void> {
    try {
      fs.writeFileSync(COMMENTS_FILE, JSON.stringify(comments, null, 2));
    } catch (error) {
      console.error('Error saving comments:', error);
      throw new Error('Failed to save comments');
    }
  }

  // Settings methods
  static async getSettings(): Promise<SiteSettings> {
    try {
      this.ensureValidJsonFile(SETTINGS_FILE, defaultSettings);
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading settings:', error);
      return defaultSettings;
    }
  }

  static async saveSettings(settings: SiteSettings): Promise<void> {
    try {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
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

  // Utility methods
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

  // Backup and restore methods
  static async createBackup(): Promise<string> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(DATA_DIR, 'backups');
      
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      const backupFile = path.join(backupDir, `backup-${timestamp}.json`);
      const backupData = {
        posts: await this.getPosts(),
        comments: await this.getComments(),
        settings: await this.getSettings(),
        analytics: await this.getAnalytics(),
        timestamp: new Date().toISOString()
      };

      fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
      return backupFile;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw new Error('Failed to create backup');
    }
  }

  static async restoreFromBackup(backupFilePath: string): Promise<void> {
    try {
      const backupData = JSON.parse(fs.readFileSync(backupFilePath, 'utf-8'));
      
      if (backupData.posts) await this.savePosts(backupData.posts);
      if (backupData.comments) await this.saveComments(backupData.comments);
      if (backupData.settings) await this.saveSettings(backupData.settings);
      if (backupData.analytics) await this.saveAnalytics(backupData.analytics);
      
      console.log(`Restored from backup: ${backupFilePath}`);
    } catch (error) {
      console.error('Error restoring from backup:', error);
      throw new Error('Failed to restore from backup');
    }
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
export default DataStorage;