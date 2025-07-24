// components/Comments.tsx
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { MessageCircle, Send, User } from 'lucide-react';

interface Comment {
  id: string;
  postId: string;
  author: string;
  email: string;
  content: string;
  createdAt: string;
  approved: boolean;
}

interface CommentsProps {
  postId: string;
}

export default function Comments({ postId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState({
    author: '',
    email: '',
    content: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments/${postId}`);
      const data = await response.json();
      setComments(data.filter((comment: Comment) => comment.approved));
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.author.trim() || !newComment.email.trim() || !newComment.content.trim()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newComment,
          postId,
        }),
      });

      if (response.ok) {
        setNewComment({ author: '', email: '', content: '' });
        // Show success message
        alert('Comment submitted! It will appear after approval.');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to submit comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="bg-earth-green-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-earth-green-600 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-earth-green-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2 mb-8">
          <MessageCircle className="h-6 w-6 text-earth-green-600" />
          <h2 className="font-serif text-2xl font-bold text-earth-green-800">
            Comments ({comments.length})
          </h2>
        </div>

        {/* Comment Form */}
        <div className="bg-white rounded-xl p-8 mb-8 shadow-md">
          <h3 className="font-serif text-xl font-semibold text-earth-green-800 mb-6">
            Leave a Comment
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="author" className="block text-sm font-medium text-earth-green-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="author"
                  value={newComment.author}
                  onChange={(e) => setNewComment({ ...newComment, author: e.target.value })}
                  className="input-field w-full"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-earth-green-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  value={newComment.email}
                  onChange={(e) => setNewComment({ ...newComment, email: e.target.value })}
                  className="input-field w-full"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-earth-green-700 mb-2">
                Comment *
              </label>
              <textarea
                id="content"
                rows={4}
                value={newComment.content}
                onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                className="input-field w-full resize-none"
                placeholder="Share your thoughts..."
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center space-x-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              <span>{submitting ? 'Submitting...' : 'Post Comment'}</span>
            </button>
          </form>
        </div>

        {/* Comments List */}
        <div className="space-y-6">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="bg-white rounded-xl p-6 shadow-md">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-sage rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-earth-green-800">{comment.author}</h4>
                      <span className="text-sm text-earth-green-500">
                        {format(new Date(comment.createdAt), 'MMM dd, yyyy at h:mm a')}
                      </span>
                    </div>
                    
                    <p className="text-earth-green-700 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-earth-green-300 mx-auto mb-4" />
              <p className="text-earth-green-600">
                No comments yet. Be the first to share your thoughts!
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
