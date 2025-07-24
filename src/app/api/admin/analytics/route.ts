import { NextRequest, NextResponse } from 'next/server';
import { DataStorage } from '@/lib/storage';
import { validateAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  if (!validateAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const posts = await DataStorage.getPosts();
    const comments = await DataStorage.getComments();
    
    const publishedPosts = posts.filter(post => post.status === 'published');
    const totalViews = publishedPosts.reduce((sum, post) => sum + (post.views || 0), 0);
    
    const topPosts = publishedPosts
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map(post => ({
        id: post.id,
        title: post.title,
        views: post.views || 0,
        slug: post.slug,
      }));

    return NextResponse.json({
      totalViews,
      totalPosts: publishedPosts.length,
      totalComments: comments.filter(c => c.approved).length,
      topPosts,
      recentActivity: [],
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
export async function POST(request: NextRequest) {
  if (!validateAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}