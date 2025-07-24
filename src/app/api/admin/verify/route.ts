import { NextRequest, NextResponse } from 'next/server';
import { validateAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  if (validateAuth(request)) {
    return NextResponse.json({ authenticated: true });
  }
  
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}