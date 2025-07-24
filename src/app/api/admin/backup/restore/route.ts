// src/app/api/admin/backup/restore/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateAuth } from '@/lib/auth';
import { BackupManager } from '@/lib/backup';

// POST - Restore from backup
export async function POST(request: NextRequest) {
  if (!validateAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { backupName } = await request.json();

    if (!backupName) {
      return NextResponse.json({ error: 'Backup name is required' }, { status: 400 });
    }

    await BackupManager.restoreFromBackup(backupName);

    return NextResponse.json({
      success: true,
      message: `Successfully restored from backup: ${backupName}`,
    });
  } catch (error) {
    console.error('Error restoring backup:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to restore backup' 
    }, { status: 500 });
  }
}
