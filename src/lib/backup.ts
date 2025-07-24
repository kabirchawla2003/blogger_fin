// src/lib/backup.ts
import fs from 'fs';
import path from 'path';
import { DataStorage } from './storage';

const BACKUP_DIR = path.join(process.cwd(), 'data', 'backups');
const MAX_BACKUPS = 30; // Keep last 30 days

export interface BackupData {
  posts: any[];
  comments: any[];
  settings: any;
  analytics: any[];
  timestamp: string;
  version: string;
}

export class BackupManager {
  static async ensureBackupDirectory(): Promise<void> {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
  }

  static async createBackup(): Promise<string> {
    try {
      await this.ensureBackupDirectory();

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `backup-${timestamp}.json`;
      const backupFilePath = path.join(BACKUP_DIR, backupFileName);

      // Gather all data
      const backupData: BackupData = {
        posts: await DataStorage.getPosts(),
        comments: await DataStorage.getComments(),
        settings: await DataStorage.getSettings(),
        analytics: await DataStorage.getAnalytics(),
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      };

      // Write backup file
      fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2));

      // Clean up old backups
      await this.cleanupOldBackups();

      console.log(`✅ Backup created successfully: ${backupFileName}`);
      return backupFilePath;
    } catch (error) {
      console.error('❌ Backup creation failed:', error);
      throw new Error(`Backup creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async restoreFromBackup(backupFileName: string): Promise<void> {
    try {
      const backupFilePath = path.join(BACKUP_DIR, backupFileName);
      
      if (!fs.existsSync(backupFilePath)) {
        throw new Error(`Backup file not found: ${backupFileName}`);
      }

      const backupContent = fs.readFileSync(backupFilePath, 'utf-8');
      const backupData: BackupData = JSON.parse(backupContent);

      // Validate backup data structure
      if (!backupData.posts || !backupData.comments || !backupData.settings) {
        throw new Error('Invalid backup file structure');
      }

      // Create a restore point before restoring
      await this.createBackup();

      // Restore data
      await DataStorage.savePosts(backupData.posts);
      await DataStorage.saveComments(backupData.comments);
      await DataStorage.saveSettings(backupData.settings);
      
      if (backupData.analytics) {
        await DataStorage.saveAnalytics(backupData.analytics);
      }

      console.log(`✅ Successfully restored from backup: ${backupFileName}`);
    } catch (error) {
      console.error('❌ Backup restoration failed:', error);
      throw new Error(`Backup restoration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async listBackups(): Promise<Array<{name: string, size: number, created: Date}>> {
    try {
      await this.ensureBackupDirectory();
      
      const files = fs.readdirSync(BACKUP_DIR)
        .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
        .map(file => {
          const filePath = path.join(BACKUP_DIR, file);
          const stats = fs.statSync(filePath);
          
          return {
            name: file,
            size: stats.size,
            created: stats.birthtime,
          };
        })
        .sort((a, b) => b.created.getTime() - a.created.getTime());

      return files;
    } catch (error) {
      console.error('❌ Failed to list backups:', error);
      return [];
    }
  }

  static async deleteBackup(backupFileName: string): Promise<void> {
    try {
      const backupFilePath = path.join(BACKUP_DIR, backupFileName);
      
      if (fs.existsSync(backupFilePath)) {
        fs.unlinkSync(backupFilePath);
        console.log(`✅ Backup deleted: ${backupFileName}`);
      }
    } catch (error) {
      console.error(`❌ Failed to delete backup ${backupFileName}:`, error);
      throw error;
    }
  }

  static async cleanupOldBackups(): Promise<void> {
    try {
      const backups = await this.listBackups();
      
      if (backups.length > MAX_BACKUPS) {
        const backupsToDelete = backups.slice(MAX_BACKUPS);
        
        for (const backup of backupsToDelete) {
          await this.deleteBackup(backup.name);
        }
        
        console.log(`🧹 Cleaned up ${backupsToDelete.length} old backups`);
      }
    } catch (error) {
      console.error('❌ Backup cleanup failed:', error);
    }
  }

  static async exportData(): Promise<string> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const exportFileName = `export-${timestamp}.json`;
      const exportFilePath = path.join(process.cwd(), 'data', exportFileName);

      const exportData = {
        posts: await DataStorage.getPosts(),
        comments: await DataStorage.getComments(),
        settings: await DataStorage.getSettings(),
        analytics: await DataStorage.getAnalytics(),
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
      };

      fs.writeFileSync(exportFilePath, JSON.stringify(exportData, null, 2));
      console.log(`📤 Data exported to: ${exportFileName}`);
      
      return exportFilePath;
    } catch (error) {
      console.error('❌ Data export failed:', error);
      throw error;
    }
  }

  static async scheduleBackup(): Promise<void> {
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setDate(nextMidnight.getDate() + 1);
    nextMidnight.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = nextMidnight.getTime() - now.getTime();
    
    setTimeout(async () => {
      await this.createBackup();
      // Schedule next backup in 24 hours
      setInterval(async () => {
        await this.createBackup();
      }, 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);
    
    console.log(`⏰ Daily backup scheduled for midnight (${Math.round(timeUntilMidnight / 1000 / 60)} minutes from now)`);
  }
}

