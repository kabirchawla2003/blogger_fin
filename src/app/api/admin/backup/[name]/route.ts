// src/app/api/admin/backup/[name]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateAuth } from '@/lib/auth';
import { BackupManager } from '@/lib/backup';

// DELETE - Delete specific backup
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  if (!validateAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name } = await params;
    const decodedName = decodeURIComponent(name);

    await BackupManager.deleteBackup(decodedName);

    return NextResponse.json({
      success: true,
      message: `Backup deleted: ${decodedName}`,
    });
  } catch (error) {
    console.error('Error deleting backup:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to delete backup' 
    }, { status: 500 });
  }
}
