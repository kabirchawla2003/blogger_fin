// app/api/comments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { DataStorage } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const commentData = await request.json();
    const comments = await DataStorage.getComments();
    
    const newComment = {
      ...commentData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      approved: false, // Comments need approval
    };

    comments.push(newComment);
    await DataStorage.saveComments(comments);

    return NextResponse.json(newComment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}
