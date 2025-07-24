'use client';

import { useState, useEffect } from 'react';
import { Check, X, MessageCircle, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface Comment {
  id: string;
  postId: string;
  author: string;
  email: string;
  content: string;
  createdAt: string;
  approved: boolean;
}

export default function CommentManager() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await fetch('/api/admin/comments', {
        headers: {
          'Authorization': localStorage.getItem('adminAuth') || '',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCommentStatus = async (commentId: string, approved: boolean) => {
    try {
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('adminAuth') || '',
        },
        body: JSON.stringify({ approved }),
      });

      if (response.ok) {
        setComments(comments.map(comment => 
          comment.id === commentId ? { ...comment, approved } : comment
        ));
      }
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': localStorage.getItem('adminAuth') || '',
        },
      });

      if (response.ok) {
        setComments(comments.filter(comment => comment.id !== commentId));
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const filteredComments = comments.filter(comment => {
    if (filter === 'pending') return !comment.approved;
    if (filter === 'approved') return comment.approved;
    return true;
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-serif text-3xl font-bold text-earth-green-800 flex items-center space-x-2">
          <MessageCircle className="h-8 w-8" />
          <span>Manage Comments</span>
        </h2>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-field"
        >
          <option value="pending">Pending Approval</option>
          <option value="approved">Approved</option>
          <option value="all">All Comments</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredComments.map((comment) => (
          <div key={comment.id} className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-sage rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-earth-green-800">{comment.author}</h4>
                  <p className="text-sm text-earth-green-500">{comment.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-earth-green-500">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(comment.createdAt), 'MMM dd, yyyy at h:mm a')}</span>
              </div>
            </div>

            <p className="text-earth-green-700 mb-4 leading-relaxed">
              {comment.content}
            </p>

            <div className="flex items-center justify-between">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                comment.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {comment.approved ? 'Approved' : 'Pending'}
              </span>

              <div className="flex items-center space-x-2">
                {!comment.approved && (
                  <button
                    onClick={() => updateCommentStatus(comment.id, true)}
                    className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors"
                  >
                    <Check className="h-4 w-4" />
                    <span>Approve</span>
                  </button>
                )}
                
                {comment.approved && (
                  <button
                    onClick={() => updateCommentStatus(comment.id, false)}
                    className="flex items-center space-x-1 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>Unapprove</span>
                  </button>
                )}
                
                <button
                  onClick={() => deleteComment(comment.id)}
                  className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredComments.length === 0 && (
        <div className="text-center py-12">
          <MessageCircle className="h-12 w-12 text-earth-green-300 mx-auto mb-4" />
          <p className="text-earth-green-600">
            No comments found for the selected filter.
          </p>
        </div>
      )}
    </div>
  );
}
