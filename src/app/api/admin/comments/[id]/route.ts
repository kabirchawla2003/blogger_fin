import { NextRequest, NextResponse } from 'next/server';
import { DataStorage } from '@/lib/storage';
import { validateAuth } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!validateAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { approved } = await request.json();
    const comments = await DataStorage.getComments();
    const commentIndex = comments.findIndex(c => c.id === params.id);
    
    if (commentIndex === -1) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    comments[commentIndex].approved = approved;
    await DataStorage.saveComments(comments);

    return NextResponse.json(comments[commentIndex]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!validateAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const comments = await DataStorage.getComments();
    const filteredComments = comments.filter(c => c.id !== params.id);
    await DataStorage.saveComments(filteredComments);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
