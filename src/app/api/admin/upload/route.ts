// src/app/api/admin/upload/route.ts (ENHANCED VERSION)
import { NextRequest, NextResponse } from 'next/server';
import { validateAuth } from '@/lib/auth';
import { validateFileUpload } from '@/lib/validation';
import { sanitizeFileName } from '@/lib/sanitization';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  if (!validateAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file
    const fileValidation = validateFileUpload({
      size: file.size,
      type: file.type,
    });

    if (!fileValidation.success) {
      return NextResponse.json({ 
        error: 'File validation failed',
        details: fileValidation.error.issues 
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize and generate unique filename
    const fileExtension = path.extname(file.name);
    const sanitizedBaseName = sanitizeFileName(path.basename(file.name, fileExtension));
    const uniqueFileName = `${sanitizedBaseName}-${uuidv4()}${fileExtension}`;
    
    const filePath = path.join(process.cwd(), 'public', 'uploads', uniqueFileName);
    await writeFile(filePath, buffer);

    const url = `/uploads/${uniqueFileName}`;
    
    console.log(`✅ Image uploaded: ${uniqueFileName} (${file.size} bytes)`);
    
    return NextResponse.json({ 
      url,
      fileName: uniqueFileName,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
