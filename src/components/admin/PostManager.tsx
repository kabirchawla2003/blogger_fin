// src/components/admin/PostManager.tsx
'use client';

import { useState, useEffect } from 'react';
import { Edit, Trash2, Eye, Calendar, Clock, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { BlogPost } from '@/lib/types';

export default function PostManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/admin/posts', {
        headers: {
          'Authorization': localStorage.getItem('adminAuth') || '',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      } else if (response.status === 401) {
        alert('Unauthorized. Please log in again.');
        localStorage.removeItem('adminAuth');
        window.location.reload();
      } else {
        console.error('Failed to fetch posts:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingPost) return;

    try {
      const response = await fetch('/api/admin/posts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('adminAuth') || '',
        },
        body: JSON.stringify(editingPost),
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setPosts(posts.map(post => 
          post.id === updatedPost.id ? updatedPost : post
        ));
        setShowEditModal(false);
        setEditingPost(null);
        alert('Post updated successfully!');
      } else {
        alert('Failed to update post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Error updating post');
    }
  };

  const deletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': localStorage.getItem('adminAuth') || '',
        },
      });

      if (response.ok) {
        setPosts(posts.filter(post => post.id !== postId));
        alert('Post deleted successfully!');
      } else {
        alert('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error deleting post');
    }
  };

  // src/components/admin/PostManager.tsx
// Find the togglePostStatus function and update it:

const togglePostStatus = async (post: BlogPost) => {
  const newStatus = post.status === 'published' ? 'draft' : 'published';
  const updatedPost = {
    ...post,
    status: newStatus,
    publishedAt: newStatus === 'published' 
      ? new Date().toISOString()  // Set current date when publishing
      : null,  // Clear when making draft
  };

  try {
    const response = await fetch('/api/admin/posts', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('adminAuth') || '',
      },
      body: JSON.stringify(updatedPost),
    });

    if (response.ok) {
      const savedPost = await response.json();
      setPosts(posts.map(p => p.id === savedPost.id ? savedPost : p));
    }
  } catch (error) {
    console.error('Error toggling post status:', error);
  }
};


  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    return post.status === filter;
  });

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-earth-green-600 mx-auto"></div>
        <p className="mt-4 text-earth-green-600">Loading posts...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-serif text-3xl font-bold text-earth-green-800">
          Manage Posts
        </h2>
        
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Posts ({posts.length})</option>
            <option value="published">Published ({posts.filter(p => p.status === 'published').length})</option>
            <option value="draft">Drafts ({posts.filter(p => p.status === 'draft').length})</option>
            <option value="scheduled">Scheduled ({posts.filter(p => p.status === 'scheduled').length})</option>
          </select>
        </div>
      </div>

      {filteredPosts.length > 0 ? (
        <div className="bg-white rounded-xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-earth-green-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-earth-green-800">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-earth-green-800">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-earth-green-800">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-earth-green-800">Views</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-earth-green-800">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-earth-green-800">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-earth-green-100">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-earth-green-50">
                    <td className="px-6 py-4">
                      <div>
                        <h3 className="font-medium text-earth-green-800">{post.title}</h3>
                        <p className="text-sm text-earth-green-500 flex items-center space-x-1 mt-1">
                          <Clock className="h-3 w-3" />
                          <span>{post.readTime || 0} min read</span>
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => togglePostStatus(post)}
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                          post.status === 'published' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                          post.status === 'draft' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                          'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }`}
                        title={`Click to toggle status`}
                      >
                        {post.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-earth-green-600">
                      {post.category || 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4 text-sm text-earth-green-600 flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{post.views || 0}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-earth-green-600">
                      {post.publishedAt ? 
                        format(new Date(post.publishedAt), 'MMM dd, yyyy') :
                        format(new Date(post.createdAt), 'MMM dd, yyyy')
                      }
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={() => handleEditPost(post)}
                          className="text-earth-green-600 hover:text-earth-green-800 transition-colors"
                          title="Edit post"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => deletePost(post.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete post"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        {post.status === 'published' && (
                          <a
                            href={`/posts/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="View post"
                          >
                            <Eye className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <p className="text-earth-green-600 text-lg">
            {filter === 'all' ? 'No posts found.' : `No ${filter} posts found.`}
          </p>
          {filter === 'all' && (
            <p className="text-earth-green-500 text-sm mt-2">
              Create your first post using the "Write" tab.
            </p>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-2xl font-bold text-earth-green-800 mb-6">
              Edit Post
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="form-label">Title</label>
                <input
                  type="text"
                  value={editingPost.title}
                  onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Excerpt</label>
                <textarea
                  value={editingPost.excerpt}
                  onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                  className="form-textarea h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Category</label>
                  <input
                    type="text"
                    value={editingPost.category}
                    onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Status</label>
                  <select
                    value={editingPost.status}
                    onChange={(e) => setEditingPost({ 
                      ...editingPost, 
                      status: e.target.value as 'draft' | 'published' | 'scheduled'
                    })}
                    className="form-input"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Content (Markdown)</label>
                <textarea
                  value={editingPost.content}
                  onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                  className="form-textarea h-40 font-mono text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingPost(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="btn-primary"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
