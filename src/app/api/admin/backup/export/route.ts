// src/app/api/admin/backup/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateAuth } from '@/lib/auth';
import { BackupManager } from '@/lib/backup';

// GET - Export all data
export async function GET(request: NextRequest) {
  if (!validateAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const exportPath = await BackupManager.exportData();
    const fs = require('fs');
    const fileContent = fs.readFileSync(exportPath);

    const fileName = `ghar-nari-export-${new Date().toISOString().split('T')[0]}.json`;

    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to export data' 
    }, { status: 500 });
  }
}
