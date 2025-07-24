import { NextRequest, NextResponse } from 'next/server';
import { DataStorage } from '@/lib/storage';
import { validateAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  if (!validateAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const comments = await DataStorage.getComments();
    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}
