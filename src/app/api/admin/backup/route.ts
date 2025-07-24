// src/app/api/admin/backup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateAuth } from '@/lib/auth';
import { BackupManager } from '@/lib/backup';
import { DataStorage } from '@/lib/storage';

// GET - List all backups
export async function GET(request: NextRequest) {
  if (!validateAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const backups = await BackupManager.listBackups();
    const lastBackup = backups.length > 0 ? backups[0].created : null;

    return NextResponse.json({
      backups,
      lastBackup,
      count: backups.length,
    });
  } catch (error) {
    console.error('Error listing backups:', error);
    return NextResponse.json({ error: 'Failed to list backups' }, { status: 500 });
  }
}

// POST - Create new backup
export async function POST(request: NextRequest) {
  if (!validateAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const backupPath = await BackupManager.createBackup();
    const fileName = backupPath.split('/').pop() || 'unknown';

    return NextResponse.json({
      success: true,
      message: 'Backup created successfully',
      fileName,
      path: backupPath,
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to create backup' 
    }, { status: 500 });
  }
}
