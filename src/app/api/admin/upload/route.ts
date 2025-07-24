import { NextRequest, NextResponse } from 'next/server';
import { validateAuth } from '@/lib/auth';
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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExtension = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);

    await writeFile(filePath, buffer);

    const url = `/uploads/${fileName}`;
    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
