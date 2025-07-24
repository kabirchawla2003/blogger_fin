// src/app/api/comments/[postId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { DataStorage } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params; // Await params first
    const comments = await DataStorage.getComments();
    const postComments = comments.filter(comment => comment.postId === postId);
    return NextResponse.json(postComments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}
