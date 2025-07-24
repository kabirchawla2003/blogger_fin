// src/app/api/admin/posts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { DataStorage } from '@/lib/storage';
import { validateAuth } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

// DELETE method - Delete a post, its image, and all associated comments
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validateAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params; // Await params first
    const posts = await DataStorage.getPosts();
    const postToDelete = posts.find(p => p.id === id);
    
    if (!postToDelete) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // 🔥 NEW: Delete all comments associated with this post
    let commentsDeleted = 0;
    let commentError = null;

    try {
      const allComments = await DataStorage.getComments();
      const remainingComments = allComments.filter(comment => comment.postId !== id);
      commentsDeleted = allComments.length - remainingComments.length;
      
      if (commentsDeleted > 0) {
        await DataStorage.saveComments(remainingComments);
        console.log(`Deleted ${commentsDeleted} comments for post ${id}`);
      }
    } catch (error) {
      commentError = error;
      console.warn(`Failed to delete comments for post ${id}:`, error);
      // Continue with post deletion even if comment deletion fails
    }

    // Delete associated image file if it exists
    let imageDeleted = false;
    let imageError = null;

    if (postToDelete.featuredImage) {
      try {
        const imageUrl = postToDelete.featuredImage;
        
        // Only delete if it's a local upload (starts with /uploads/)
        if (imageUrl.startsWith('/uploads/')) {
          const imagePath = path.join(process.cwd(), 'public', imageUrl);
          
          // Check if file exists before attempting deletion
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
            imageDeleted = true;
            console.log(`Successfully deleted image: ${imagePath}`);
          } else {
            console.warn(`Image file not found: ${imagePath}`);
          }
        } else {
          console.log(`Skipping deletion of external image: ${imageUrl}`);
        }
      } catch (error) {
        imageError = error;
        console.warn(`Failed to delete image for post ${id}:`, error);
        // Continue with post deletion even if image deletion fails
      }
    }

    // Delete the post from the array
    const filteredPosts = posts.filter(p => p.id !== id);
    await DataStorage.savePosts(filteredPosts);

    // Prepare comprehensive response
    const response = {
      success: true,
      message: 'Post and associated data deleted successfully',
      postTitle: postToDelete.title,
      commentsDeleted,
      imageDeleted,
      details: {
        post: 'deleted',
        comments: commentsDeleted > 0 ? `${commentsDeleted} deleted` : 'none found',
        image: imageDeleted ? 'deleted' : 'none or external',
      },
      errors: {
        commentError: commentError ? commentError.message : null,
        imageError: imageError ? imageError.message : null,
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ 
      error: 'Failed to delete post',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET method - Fetch a specific post for editing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validateAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const posts = await DataStorage.getPosts();
    const post = posts.find(p => p.id === id);
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

// PUT method - Update an existing post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validateAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const postData = await request.json();
    const posts = await DataStorage.getPosts();
    const postIndex = posts.findIndex(p => p.id === id);
    
    if (postIndex === -1) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Get the old post data to check for image changes
    const oldPost = posts[postIndex];
    const oldImage = oldPost.featuredImage;
    const newImage = postData.featuredImage;

    // If the featured image has changed, delete the old one
    if (oldImage && oldImage !== newImage && oldImage.startsWith('/uploads/')) {
      try {
        const oldImagePath = path.join(process.cwd(), 'public', oldImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log(`Deleted old image: ${oldImagePath}`);
        }
      } catch (imageError) {
        console.warn(`Failed to delete old image ${oldImage}:`, imageError);
      }
    }

    // Update the post
    posts[postIndex] = {
      ...posts[postIndex],
      ...postData,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
      isDraft: postData.status === 'draft',
    };

    await DataStorage.savePosts(posts);
    return NextResponse.json(posts[postIndex]);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

// PATCH method - Partially update a post
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validateAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const updates = await request.json();
    const posts = await DataStorage.getPosts();
    const postIndex = posts.findIndex(p => p.id === id);
    
    if (postIndex === -1) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Apply partial updates
    posts[postIndex] = {
      ...posts[postIndex],
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };

    // Handle status-specific logic
    if (updates.status) {
      if (updates.status === 'published' && !posts[postIndex].publishedAt) {
        posts[postIndex].publishedAt = new Date().toISOString();
      } else if (updates.status === 'draft') {
        posts[postIndex].publishedAt = null;
      }
      posts[postIndex].isDraft = updates.status === 'draft';
    }

    await DataStorage.savePosts(posts);
    return NextResponse.json(posts[postIndex]);
  } catch (error) {
    console.error('Error patching post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}
