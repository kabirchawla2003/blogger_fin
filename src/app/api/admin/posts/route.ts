// src/app/api/admin/posts/route.ts (ENHANCED VERSION)
import { NextRequest, NextResponse } from 'next/server';
import { DataStorage } from '@/lib/storage';
import { validateAuth } from '@/lib/auth';
import { validateBlogPost } from '@/lib/validation';
import { sanitizeBlogPost } from '@/lib/sanitization';
import { v4 as uuidv4 } from 'uuid';

// GET method - Fetch all posts for admin
export async function GET(request: NextRequest) {
  if (!validateAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const posts = await DataStorage.getPosts();
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts for admin:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// POST method - Create new post with validation
export async function POST(request: NextRequest) {
  if (!validateAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rawPostData = await request.json();
    
    // Sanitize input
    const sanitizedData = sanitizeBlogPost(rawPostData);
    
    // Validate input
    const validation = validateBlogPost({
      ...sanitizedData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      isDraft: sanitizedData.status === 'draft',
    });

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: validation.error.issues 
      }, { status: 400 });
    }

    const posts = await DataStorage.getPosts();
    posts.push(validation.data);
    await DataStorage.savePosts(posts);

    return NextResponse.json(validation.data);
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}

// PUT method - Update existing post with validation
export async function PUT(request: NextRequest) {
  if (!validateAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rawPostData = await request.json();
    
    // Sanitize input
    const sanitizedData = sanitizeBlogPost(rawPostData);
    
    // Validate input
    const validation = validateBlogPost({
      ...sanitizedData,
      updatedAt: new Date().toISOString(),
      isDraft: sanitizedData.status === 'draft',
    });

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: validation.error.issues 
      }, { status: 400 });
    }

    const posts = await DataStorage.getPosts();
    const postIndex = posts.findIndex(p => p.id === validation.data.id);
    
    if (postIndex === -1) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    posts[postIndex] = {
      ...posts[postIndex],
      ...validation.data,
    };

    await DataStorage.savePosts(posts);
    return NextResponse.json(posts[postIndex]);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}
