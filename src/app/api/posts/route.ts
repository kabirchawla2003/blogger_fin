import { NextRequest, NextResponse } from 'next/server';
import { DataStorage } from '@/lib/storage';

export async function GET() {
  try {
    const posts = await DataStorage.getPosts();
    const publishedPosts = posts.filter(post => post.status === 'published');
    return NextResponse.json(publishedPosts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}