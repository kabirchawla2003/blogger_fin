import { NextRequest, NextResponse } from 'next/server';
import { DataStorage } from '@/lib/storage';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Await params first
    const posts = await DataStorage.getPosts();
    const postIndex = posts.findIndex(p => p.id === id);
    
    if (postIndex === -1) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    posts[postIndex].views = (posts[postIndex].views || 0) + 1;
    await DataStorage.savePosts(posts);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to track view' }, { status: 500 });
  }
}
