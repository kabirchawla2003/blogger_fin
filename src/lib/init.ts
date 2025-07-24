// src/lib/init.ts
import { BackupManager } from './backup';

let initialized = false;

export async function initializeBackupSystem() {
  if (initialized) return;
  
  try {
    await BackupManager.scheduleBackup();
    initialized = true;
    console.log('✅ Backup system initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize backup system:', error);
  }
}
